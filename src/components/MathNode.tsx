/* src/components/MathNode.tsx */
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import type { StructureNode } from '../types';
import { LatexRenderer } from './LatexRenderer';
import { useVoting } from '../hooks/useVoting';
import { checkStatus } from '../utils/checkStatus';

/**
 * Type alias extending StructureNode with generic record for React Flow compatibility.
 */
type MathNodeData = StructureNode & Record<string, unknown>;

/**
 * A custom React Flow node component representing an Algebraic Structure.
 * * This component is responsible for:
 * 1. Rendering the LaTeX notation of the structure (e.g., "\text{Group}").
 * 2. Visualizing the verification status (Green/Red/Gray/Zombie) via CSS classes.
 * 3. Providing interactive voting controls for community governance.
 * * @param props - Standard React Flow node props containing the StructureNode data.
 */
export const MathNode = ({ data }: NodeProps<Node<MathNodeData, 'mathNode'>>) => {
  
  // Initialize voting hook with current stats
  const { stats, userVote, handleVote } = useVoting({
    greenVotes: data.stats?.greenVotes || 0,
    blackVotes: data.stats?.blackVotes || 0
  });

  // Calculate the live status based on local voting state + admin flags
  const currentStatus = checkStatus({
    ...data,
    stats: stats 
  });
  
  const containerClass = `math-node-container status-${currentStatus}`;
  const upButtonClass = `vote-btn ${userVote === 'up' ? 'active-up' : ''}`;
  const downButtonClass = `vote-btn ${userVote === 'down' ? 'active-down' : ''}`;

  return (
    <div className={containerClass}>
      {/* Incoming Connection Handle (Parent) */}
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ bottom: '0px' }} 
      />
      
      {/* Main Content Area: LaTeX Notation */}
      <div className="math-display-area">
        <LatexRenderer latex={data.displayLatex} />
      </div>
      
      {/* Governance Controls: Voting */}
      <div className="math-node-stats">
        <button 
          className={upButtonClass}
          onClick={(e) => { e.stopPropagation(); handleVote('up'); }}
          title="Vote Valid (Green)"
        >
          ▲ {stats.greenVotes}
        </button>

        <button 
          className={downButtonClass}
          onClick={(e) => { e.stopPropagation(); handleVote('down'); }}
          title="Vote Invalid (Black)"
        >
          ▼ {stats.blackVotes}
        </button>
      </div>

      {/* Outgoing Connection Handle (Children) */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ bottom: '-25px' }}
      />
    </div>
  );
};
