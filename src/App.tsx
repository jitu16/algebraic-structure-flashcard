/* src/App.tsx */
import React, { useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  ConnectionMode 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css'; 
import './index.css';

// Data & Utils
import { INITIAL_NODES } from './data/initialData';
import { nodesToGraph } from './utils/graphAdapter';

// 1. Move static config OUTSIDE the component to prevent re-renders
const PRO_OPTIONS = { hideAttribution: true };
const { nodes: initialNodes, edges: initialEdges } = nodesToGraph(INITIAL_NODES);

const App: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 2. If you eventually add custom node types, define them here or memoize them
  const nodeTypes = useMemo(() => ({
    // mathNode: MathNodeComponent, 
  }), []);

  return (
    <div className="mathverse-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes} // Added this to satisfy the renderer
        fitView
        minZoom={0.1}
        maxZoom={4}
        connectionMode={ConnectionMode.Loose}
        proOptions={PRO_OPTIONS}
      >
        <Background gap={20} color="#444" />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
             // Logic based on status defined in logic.mmd
             switch(node.data?.status) {
               case 'verified': return '#ccffcc';
               case 'unverified': return '#ffcccc';
               case 'deprecated': return '#ffff00';
               default: return '#eee';
             }
          }}
        />
      </ReactFlow>
      
      <div className="mathverse-overlay">
        <h2>The Mathverse (Alpha)</h2>
        <p>✅ Verified: Green</p>
        <p>⚠️ Zombie (Deprecated): Flashing Yellow</p>
        <p>🔵 Isomorphism: Dashed Blue Line</p>
      </div>
    </div>
  );
};

export default App;
