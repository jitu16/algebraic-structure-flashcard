/**
 * @file src/utils/graphAdapter.ts
 * @description Pure functions to transform our scientific 'MathNode' data 
 * into visual 'ReactFlow' nodes and edges.
 */

import { MarkerType } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import type { MathNode } from '../types';

// ==========================================
// 1. STYLE CONFIGURATIONS
// ==========================================

const NODE_STYLES = {
  verified: { background: '#ccffcc', border: '1px solid #006400', color: '#006400' }, // Green
  unverified: { background: '#ffcccc', border: '1px solid #8b0000', color: '#8b0000' }, // Red
  contested: { background: '#ffffcc', border: '1px solid #b8860b', color: '#b8860b' }, // Yellow
  dead_end: { background: '#f0f0f0', border: '1px solid #666', color: '#666' },       // Gray
  // The Zombie Style (Deprecation)
  deprecated: { 
    background: '#ffff00', 
    border: '2px dashed #000', 
    color: '#000',
    opacity: 0.7 
  },
};

// ==========================================
// 2. TRANSFORMERS
// ==========================================

/**
 * Converts our MathNodes into React Flow Nodes.
 * automatically calculates layout positions (simple tree layout for now).
 */
export const nodesToGraph = (mathNodes: MathNode[]): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Simple layout counters (mocking a tree structure for visualization)
  // In the real app, we will use a proper layout library like 'dagre'.
  const levelCounts: Record<number, number> = {}; 

  mathNodes.forEach((mn) => {
    // 1. Determine Level (Depth in tree)
    // Note: For now, we manually approximate. Real implementation needs a tree traversal.
    const level = mn.parentId ? 2 : 1; 
    if (!levelCounts[level]) levelCounts[level] = 0;
    
    // 2. Calculate Position (Mock Layout)
    const xPos = levelCounts[level] * 250; // Spread horizontally
    const yPos = (level - 1) * 200;        // Spread vertically
    levelCounts[level]++;

    // 3. Create the Visual Node
    nodes.push({
      id: mn.id,
      position: { x: xPos, y: yPos },
      data: { 
        label: mn.displayLatex, // We will eventually replace this with a Custom Component
        status: mn.status,
        stats: mn.stats
      },
      style: {
        ...NODE_STYLES[mn.status],
        width: 180,
        padding: 10,
        borderRadius: 5,
        fontWeight: 'bold',
        textAlign: 'center',
        // Zombie Logic: Add flashing animation class if deprecated
        animation: mn.toBeDeleted ? 'pulse-yellow 2s infinite' : 'none'
      },
      type: 'default', // We will swap this for 'mathNode' later
    });

    // 4. Create the Edge (Connection)
    if (mn.parentId) {
      edges.push({
        id: `e-${mn.parentId}-${mn.id}`,
        source: mn.parentId,
        target: mn.id,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#333' },
      });
    }

    // 5. Create Isomorphism Links (The Wormholes)
    mn.isomorphicToIds.forEach((isoId) => {
      edges.push({
        id: `iso-${mn.id}-${isoId}`,
        source: mn.id,
        target: isoId,
        type: 'straight',
        animated: true, // Dashed moving line
        style: { stroke: '#0000FF', strokeDasharray: 5 },
        label: 'Isomorphic',
      });
    });
  });

  return { nodes, edges };
};
