/* src/components/MathNode.tsx */
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
// REMOVED: import katex from 'katex';
import type { StructureNode, TheoremNode } from '../types';
import { LatexRenderer } from './LatexRenderer'; // <--- Import the new component

// ------------------------------------------------------------------
// TYPES
// ------------------------------------------------------------------

type MathNodeData = StructureNode | TheoremNode;
type MathNodeDataWithIndex = MathNodeData & Record<string, unknown>;

// ------------------------------------------------------------------
// COMPONENT
// ------------------------------------------------------------------

/**
 * Visual component for a Graph Node (Structure or Theorem).
 * Renders a mathematical formula (LaTeX) and voting statistics.
 */
export const MathNode = ({ data }: NodeProps<Node<MathNodeDataWithIndex, 'mathNode'>>) => {
  
  // Logic: Determine what string to render
  const latexToRender: string = (typeof data.displayLatex === 'string' ? data.displayLatex : '')
    || (data as TheoremNode).statementLatex
    || "";
  const containerClass = `math-node-container status-${data.status}`;

  return (
    <div className={containerClass}>
      <Handle type="target" position={Position.Top} />
      
      {/* Replaced manual Ref/Effect with the modular component */}
      <div className="math-display-area">
        <LatexRenderer latex={latexToRender} />
      </div>
      
      <div className="math-node-stats">
        <span className="stat-green">▲ {data.stats?.greenVotes || 0}</span>
        <span className="stat-black">▼ {data.stats?.blackVotes || 0}</span>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
