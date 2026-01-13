/* src/hooks/useVoting.ts */
import { useState, useCallback } from 'react';

interface InitialStats {
  greenVotes: number;
  blackVotes: number;
}

/**
 * Custom Hook to manage voting logic.
 * Handles the math for toggling and swapping votes (Up <-> Down).
 * * @input initialStats - The starting counts from the database/node.
 * @output stats - Current vote counts.
 * @output userVote - The current user's selection ('up' | 'down' | null).
 * @output handleVote - Function to cast a vote.
 */
export const useVoting = (initialStats: InitialStats) => {
  const [stats, setStats] = useState(initialStats);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  const handleVote = useCallback((type: 'up' | 'down') => {
    if (userVote === type) {
      setUserVote(null);
      setStats(prev => ({
        ...prev,
        [type === 'up' ? 'greenVotes' : 'blackVotes']: prev[type === 'up' ? 'greenVotes' : 'blackVotes'] - 1
      }));
      return;
    }

    if (userVote) {
      setUserVote(type);
      setStats(prev => ({
        greenVotes: type === 'up' ? prev.greenVotes + 1 : prev.greenVotes - 1,
        blackVotes: type === 'down' ? prev.blackVotes + 1 : prev.blackVotes - 1
      }));
      return;
    }

    setUserVote(type);
    setStats(prev => ({
      ...prev,
      [type === 'up' ? 'greenVotes' : 'blackVotes']: prev[type === 'up' ? 'greenVotes' : 'blackVotes'] + 1
    }));
    
  }, [userVote]);

  return { stats, userVote, handleVote };
};
