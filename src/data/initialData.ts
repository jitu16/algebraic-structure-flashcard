/**
 * @file src/data/initialData.ts
 * @description Static seed data to simulate the database. 
 * Includes examples of verified nodes, zombies (deprecated), and isomorphisms.
 */

import type { Axiom, MathNode } from '../types';

// ==========================================
// 1. THE AXIOMS (Concepts)
// ==========================================

export const INITIAL_AXIOMS: Axiom[] = [
  {
    id: 'ax_comm',
    canonicalName: 'Commutativity',
    aliases: ['Symmetric', 'Abelian'],
    defaultLatex: 'a \\cdot b = b \\cdot a',
    authorId: 'system_admin',
    createdAt: Date.now(),
  },
  {
    id: 'ax_assoc',
    canonicalName: 'Associativity',
    aliases: ['Grouping'],
    defaultLatex: '(a \\cdot b) \\cdot c = a \\cdot (b \\cdot c)',
    authorId: 'system_admin',
    createdAt: Date.now(),
  },
  {
    id: 'ax_ident',
    canonicalName: 'Identity Element',
    aliases: ['Neutral Element', 'Unity'],
    defaultLatex: '\\exists e : a \\cdot e = a',
    authorId: 'system_admin',
    createdAt: Date.now(),
  },
  {
    id: 'ax_inv',
    canonicalName: 'Inverse Element',
    aliases: ['Reversibility'],
    defaultLatex: '\\forall a, \\exists a^{-1} : a \\cdot a^{-1} = e',
    authorId: 'system_admin',
    createdAt: Date.now(),
  },
  {
    id: 'ax_dist',
    canonicalName: 'Distributivity',
    aliases: [],
    defaultLatex: 'a \\cdot (b + c) = (a \\cdot b) + (a \\cdot c)',
    authorId: 'system_admin',
    createdAt: Date.now(),
  },
];

// ==========================================
// 2. THE NODES (The Tree)
// ==========================================

export const INITIAL_NODES: MathNode[] = [
  // --- LEVEL 1: ROOTS ---
  {
    id: 'node_root_comm',
    parentId: null, // Root
    authorId: 'system_admin',
    axiomId: 'ax_comm',
    displayLatex: 'x + y = y + x', // Using additive notation
    status: 'unverified',
    isomorphicToIds: [],
    toBeDeleted: false,
    stats: { greenVotes: 50, blackVotes: 1, yellowFlags: 0 },
    createdAt: Date.now(),
  },
  {
    id: 'node_root_assoc',
    parentId: null, // Root
    authorId: 'system_admin',
    axiomId: 'ax_assoc',
    displayLatex: '(x + y) + z = x + (y + z)',
    status: 'verified',
    isomorphicToIds: [],
    toBeDeleted: false,
    stats: { greenVotes: 45, blackVotes: 0, yellowFlags: 0 },
    createdAt: Date.now(),
  },

  // --- LEVEL 2: COMBINATIONS ---
  
  // Node A: Commutative + Associative (Foundation of Abelian Group)
  {
    id: 'node_comm_assoc',
    parentId: 'node_root_comm', // Child of Commutativity
    authorId: 'user_contributor',
    axiomId: 'ax_assoc', // Adds Associativity
    displayLatex: '(x + y) + z = x + (y + z)',
    status: 'verified',
    isomorphicToIds: ['node_assoc_comm'], // Links to Node B (Type 1 Iso)
    toBeDeleted: false,
    stats: { greenVotes: 20, blackVotes: 0, yellowFlags: 0 },
    createdAt: Date.now(),
  },

  // Node B: Associative + Commutative (Same logic, different path)
  {
    id: 'node_assoc_comm',
    parentId: 'node_root_assoc', // Child of Associativity
    authorId: 'user_contributor',
    axiomId: 'ax_comm', // Adds Commutativity
    displayLatex: 'x + y = y + x',
    status: 'verified',
    isomorphicToIds: ['node_comm_assoc'], // Links to Node A (Type 1 Iso)
    toBeDeleted: false,
    stats: { greenVotes: 20, blackVotes: 0, yellowFlags: 0 },
    createdAt: Date.now(),
  },

  // --- THE ZOMBIE BRANCH (Type 2 Isomorphism test) ---
  
  // Node C: A duplicate created by accident
  {
    id: 'node_zombie_duplicate',
    parentId: 'node_root_comm',
    authorId: 'user_novice',
    axiomId: 'ax_assoc',
    displayLatex: 'Duplicate of Node A',
    status: 'deprecated', // <--- FLASH YELLOW
    isomorphicToIds: [],
    
    // The "One-Way Ticket" pointers
    duplicateOfId: 'node_comm_assoc', // Survivor is Node A
    toBeDeleted: true,
    
    stats: { greenVotes: 2, blackVotes: 10, yellowFlags: 5 },
    createdAt: Date.now(),
  },
  
  // Node D: The Child of the Zombie (Should also inherit Flash logic in UI)
  {
    id: 'node_zombie_child',
    parentId: 'node_zombie_duplicate',
    authorId: 'user_novice',
    axiomId: 'ax_ident',
    displayLatex: 'x + 0 = x',
    status: 'deprecated', // Inherited status
    isomorphicToIds: [],
    duplicateOfId: undefined, // Hasn't been manually mapped yet
    toBeDeleted: true,        // Inherited flag
    stats: { greenVotes: 0, blackVotes: 0, yellowFlags: 0 },
    createdAt: Date.now(),
  },
];
