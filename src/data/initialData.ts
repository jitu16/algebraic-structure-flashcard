/* src/data/initialData.ts */
import type { StructureNode, Axiom, Theorem, RootEnvironment } from '../types';

const NOW = Date.now();

/**
 * 1. ROOT ENVIRONMENTS (The Universes)
 */
export const initialEnvironments: RootEnvironment[] = [
  {
    id: 'env-general-algebra',
    name: 'Group Theory',
    sets: ['G'],
    operators: ['\\cdot']
  },
  {
    id: 'env-ring-theory',
    name: 'Ring Theory',
    sets: ['R'],
    operators: ['+', '\\cdot']
  }
];

/**
 * 2. AXIOMS (Shared Global Registry)
 */
export const initialAxioms: Axiom[] = [
  {
    id: 'ax-closure',
    canonicalName: 'Closure',
    aliases: ['Binary Operation'],
    defaultLatex: '\\forall a, b \\in S, a \\cdot b \\in S',
    authorId: 'System_Genesis',
    createdAt: NOW
  },
  {
    id: 'ax-associativity',
    canonicalName: 'Associativity',
    aliases: [],
    defaultLatex: '\\forall a, b, c \\in S, (a \\cdot b) \\cdot c = a \\cdot (b \\cdot c)',
    authorId: 'System_Genesis',
    createdAt: NOW
  },
  {
    id: 'ax-identity',
    canonicalName: 'Identity Element',
    aliases: ['Neutral Element', 'Unit'],
    defaultLatex: '\\exists e \\in S \\text{ s.t. } \\forall a \\in S, a \\cdot e = e \\cdot a = a',
    authorId: 'System_Genesis',
    createdAt: NOW
  },
  {
    id: 'ax-inverse',
    canonicalName: 'Inverse Element',
    aliases: ['Invertibility'],
    defaultLatex: '\\forall a \\in S, \\exists a^{-1} \\in S \\text{ s.t. } a \\cdot a^{-1} = a^{-1} \\cdot a = e',
    authorId: 'System_Genesis',
    createdAt: NOW
  },
  {
    id: 'ax-commutativity',
    canonicalName: 'Commutativity',
    aliases: ['Abelian Property'],
    defaultLatex: '\\forall a, b \\in S, a \\cdot b = b \\cdot a',
    authorId: 'System_Genesis',
    createdAt: NOW
  },
  {
    id: 'ax-idempotency',
    canonicalName: 'Idempotency',
    aliases: [],
    defaultLatex: '\\forall a \\in S, a \\cdot a = a',
    authorId: 'System_Explorer',
    createdAt: NOW
  },
  // --- RING AXIOMS ---
  {
    id: 'ax-distributivity',
    canonicalName: 'Distributivity',
    aliases: [],
    defaultLatex: 'a \\cdot (b + c) = (a \\cdot b) + (a \\cdot c)',
    authorId: 'System_Genesis',
    createdAt: NOW
  }
];

/**
 * 3. STRUCTURE NODES (Partitioned by rootContextId)
 */
export const initialNodes: StructureNode[] = [
  // === UNIVERSE A: GROUP THEORY ===
  {
    id: 'node-magma',
    type: 'algebraic structure',
    parentId: null, 
    axiomId: 'ax-closure',
    authorId: 'System',
    displayLatex: '\\text{Magma}',
    status: 'verified',
    rootContextId: 'env-general-algebra',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 100, blackVotes: 0 }
  },
  {
    id: 'node-semigroup',
    type: 'algebraic structure',
    parentId: 'node-magma',
    axiomId: 'ax-associativity',
    authorId: 'System',
    displayLatex: '\\text{Semigroup}',
    status: 'verified',
    rootContextId: 'env-general-algebra',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 95, blackVotes: 1 }
  },
  {
    id: 'node-monoid',
    type: 'algebraic structure',
    parentId: 'node-semigroup',
    axiomId: 'ax-identity',
    authorId: 'System',
    displayLatex: '\\text{Monoid}',
    status: 'verified',
    rootContextId: 'env-general-algebra',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 88, blackVotes: 2 }
  },
  {
    id: 'node-group',
    type: 'algebraic structure',
    parentId: 'node-monoid',
    axiomId: 'ax-inverse',
    authorId: 'Galois',
    displayLatex: '\\text{Group}',
    status: 'unverified',
    rootContextId: 'env-general-algebra',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 12, blackVotes: 3 }
  },
  {
    id: 'node-abelian-group',
    type: 'algebraic structure',
    parentId: 'node-group',
    axiomId: 'ax-commutativity',
    authorId: 'Abel',
    displayLatex: '\\text{Abelian Group}',
    status: 'verified',
    rootContextId: 'env-general-algebra',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 0, blackVotes: 9 }
  },
  {
    id: 'node-commutative-group-dup',
    type: 'algebraic structure',
    parentId: 'node-group',
    axiomId: 'ax-commutativity', 
    authorId: 'NewUser_123',
    displayLatex: '\\text{Commutative Group}',
    status: 'deprecated', 
    rootContextId: 'env-general-algebra',
    toBeDeleted: true, 
    duplicateOfId: 'node-abelian-group', 
    createdAt: NOW,
    stats: { greenVotes: 5, blackVotes: 25 }
  },
  {
    id: 'node-idempotent-group',
    type: 'algebraic structure',
    parentId: 'node-group',
    axiomId: 'ax-idempotency',
    authorId: 'MathExplorer',
    displayLatex: '\\text{Idempotent Group}',
    status: 'deadend', 
    rootContextId: 'env-general-algebra',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 10, blackVotes: 0 }
  },

  // === UNIVERSE B: RING THEORY ===
  {
    id: 'node-ring-root',
    type: 'algebraic structure',
    parentId: null,
    axiomId: 'ax-closure', // Temporary root axiom
    authorId: 'System',
    displayLatex: '\\text{Pseudo-Ring Base}',
    status: 'verified',
    rootContextId: 'env-ring-theory', // <--- Distinct Context
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 1, blackVotes: 0 }
  }
];

/**
 * 4. THEOREMS
 */
export const initialTheorems: Theorem[] = [
  {
    id: 'thm-generalized-associativity',
    structureNodeId: 'node-semigroup',
    name: 'Generalized Associativity',
    aliases: ['No-Parentheses Rule'],
    statementLatex: 'a_1 \\cdot a_2 \\cdot \\dots \\cdot a_n \\text{ is unambiguous.}',
    proofLatex: '\\text{Proof by induction on } n.',
    authorId: 'System',
    status: 'verified',
    createdAt: NOW,
    stats: { greenVotes: 30, blackVotes: 0 }
  },
  {
    id: 'thm-unique-identity',
    structureNodeId: 'node-monoid',
    name: 'Uniqueness of Identity',
    aliases: [],
    statementLatex: '\\text{If } e, e\' \\text{ are identity elements, then } e = e\'.',
    proofLatex: 'e = e \\cdot e\' = e\'.',
    authorId: 'Euler',
    status: 'verified',
    createdAt: NOW,
    stats: { greenVotes: 45, blackVotes: 0 }
  },
  {
    id: 'thm-unique-inverse',
    structureNodeId: 'node-group',
    name: 'Uniqueness of Inverse',
    aliases: [],
    statementLatex: '\\text{For every } a, \\text{ the inverse } a^{-1} \\text{ is unique.}',
    proofLatex: 'b = b \\cdot e = b \\cdot (a \\cdot c) = (b \\cdot a) \\cdot c = c.',
    authorId: 'System',
    status: 'verified',
    createdAt: NOW,
    stats: { greenVotes: 50, blackVotes: 0 }
  },
  {
    id: 'thm-inverse-order',
    structureNodeId: 'node-group',
    name: 'Inverse Order Property',
    aliases: [],
    statementLatex: '(a \\cdot b)^{-1} = b^{-1} \\cdot a^{-1}',
    proofLatex: '(ab)(b^{-1}a^{-1}) = a(bb^{-1})a^{-1} = e.',
    authorId: 'System',
    status: 'verified',
    createdAt: NOW,
    stats: { greenVotes: 40, blackVotes: 1 }
  },
  {
    id: 'thm-abelian-power',
    structureNodeId: 'node-abelian-group',
    name: 'Power of a Product',
    aliases: [],
    statementLatex: '(a \\cdot b)^n = a^n \\cdot b^n',
    proofLatex: '(ab)^2 = abab = a(ba)b = a^2b^2.',
    authorId: 'Abel',
    status: 'verified',
    createdAt: NOW,
    stats: { greenVotes: 25, blackVotes: 0 }
  },
  {
    id: 'thm-collapse',
    structureNodeId: 'node-idempotent-group',
    name: 'Collapse to Triviality',
    aliases: ['Trivial Group Theorem'],
    statementLatex: '\\forall a \\in S, a = e',
    proofLatex: 'a \\cdot a = a \\implies a^{-1} \\cdot (a \\cdot a) = a^{-1} \\cdot a \\implies e \\cdot a = e \\implies a = e.',
    authorId: 'System',
    status: 'unverified',
    createdAt: NOW,
    stats: { greenVotes: 18, blackVotes: 9 }
  }
];
