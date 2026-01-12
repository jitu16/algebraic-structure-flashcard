/* src/types/index.ts */

// 1. Updated Roles to match Trust Ladder
export type UserRole = 'novice' | 'citizen' | 'admin';

export type NodeStatus = 
  | 'unverified'
  | 'verified'
  | 'contested'
  | 'deadEnd'
  | 'deprecated';

export type VoteType = 'green' | 'black';

export type FlagType = 
  | 'nodeIssue' 
  | 'axiomDuplicate'  
  | 'deprecation';

export type FlagStatus = 'open' | 'resolvedFixed' | 'resolvedFalseAlarm' | 'resolvedKilled';

// 2. Updated RootEnvironment (No rootAxiomId)
export interface RootEnvironment {
  id: string;
  name: string; // e.g., "Standard Ring Theory"
  sets: string[]; // ['R']
  operators: string[]; // ['+', '*']
}

// 3. Renamed to StructureNode (Explicit)
export interface StructureNode {
  id: string;
  parentId: string | null;
  authorId: string;
  axiomId: string | null; // Null if this is the "Genesis Node" defining the Set/Op
  displayLatex: string; 
  status: NodeStatus;
  
  duplicateOfId?: string;
  toBeDeleted: boolean;
  
  stats: {
    greenVotes: number;
    blackVotes: number;
    yellowFlags: number;
  };
  createdAt: number;
}

// 4. Renamed to TheoremNode (Explicit)
export interface TheoremNode {
  id: string;
  rootNodeId: string; // Context: Which StructureNode does this belong to?
  parentId: string | null; // Logic: Derived from which previous Theorem?

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
  nodeId: string; // This handles both node/theorem via ID lookup
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

// Combined type for the Generic Engine
export type AnyGraphNode = StructureNode | TheoremNode;
