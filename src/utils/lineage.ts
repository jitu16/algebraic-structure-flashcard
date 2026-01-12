/* src/utils/lineage.ts */
import type { StructureNode, Axiom, TheoremNode } from '../types';

export interface CumulativeLineage {
  inheritedAxioms: Axiom[];
  inheritedTheorems: TheoremNode[];
  localAxiom?: Axiom;
  localTheorems: TheoremNode[];
}

export const getCumulativeLineage = (
  currentNodeId: string,
  allNodes: StructureNode[],
  allAxioms: Axiom[],
  allTheorems: TheoremNode[]
): CumulativeLineage => {
  
  // 1. Identify the current scope
  const currentNode = allNodes.find(n => n.id === currentNodeId);
  
  // 2. Initialize Result
  // Note: We filter for theorems where rootNodeId matches the current node
  const result: CumulativeLineage = {
    inheritedAxioms: [],
    inheritedTheorems: [],
    localTheorems: allTheorems.filter(t => t.rootNodeId === currentNodeId),
    localAxiom: undefined
  };

  if (!currentNode) return result;

  // 3. Set Local Axiom (if present)
  result.localAxiom = allAxioms.find(a => a.id === currentNode.axiomId);

  // 4. Traverse parent chain for inheritance
  let parentPointer = currentNode.parentId;
  
  while (parentPointer) {
    const parentNode = allNodes.find(n => n.id === parentPointer);
    if (!parentNode) break;

    // Add Parent's Axiom (Prepend to maintain logical order: Root -> Local)
    const axiom = allAxioms.find(a => a.id === parentNode.axiomId);
    if (axiom) result.inheritedAxioms.unshift(axiom);

    // Add Parent's Theorems
    const parentTheorems = allTheorems.filter(t => t.rootNodeId === parentNode.id);
    result.inheritedTheorems.unshift(...parentTheorems);

    // Move up the tree
    parentPointer = parentNode.parentId;
  }

  return result;
};
