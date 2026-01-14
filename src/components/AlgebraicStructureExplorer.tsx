/* src/components/AlgebraicStructureExplorer.tsx */
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import { GenericGraphEngine } from './GenericGraphEngine';
import { MathNode } from './MathNode'; 
import { Flashcard } from './Flashcard';
import { nodesToGraph } from '../utils/graphAdapter';
import { initialNodes, initialAxioms, initialTheorems, initialEnvironments } from '../data/initialData';
import { CreateStructureModal, type StructureFormData } from './modals/CreateStructureModal';
import { type TheoremFormData } from './modals/CreateTheoremModal';
import type { StructureNode, Axiom, RootEnvironment, Theorem } from '../types';
import styles from './AlgebraicStructureExplorer.module.css';

/**
 * The Primary Controller: Manages the "Algebraic Structure Map".
 * Responsibilities:
 * 1. Visualizing the evolutionary tree of algebraic systems.
 * 2. Managing state (Nodes, Axioms, Theorems).
 * 3. Handling data mutations (Creating Structures, Adding Theorems).
 */
export const AlgebraicStructureExplorer = () => {
  
  // --- STATE MANAGEMENT ---
  const [dataNodes, setDataNodes] = useState<StructureNode[]>(initialNodes as StructureNode[]);
  const [dataAxioms, setDataAxioms] = useState<Axiom[]>(initialAxioms);
  const [dataTheorems, setDataTheorems] = useState<Theorem[]>(initialTheorems);
  const [dataEnvironments] = useState<RootEnvironment[]>(initialEnvironments);

  // --- GRAPH LAYOUT CALCULATION ---
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

  const nodeTypes = useMemo(() => ({ mathNode: MathNode }), []);

  const selectedNodeData = useMemo(() => 
    dataNodes.find(n => n.id === selectedNodeId), 
  [selectedNodeId, dataNodes]);

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
   * Handler: Create New Structure
   * Links a new node to the graph and potentially creates a new axiom.
   */
  const handleCreateStructure = (formData: StructureFormData) => {
    if (!selectedNodeId || !selectedNodeData) return;
    if (selectedNodeData.status === 'deprecated' || selectedNodeData.status === 'deadend') return;
    
    const timestamp = Date.now();
    const currentUser = 'temp-user-id'; 

    // 1. Determine Axiom Source
    let finalAxiomId = formData.existingAxiomId;

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
      setDataAxioms(prev => [...prev, newAxiom]);
    }

    // 2. Create Structure Node
    const newStructureId = `struct-${timestamp}`;
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
      stats: { greenVotes: 0, blackVotes: 0 },
      createdAt: timestamp 
    };

    setDataNodes(prev => [...prev, newStructure]);
    setIsCreateModalOpen(false);
  };

  /**
   * Handler: Add New Theorem
   * Adds a new theorem definition to the currently selected node.
   * * Note: Theorems start as 'unverified' and must be voted on.
   */
  const handleAddTheorem = (formData: TheoremFormData) => {
    if (!selectedNodeId) return;

    const timestamp = Date.now();
    const newTheorem: Theorem = {
      id: `th-${timestamp}`,
      structureNodeId: selectedNodeId,
      name: formData.name,
      aliases: [],
      statementLatex: formData.statementLatex,
      proofLatex: formData.proofLatex,
      authorId: 'temp-user-id',
      createdAt: timestamp,
      status: 'unverified',
      stats: { greenVotes: 0, blackVotes: 0 }
    };

    setDataTheorems(prev => [...prev, newTheorem]);
  };

  return (
    <div className={styles.explorerRoot}>
      
      {/* --- EXTEND STRUCTURE BUTTON --- */}
      {selectedNodeId
        && selectedNodeData?.status !== 'deprecated'
        && selectedNodeData?.status !== 'deadend'
        && (
        <div className={styles.extendBtnContainer}>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className={styles.extendBtn}
          >
            <span className={styles.plusIcon}>+</span> Extend Structure
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
          onAddTheorem={handleAddTheorem} // <--- Connected Handler
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
