/* src/utils/graphAdapter.ts */
import dagre from 'dagre';
import { type Node, type Edge, Position } from '@xyflow/react';
import type { StructureNode, Axiom } from '../types'; 
import { createParentEdge, createDuplicateEdge } from './edgeFactory';

const NODE_WIDTH = 300;
const NODE_HEIGHT = 120;

/**
 * Transforms raw Algebraic Structure data into React Flow nodes and edges.
 * Uses Dagre for automatic hierarchical layout (Top-to-Bottom).
 * * This adapter is exclusively for the Structural Map. It does not handle theorems,
 * as those are now displayed within the Detail Panel (Flashcard).
 * * @param structures - The list of Algebraic Structure nodes to visualize.
 * @param axioms - List of axioms used to generate detailed node labels.
 * @returns An object containing the layouted nodes and edges ready for React Flow.
 */
export const nodesToGraph = (
  structures: StructureNode[], 
  axioms: Axiom[] 
): { nodes: Node[]; edges: Edge[] } => {
  
  // 1. Initialize Dagre Graph
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setGraph({ 
    rankdir: 'TB', 
    nodesep: 50,
    ranksep: 80    
  });
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // 2. Process Nodes
  structures.forEach((structure) => {
    // Generate the rich LaTeX label for the graph node
    const structureName = structure.displayLatex;
    let axiomBlock = "";

    // If an axiom is associated, format it for display inside the node
    if (structure.axiomId) {
      const ax = axioms.find(a => a.id === structure.axiomId);
      if (ax) {
        axiomBlock = `\\\\ \\text{\\small{Axiom: ${ax.canonicalName}}} \\\\ {\\tiny ${ax.defaultLatex}}`;
      }
    }

    // Combine name + axiom into a single LaTeX matrix for rendering
    const label = `\\begin{matrix} \\text{\\textbf{${structureName}}} ${axiomBlock} \\end{matrix}`;

    // Register node dimensions for Dagre layout
    dagreGraph.setNode(structure.id, { width: NODE_WIDTH, height: NODE_HEIGHT });

    // Prepare visual data object
    const visualData = { 
      ...structure,
      displayLatex: label, // Override specific display field for the Graph
      stats: structure.stats || { greenVotes: 0, blackVotes: 0 }
    };

    nodes.push({
      id: structure.id,
      type: 'mathNode',
      data: visualData, 
      position: { x: 0, y: 0 }, // Placeholder, updated by Dagre below
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
    });

    // 3. Process Edges
    if (structure.parentId) {
      edges.push(createParentEdge(structure.parentId, structure.id));
      dagreGraph.setEdge(structure.parentId, structure.id);
    }

    if (structure.duplicateOfId) {
      edges.push(createDuplicateEdge(structure.id, structure.duplicateOfId));
    }
  });

  // 4. Calculate Layout
  dagre.layout(dagreGraph);

  // 5. Apply Calculated Positions
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
      style: { width: NODE_WIDTH, height: NODE_HEIGHT }
    };
  });

  return { nodes: layoutedNodes, edges };
};
