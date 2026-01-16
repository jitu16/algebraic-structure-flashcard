/* src/services/governanceService.ts */
import { 
  doc, 
  runTransaction 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { VoteType } from '../types';

/**
 * Service: Manages the "Trust Ladder" and Community Governance.
 * Responsibilities:
 * 1. Securely casting votes (Green/Black) with atomic counters.
 * 2. Managing the integrity of the voting data (One person, one vote).
 * 3. (Future) Handling flagging and reputation adjustments.
 */
export const GovernanceService = {

  /**
   * Casts, changes, or removes a vote on a mathematical entity.
   * Uses a Firestore Transaction to ensure the vote count matches the vote slips exactly.
   * * Logic:
   * - If the user clicks the SAME vote they already have, it toggles off (removes vote).
   * - If the user clicks a DIFFERENT vote, it swaps (decrements old, increments new).
   * - If the user has NO vote, it adds one (increments new).
   * * @param collectionName - The collection containing the target entity ('nodes' or 'theorems').
   * @param itemId - The ID of the document being voted on.
   * @param userId - The UID of the voter.
   * @param voteType - The type of vote being cast ('green' | 'black').
   */
  async castVote(
    collectionName: 'nodes' | 'theorems',
    itemId: string, 
    userId: string, 
    voteType: VoteType
  ): Promise<void> {
    const itemRef = doc(db, collectionName, itemId);
    const voteRef = doc(db, collectionName, itemId, 'votes', userId);

    try {
      await runTransaction(db, async (transaction) => {
        // 1. Read Phase (Must happen before any writes)
        const itemDoc = await transaction.get(itemRef);
        const voteDoc = await transaction.get(voteRef);

        if (!itemDoc.exists()) {
          throw new Error("Target document does not exist.");
        }

        const currentStats = itemDoc.data().stats || { greenVotes: 0, blackVotes: 0 };
        const existingChoice = voteDoc.exists() ? voteDoc.data().choice : null;
        
        // Map UI vote types ('green'/'black') to stats keys
        let newGreen = currentStats.greenVotes;
        let newBlack = currentStats.blackVotes;

        // 2. Logic Phase: Determine the net effect on counters
        if (existingChoice === voteType) {
          // Toggle Off: Remove existing vote
          transaction.delete(voteRef);
          
          if (voteType === 'green') newGreen--;
          else newBlack--;
          
        } else {
          // Swap or New Vote
          transaction.set(voteRef, { 
            choice: voteType,
            timestamp: Date.now()
          });

          // If swapping, remove the old vote from the counters
          if (existingChoice === 'green') newGreen--;
          if (existingChoice === 'black') newBlack--;

          // Add the new vote to the counters
          if (voteType === 'green') newGreen++;
          else newBlack++;
        }

        // 3. Write Phase: Update parent document counters
        transaction.update(itemRef, {
          stats: {
            greenVotes: Math.max(0, newGreen), // Prevent negative counts
            blackVotes: Math.max(0, newBlack)
          }
        });
      });
    } catch (error) {
      console.error("Governance Service: Vote Transaction failed", error);
      throw error;
    }
  }
};
