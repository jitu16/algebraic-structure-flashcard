/* src/types/index.ts */

export type UserRole = 'novice' | 'citizen' | 'admin';

export type NodeStatus = 
  | 'unverified'
  | 'verified'
  | 'deadend' //you can not extend this node! 
  | 'trash'   //When a lot of users vote for a node to be deleted, it becomes trash -> will flash red.
  | 'deprecated';

export type VoteType = 'green' | 'black';

export type FlagType = 
  | 'nodeIssue' 
  | 'axiomDuplicate'  
  | 'deprecation';

export type FlagStatus = 'open' | 'resolvedFixed' | 'resolvedFalseAlarm' | 'resolvedKilled';

export interface RootEnvironment {
  id: string;
  name: string;
  sets: string[];
  operators: string[];
}

export interface StructureNode {
  id: string;
  type: 'algebraic structure';
  parentId: string | null;
  authorId: string;
  axiomId: string | null;
  displayLatex: string; 
  status: NodeStatus;
  
  duplicateOfId?: string;
  toBeDeleted: boolean;
  
  stats: {
    greenVotes: number;
    blackVotes: number;
  };
  createdAt: number;
}

export interface TheoremNode {
  id: string;
  type: 'theorem';
  rootNodeId: string;
  parentId: string | null;

  name: string;
  aliases: string[];

  statementLatex: string;
  proofLatex: string;
  authorId: string;
  
  status: NodeStatus;
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

export type AnyGraphNode = StructureNode | TheoremNode;
