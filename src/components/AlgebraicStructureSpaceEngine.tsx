/* src/components/AlgebraicStructureSpaceEngine.tsx */
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import { GenericGraphEngine } from './GenericGraphEngine';
import { MathNode } from './MathNode'; 
import { Flashcard } from './Flashcard';
import { nodesToGraph } from '../utils/graphAdapter';
import { initialNodes, initialAxioms, initialTheorems, initialEnvironments } from '../data/initialData';
import { CreateStructureModal, type StructureFormData } from './modals/CreateStructureModal';
import type { StructureNode, Axiom, RootEnvironment } from '../types';

interface AlgebraicStructureSpaceEngineProps {
  onNavigateToTheoremSpace: (nodeId: string) => void;
}

/**
 * The Macro-View Engine: Manages the "Algebraic Structure Space".
 * This engine visualizes the evolutionary map of algebraic structures (e.g., Magmas → Groups → Rings).
 * It handles the "structural" mode of the graph, where nodes represent systems and edges represent axiomatic extensions.
 * * @param onNavigateToTheoremSpace - Callback to transition the view to the Theorem Space (Micro-View) for a selected node.
 */
export const AlgebraicStructureSpaceEngine = ({ onNavigateToTheoremSpace }: AlgebraicStructureSpaceEngineProps) => {
  
  const [dataNodes, setDataNodes] = useState<StructureNode[]>(initialNodes as StructureNode[]);
  const [dataAxioms, setDataAxioms] = useState<Axiom[]>(initialAxioms);
  
  /**
   * We maintain the list of Root Environments (Sets/Operators notation).
   * These are generally static but kept in state for potential future extensibility.
   */
  const [dataEnvironments] = useState<RootEnvironment[]>(initialEnvironments);

  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(
    () => nodesToGraph(dataNodes, 'structural', dataAxioms), 
    [dataNodes, dataAxioms]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);
  
  useEffect(() => {
    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [layoutNodes, layoutEdges, setNodes, setEdges]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const nodeTypes = useMemo(() => ({ mathNode: MathNode }), []);

  const selectedNodeData = useMemo(() => 
    dataNodes.find(n => n.id === selectedNodeId), 
  [selectedNodeId, dataNodes]);

  /**
   * Retrieves the RootEnvironment associated with the currently selected node.
   * This is used to pass notation constraints (sets/operators) to the creation modal.
   */
  const activeEnvironment = useMemo(() => {
    if (!selectedNodeData) return null;
    return dataEnvironments.find(env => env.id === selectedNodeData.rootContextId) || null;
  }, [selectedNodeData, dataEnvironments]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null); 
  }, []);

  const handleToggleMode = useCallback(() => {
    if (selectedNodeId) {
      onNavigateToTheoremSpace(selectedNodeId);
    }
  }, [selectedNodeId, onNavigateToTheoremSpace]);

  /**
   * Handles the creation of a new Structure Node.
   * Enforces immutability of the Root Context: The new node automatically inherits
   * the 'rootContextId' from the parent, ensuring notation consistency.
   */
  const handleCreateStructure = (formData: StructureFormData) => {
    if (!selectedNodeId || !selectedNodeData) return;

    if (selectedNodeData.status === 'deprecated') {
      return; 
    }
    
    if (selectedNodeData.status === 'deadend') {
      return; 
    }
    
    const timestamp = Date.now();
    const newAxiomId = `ax-${timestamp}`;
    const newStructureId = `struct-${timestamp}`;
    const currentUser = 'temp-user-id'; 

    const newAxiom: Axiom = {
      id: newAxiomId,
      canonicalName: formData.axiomName,
      aliases: [], 
      defaultLatex: formData.axiomLatex,
      authorId: currentUser, 
      createdAt: timestamp   
    };

    const newStructure: StructureNode = {
      id: newStructureId,
      type: 'algebraic structure',
      parentId: selectedNodeId,
      axiomId: newAxiomId,
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

    setDataAxioms(prev => [...prev, newAxiom]);
    setDataNodes(prev => [...prev, newStructure]);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      
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

      {selectedNodeData && (
        <Flashcard 
          node={selectedNodeData}
          allNodes={dataNodes}
          allAxioms={dataAxioms}
          allTheorems={initialTheorems}
          onClose={() => setSelectedNodeId(null)}
          onToggleMode={handleToggleMode}
        />
      )}

      {isCreateModalOpen && selectedNodeData && activeEnvironment && (
        <CreateStructureModal 
          parentId={selectedNodeData.id}
          parentName={selectedNodeData.displayLatex}
          rootEnvironment={activeEnvironment}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateStructure}
        />
      )}
    </div>
  );
};
