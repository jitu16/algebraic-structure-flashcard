/* src/data/initialData.ts */
import type { StructureNode, Axiom, TheoremNode, RootEnvironment } from '../types';

const NOW = Date.now();

/**
 * 1. ROOT ENVIRONMENTS
 * Defines the immutable mathematical context (Sets and Operators) for different branches.
 * These are inherited by all child structures and theorems to ensure notation consistency.
 */
export const initialEnvironments: RootEnvironment[] = [
  {
    id: 'env-standard-algebra',
    name: 'Standard Algebraic Context',
    sets: ['S'],
    operators: ['\\cdot']
  },
  {
    id: 'env-group-theory',
    name: 'Group Theory Context',
    sets: ['G'],
    operators: ['*']
  }
];

/**
 * 2. AXIOMS
 * The fundamental rules that define algebraic structures.
 */
export const initialAxioms: Axiom[] = [
  {
    id: 'closure',
    canonicalName: 'Closure',
    aliases: ['Internal Operation'],
    defaultLatex: '\\forall a, b \\in S, a \\cdot b \\in S',
    authorId: 'System_Genesis',
    createdAt: NOW
  },
  {
    id: 'associativity',
    canonicalName: 'Associativity',
    aliases: [],
    defaultLatex: '\\forall a, b, c \\in S, (a \\cdot b) \\cdot c = a \\cdot (b \\cdot c)',
    authorId: 'System_Genesis',
    createdAt: NOW
  },
  {
    id: 'identity',
    canonicalName: 'Identity Element',
    aliases: ['Neutral Element', 'Unit'],
    defaultLatex: '\\exists e \\in S \\text{ s.t. } \\forall a \\in S, a \\cdot e = e \\cdot a = a',
    authorId: 'System_Genesis',
    createdAt: NOW
  },
  {
    id: 'inverse',
    canonicalName: 'Inverse Element',
    aliases: ['Symmetric Element'],
    defaultLatex: '\\forall a \\in S, \\exists a^{-1} \\in S \\text{ s.t. } a \\cdot a^{-1} = a^{-1} \\cdot a = e',
    authorId: 'System_Genesis',
    createdAt: NOW
  },
  {
    id: 'commutativity',
    canonicalName: 'Commutativity',
    aliases: ['Abelian Property'],
    defaultLatex: '\\forall a, b \\in S, a \\cdot b = b \\cdot a',
    authorId: 'System_Genesis',
    createdAt: NOW
  }
];

/**
 * 3. STRUCTURE NODES (The Map)
 * The visual nodes for the Algebraic Structure Space Engine.
 * Each node is assigned a rootContextId to link it to its mathematical environment.
 */
export const initialNodes: StructureNode[] = [
  {
    id: 'magma',
    type: 'algebraic structure',
    parentId: null,
    axiomId: 'closure',
    authorId: 'Bourbaki_00',
    displayLatex: '\\text{Magma}',
    status: 'verified',
    rootContextId: 'env-standard-algebra',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 42, blackVotes: 1 }
  },
  {
    id: 'semigroup',
    type: 'algebraic structure',
    parentId: 'magma',
    axiomId: 'associativity',
    authorId: 'Bourbaki_00',
    displayLatex: '\\text{Semigroup}',
    status: 'verified',
    rootContextId: 'env-standard-algebra',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 35, blackVotes: 0 }
  },
  {
    id: 'monoid',
    type: 'algebraic structure',
    parentId: 'semigroup',
    axiomId: 'identity',
    authorId: 'Bourbaki_00',
    displayLatex: '\\text{Monoid}',
    status: 'verified',
    rootContextId: 'env-standard-algebra',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 50, blackVotes: 2 }
  },
  {
    id: 'group',
    type: 'algebraic structure',
    parentId: 'monoid',
    axiomId: 'inverse',
    authorId: 'Galois_Genius',
    displayLatex: '\\text{Group}',
    status: 'verified',
    rootContextId: 'env-standard-algebra',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 120, blackVotes: 5 }
  },
  {
    id: 'abelian-group',
    type: 'algebraic structure',
    parentId: 'group',
    axiomId: 'commutativity',
    authorId: 'Abel_Official',
    displayLatex: '\\text{Abelian Group}',
    status: 'unverified',
    rootContextId: 'env-standard-algebra',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 2, blackVotes: 11 }
  },
  {
    id: 'duplicate-group',
    type: 'algebraic structure',
    parentId: 'monoid',
    axiomId: 'inverse',
    authorId: 'Newbie_Mistake',
    displayLatex: '\\text{Group (Dup)}',
    status: 'deprecated',
    rootContextId: 'env-standard-algebra',
    toBeDeleted: true,
    duplicateOfId: 'group',
    createdAt: NOW,
    stats: { greenVotes: 2, blackVotes: 20 }
  }
];

/**
 * 4. THEOREMS (The Deductive Layer)
 * Specific proofs tied to structures. 
 * Inherits rootContextId from the relevant structure rootNodeId.
 */
export const initialTheorems: TheoremNode[] = [
  {
    id: 'thm-unique-identity',
    type: 'theorem',
    rootNodeId: 'monoid',
    parentId: null,
    name: '\\text{Uniqueness of Identity}',
    aliases: [],
    statementLatex: '\\text{If } e, e\' \\text{ are identity elements, then } e = e\'.',
    proofLatex: 'e = e \\cdot e\' \\text{ (since } e\' \\text{ is identity)} \\\\ = e\' \\text{ (since } e \\text{ is identity)}',
    authorId: 'Euler_01',
    status: 'verified',
    rootContextId: 'env-standard-algebra',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 15, blackVotes: 0 }
  },
  {
    id: 'thm-unique-inverse',
    type: 'theorem',
    rootNodeId: 'group',
    parentId: null,
    name: '\\text{Uniqueness of Inverse}',
    aliases: [],
    statementLatex: '\\text{Every element } a \\text{ has exactly one inverse } a^{-1}.',
    proofLatex: '\\text{Suppose } b, c \\text{ are inverses of } a. \\\\ b = b \\cdot e = b \\cdot (a \\cdot c) \\\\ = (b \\cdot a) \\cdot c = e \\cdot c = c.',
    authorId: 'Gauss_99',
    status: 'verified',
    rootContextId: 'env-standard-algebra',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 22, blackVotes: 1 }
  },
  {
    id: 'thm-socks-shoes',
    type: 'theorem',
    rootNodeId: 'group',
    parentId: null,
    name: '\\text{Socks & Shoes Property}',
    aliases: ['Reverse Order Law'],
    statementLatex: '(ab)^{-1} = b^{-1}a^{-1}',
    proofLatex: '(ab)(b^{-1}a^{-1}) = a(bb^{-1})a^{-1} = aea^{-1} = aa^{-1} = e.',
    authorId: 'Noether_Fan',
    status: 'unverified',
    rootContextId: 'env-standard-algebra',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 8, blackVotes: 0 }
  },
  {
    id: 'thm-cancellation',
    type: 'theorem',
    rootNodeId: 'group',
    parentId: null,
    name: '\\text{Cancellation Laws}',
    aliases: [],
    statementLatex: 'ax = ay \\implies x = y \\quad \\text{and} \\quad xa = ya \\implies x = y',
    proofLatex: '\\text{Left multiply by } a^{-1}: \\\\ a^{-1}(ax) = a^{-1}(ay) \\\\ (a^{-1}a)x = (a^{-1}a)y \\\\ ex = ey \\implies x = y.',
    authorId: 'Lagrange_Legacy',
    status: 'verified',
    rootContextId: 'env-standard-algebra',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 40, blackVotes: 2 }
  },
  {
    id: 'thm-abelian-exponent',
    type: 'theorem',
    rootNodeId: 'abelian-group',
    parentId: null,
    name: '\\text{Exponent Distributivity}',
    aliases: [],
    statementLatex: '(ab)^n = a^n b^n \\text{ for all } n \\in \\mathbb{Z}',
    proofLatex: '\\text{Base case } n=1: (ab)^1 = a^1 b^1. \\\\ \\text{Inductive step...}',
    authorId: 'Abel_Official',
    status: 'unverified',
    rootContextId: 'env-standard-algebra',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 9, blackVotes: 0 }
  }
];
