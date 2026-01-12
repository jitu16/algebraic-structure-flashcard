//import { MarkerType } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import type { StructureNode } from '../types'; 
import { createParentEdge, createDuplicateEdge } from './edgeFactory';

export const nodesToGraph = (structureNode: StructureNode[]): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const levelCounts: Record<number, number> = {}; 

  structureNode.forEach((node) => {
    const level = node.parentId ? 2 : 1; 
    if (!levelCounts[level]) levelCounts[level] = 0;
    
    const xPos = levelCounts[level] * 250;
    const yPos = (level - 1) * 200;
    levelCounts[level]++;

    nodes.push({
      id: node.id,
      position: { x: xPos, y: yPos },
      type: 'mathNode', 
      data: { ...node }, 
    });

    if (node.parentId) {edges.push(createParentEdge(node.parentId,node.id));}

    if (node.duplicateOfId) {edges.push(createDuplicateEdge(node.id,node.duplicateOfId));}
  });

  return { nodes, edges };
};
