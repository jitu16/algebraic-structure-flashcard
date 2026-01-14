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

/**
 * Pure UI Component: Renders the React Flow canvas.
 * It is agnostic to the data type (Structure vs Theorem) and just renders whatever nodes/edges are passed to it.
 * * @input nodes - Array of React Flow nodes.
 * @input edges - Array of React Flow edges.
 * @input nodeTypes - Mapping of node types (e.g., { mathNode: MathNode }).
 * @output A full-screen interactive graph canvas with background, controls, and minimap.
 */
export const GenericGraphEngine = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onPaneClick,
  nodeTypes,
  title = "Mathverse Explorer"
}: GenericGraphEngineProps) => {
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
	panOnScroll /* Enables two-finger pan / Scroll-to-pan */
	selectionOnDrag= {false}
	panOnDrag={true}
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
