/* src/utils/graphAdapter.ts */
import dagre from 'dagre';
import { type Node, type Edge, Position } from '@xyflow/react';
import type { StructureNode, TheoremNode, Axiom } from '../types'; 
import { createParentEdge, createDuplicateEdge } from './edgeFactory';

// Compact sizes since we are using names now
const NODE_WIDTH = 200;
const NODE_HEIGHT = 60;

type GraphMode = 'structural' | 'deductive';

export const nodesToGraph = (
  dataNodes: (StructureNode | TheoremNode)[], 
  mode: GraphMode,
  axioms?: Axiom[] // <--- NEW PARAMETER (Needed for lookup)
): { nodes: Node[]; edges: Edge[] } => {
  
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setGraph({ 
    rankdir: 'TB', 
    nodesep: 40,   
    ranksep: 60    
  });
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  dataNodes.forEach((data) => {
    // 1. DETERMINE LABEL
    let label = "";
    
    if (mode === 'structural') {
      const sNode = data as StructureNode;
      if (sNode.axiomId && axioms) {
        // Look up the Axiom Name (e.g., "Associativity")
        const linkedAxiom = axioms.find(ax => ax.id === sNode.axiomId);
        label = linkedAxiom ? `\\text{${linkedAxiom.canonicalName}}` : "\\text{Definition}";
      } else {
        // Genesis Node fallback
        label = "\\text{Genesis}";
      }
    } else {
      // Theorem Mode: Use the explicit name
      const tNode = data as TheoremNode;
      label = `\\text{${tNode.name}}`;
    }

    dagreGraph.setNode(data.id, { width: NODE_WIDTH, height: NODE_HEIGHT });

    nodes.push({
      id: data.id,
      type: 'mathNode',
      data: { 
        ...data, 
        // We inject the NAME into displayLatex so MathNode renders it nicely
        displayLatex: label,
        stats: data.stats || { greenVotes: 0, blackVotes: 0 }
      },
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
    };
  });

  return { nodes: layoutedNodes, edges };
};
