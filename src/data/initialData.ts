/* src/data/initialData.ts */
import type { 
  Axiom, 
  StructureNode, 
  TheoremNode, 
  RootEnvironment 
} from '../types';

// ==========================================
// 1. THE ENVIRONMENT (The Playground)
// ==========================================
export const initialEnvironment: RootEnvironment = {
  id: 'env_additive_magma',
  name: 'Additive Magma',
  sets: ['S'],
  operators: ['+']
};

// ==========================================
// 2. THE AXIOMS (Concepts)
// ==========================================
export const initialAxioms: Axiom[] = [
  {
    id: 'axComm',
    canonicalName: '\\text{Commutativity}',
    aliases: ['Symmetric', 'Abelian'],
    defaultLatex: 'a + b = b + a',
    authorId: 'systemAdmin',
    createdAt: Date.now(),
  },
  {
    id: 'axAssoc',
    canonicalName: '\\text{Associativity}',
    aliases: ['Grouping'],
    defaultLatex: '(a + b) + c = a + (b + c)',
    authorId: 'systemAdmin',
    createdAt: Date.now(),
  },
  {
    id: 'axIdent',
    canonicalName: '\\text{Identity Element}',
    aliases: ['Neutral Element', 'Unity'],
    defaultLatex: '\\exists e : a + e = a',
    authorId: 'systemAdmin',
    createdAt: Date.now(),
  },
  {
    id: 'axInv',
    canonicalName: '\\text{Inverse Element}',
    aliases: ['Reversibility'],
    defaultLatex: '\\forall a, \\exists a^{-1} : a + a^{-1} = e',
    authorId: 'systemAdmin',
    createdAt: Date.now(),
  },
];

// ==========================================
// 3. THE STRUCTURAL TREE (Nodes)
// ==========================================
export const initialNodes: StructureNode[] = [
  // --- LEVEL 0: GENESIS (Definitions only) ---
  {
    id: 'node_genesis',
    parentId: null, // The Absolute Root
    axiomId: null,  // No Axiom, just definitions
    authorId: 'systemAdmin',
    displayLatex: '\\text{Magma } (S, +)', 
    status: 'verified',
    toBeDeleted: false,
    stats: { greenVotes: 100, blackVotes: 0, yellowFlags: 0 },
    createdAt: Date.now(),
  },

  // --- LEVEL 1: FIRST PRINCIPLES ---
  {
    id: 'nodeRootComm',
    parentId: 'node_genesis', // Now a child of Genesis
    authorId: 'systemAdmin',
    axiomId: 'axComm',
    displayLatex: 'x + y = y + x',
    status: 'unverified',
    toBeDeleted: false,
    stats: { greenVotes: 50, blackVotes: 1, yellowFlags: 0 },
    createdAt: Date.now(),
  },
  {
    id: 'nodeRootAssoc',
    parentId: 'node_genesis', // Now a child of Genesis
    authorId: 'systemAdmin',
    axiomId: 'axAssoc',
    displayLatex: '(x + y) + z = x + (y + z)',
    status: 'verified',
    toBeDeleted: false,
    stats: { greenVotes: 45, blackVotes: 0, yellowFlags: 0 },
    createdAt: Date.now(),
  },

  // --- LEVEL 2: COMBINATIONS ---
  {
    id: 'nodeCommAssoc',
    parentId: 'nodeRootComm',
    authorId: 'userContributor',
    axiomId: 'axAssoc',
    displayLatex: '(x + y) + z = x + (y + z)',
    status: 'verified',
    toBeDeleted: false,
    stats: { greenVotes: 20, blackVotes: 0, yellowFlags: 0 },
    createdAt: Date.now(),
  },
  {
    id: 'nodeAssocComm',
    parentId: 'nodeRootAssoc',
    authorId: 'userContributor',
    axiomId: 'axComm',
    displayLatex: 'x + y = y + x',
    status: 'verified',
    toBeDeleted: false,
    stats: { greenVotes: 20, blackVotes: 0, yellowFlags: 0 },
    createdAt: Date.now(),
  },

  // --- THE ZOMBIE BRANCH ---
  {
    id: 'nodeZombieDuplicate',
    parentId: 'nodeCommAssoc',
    authorId: 'userNovice',
    axiomId: 'axAssoc',
    displayLatex: '\\text{Duplicate of Node A}',
    status: 'deprecated', // FLASH YELLOW
    duplicateOfId: 'nodeCommAssoc',
    toBeDeleted: true,
    stats: { greenVotes: 2, blackVotes: 10, yellowFlags: 5 },
    createdAt: Date.now(),
  },
  {
    id: 'nodeZombieChild',
    parentId: 'nodeZombieDuplicate',
    authorId: 'userNovice',
    axiomId: 'axIdent',
    displayLatex: 'x + 0 = x',
    status: 'deprecated',
    toBeDeleted: true,
    stats: { greenVotes: 0, blackVotes: 0, yellowFlags: 0 },
    createdAt: Date.now(),
  },
];

// ==========================================
// 4. THE DEDUCTIVE TREE (Theorems)
// ==========================================
export const initialTheorems: TheoremNode[] = [
  {
    id: 'thm_unique_identity',
    rootNodeId: 'node_genesis',
    parentId: 'thm_magma_closure',
    name: "\\text{Uniqueness of Identity}",
    aliases: ["Identity Uniqueness"],
    statementLatex: "\\text{The identity element } e \\text{ is unique.}",
    proofLatex: "\\text{Assume } e, e' \\text{ are identities...}",
    authorId: 'user_gauss',
    toBeDeleted: false,
    status: 'verified',
    stats: { greenVotes: 42, blackVotes: 1 },
    createdAt: Date.now()
  },
  {
    id: 'thm_socks_shoes',
    rootNodeId: 'node_genesis',
    parentId: 'thm_unique_identity',
    name: "\\text{Socks and Shoes Property}",
    aliases: ["Reverse Inverse Law"],
    statementLatex: "(a b)^{-1} = b^{-1}a^{-1}",
    proofLatex: "\\text{Multiply } a b \\text{ by } b^{-1}a^{-1}...",
    authorId: 'user_euler',
    toBeDeleted: true,
    status: 'verified',
    stats: { greenVotes: 120, blackVotes: 5 },
    createdAt: Date.now()
  },
  {
    id: 'thm-1',
    rootNodeId: 'nodeRootComm', // Context
    parentId: null, // First logic step
    statementLatex: 'x + 0 = 0 + x',
    name: "\\text{Foo}",
    aliases: ["Bar"],        
    proofLatex: '\\text{Direct application of the commutativity axiom where y = 0}.',
    authorId: 'systemAdmin',
    status: 'verified',
    toBeDeleted: false,
    stats: { greenVotes: 10, blackVotes: 0 },
    createdAt: Date.now()
  },
  {
    id: 'thm-2',
    rootNodeId: 'nodeCommAssoc', // Context
    parentId: null,
    statementLatex: 'x + (y + z) = (z + y) + x',
    name: "\\text{Ola}",
    aliases: [],
    proofLatex: '\\text{Combine Associativity to group (y+z) then Commutativity to swap the order.}',
    authorId: 'userContributor',
    status: 'verified',
    toBeDeleted: false,
    stats: { greenVotes: 5, blackVotes: 0 },
    createdAt: Date.now()
  },
  {
    id: 'thm_magma_closure',
    rootNodeId: 'node_genesis', // <--- Links this theorem to Magma
    parentId: null,
    statementLatex: '\\forall a, b \\in S, a * b \\in S',
    name: "\\text{Stupid Theorem}",
    aliases: ["GGT"],
    proofLatex: '\\text{By definition of a binary operation on a set.}',
    authorId: 'systemAdmin',
    status: 'verified',
    toBeDeleted: false,
    stats: { greenVotes: 100, blackVotes: 0 },
    createdAt: Date.now()
  }
];
