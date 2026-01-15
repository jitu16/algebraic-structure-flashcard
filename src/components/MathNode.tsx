/* src/components/MathNode.tsx */
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import type { StructureNode } from '../types';
import { LatexRenderer } from './LatexRenderer';
import { useVoting } from '../hooks/useVoting';
import { checkStatus } from '../utils/checkStatus';

type MathNodeData = StructureNode & Record<string, unknown>;

/**
 * A custom React Flow node component representing an Algebraic Structure.
 * Integrates real-time governance status and interactive voting controls.
 */
export const MathNode = ({ data }: NodeProps<Node<MathNodeData, 'mathNode'>>) => {
  
  const { stats, userVote, handleVote, isLoading } = useVoting(
    data.id,
    'nodes',
    data.stats?.greenVotes || 0,
    data.stats?.blackVotes || 0
  );

  const currentStatus = checkStatus({
    ...data,
    stats: stats 
  });
  
  const containerClass = `math-node-container status-${currentStatus}`;
  const upButtonClass = `vote-btn ${userVote === 'up' ? 'active-up' : ''}`;
  const downButtonClass = `vote-btn ${userVote === 'down' ? 'active-down' : ''}`;

  return (
    <div className={containerClass}>
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ bottom: '0px' }} 
      />
      
      <div className="math-display-area">
        <LatexRenderer latex={data.displayLatex} />
      </div>
      
      <div className="math-node-stats">
        <button 
          className={upButtonClass}
          onClick={(e) => { e.stopPropagation(); handleVote('up'); }}
          disabled={isLoading}
          title="Vote Valid (Green)"
        >
          ▲ {stats.greenVotes}
        </button>

        <button 
          className={downButtonClass}
          onClick={(e) => { e.stopPropagation(); handleVote('down'); }}
          disabled={isLoading}
          title="Vote Invalid (Black)"
        >
          ▼ {stats.blackVotes}
        </button>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ bottom: '-25px' }}
      />
    </div>
  );
};
