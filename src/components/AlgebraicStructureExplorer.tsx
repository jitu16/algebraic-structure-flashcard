/* src/components/AlgebraicStructureExplorer.tsx */
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import { toast } from 'react-hot-toast'; // NEW IMPORT
import { GenericGraphEngine } from './GenericGraphEngine';
import { MathNode } from './MathNode'; 
import { Flashcard } from './Flashcard';
import { nodesToGraph } from '../utils/graphAdapter';
import { CreateStructureModal, type StructureFormData } from './modals/CreateStructureModal';
import { type TheoremFormData } from './modals/CreateTheoremModal';
import { AdminLibraryModal } from './modals/AdminLibraryModal';
import styles from './AlgebraicStructureExplorer.module.css';
import { useAuth } from '../contexts/AuthContext';
import { useUniverseData } from '../hooks/useUniverseData';
import { StructureService } from '../services/structureService';
import { TheoremService } from '../services/theoremService';
import { AxiomService } from '../services/axiomService';

interface ExplorerProps {
  universeId: string;
  onExit: () => void;
}

/**
 * The Primary Controller: Manages the "Algebraic Structure Map".
 * Responsibilities:
 * 1. Visualizing the evolutionary tree of algebraic systems.
 * 2. Managing state (Nodes, Axioms, Theorems) via Real-Time Database.
 * 3. Handling data mutations via Service Layer.
 */
export const AlgebraicStructureExplorer = ({ universeId, onExit }: ExplorerProps) => {

  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  
  // --- DATA FETCHING (VIA HOOK) ---
  const {
    nodes: dataNodes,
    axioms: dataAxioms,
    theorems: dataTheorems,
    activeEnvironment,
    isLoading
  } = useUniverseData(universeId);

  // --- GRAPH LAYOUT CALCULATION ---
  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(
    () => nodesToGraph(dataNodes, dataAxioms), 
    [dataNodes, dataAxioms]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);
  
  // Sync local graph state when layout recalculates
  useEffect(() => {
    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [layoutNodes, layoutEdges, setNodes, setEdges]);

  // --- INTERACTION STATE ---
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAdminLibraryOpen, setIsAdminLibraryOpen] = useState(false);

  const nodeTypes = useMemo(() => ({ mathNode: MathNode }), []);

  const selectedNodeData = useMemo(() => 
    dataNodes.find(n => n.id === selectedNodeId), 
  [selectedNodeId, dataNodes]);

  // --- EVENT HANDLERS ---

  const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null); 
  }, []);
  
  /**
   * Handles the extension of the graph.
   * Delegates the creation of Axioms (if new) and Structure Nodes to the StructureService.
   * @param formData - The data from the creation modal.
   */
  const handleCreateStructure = async (formData: StructureFormData) => {
    if (!selectedNodeId || !selectedNodeData || !user) return;
    if (selectedNodeData.status === 'deprecated' || selectedNodeData.status === 'deadend') return;
    
    try {
      await StructureService.createStructure({
        parentId: selectedNodeId,
        rootContextId: universeId,
        structureName: formData.structureName,
        existingAxiomId: formData.existingAxiomId,
        axiomName: formData.axiomName,
        axiomLatex: formData.axiomLatex
      }, user.uid);

      toast.success("Structure created successfully");
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create structure:", error);
      toast.error("Error creating structure");
    }
  };

  /**
   * Deletes a node after validating that it is a leaf (has no children).
   * @param nodeId - The ID of the node to delete.
   */
  const handleDeleteNode = async (nodeId: string) => {
    // 1. UI Validation: Check if the node has children in the current view
    const hasChildren = dataNodes.some(n => n.parentId === nodeId);
    if (hasChildren) {
      toast.error("Cannot delete node: It has children");
      return;
    }

    if (!confirm("⚠️ ADMIN WARNING ⚠️\n\nPermanently delete this node?")) return;
    
    // 2. Service Call
    try {
      await StructureService.deleteStructure(nodeId);
      toast.success("Node deleted");
      setSelectedNodeId(null);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete node");
    }
  };

  /**
   * Deletes a theorem using the TheoremService.
   * @param theoremId - The ID of the theorem to delete.
   */
  const handleDeleteTheorem = async (theoremId: string) => {
    if (!confirm("⚠️ ADMIN WARNING ⚠️\n\nPermanently delete this theorem?")) return;
    try { 
      await TheoremService.deleteTheorem(theoremId);
      toast.success("Theorem deleted");
    } catch (e) { 
      console.error(e); 
      toast.error("Failed to delete theorem");
    }
  };

  /**
   * Deletes an axiom using the AxiomService.
   * @param axiomId - The ID of the axiom to delete.
   */
  const handleDeleteAxiom = async (axiomId: string) => {
    try { 
      await AxiomService.deleteAxiom(axiomId);
      toast.success("Axiom deleted");
    } catch (e) { 
      console.error(e); 
      toast.error("Failed to delete axiom"); 
    }
  };

  /**
   * Adds a new theorem to the selected structure using the TheoremService.
   * @param formData - The data from the creation modal.
   */
  const handleAddTheorem = async (formData: TheoremFormData) => {
    if (!selectedNodeId || !user) return;
    
    try { 
      await TheoremService.createTheorem(
        selectedNodeId,
        {
          name: formData.name,
          statementLatex: formData.statementLatex,
          proofLatex: formData.proofLatex
        },
        user.uid
      );
      toast.success("Theorem proposed successfully");
    } catch (e) { 
      console.error(e); 
      toast.error("Failed to create theorem");
    }
  };

  if (isLoading) {
    return <div className={styles.explorerRoot}>Loading Universe...</div>;
  }

  return (
    <div className={styles.explorerRoot}>
      
      {/* --- NAVIGATION UI --- */}
      <div className={styles.backBtnContainer}>
        <button onClick={onExit} className={styles.backBtn}>
          &larr; Exit to Lobby
        </button>
        {isAdmin && (
          <button 
            onClick={() => setIsAdminLibraryOpen(true)} 
            className={styles.backBtn}
          >
            📚 Library
          </button>
        )}
      </div>

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
        title={`\\text{${activeEnvironment?.name || "Universe"}}`}
      />

      {/* --- DETAIL PANEL --- */}
      {selectedNodeData && (
        <Flashcard 
          node={selectedNodeData}
          allNodes={dataNodes}
          allAxioms={dataAxioms}
          allTheorems={dataTheorems}
          onClose={() => setSelectedNodeId(null)}
          onAddTheorem={handleAddTheorem}
          onDelete={handleDeleteNode}
          onDeleteTheorem={handleDeleteTheorem}
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

      {/* --- ADMIN LIBRARY MODAL --- */}
      {isAdminLibraryOpen && (
        <AdminLibraryModal
          axioms={dataAxioms}
          theorems={dataTheorems}
          onClose={() => setIsAdminLibraryOpen(false)}
          onDeleteAxiom={handleDeleteAxiom}
          onDeleteTheorem={handleDeleteTheorem}
        />
      )}
    </div>
  );
};
