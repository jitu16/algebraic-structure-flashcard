/* src/types/index.ts */

export type UserRole = 'admin' | 'contributor' | 'voter' | 'viewer';

export type NodeStatus = 
  | 'unverified'
  | 'verified'
  | 'contested'
  | 'dead_end'
  | 'deprecated';

export type VoteType = 'green' | 'black';

export type FlagType = 
  | 'node_issue' 
  | 'axiom_duplicate' 
  | 'isomorphism' 
  | 'deprecation';

export type FlagStatus = 'open' | 'resolved_fixed' | 'resolved_false_alarm' | 'resolved_killed';

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

// --- THIS IS THE PART THAT WAS MISSING/FAILING ---
export interface Axiom {
  id: string;
  canonicalName: string;
  aliases: string[];
  defaultLatex: string;
  authorId: string;
  createdAt: number;
}

export interface MathNode {
  id: string;
  parentId: string | null;
  authorId: string;
  axiomId: string;
  displayLatex: string;
  status: NodeStatus;
  isomorphicToIds: string[]; 
  duplicateOfId?: string;
  toBeDeleted: boolean;
  stats: {
    greenVotes: number;
    blackVotes: number;
    yellowFlags: number;
  };
  createdAt: number;
}

export interface Vote {
  id: string;
  nodeId: string;
  userId: string;
  type: VoteType;
  timestamp: number;
}

export interface Flag {
  id: string;
  type: FlagType;
  targetNodeId?: string;
  targetAxiomId?: string;
  reporterId: string;
  reason: string;
  suggestedFixLatex?: string;
  duplicateOfId?: string;
  status: FlagStatus;
  timestamp: number;
}

export interface Theorem {
  id: string;
  nodeId: string;
  statementLatex: string;
  proofLatex: string;
  authorId: string;
  createdAt: number;
}