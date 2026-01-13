/* src/components/MathNode.tsx */
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import type { AnyGraphNode } from '../types';
import { LatexRenderer } from './LatexRenderer';
import { useVoting } from '../hooks/useVoting';
import { checkStatus } from '../utils/checkStatus';

// We extend the shared type with an index signature to satisfy React Flow's internal requirements
type MathNodeDataWithIndex = AnyGraphNode & Record<string, unknown>;

/**
 * Visual component for a Graph Node (Structure or Theorem).
 * Renders a mathematical formula (LaTeX) and interactive voting buttons.
 * Dynamically updates its visual status (color) based on vote counts.
 */
export const MathNode = ({ data }: NodeProps<Node<MathNodeDataWithIndex, 'mathNode'>>) => {
  const { stats, userVote, handleVote } = useVoting({
    greenVotes: data.stats?.greenVotes || 0,
    blackVotes: data.stats?.blackVotes || 0
  });

  // Strict Type Guarding: Determine render content based on explicit node type
  let latexToRender = "";
  
  if (data.type === 'algebraic structure') {
    latexToRender = data.displayLatex;
  } else if (data.type === 'theorem') {
    latexToRender = data.statementLatex;
  }
    
  // Dynamically calculate status based on current votes
  const currentStatus = checkStatus(stats.greenVotes, stats.blackVotes);
  const containerClass = `math-node-container status-${currentStatus}`;
  
  const upButtonClass = `vote-btn ${userVote === 'up' ? 'active-up' : ''}`;
  const downButtonClass = `vote-btn ${userVote === 'down' ? 'active-down' : ''}`;

  return (
    <div className={containerClass}>
      <Handle type="target"
	position={Position.Top}
	style={{ bottom: '0px'}} />
      
      <div className="math-display-area">
        <LatexRenderer latex={latexToRender} />
      </div>
      
      <div className="math-node-stats">
        <button 
          className={upButtonClass}
          onClick={(e) => { e.stopPropagation(); handleVote('up'); }}
        >
          ▲ {stats.greenVotes}
        </button>

        <button 
          className={downButtonClass}
          onClick={(e) => { e.stopPropagation(); handleVote('down'); }}
        >
          ▼ {stats.blackVotes}
        </button>
      </div>

      <Handle type="source"
	position={Position.Bottom}
	style={{ bottom: '-25px'}}/>
    </div>
  );
};
