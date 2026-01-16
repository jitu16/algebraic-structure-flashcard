/* src/services/structureService.ts */
import { 
  doc, 
  setDoc, 
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import type { StructureNode, Axiom } from '../types';

/**
 * Interface matching the form data required to extend the graph.
 */
export interface CreateStructureInput {
  parentId: string;
  rootContextId: string; // The Universe ID
  structureName: string;
  
  // Axiom Selection: Either link to existing OR define new
  existingAxiomId?: string | null;
  axiomName?: string;
  axiomLatex?: string;
}

/**
 * Service: Manages "Write" operations for Algebraic Structure Nodes.
 * Handles the relationship between Nodes and Axioms.
 */
export const StructureService = {

  /**
   * Extends the algebraic tree by creating a new Structure Node.
   * If a new axiom definition is provided, it creates that first.
   * * @param data - Configuration for the new node and its axiom.
   * @param authorId - The UID of the creating user.
   */
  async createStructure(data: CreateStructureInput, authorId: string): Promise<void> {
    const timestamp = Date.now();
    let finalAxiomId = data.existingAxiomId;

    // 1. Handle Axiom Creation (if not selecting an existing one)
    if (!finalAxiomId) {
      if (!data.axiomName || !data.axiomLatex) {
        throw new Error("Missing axiom definition.");
      }

      finalAxiomId = `ax-${timestamp}`;
      const newAxiom: Axiom = {
        id: finalAxiomId,
        canonicalName: data.axiomName,
        aliases: [],
        defaultLatex: data.axiomLatex,
        authorId: authorId,
        createdAt: timestamp
      };

      try {
        await setDoc(doc(db, 'axioms', newAxiom.id), newAxiom);
      } catch (error) {
        console.error("Service Error: Failed to create new Axiom", error);
        throw error;
      }
    }

    // 2. Create the Structure Node
    const newStructureId = `struct-${timestamp}`;
    const newStructure: StructureNode = {
      id: newStructureId,
      type: 'algebraic structure',
      parentId: data.parentId,
      axiomId: finalAxiomId,
      authorId: authorId,
      displayLatex: data.structureName,
      status: 'unverified', // New nodes start as Red
      rootContextId: data.rootContextId,
      toBeDeleted: false,
      stats: { greenVotes: 0, blackVotes: 0 },
      createdAt: timestamp
    };

    try {
      await setDoc(doc(db, 'nodes', newStructure.id), newStructure);
    } catch (error) {
      console.error("Service Error: Failed to create Structure Node", error);
      throw error;
    }
  },

  /**
   * Deletes a Structure Node.
   * Note: This strictly deletes the node. The caller (UI) is responsible for 
   * checking safety conditions (e.g., "Does this node have children?").
   * * @param nodeId - The ID of the node to delete.
   */
  async deleteStructure(nodeId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'nodes', nodeId));
    } catch (error) {
      console.error("Service Error: Failed to delete Structure Node", error);
      throw error;
    }
  },
  
  /**
   * Updates specific fields of an existing Structure Node.
   * * @param nodeId - The ID of the node to update.
   * @param updates - Partial object containing fields to update.
   */
  async updateStructure(nodeId: string, updates: Partial<StructureNode>): Promise<void> {
    try {
      await updateDoc(doc(db, 'nodes', nodeId), updates);
    } catch (error) {
      console.error("Service Error: Failed to update Structure Node", error);
      throw error;
    }
  }
};
