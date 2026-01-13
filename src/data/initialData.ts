/* src/data/initialData.ts */
import type { StructureNode, Axiom, TheoremNode } from '../types';

const NOW = Date.now();

/**
 * 1. AXIOMS
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
 * 2. STRUCTURE NODES (The Map)
 * The visual nodes for the Algebraic Structure Space Engine.
 */
export const initialNodes: StructureNode[] = [
  {
    id: 'magma',
    type: 'algebraic structure', // FIXED: Updated type name
    parentId: null,              // Root Node
    axiomId: 'closure',
    authorId: 'Bourbaki_00',
    displayLatex: '\\text{Magma}',
    status: 'verified',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 42, blackVotes: 1 }
  },
  {
    id: 'semigroup',
    type: 'algebraic structure',
    parentId: 'magma',           // Linked to Parent
    axiomId: 'associativity',
    authorId: 'Bourbaki_00',
    displayLatex: '\\text{Semigroup}',
    status: 'verified',
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
    status: 'verified',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 85, blackVotes: 3 }
  },
  // TEST CASE: Deprecated / Zombie (Yellow)
  {
    id: 'duplicate-group',
    type: 'algebraic structure',
    parentId: 'monoid',          // Attached to Monoid (incorrectly)
    axiomId: 'inverse',
    authorId: 'Newbie_Mistake',
    displayLatex: '\\text{Group (Dup)}',
    status: 'deprecated',
    toBeDeleted: true,
    duplicateOfId: 'group',
    createdAt: NOW,
    stats: { greenVotes: 2, blackVotes: 15 }
  }
];

/**
 * 3. THEOREMS (The Deductive Layer)
 * Specific proofs tied to structures.
 */
export const initialTheorems: TheoremNode[] = [
  // --- MONOID THEOREMS ---
  {
    id: 'thm-unique-identity',
    type: 'theorem',
    rootNodeId: 'monoid',
    parentId: null, // First theorem in chain
    name: '\\text{Uniqueness of Identity}',
    aliases: [],
    statementLatex: '\\text{If } e, e\' \\text{ are identity elements, then } e = e\'.',
    proofLatex: 'e = e \\cdot e\' \\text{ (since } e\' \\text{ is identity)} \\\\ = e\' \\text{ (since } e \\text{ is identity)}',
    authorId: 'Euler_01',
    status: 'verified',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 15, blackVotes: 0 }
  },

  // --- GROUP THEOREMS ---
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
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 22, blackVotes: 1 }
  },
  // TEST CASE: Unverified (Red) - 8 Green Votes
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
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 40, blackVotes: 2 }
  },
  // TEST CASE: Inconsistent / Dead End (Gray)
  {
    id: 'thm-bad-logic',
    type: 'theorem',
    rootNodeId: 'group',
    parentId: null,
    name: '\\text{Fallacy of } 1=0',
    aliases: [],
    statementLatex: '1 = 0',
    proofLatex: '\\text{If we assume } x = 0 \\text{ allows division... (Invalid Step)}',
    authorId: 'Troll_01',
    status: 'inconsistent',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 0, blackVotes: 50 }
  },

  // --- ABELIAN GROUP THEOREMS ---
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
    status: 'verified',
    toBeDeleted: false,
    createdAt: NOW,
    stats: { greenVotes: 18, blackVotes: 0 }
  }
];
