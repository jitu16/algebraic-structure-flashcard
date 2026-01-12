/* src/components/DeductiveEngine.tsx */
import React, { useMemo } from 'react';
import { useNodesState, useEdgesState, type Node,type Edge, MarkerType } from '@xyflow/react';
import { GenericGraphEngine } from './GenericGraphEngine';
import { MathNode } from './MathNode'; 
import { initialTheorems, initialNodes } from '../data/initialData';
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

  // 2. Filter & Transform Data
  const { nodes: initialGraphNodes, edges: initialGraphEdges } = useMemo(() => {
    const relevantTheorems = initialTheorems.filter(t => t.rootNodeId === rootNodeId);
    return theoremsToGraph(relevantTheorems);
  }, [rootNodeId]);

  const [nodes, , onNodesChange] = useNodesState(initialGraphNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialGraphEdges);

  const nodeTypes = useMemo(() => ({ mathNode: MathNode }), []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      
      {/* Navigation Overlay - Right Side */}
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
        onNodeClick={() => {}} 
        nodeTypes={nodeTypes}
        title={`\\text{Deductive Layer: } ${rootNodeName}`}
      />
    </div>
  );
};

// --- Local Helper: Theorem Transformer ---
const theoremsToGraph = (theorems: TheoremNode[]): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const levelCounts: Record<number, number> = {}; 

  theorems.forEach((thm) => {
    const level = thm.parentId ? 2 : 1; 
    
    if (!levelCounts[level]) levelCounts[level] = 0;
    
    const xPos = levelCounts[level] * 350;
    const yPos = (level - 1) * 250;
    levelCounts[level]++;

    nodes.push({
      id: thm.id,
      position: { x: xPos, y: yPos },
      type: 'mathNode',
      data: { 
        displayLatex: thm.statementLatex, 
        status: thm.status,
        stats: thm.stats // <--- FIXED: The missing property that caused the crash!
      }, 
    });

    if (thm.parentId) {
      edges.push({
        id: `e-${thm.parentId}-${thm.id}`,
        source: thm.parentId,
        target: thm.id,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#555' },
      });
    }
  });

  return { nodes, edges };
};
