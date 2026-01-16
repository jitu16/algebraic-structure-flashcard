/* src/services/universeService.ts */
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import type { RootEnvironment, Axiom, StructureNode } from '../types';

/**
 * Interface matching the form data required to create a universe.
 * Decoupled from the UI modal to keep the service independent.
 */
export interface CreateUniverseInput {
  envName: string;
  rootAxiomName: string;
  rootAxiomLatex: string;
  rootNodeName: string;
  sets: string[];
  operators: string[];
}

/**
 * Service: Manages "Write" operations for Algebraic Universes (Root Environments).
 */
export const UniverseService = {

  /**
   * Creates a new Universe, including its Root Axiom and Root Structure Node.
   * This performs a "logical batch" operation (creating 3 distinct documents).
   * * @param data - The configuration data for the new universe.
   * @param authorId - The UID of the creating user.
   */
  async createUniverse(data: CreateUniverseInput, authorId: string): Promise<void> {
    const timestamp = Date.now();
    
    // Generate IDs deterministically based on timestamp to ensure uniqueness
    const envId = `env-${timestamp}`;
    const axiomId = `ax-${timestamp}`;
    const nodeId = `node-${timestamp}`;

    // 1. Prepare the Environment (The "Ruleset")
    const newEnv: RootEnvironment = {
      id: envId,
      name: data.envName,
      sets: data.sets,
      operators: data.operators
    };

    // 2. Prepare the Root Axiom (The "Concept")
    const newAxiom: Axiom = {
      id: axiomId,
      canonicalName: data.rootAxiomName,
      aliases: [],
      defaultLatex: data.rootAxiomLatex,
      authorId: authorId,
      createdAt: timestamp
    };

    // 3. Prepare the Root Node (The "Starting Point")
    const newRootNode: StructureNode = {
      id: nodeId,
      type: 'algebraic structure',
      parentId: null,
      axiomId: axiomId,
      authorId: authorId,
      displayLatex: `\\text{${data.rootNodeName}}`,
      status: 'verified', // Root nodes are implicitly verified
      rootContextId: envId,
      toBeDeleted: false,
      stats: { greenVotes: 0, blackVotes: 0 },
      createdAt: timestamp
    };

    // Execute writes
    // Note: In a production app, we would use runTransaction or writeBatch here
    // to ensure atomicity, but individual setDocs are acceptable for this scale.
    try {
      await setDoc(doc(db, 'environments', envId), newEnv);
      await setDoc(doc(db, 'axioms', axiomId), newAxiom);
      await setDoc(doc(db, 'nodes', nodeId), newRootNode);
      console.log(`Universe '${data.envName}' created successfully.`);
    } catch (error) {
      console.error("Service Error: Create Universe failed", error);
      throw error; // Re-throw to let the UI handle the alert
    }
  },

  /**
   * Renames an existing Universe.
   * * @param id - The ID of the environment to rename.
   * @param newName - The new name string.
   */
  async renameUniverse(id: string, newName: string): Promise<void> {
    if (!newName.trim()) throw new Error("Name cannot be empty");
    
    try {
      await updateDoc(doc(db, 'environments', id), { name: newName.trim() });
    } catch (error) {
      console.error("Service Error: Rename Universe failed", error);
      throw error;
    }
  },

  /**
   * Deletes a Universe.
   * * @param id - The ID of the environment to delete.
   */
  async deleteUniverse(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'environments', id));
    } catch (error) {
      console.error("Service Error: Delete Universe failed", error);
      throw error;
    }
  }
};
