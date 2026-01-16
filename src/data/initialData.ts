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
  // --- GENERAL / GROUP AXIOMS ---
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
  
  // --- RING / FIELD AXIOMS ---
  {
    id: 'ax-distributivity',
    canonicalName: 'Distributivity',
    aliases: [],
    defaultLatex: '\\forall a,b,c \\in R, a \\cdot (b + c) = (a \\cdot b) + (a \\cdot c)',
    authorId: 'System_Genesis',
    createdAt: NOW
  },
  {
    id: 'ax-field-inverse',
    canonicalName: 'Multiplicative Inverse (Non-Zero)',
    aliases: ['Field Inverse'],
    defaultLatex: '\\forall a \\in R \\setminus \\{0\\}, \\exists a^{-1} \\text{ s.t. } a \\cdot a^{-1} = 1',
    authorId: 'System_Genesis',
    createdAt: NOW
  }
];

/**
 * 3. STRUCTURE NODES (The Evolutionary Tree)
 */
export const initialNodes: StructureNode[] = [
  // ===================================
  // UNIVERSE A: GROUP THEORY
  // Path: Magma -> Semigroup -> Monoid -> Group -> Abelian Group
  // ===================================
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
    stats: { greenVotes: 55, blackVotes: 1 }
  },
  // Example of a Dead End
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

  // ===================================
  // UNIVERSE B: RING THEORY
  // Path: Abelian Group (+) -> Rng -> Ring -> Commutative Ring -> Field
  // ===================================
  {
    id: 'node-ring-base',
    type: 'algebraic structure',
    parentId: null,
    // We assume the starting point is an Abelian Group under (+)
    axiomId: 'ax-commutativity', 
    authorId: 'System',
    displayLatex: '\\text{Abelian Group } (R, +)',
    status: 'verified',
    rootContextId: 'env-ring-theory', 
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 20, blackVotes: 0 }
  },
  {
    id: 'node-rng',
    type: 'algebraic structure',
    parentId: 'node-ring-base',
    // Adding Distributivity connects + and *
    axiomId: 'ax-distributivity',
    authorId: 'System',
    displayLatex: '\\text{Rng}',
    status: 'verified',
    rootContextId: 'env-ring-theory',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 15, blackVotes: 0 }
  },
  {
    id: 'node-ring',
    type: 'algebraic structure',
    parentId: 'node-rng',
    // Adding Multiplicative Identity makes it a Ring (unital)
    axiomId: 'ax-identity',
    authorId: 'System',
    displayLatex: '\\text{Ring}',
    status: 'verified',
    rootContextId: 'env-ring-theory',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 18, blackVotes: 1 }
  },
  {
    id: 'node-commutative-ring',
    type: 'algebraic structure',
    parentId: 'node-ring',
    // Adding Multiplicative Commutativity
    axiomId: 'ax-commutativity',
    authorId: 'System',
    displayLatex: '\\text{Commutative Ring}',
    status: 'verified',
    rootContextId: 'env-ring-theory',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 22, blackVotes: 0 }
  },
  {
    id: 'node-field',
    type: 'algebraic structure',
    parentId: 'node-commutative-ring',
    // Adding Multiplicative Inverse (for non-zero elements)
    axiomId: 'ax-field-inverse',
    authorId: 'System',
    displayLatex: '\\text{Field}',
    status: 'verified',
    rootContextId: 'env-ring-theory',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 30, blackVotes: 0 }
  }
];

/**
 * 4. THEOREMS
 */
export const initialTheorems: Theorem[] = [
  // --- GROUP THEORY THEOREMS ---
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
    id: 'thm-socks-shoes',
    structureNodeId: 'node-group',
    name: 'Socks-Shoes Property',
    aliases: ['Inverse of Product'],
    statementLatex: '(a \\cdot b)^{-1} = b^{-1} \\cdot a^{-1}',
    proofLatex: '(ab)(b^{-1}a^{-1}) = a(bb^{-1})a^{-1} = ae a^{-1} = aa^{-1} = e.',
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
    proofLatex: '(ab)^2 = abab = a(ba)b = a(ab)b = a^2b^2.',
    authorId: 'Abel',
    status: 'verified',
    createdAt: NOW,
    stats: { greenVotes: 25, blackVotes: 0 }
  },
  
  // --- RING THEORY THEOREMS ---
  {
    id: 'thm-zero-product',
    structureNodeId: 'node-rng',
    name: 'Multiplication by Zero',
    aliases: ['Annihilation'],
    statementLatex: '\\forall a \\in R, a \\cdot 0 = 0 \\cdot a = 0',
    proofLatex: 'a \\cdot 0 = a \\cdot (0+0) = a \\cdot 0 + a \\cdot 0 \\implies 0 = a \\cdot 0.',
    authorId: 'System',
    status: 'verified',
    createdAt: NOW,
    stats: { greenVotes: 15, blackVotes: 0 }
  },
  {
    id: 'thm-field-no-divisors',
    structureNodeId: 'node-field',
    name: 'No Zero Divisors',
    aliases: [],
    statementLatex: 'a \\cdot b = 0 \\implies a = 0 \\lor b = 0',
    proofLatex: '\\text{If } a \\neq 0, a^{-1}(ab) = a^{-1}(0) \\implies b = 0.',
    authorId: 'System',
    status: 'verified',
    createdAt: NOW,
    stats: { greenVotes: 20, blackVotes: 0 }
  }
];
