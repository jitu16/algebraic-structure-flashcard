/* src/utils/checkStatus.ts */
import type { AnyGraphNode, NodeStatus } from '../types';

// Configuration
export const VERIFICATION_THRESHOLD = 10; 
export const TRASH_THRESHOLD = -10; 

/**
 * Pure Logic Function: Determines the status of a theorem.
 * * Input: The full node data object.
 * * Priority Order:
 * 1. Deprecated (Admin Flag) - Overrides all votes.
 * 2. Verified (Votes >= 10) - Community consensus.
 * 3. Trash (Votes <= -10) - Community rejection (Admin will be notified of the node).
 * 4. Unverified - Default state.
 */
export const checkStatus = (data: AnyGraphNode): NodeStatus => {
  // 1. Check Admin Flag first (The "Deprecated" status)
  if (data.status == 'deprecated') {
    return 'deprecated';
  }
  
  if (data.status == 'deadend') {
    return 'deadend';
  }

  // 2. Calculate Net Score
  const green = data.stats?.greenVotes || 0;
  const black = data.stats?.blackVotes || 0;
  const netScore = green - black;

  // 3. Check Vote Thresholds
  if (netScore >= VERIFICATION_THRESHOLD && data.status == 'unverified') {
    return 'verified';
  }

  if (netScore <= TRASH_THRESHOLD) {
    return 'trash';
  }

  // 4. Default
  return data.status;
};
