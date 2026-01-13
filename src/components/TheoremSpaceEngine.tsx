/* src/components/TheoremSpaceEngine.tsx */
import React, { useMemo, useState, useCallback } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import { GenericGraphEngine } from './GenericGraphEngine';
import { MathNode } from './MathNode'; 
import { Flashcard } from './Flashcard';
import { initialTheorems, initialNodes } from '../data/initialData';
import { nodesToGraph } from '../utils/graphAdapter'; 

interface TheoremSpaceEngineProps {
  rootNodeId: string; 
  onNavigateToStructureSpace: () => void; 
}

/**
 * The Micro-View Engine: Manages the "Theorem Space".
 * * This engine visualizes the local proof tree for a specific Algebraic Structure (e.g., theorems proven within a "Group").
 * It handles the "deductive" mode of the graph, where nodes represent theorems and edges represent logical dependencies.
 * * @param rootNodeId - The ID of the Structure (context) to visualize.
 * @param onNavigateToStructureSpace - Callback to return to the macro-view (Algebraic Structure Space).
 */
export const TheoremSpaceEngine = ({ rootNodeId, onNavigateToStructureSpace }: TheoremSpaceEngineProps) => {
  
  const rootNodeName = useMemo(() => {
    const node = initialNodes.find(n => n.id === rootNodeId);
    return node?.displayLatex || "\\text{Structure}";
  }, [rootNodeId]);

  const { nodes: initialGraphNodes, edges: initialGraphEdges } = useMemo(() => {
    const relevantTheorems = initialTheorems.filter(t => t.rootNodeId === rootNodeId);
    return nodesToGraph(relevantTheorems, 'deductive'); 
  }, [rootNodeId]);

  const [nodes, , onNodesChange] = useNodesState(initialGraphNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialGraphEdges);
  
  const [selectedTheoremId, setSelectedTheoremId] = useState<string | null>(null);

  const selectedTheoremData = useMemo(() => 
    initialTheorems.find(t => t.id === selectedTheoremId), 
  [selectedTheoremId]);

  const nodeTypes = useMemo(() => ({ mathNode: MathNode }), []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    setSelectedTheoremId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedTheoremId(null); 
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      
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
          onClick={onNavigateToStructureSpace}
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
          &larr; Back to Structure Space
        </button>
        <div style={{ fontSize: '0.85rem', color: '#666' }}>
          Viewing Proof Tree
        </div>
      </div>

      <GenericGraphEngine
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick} 
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        title={`\\text{Theorem Space: } ${rootNodeName}`}
      />

      {selectedTheoremData && (
        <Flashcard 
          node={selectedTheoremData}
          onClose={() => setSelectedTheoremId(null)}
        />
      )}
    </div>
  );
};
