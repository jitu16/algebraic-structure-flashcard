/* src/components/StructuralEngine.tsx */
import React, { useMemo, useState, useCallback } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import { GenericGraphEngine } from './GenericGraphEngine';
import { MathNode } from './MathNode'; // The visual component for the node
import { Flashcard } from './Flashcard';
import { nodesToGraph } from '../utils/graphAdapter';
import { initialNodes, initialAxioms, initialTheorems } from '../data/initialData';
import type { StructureNode } from '../types';

interface StructuralEngineProps {
  /**
   * Callback to trigger the "Zoom In" to the Deductive Layer.
   * Called when user clicks "View Proof Tree" on a Flashcard.
   */
  onNavigateToDeductive: (nodeId: string) => void;
}

export const StructuralEngine: React.FC<StructuralEngineProps> = ({ onNavigateToDeductive }) => {
  // 1. Initialize Graph Data (Transforming raw data into React Flow nodes)
  const { nodes: initialGraphNodes, edges: initialGraphEdges } = useMemo(
    () => nodesToGraph(initialNodes), 
    []
  );

  // 2. State Management
  const [nodes, , onNodesChange] = useNodesState(initialGraphNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialGraphEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // 3. Memoized Helpers
  const nodeTypes = useMemo(() => ({ mathNode: MathNode }), []);

  // Find the actual data object for the selected node
  const selectedNodeData = useMemo(() => 
    initialNodes.find(n => n.id === selectedNodeId), 
  [selectedNodeId]);

  // 4. Event Handlers
  const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null); // Deselect when clicking empty space
  }, []);

  const handleToggleMode = useCallback(() => {
    if (selectedNodeId) {
      onNavigateToDeductive(selectedNodeId);
    }
  }, [selectedNodeId, onNavigateToDeductive]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* The Visual Graph */}
      <GenericGraphEngine
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        title="\text{Structural Map (Algebraic Systems)}"
      />

      {/* The Detail View (Hybrid Flashcard) */}
      {selectedNodeData && (
        <Flashcard 
          node={selectedNodeData as StructureNode}
          allNodes={initialNodes}
          allAxioms={initialAxioms}
          allTheorems={initialTheorems}
          onClose={() => setSelectedNodeId(null)}
          onToggleMode={handleToggleMode}
        />
      )}
    </div>
  );
};
