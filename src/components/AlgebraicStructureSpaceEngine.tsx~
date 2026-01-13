/* src/components/AlgebraicStructureSpaceEngine.tsx */
import React, { useMemo, useState, useCallback } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import { GenericGraphEngine } from './GenericGraphEngine';
import { MathNode } from './MathNode'; 
import { Flashcard } from './Flashcard';
import { nodesToGraph } from '../utils/graphAdapter';
import { initialNodes, initialAxioms, initialTheorems } from '../data/initialData';

interface AlgebraicStructureSpaceEngineProps {
  onNavigateToTheoremSpace: (nodeId: string) => void;
}

/**
 * The Macro-View Engine: Manages the "Algebraic Structure Space".
 * * This engine visualizes the evolutionary map of algebraic structures (e.g., Magmas → Groups → Rings).
 * It handles the "structural" mode of the graph, where nodes represent systems and edges represent axiomatic extensions.
 * * @param onNavigateToTheoremSpace - Callback to transition the view to the Theorem Space (Micro-View) for a selected node.
 */
export const AlgebraicStructureSpaceEngine = ({ onNavigateToTheoremSpace }: AlgebraicStructureSpaceEngineProps) => {
  
  /**
   * Initialize the Graph using the Structural Adapter.
   * This transforms raw StructureNodes into React Flow nodes with 'structural' specific styling.
   */
  const { nodes: initialGraphNodes, edges: initialGraphEdges } = useMemo(
    () => nodesToGraph(initialNodes, 'structural', initialAxioms), 
    []
  );

  const [nodes, , onNodesChange] = useNodesState(initialGraphNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialGraphEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const nodeTypes = useMemo(() => ({ mathNode: MathNode }), []);

  const selectedNodeData = useMemo(() => 
    initialNodes.find(n => n.id === selectedNodeId), 
  [selectedNodeId]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null); 
  }, []);

  const handleToggleMode = useCallback(() => {
    if (selectedNodeId) {
      onNavigateToTheoremSpace(selectedNodeId);
    }
  }, [selectedNodeId, onNavigateToTheoremSpace]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <GenericGraphEngine
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        title="\text{Algebraic Structure Space}"
      />

      {selectedNodeData && (
        <Flashcard 
          node={selectedNodeData}
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
