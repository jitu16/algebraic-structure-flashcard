/* src/hooks/useVoting.ts */
import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast'; // NEW IMPORT
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { GovernanceService } from '../services/governanceService';
import type { VoteType } from '../types';

interface VotingStats {
  greenVotes: number;
  blackVotes: number;
}

/**
 * A custom hook that manages the interactive voting state for a specific entity.
 * * Responsibilities:
 * 1. Listening: Subscribes to the specific User's vote slip (Real-time).
 * 2. Display: Manages local stats state for immediate rendering.
 * 3. Action: Delegates the actual vote mutation to the GovernanceService.
 * * @param itemId - The unique ID of the document (Node or Theorem).
 * @param collectionName - The Firestore collection name ('nodes' or 'theorems').
 * @param initialGreen - The initial number of green (valid) votes.
 * @param initialBlack - The initial number of black (invalid) votes.
 * @returns An object containing current stats, the user's active vote, and the vote handler.
 */
export const useVoting = (
  itemId: string, 
  collectionName: 'nodes' | 'theorems', 
  initialGreen: number, 
  initialBlack: number
) => {
  const { user } = useAuth();
  
  // Local state for UI display. 
  // Initially synced with props, then potentially updated by parent re-renders.
  const [stats, setStats] = useState<VotingStats>({ 
    greenVotes: initialGreen, 
    blackVotes: initialBlack 
  });
  
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Sync local stats when parent data changes
  useEffect(() => {
    setStats({ greenVotes: initialGreen, blackVotes: initialBlack });
  }, [initialGreen, initialBlack]);

  // 2. Real-time Listener: Subscribe to the current user's vote status
  useEffect(() => {
    if (!user || !itemId) {
      setUserVote(null);
      return;
    }

    // Path: collection -> item -> votes (subcollection) -> userId
    const voteRef = doc(db, collectionName, itemId, 'votes', user.uid);
    
    const unsubscribe = onSnapshot(voteRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Map Database types to UI types
        if (data.choice === 'green') setUserVote('up');
        else if (data.choice === 'black') setUserVote('down');
      } else {
        setUserVote(null);
      }
    });

    return () => unsubscribe();
  }, [user, itemId, collectionName]);

  // 3. Action Handler: Delegate logic to GovernanceService
  const handleVote = useCallback(async (newVoteType: 'up' | 'down') => {
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }
    
    setIsLoading(true);

    // Map UI intent ('up'/'down') to Domain Language ('green'/'black')
    const targetDomainVote: VoteType = newVoteType === 'up' ? 'green' : 'black';

    try {
      await GovernanceService.castVote(
        collectionName,
        itemId,
        user.uid,
        targetDomainVote
      );
      // Note: We don't toast on success here to avoid spamming the user on every click.
      // The button state change is sufficient feedback.
    } catch (error) {
      console.error("Voting Failed:", error);
      toast.error("Vote failed. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, [user, itemId, collectionName]);

  return { stats, userVote, handleVote, isLoading };
};
