/* src/services/axiomService.ts */
import { 
  doc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Axiom } from '../types';

/**
 * Service: Manages "Write" operations for the Global Axiom Registry.
 * * Note: Axioms are shared across Universes. Updates here affect all consumers.
 */
export const AxiomService = {

  /**
   * Updates specific fields of an existing Axiom.
   * Useful for fixing typos in the canonical registry.
   * * @param axiomId - The ID of the axiom to update.
   * @param updates - Partial object containing fields to update (e.g., canonicalName).
   */
  async updateAxiom(axiomId: string, updates: Partial<Axiom>): Promise<void> {
    try {
      await updateDoc(doc(db, 'axioms', axiomId), updates);
    } catch (error) {
      console.error("Service Error: Failed to update Axiom", error);
      throw error;
    }
  },

  /**
   * Deletes an Axiom from the registry.
   * * @param axiomId - The ID of the axiom to delete.
   */
  async deleteAxiom(axiomId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'axioms', axiomId));
    } catch (error) {
      console.error("Service Error: Failed to delete Axiom", error);
      throw error;
    }
  }
};
