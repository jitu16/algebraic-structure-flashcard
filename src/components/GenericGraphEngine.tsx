/* src/components/GenericGraphEngine.tsx */
import React from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  type Node, 
  type Edge, 
  type OnNodesChange, 
  type OnEdgesChange,
  type NodeTypes
} from '@xyflow/react';
import { Overlay } from './Overlay';
import { COLORS } from '../styles/theme';
import '@xyflow/react/dist/style.css';

interface GenericGraphEngineProps {
  // Data Props
  nodes: Node[];
  edges: Edge[];
  
  // Event Handlers
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onPaneClick?: () => void; // Optional: To deselect when clicking background
  
  // Configuration
  nodeTypes: NodeTypes;
  title?: string;
}

export const GenericGraphEngine: React.FC<GenericGraphEngineProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onPaneClick,
  nodeTypes,
  title = "Mathverse Explorer"
}) => {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background gap={20} color="#333" />
        <Controls />
        <MiniMap 
          nodeColor={(node) => COLORS[node.data?.status as keyof typeof COLORS] || '#eee'} 
        />
      </ReactFlow>
      
      {/* Standard UI Overlay for Legend/Title */}
      <Overlay structureName={title} />
    </div>
  );
};
