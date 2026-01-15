/* src/hooks/useVoting.ts */
import { useState, useEffect, useCallback } from 'react';
import { doc, runTransaction, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import type { VoteType } from '../types';

interface VotingStats {
  greenVotes: number;
  blackVotes: number;
}

/**
 * A custom hook that manages secure, transactional voting for any collection.
 * Uses atomic transactions to ensure "One Person, One Vote" integrity.
 *
 * @param itemId - The unique ID of the document (Node or Theorem).
 * @param collectionName - The Firestore collection name ('nodes' or 'theorems').
 * @param initialGreen - The initial number of green (valid) votes.
 * @param initialBlack - The initial number of black (invalid) votes.
 * @returns An object containing the current stats, the user's active vote, and the vote handler.
 */
export const useVoting = (
  itemId: string, 
  collectionName: 'nodes' | 'theorems', 
  initialGreen: number, 
  initialBlack: number
) => {
  const { user } = useAuth();
  
  // Local state for immediate UI feedback.
  // We initialize this only once to prevent render loops.
  const [stats, setStats] = useState<VotingStats>({ 
    greenVotes: initialGreen, 
    blackVotes: initialBlack 
  });
  
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Sync local stats ONLY when the actual numbers change in the database.
  useEffect(() => {
    setStats({ greenVotes: initialGreen, blackVotes: initialBlack });
  }, [initialGreen, initialBlack]);

  // 2. Real-time Listener: Check if the current user has an existing vote slip.
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
        if (data.choice === 'green') setUserVote('up');
        else if (data.choice === 'black') setUserVote('down');
      } else {
        setUserVote(null);
      }
    });

    return () => unsubscribe();
  }, [user, itemId, collectionName]);

  // 3. Transaction Handler: Executes the vote safely in the database.
  const handleVote = useCallback(async (newVoteType: 'up' | 'down') => {
    if (!user) {
      alert("Please sign in to vote!");
      return;
    }
    
    setIsLoading(true);
    const itemRef = doc(db, collectionName, itemId);
    const voteRef = doc(db, collectionName, itemId, 'votes', user.uid);

    try {
      await runTransaction(db, async (transaction) => {
        // Read Phase
        const voteDoc = await transaction.get(voteRef);
        const itemDoc = await transaction.get(itemRef);

        if (!itemDoc.exists()) throw new Error("Document does not exist!");

        const currentStats = itemDoc.data().stats || { greenVotes: 0, blackVotes: 0 };
        const existingChoice = voteDoc.exists() ? voteDoc.data().choice : null;
        const targetChoice: VoteType = newVoteType === 'up' ? 'green' : 'black';

        let newGreen = currentStats.greenVotes;
        let newBlack = currentStats.blackVotes;

        // Logic: Toggle or Swap Vote
        if (existingChoice === targetChoice) {
          // Case A: Remove vote (Toggle Off)
          transaction.delete(voteRef);
          if (targetChoice === 'green') newGreen--;
          else newBlack--;
        } else {
          // Case B: Add or Change vote
          transaction.set(voteRef, { 
            choice: targetChoice,
            timestamp: Date.now()
          });
          
          // Remove old vote count if switching sides
          if (existingChoice === 'green') newGreen--;
          if (existingChoice === 'black') newBlack--;

          // Add new vote count
          if (targetChoice === 'green') newGreen++;
          else newBlack++;
        }

        // Write Phase: Commit new totals to parent document
        transaction.update(itemRef, {
          stats: {
            greenVotes: Math.max(0, newGreen),
            blackVotes: Math.max(0, newBlack)
          }
        });
      });
    } catch (error) {
      console.error("Voting Transaction Failed:", error);
      alert("Vote failed. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, [user, itemId, collectionName]);

  return { stats, userVote, handleVote, isLoading };
};
