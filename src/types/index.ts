/* src/types/index.ts */

export type UserRole = 'novice' | 'citizen' | 'admin';

export type NodeStatus = 
  | 'unverified'
  | 'verified'
  | 'deadend' 
  | 'trash'   
  | 'deprecated'
  | 'deleteRequested';

export type VoteType = 'green' | 'black';

export type FlagType = 'nodeIssue' | 'duplicate';

export type FlagStatus = 'open' | 'resolvedFixed' | 'resolvedFalseAlarm' | 'resolvedKilled';

export interface RootEnvironment {
  id: string;
  name: string;
  sets: string[];
  operators: string[];
}

export interface Theorem {
  id: string;
  structureNodeId: string;
  name: string;
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

export interface StructureNode {
  id: string;
  type: 'algebraic structure';
  parentId: string | null;
  authorId: string;
  axiomId: string | null;
  displayLatex: string; 
  status: NodeStatus;
  rootContextId: string;
  duplicateOfId?: string;
  toBeDeleted: boolean;
  stats: {
    greenVotes: number;
    blackVotes: number;
  };
  createdAt: number;
}

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

/**
 * Represents a "Vote Slip" stored in the 'votes' subcollection.
 * The document ID represents the User ID.
 */
export interface Vote {
  choice: VoteType;
  timestamp: number;
}

export interface Flag {
  id: string;
  type: FlagType;
  targetNodeId?: string;
  targetTheoremId?: string;
  reporterId: string;
  reason: string;
  suggestedFixLatex?: string;
  duplicateOfId?: string;
  status: FlagStatus;
  timestamp: number;
}

export type AnyGraphNode = StructureNode | Theorem;
