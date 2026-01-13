/* src/components/MathNode.tsx */
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import type { AnyGraphNode } from '../types';
import { LatexRenderer } from './LatexRenderer';
import { useVoting } from '../hooks/useVoting';
import { checkStatus } from '../utils/checkStatus';

/**
 * Extended type definition for node data.
 */
type MathNodeDataWithIndex = AnyGraphNode & Record<string, unknown>;

/**
 * Visual component representing a custom Graph Node.
 * Renders LaTeX, manages voting, and displays status based on Admin flags + Votes.
 */
export const MathNode = ({ data }: NodeProps<Node<MathNodeDataWithIndex, 'mathNode'>>) => {
  const { stats, userVote, handleVote } = useVoting({
    greenVotes: data.stats?.greenVotes || 0,
    blackVotes: data.stats?.blackVotes || 0
  });

  /* Determine content to render based on node type. */
  let latexToRender = "";
  if (data.type === 'algebraic structure') {
    latexToRender = data.displayLatex;
  } else if (data.type === 'theorem') {
    latexToRender = data.statementLatex;
  }
    
  /* * STATUS CHECK:
   * We now pass the WHOLE `data` object. 
   * This allows checkStatus to see the 'isDeprecated' admin flag.
   * Note: We construct a temporary object combining live 'stats' with the static 'data'
   * to ensure the status updates instantly when the user votes.
   */
  const currentStatus = checkStatus({
    ...data,
    stats: stats // Use the live stats from the hook, not the initial data
  });
  
  const containerClass = `math-node-container status-${currentStatus}`;
  
  const upButtonClass = `vote-btn ${userVote === 'up' ? 'active-up' : ''}`;
  const downButtonClass = `vote-btn ${userVote === 'down' ? 'active-down' : ''}`;

  return (
    <div className={containerClass}>
      <Handle type="target" position={Position.Top} style={{ bottom: '0px'}} />
      
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

      <Handle type="source" position={Position.Bottom} style={{ bottom: '-25px'}}/>
    </div>
  );
};
