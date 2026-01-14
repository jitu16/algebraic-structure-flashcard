/* src/components/AlgebraicStructureExplorer.tsx */
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import { GenericGraphEngine } from './GenericGraphEngine';
import { MathNode } from './MathNode'; 
import { Flashcard } from './Flashcard';
import { nodesToGraph } from '../utils/graphAdapter';
import { initialNodes, initialAxioms, initialTheorems, initialEnvironments } from '../data/initialData';
import { CreateStructureModal, type StructureFormData } from './modals/CreateStructureModal';
import type { StructureNode, Axiom, RootEnvironment, Theorem } from '../types';

/**
 * The Primary Controller: Manages the "Algebraic Structure Map".
 * This engine visualizes the evolutionary tree of algebraic systems (e.g., Magmas → Groups → Rings).
 * It manages the graph state, selection logic, and data mutations for new structures.
 */
export const AlgebraicStructureExplorer = () => {
  
  // --- STATE MANAGEMENT ---
  // In a real app, this would be replaced by a Context or Redux store connected to Firebase.
  const [dataNodes, setDataNodes] = useState<StructureNode[]>(initialNodes as StructureNode[]);
  const [dataAxioms, setDataAxioms] = useState<Axiom[]>(initialAxioms);
  const [dataTheorems, setDataTheorems] = useState<Theorem[]>(initialTheorems);
  
  // Root Environments are currently static but kept in state for future scaling.
  const [dataEnvironments] = useState<RootEnvironment[]>(initialEnvironments);

  // --- GRAPH LAYOUT CALCULATION ---
  // Re-runs Dagre layout whenever the structural data changes.
  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(
    () => nodesToGraph(dataNodes, dataAxioms), 
    [dataNodes, dataAxioms]
  );

  // React Flow State Hooks
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);
  
  // Sync React Flow state with calculated layout
  useEffect(() => {
    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [layoutNodes, layoutEdges, setNodes, setEdges]);

  // --- INTERACTION STATE ---
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Define custom node types for React Flow
  const nodeTypes = useMemo(() => ({ mathNode: MathNode }), []);

  // Derived state: The currently selected data object
  const selectedNodeData = useMemo(() => 
    dataNodes.find(n => n.id === selectedNodeId), 
  [selectedNodeId, dataNodes]);

  /**
   * Retrieves the RootEnvironment associated with the currently selected node.
   * Used to pass notation constraints (sets/operators) to the creation modal.
   */
  const activeEnvironment = useMemo(() => {
    if (!selectedNodeData) return null;
    return dataEnvironments.find(env => env.id === selectedNodeData.rootContextId) || null;
  }, [selectedNodeData, dataEnvironments]);

  // --- EVENT HANDLERS ---

  const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null); 
  }, []);

  /**
   * Handles the creation of a new Structure Node.
   * * Logic:
   * 1. Checks if the user selected an existing axiom (Linked Mode) or created a new one (Creation Mode).
   * 2. If new, creates the Axiom entity and adds it to the global store.
   * 3. Creates the Structure Node linked to that Axiom ID.
   */
  const handleCreateStructure = (formData: StructureFormData) => {
    if (!selectedNodeId || !selectedNodeData) return;

    // Prevent extension from dead ends or deprecated nodes
    if (selectedNodeData.status === 'deprecated' || selectedNodeData.status === 'deadend') {
      return; 
    }
    
    const timestamp = Date.now();
    const newStructureId = `struct-${timestamp}`;
    const currentUser = 'temp-user-id'; // Placeholder for Auth

    // 1. Determine the Axiom ID (New vs. Existing)
    let finalAxiomId = formData.existingAxiomId;

    // If no existing ID was provided, we must create a new Axiom entry
    if (!finalAxiomId) {
      finalAxiomId = `ax-${timestamp}`;
      const newAxiom: Axiom = {
        id: finalAxiomId,
        canonicalName: formData.axiomName,
        aliases: [], 
        defaultLatex: formData.axiomLatex,
        authorId: currentUser, 
        createdAt: timestamp   
      };
      // Add the new axiom to the global state
      setDataAxioms(prev => [...prev, newAxiom]);
    }

    // 2. Create the new Structure Node
    const newStructure: StructureNode = {
      id: newStructureId,
      type: 'algebraic structure',
      parentId: selectedNodeId,
      axiomId: finalAxiomId,
      authorId: currentUser, 
      displayLatex: formData.structureName, 
      status: 'unverified',
      rootContextId: selectedNodeData.rootContextId, 
      toBeDeleted: false, 
      stats: {
        greenVotes: 0,
        blackVotes: 0
      },
      createdAt: timestamp 
    };

    // 3. Update State (Triggering Re-render/Re-layout)
    setDataNodes(prev => [...prev, newStructure]);
    setIsCreateModalOpen(false); // Close modal on success
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      
      {/* --- EXTEND STRUCTURE BUTTON --- */}
      {selectedNodeId
        && selectedNodeData?.status !== 'deprecated'
        && selectedNodeData?.status !== 'deadend'
        && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%', 
          transform: 'translateX(-50%)',
          zIndex: 100, 
        }}>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              padding: '10px 24px',
              background: '#2e7d32',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '1rem'
            }}
          >
            <span style={{ fontSize: '1.2rem', lineHeight: '1rem' }}>+</span> Extend Structure
          </button>
        </div>
      )}

      {/* --- GRAPH CANVAS --- */}
      <GenericGraphEngine
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        title="\text{Algebraic Structure Space}"
      />

      {/* --- DETAIL PANEL (FLASHCARD) --- */}
      {selectedNodeData && (
        <Flashcard 
          node={selectedNodeData}
          allNodes={dataNodes}
          allAxioms={dataAxioms}
          allTheorems={dataTheorems}
          onClose={() => setSelectedNodeId(null)}
        />
      )}

      {/* --- CREATE MODAL --- */}
      {isCreateModalOpen && selectedNodeData && activeEnvironment && (
        <CreateStructureModal 
          parentId={selectedNodeData.id}
          parentName={selectedNodeData.displayLatex}
          rootEnvironment={activeEnvironment}
          availableAxioms={dataAxioms} 
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateStructure}
        />
      )}
    </div>
  );
};
