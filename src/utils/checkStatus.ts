/* src/utils/checkStatus.ts */

// Configuration
export const VERIFICATION_THRESHOLD = 10; 
export const DEPRECATION_THRESHOLD = -2;

/**
 * Pure Logic Function: Determines the status of a theorem based on votes.
 * * Rules:
 * 1. Verified: Net Score >= Threshold (Green)
 * 2. Deprecated: Net Score <= Deprecation Threshold (Yellow)
 * 3. Unverified: Everything else (Red)
 */
export const checkStatus = (green: number, black: number): 'verified' | 'unverified' | 'deprecated' => {
  const netScore = green - black;

  if (netScore >= VERIFICATION_THRESHOLD) {
    return 'verified';
  }


  if (netScore <= DEPRECATION_THRESHOLD) {
    return 'unverified';
  }

  return 'unverified';
};
