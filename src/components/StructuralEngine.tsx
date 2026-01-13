/* src/components/StructuralEngine.tsx */
import React, { useMemo, useState, useCallback } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import { GenericGraphEngine } from './GenericGraphEngine';
import { MathNode } from './MathNode'; 
import { Flashcard } from './Flashcard';
import { nodesToGraph } from '../utils/graphAdapter';
import { initialNodes, initialAxioms, initialTheorems } from '../data/initialData';
import type { StructureNode } from '../types';

interface StructuralEngineProps {
  onNavigateToDeductive: (nodeId: string) => void;
}

/**
 * Macro-view: The "Map" of Algebraic Systems.
 * Displays structures (Groups, Rings) as nodes and axiomatic extensions as edges.
 * * @input onNavigateToDeductive - Callback to drill down into a specific node's proof tree.
 * @output A full-screen interactive graph with a slide-out Detail Panel (Flashcard).
 */
export const StructuralEngine = ({ onNavigateToDeductive }: StructuralEngineProps) => {
  
  // 1. Initialize Graph Data (Using Smart Layout)
  const { nodes: initialGraphNodes, edges: initialGraphEdges } = useMemo(
    // PASS 'structural' MODE HERE:
    () => nodesToGraph(initialNodes, 'structural', initialAxioms), 
    []
  );

  // 2. State Management
  const [nodes, , onNodesChange] = useNodesState(initialGraphNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialGraphEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // 3. Memoized Helpers
  const nodeTypes = useMemo(() => ({ mathNode: MathNode }), []);

  const selectedNodeData = useMemo(() => 
    initialNodes.find(n => n.id === selectedNodeId), 
  [selectedNodeId]);

  // 4. Event Handlers
  const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null); 
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

      {/* The Detail View */}
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
