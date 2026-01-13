/* src/utils/graphAdapter.ts */
import dagre from 'dagre';
import { type Node, type Edge, Position } from '@xyflow/react';
import type { StructureNode, TheoremNode, Axiom, AnyGraphNode } from '../types'; 
import { createParentEdge, createDuplicateEdge } from './edgeFactory';

const NODE_WIDTH = 300;
const NODE_HEIGHT = 120;

type GraphMode = 'structural' | 'deductive';

/**
 * Transforms raw logic data into React Flow nodes and edges.
 * Uses Dagre for automatic layout calculations to arrange nodes hierarchically.
 * * @param dataNodes - The list of nodes (Structures or Theorems) to visualize.
 * @param mode - The current visualization mode ('structural' or 'deductive').
 * @param axioms - Optional list of axioms. Required in 'structural' mode to generate detailed labels.
 * @returns An object containing the layouted nodes and edges ready for React Flow.
 */
export const nodesToGraph = (
  dataNodes: AnyGraphNode[], 
  mode: GraphMode,
  axioms?: Axiom[] 
): { nodes: Node[]; edges: Edge[] } => {
  
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setGraph({ 
    rankdir: 'TB', 
    nodesep: 50,
    ranksep: 80    
  });
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  dataNodes.forEach((data) => {
    let label = "";
    
    if (data.type === 'algebraic structure') {
      const structureName = data.displayLatex;
      
      let axiomBlock = "";
      if (axioms && data.axiomId) {
        const ax = axioms.find(a => a.id === data.axiomId);
        if (ax) {
          axiomBlock = `\\\\ \\text{\\small{Axiom: ${ax.canonicalName}}} \\\\ {\\tiny ${ax.defaultLatex}}`;
        }
      }

      label = `\\begin{matrix} \\text{\\textbf{${structureName}}} ${axiomBlock} \\end{matrix}`;

    } else if (data.type === 'theorem') {
      const name = data.name;
      const statement = data.statementLatex;
      label = `\\begin{matrix} \\text{\\textbf{${name}}} \\\\ {\\small ${statement}} \\end{matrix}`;
    }

    dagreGraph.setNode(data.id, { width: NODE_WIDTH, height: NODE_HEIGHT });

    const visualData = { 
      ...data,
      stats: data.stats || { greenVotes: 0, blackVotes: 0 }
    };

    if (data.type === 'algebraic structure') {
      (visualData as StructureNode).displayLatex = label;
    } else if (data.type === 'theorem') {
      (visualData as TheoremNode).statementLatex = label;
    }

    nodes.push({
      id: data.id,
      type: 'mathNode',
      data: visualData as any, 
      position: { x: 0, y: 0 }, 
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
    });

    if (data.parentId) {
      edges.push(createParentEdge(data.parentId, data.id));
      dagreGraph.setEdge(data.parentId, data.id);
    }

    if (data.duplicateOfId) {
      edges.push(createDuplicateEdge(data.id, data.duplicateOfId));
    }
  });

  dagre.layout(dagreGraph);

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
