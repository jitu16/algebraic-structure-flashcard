/* src/utils/checkStatus.ts */
import type { AnyGraphNode, NodeStatus } from '../types';

// Configuration
export const VERIFICATION_THRESHOLD = 10; 
export const TRASH_THRESHOLD = -10; 

/**
 * Pure Logic Function: Determines the lifecycle status of a mathematical entity.
 * Works polymorphically for both Algebraic Structures (Nodes) and Theorems.
 * * * Priority Order:
 * 1. Admin Overrides: 'deprecated' (Zombie) or 'deadend' (Gray) are final.
 * 2. Community Verification: Net Score >= 10 -> 'verified' (Green).
 * 3. Community Rejection: Net Score <= -10 -> 'trash' (Flashing Red).
 * 4. Default: 'unverified' (Red).
 * * @param entity - The StructureNode or Theorem object to evaluate.
 * @returns The computed NodeStatus.
 */
export const checkStatus = (entity: AnyGraphNode): NodeStatus => {
  // 1. Check Admin Flags first (Immutable States)
  if (entity.status === 'deprecated') {
    return 'deprecated';
  }
  
  if (entity.status === 'deadend') {
    return 'deadend';
  }

  // 2. Calculate Net Reputation Score
  const green = entity.stats?.greenVotes || 0;
  const black = entity.stats?.blackVotes || 0;
  const netScore = green - black;

  // 3. Check Verification Thresholds (Red -> Green)
  if (netScore >= VERIFICATION_THRESHOLD && entity.status === 'unverified') {
    return 'verified';
  }

  // 4. Check Rejection Thresholds (Red -> Trash)
  if (netScore <= TRASH_THRESHOLD) {
    return 'trash';
  }

  // 5. Default Fallback (Preserve existing status if no thresholds met)
  return entity.status;
};
