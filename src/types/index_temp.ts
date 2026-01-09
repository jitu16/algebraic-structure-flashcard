/**
 * @file src/types/index.ts
 * @description Defines the core data structures and union types for the Mathverse application.
 * This file serves as the Single Source of Truth for the data schema defined in 'schema.mmd'.
 */

// ==========================================
// 1. ENUMS & UNION TYPES
// ==========================================

/**
 * Defines the permission levels for a user.
 * - 'admin': Can verify nodes, merge axioms, and trigger deprecation protocols.
 * - 'contributor': Can create nodes, vote, and flag.
 * - 'voter': Can vote on existing nodes.
 * - 'viewer': Read-only access.
 */
export type UserRole = 'admin' | 'contributor' | 'voter' | 'viewer';

/**
 * Represents the lifecycle state of a MathNode.
 * - 'unverified': Newly created, pending community/admin review (Red).
 * - 'verified': Accepted as mathematically valid and canonical (Green).
 * - 'contested': Currently flagged for potential issues (Yellow).
 * - 'dead_end': Proven inconsistent or trivial (Gray).
 * - 'deprecated': Marked for deletion via the Zombie Protocol (Flashing Yellow).
 */
export type NodeStatus = 
  | 'unverified'
  | 'verified'
  | 'contested'
  | 'dead_end'
  | 'deprecated';

/**
 * The type of vote cast by a user.
 * - 'green': Vouch for validity.
 * - 'black': Vote against validity.
 */
export type VoteType = 'green' | 'black';

/**
 * Categorizes the reason for a flag.
 * - 'node_issue': Typos, formatting errors, or minor mathematical errors.
 * - 'axiom_duplicate': The Axiom used is a duplicate of another registry entry.
 * - 'isomorphism': Type 1 Isomorphism (Request to link to another node).
 * - 'deprecation': Type 2 Isomorphism (Request to mark as duplicate/zombie).
 */
export type FlagType = 
  | 'node_issue' 
  | 'axiom_duplicate' 
  | 'isomorphism' 
  | 'deprecation';

/**
 * Tracks the resolution state of a flag.
 */
export type FlagStatus = 'open' | 'resolved_fixed' | 'resolved_false_alarm' | 'resolved_killed';

// ==========================================
// 2. DATA INTERFACES
// ==========================================

/**
 * Represents a user in the system.
 * Tracks reputation scores which determine influence and privileges.
 */
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  
  /** * The economy of reputation.
   * - creation: Gained by owning Verified nodes.
   * - contributor: Gained by correct voting and accepted flags.
   */
  reputation: {
    creation: number;
    contributor: number;
  };
  
  createdAt: number; // Unix timestamp
}

/**
 * Represents a fundamental mathematical concept in the Global Registry.
 * @example
 * {
 * canonicalName: "Commutativity",
 * aliases: ["Abelian", "Symmetric"],
 * defaultLatex: "a \cdot b = b \cdot a"
 * }
 */
export interface Axiom {
  id: string;
  
  /** The primary, unique name for the concept. */
  canonicalName: string;
  
  /** Alternative names used to prevent registry duplication. */
  aliases: string[];
  
  /** The standard LaTeX representation of the axiom. */
  defaultLatex: string;
  
  authorId: string;
  createdAt: number;
}

/**
 * Represents a node in the axiomatic tree.
 * A node is a specific usage of an Axiom within a lineage of parent nodes.
 */
export interface MathNode {
  id: string;
  
  /** The ID of the immediate predecessor. Null if this is a Root Axiom usage. */
  parentId: string | null;
  
  authorId: string;
  
  // --- Content ---
  
  /** Reference to the conceptual Axiom definition. */
  axiomId: string;
  
  /** * The visual override for this specific node. 
   * Allows users to match notation with the specific lineage.
   */
  displayLatex: string;
  
  // --- State & Relationships ---
  
  status: NodeStatus;
  
  /** * Type 1 Isomorphism:
   * List of IDs for nodes that represent the same system via different axioms.
   * These are links, not deprecations.
   */
  isomorphicToIds: string[]; 

  /**
   * Type 2 Isomorphism (Deprecation Protocol):
   * If present, points to the "Survivor Node" this node is a duplicate of.
   */
  duplicateOfId?: string;
  
  /**
   * If true, the node enters "Zombie Mode" (flashing yellow).
   * It blocks new children and awaits garbage collection.
   */
  toBeDeleted: boolean;
  
  // --- Statistics ---
  
  /** Cached counts for UI performance. */
  stats: {
    greenVotes: number;
    blackVotes: number;
    yellowFlags: number;
  };
  
  createdAt: number;
}

/**
 * Represents a single vote cast by a user on a specific node.
 * Constraints: A user may only have one vote per node.
 */
export interface Vote {
  /** Compound key: `userId_nodeId` to enforce uniqueness. */
  id: string;
  nodeId: string;
  userId: string;
  type: VoteType;
  timestamp: number;
}

/**
 * Represents a user-reported issue or maintenance request.
 */
export interface Flag {
  id: string;
  type: FlagType;
  
  /** ID of the Node being flagged (if applicable). */
  targetNodeId?: string;
  
  /** ID of the Axiom being flagged (if applicable). */
  targetAxiomId?: string;
  
  reporterId: string;
  reason: string;
  
  /** Optional LaTeX correction for 'node_issue' flags. */
  suggestedFixLatex?: string;
  
  /** * Required for 'deprecation' or 'axiom_duplicate' flags.
   * Points to the Master Axiom or Survivor Node.
   */
  duplicateOfId?: string;
  
  status: FlagStatus;
  timestamp: number;
}

/**
 * Represents a theorem derived within the context of a specific node.
 */
export interface Theorem {
  id: string;
  nodeId: string;
  statementLatex: string;
  proofLatex: string;
  authorId: string;
  createdAt: number;
}
