/* src/types/index.ts */

/**
 * Roles defining user permissions within the governance system.
 * - novice: Can propose draft nodes.
 * - citizen: Can publish unverified nodes and vote.
 * - admin: Can manage the zombie protocol and lock nodes.
 */
export type UserRole = 'novice' | 'citizen' | 'admin';

/**
 * The lifecycle state of a node or theorem.
 * - unverified: Newly created, pending consensus.
 * - verified: Accepted as canonical.
 * - deadend: A valid structure that cannot be extended further.
 * - trash: Rejected by the community (flashes red).
 * - deprecated: Marked for deletion (zombie state).
 */
export type NodeStatus = 
  | 'unverified'
  | 'verified'
  | 'deadend' 
  | 'trash'   
  | 'deprecated';

export type VoteType = 'green' | 'black';

/**
 * Categories for flagging content.
 * - nodeIssue: General errors or inconsistencies.
 * - duplicate: The structure or theorem already exists elsewhere.
 */
export type FlagType = 
  | 'nodeIssue' 
  | 'duplicate';

export type FlagStatus = 'open' | 'resolvedFixed' | 'resolvedFalseAlarm' | 'resolvedKilled';

/**
 * Defines the fundamental environment for a branch (Sets and Operators).
 */
export interface RootEnvironment {
  id: string;
  name: string;
  sets: string[];
  operators: string[];
}

/**
 * Represents a rich theorem object attached to a structure.
 * Stored independently from the node to optimize map performance.
 */
export interface Theorem {
  id: string;
  
  /** Foreign Key: Points to the StructureNode where this theorem is defined. */
  structureNodeId: string;
  
  name: string; // e.g. "Uniqueness of Identity"
  aliases: string[];
  
  statementLatex: string;
  proofLatex: string;
  
  authorId: string;
  createdAt: number;
  status: NodeStatus;
  
  stats: {
    greenVotes: number;
    blackVotes: number;
  };
}

/**
 * Represents a node in the Algebraic Structure Map.
 * Each node represents a system created by applying an axiom to a parent.
 */
export interface StructureNode {
  id: string;
  type: 'algebraic structure';
  parentId: string | null;
  authorId: string;
  
  /** The specific axiom applied to create this node. */
  axiomId: string | null;
  
  /** Context-specific LaTeX rendering (e.g., overriding * with +). */
  displayLatex: string; 
  status: NodeStatus;
  rootContextId: string;
  duplicateOfId?: string;
  toBeDeleted: boolean;
  
  /** * Note: Theorems are now fetched separately using structureNodeId.
   * This keeps the graph data structure lightweight.
   */
  
  stats: {
    greenVotes: number;
    blackVotes: number;
  };
  createdAt: number;
}

/**
 * Represents a mathematical axiom in the global registry.
 */
export interface Axiom {
  id: string;
  canonicalName: string;
  aliases: string[];
  defaultLatex: string;
  authorId: string;
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  reputation: {
    creation: number;
    contributor: number;
  };
  createdAt: number;
}

export interface Vote {
  id: string;
  nodeId?: string;
  targetTheoremId?: string; // Optional: Allows voting specifically on a theorem
  userId: string;
  type: VoteType;
  timestamp: number;
}

export interface Flag {
  id: string;
  type: FlagType;
  targetNodeId?: string;
  targetTheoremId?: string; // Optional: Allows flagging specifically a theorem
  reporterId: string;
  reason: string;
  suggestedFixLatex?: string;
  duplicateOfId?: string;
  status: FlagStatus;
  timestamp: number;
}

/**
 * Utility type alias.
 * Strictly StructureNode as theorems are now internal data properties.
 */
export type AnyGraphNode = StructureNode | Theorem;
