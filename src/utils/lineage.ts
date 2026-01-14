/* src/utils/lineage.ts */
import type { StructureNode, Axiom, Theorem } from '../types';

export interface CumulativeLineage {
  inheritedAxioms: Axiom[];
  inheritedTheorems: Theorem[];
  localAxiom?: Axiom;
  localTheorems: Theorem[];
}

/**
 * Calculates the full mathematical heritage of a node.
 * Traverses up the 'parentId' chain to collect all Axioms and Theorems
 * that are "known" or "true" in this specific context.
 */
export const getCumulativeLineage = (
  currentNodeId: string,
  allNodes: StructureNode[],
  allAxioms: Axiom[],
  allTheorems: Theorem[]
): CumulativeLineage => {
  
  // 1. Identify the current scope
  const currentNode = allNodes.find(n => n.id === currentNodeId);
  
  // 2. Initialize Result
  // We filter for theorems specifically attached to this structure
  const result: CumulativeLineage = {
    inheritedAxioms: [],
    inheritedTheorems: [],
    localTheorems: allTheorems.filter(t => t.structureNodeId === currentNodeId),
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

    // Add Parent's Theorems (Theorems proven in the parent scope are valid here too)
    const parentTheorems = allTheorems.filter(t => t.structureNodeId === parentNode.id);
    result.inheritedTheorems.unshift(...parentTheorems);

    // Move up the tree
    parentPointer = parentNode.parentId;
  }

  return result;
};
