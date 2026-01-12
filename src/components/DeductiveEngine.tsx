/* src/components/DeductiveEngine.tsx */
import React, { useMemo, useState, useCallback } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import { GenericGraphEngine } from './GenericGraphEngine';
import { MathNode } from './MathNode'; 
// FIX: Import the new specialized Flashcard
import { TheoremFlashcard } from './Flashcard'; 
import { initialTheorems, initialNodes } from '../data/initialData';
import { nodesToGraph } from '../utils/graphAdapter'; 
import type { TheoremNode } from '../types';

interface DeductiveEngineProps {
  rootNodeId: string; 
  onBack: () => void; 
}

export const DeductiveEngine: React.FC<DeductiveEngineProps> = ({ rootNodeId, onBack }) => {
  
  // 1. Get Context Name
  const rootNodeName = useMemo(() => {
    const node = initialNodes.find(n => n.id === rootNodeId);
    return node?.displayLatex || "\\text{Structure}";
  }, [rootNodeId]);

  // 2. Filter & Transform Data (Using the Smart Layout Engine)
  const { nodes: initialGraphNodes, edges: initialGraphEdges } = useMemo(() => {
    const relevantTheorems = initialTheorems.filter(t => t.rootNodeId === rootNodeId);
    return nodesToGraph(relevantTheorems, 'deductive'); 
  }, [rootNodeId]);

  const [nodes, , onNodesChange] = useNodesState(initialGraphNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialGraphEdges);
  
  // 3. Selection State
  const [selectedTheoremId, setSelectedTheoremId] = useState<string | null>(null);

  const selectedTheoremData = useMemo(() => 
    initialTheorems.find(t => t.id === selectedTheoremId), 
  [selectedTheoremId]);

  const nodeTypes = useMemo(() => ({ mathNode: MathNode }), []);

  // 4. Handle Clicks
  const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    setSelectedTheoremId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedTheoremId(null); 
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      
      {/* Navigation Overlay */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px', 
        zIndex: 100,
        background: 'white',
        padding: '10px 15px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end' 
      }}>
        <button 
          onClick={onBack}
          style={{
            cursor: 'pointer',
            padding: '8px 16px',
            background: '#0288d1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '1rem',
            marginBottom: '5px'
          }}
        >
          &larr; Back to Algebraic Structure Map
        </button>
        <div style={{ fontSize: '0.85rem', color: '#666' }}>
          Viewing Proof Tree
        </div>
      </div>

      {/* The Graph */}
      <GenericGraphEngine
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick} 
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        title={`\\text{Deductive Layer: } ${rootNodeName}`}
      />

      {/* The Detail View (Theorem Flashcard) */}
      {selectedTheoremData && (
        <TheoremFlashcard 
          node={selectedTheoremData as TheoremNode}
          onClose={() => setSelectedTheoremId(null)}
        />
      )}
    </div>
  );
};
