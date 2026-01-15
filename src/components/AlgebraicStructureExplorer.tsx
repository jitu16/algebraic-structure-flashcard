/* src/components/AlgebraicStructureExplorer.tsx */
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { GenericGraphEngine } from './GenericGraphEngine';
import { MathNode } from './MathNode'; 
import { Flashcard } from './Flashcard';
import { nodesToGraph } from '../utils/graphAdapter';
import { CreateStructureModal, type StructureFormData } from './modals/CreateStructureModal';
import { type TheoremFormData } from './modals/CreateTheoremModal';
import { AdminLibraryModal } from './modals/AdminLibraryModal';
import type { StructureNode, Axiom, RootEnvironment, Theorem } from '../types';
import styles from './AlgebraicStructureExplorer.module.css';

import { useAuth } from '../contexts/AuthContext';

interface ExplorerProps {
  universeId: string;
  onExit: () => void;
}

/**
 * The Primary Controller: Manages the "Algebraic Structure Map".
 * Responsibilities:
 * 1. Visualizing the evolutionary tree of algebraic systems.
 * 2. Managing state (Nodes, Axioms, Theorems) via Real-Time Database.
 * 3. Handling data mutations (Creating Structures, Adding Theorems).
 */
export const AlgebraicStructureExplorer = ({ universeId, onExit }: ExplorerProps) => {

  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  
  // --- STATE MANAGEMENT ---
  
  // Nodes are filtered by the current Universe ID
  const [dataNodes, setDataNodes] = useState<StructureNode[]>([]);
  
  // Axioms and Theorems are GLOBAL (Shared across universes)
  const [dataAxioms, setDataAxioms] = useState<Axiom[]>([]);
  const [dataTheorems, setDataTheorems] = useState<Theorem[]>([]);
  
  const [activeEnvironment, setActiveEnvironment] = useState<RootEnvironment | null>(null);

  // --- REAL-TIME DATABASE SUBSCRIPTION ---
  useEffect(() => {
    // 1. Fetch Environment Metadata
    const envRef = doc(db, 'environments', universeId);
    const unsubscribeEnv = onSnapshot(envRef, (docSnap) => {
      if (docSnap.exists()) {
        setActiveEnvironment(docSnap.data() as RootEnvironment);
      }
    });

    // 2. Fetch Nodes (Filtered by CURRENT UNIVERSE)
    const nodesQuery = query(
      collection(db, 'nodes'), 
      where('rootContextId', '==', universeId)
    );
    const unsubscribeNodes = onSnapshot(nodesQuery, (snapshot) => {
      const nodes = snapshot.docs.map(doc => doc.data() as StructureNode);
      setDataNodes(nodes);
    });

    // 3. Fetch Axioms (Global Registry)
    const unsubscribeAxioms = onSnapshot(collection(db, 'axioms'), (snapshot) => {
      const axioms = snapshot.docs.map(doc => doc.data() as Axiom);
      setDataAxioms(axioms);
    });

    // 4. Fetch Theorems (Global Registry)
    const unsubscribeTheorems = onSnapshot(collection(db, 'theorems'), (snapshot) => {
      const theorems = snapshot.docs.map(doc => doc.data() as Theorem);
      setDataTheorems(theorems);
    });

    return () => {
      unsubscribeEnv();
      unsubscribeNodes();
      unsubscribeAxioms();
      unsubscribeTheorems();
    };
  }, [universeId]);

  // --- GRAPH LAYOUT CALCULATION ---
  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(
    () => nodesToGraph(dataNodes, dataAxioms), 
    [dataNodes, dataAxioms]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);
  
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

  // ... (Create & Delete Handlers remain the same, hidden for brevity) ...
  // [Keeping existing handler logic for createStructure, deleteNode, deleteTheorem, deleteAxiom]
  
  const handleCreateStructure = async (formData: StructureFormData) => {
    if (!selectedNodeId || !selectedNodeData) return;
    if (selectedNodeData.status === 'deprecated' || selectedNodeData.status === 'deadend') return;
    
    const timestamp = Date.now();
    if (!user) { alert("Sign in required."); return; }
    const currentUser = user.uid;

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
      try { await setDoc(doc(db, 'axioms', newAxiom.id), newAxiom); } catch (e) { console.error(e); return; }
    }

    const newStructureId = `struct-${timestamp}`;
    const newStructure: StructureNode = {
      id: newStructureId,
      type: 'algebraic structure',
      parentId: selectedNodeId,
      axiomId: finalAxiomId,
      authorId: currentUser, 
      displayLatex: formData.structureName, 
      status: 'unverified',
      rootContextId: universeId, 
      toBeDeleted: false, 
      stats: { greenVotes: 0, blackVotes: 0 },
      createdAt: timestamp 
    };

    try {
      await setDoc(doc(db, 'nodes', newStructure.id), newStructure);
      setIsCreateModalOpen(false);
    } catch (e) { console.error(e); }
  };

  const handleDeleteNode = async (nodeId: string) => {
    const hasChildren = dataNodes.some(n => n.parentId === nodeId);
    if (hasChildren) {
      alert("CRITICAL ERROR: Cannot delete this node because it has children.");
      return;
    }
    if (!confirm("⚠️ ADMIN WARNING ⚠️\n\nPermanently delete this node?")) return;
    try {
      await deleteDoc(doc(db, 'nodes', nodeId));
      setSelectedNodeId(null);
    } catch (e) { console.error(e); }
  };

  const handleDeleteTheorem = async (theoremId: string) => {
    if (!confirm("⚠️ ADMIN WARNING ⚠️\n\nPermanently delete this theorem?")) return;
    try { await deleteDoc(doc(db, 'theorems', theoremId)); } catch (e) { console.error(e); }
  };

  const handleDeleteAxiom = async (axiomId: string) => {
    try { await deleteDoc(doc(db, 'axioms', axiomId)); } catch (e) { console.error(e); }
  };

  const handleAddTheorem = async (formData: TheoremFormData) => {
    if (!selectedNodeId || !user) return;
    const timestamp = Date.now();
    const newTheorem: Theorem = {
      id: `th-${timestamp}`,
      structureNodeId: selectedNodeId,
      name: formData.name,
      aliases: [],
      statementLatex: formData.statementLatex,
      proofLatex: formData.proofLatex,
      authorId: user.uid,
      createdAt: timestamp,
      status: 'unverified',
      stats: { greenVotes: 0, blackVotes: 0 }
    };
    try { await setDoc(doc(db, 'theorems', newTheorem.id), newTheorem); } catch (e) { console.error(e); }
  };

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
            style={{ marginLeft: '10px' }}
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

      {/* --- ADMIN LIBRARY MODAL (UPDATED) --- */}
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
