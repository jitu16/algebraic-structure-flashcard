/* src/services/theoremService.ts */
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Theorem } from '../types';

/**
 * Interface for the data required to create a new theorem.
 * Defines the contract between the UI (Modal) and this Service.
 */
export interface CreateTheoremInput {
  name: string;
  statementLatex: string;
  proofLatex: string;
}

/**
 * Service: Manages "Write" operations for Mathematical Theorems.
 * Handles the creation, update, and deletion of theorem documents.
 */
export const TheoremService = {

  /**
   * Creates a new Theorem attached to a specific Structure Node.
   * Initializes the theorem with 'unverified' status and zero votes.
   * * @param structureNodeId - The ID of the parent Algebraic Structure.
   * @param data - The input data containing name, statement, and proof.
   * @param authorId - The UID of the creating user.
   */
  async createTheorem(
    structureNodeId: string, 
    data: CreateTheoremInput, 
    authorId: string
  ): Promise<void> {
    const timestamp = Date.now();
    const theoremId = `th-${timestamp}`;

    const newTheorem: Theorem = {
      id: theoremId,
      structureNodeId: structureNodeId,
      name: data.name,
      aliases: [],
      statementLatex: data.statementLatex,
      proofLatex: data.proofLatex,
      authorId: authorId,
      createdAt: timestamp,
      status: 'unverified', // Default start state
      stats: { greenVotes: 0, blackVotes: 0 }
    };

    try {
      await setDoc(doc(db, 'theorems', theoremId), newTheorem);
    } catch (error) {
      console.error("Service Error: Failed to create Theorem", error);
      throw error;
    }
  },

  /**
   * Deletes a Theorem document from the database.
   * * @param theoremId - The ID of the theorem to delete.
   */
  async deleteTheorem(theoremId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'theorems', theoremId));
    } catch (error) {
      console.error("Service Error: Failed to delete Theorem", error);
      throw error;
    }
  },

  /**
   * Updates specific fields of an existing Theorem.
   * Useful for admin edits or author corrections.
   * * @param theoremId - The ID of the theorem to update.
   * @param updates - A partial object containing only the fields to change.
   */
  async updateTheorem(theoremId: string, updates: Partial<Theorem>): Promise<void> {
    try {
      await updateDoc(doc(db, 'theorems', theoremId), updates);
    } catch (error) {
      console.error("Service Error: Failed to update Theorem", error);
      throw error;
    }
  }
};
