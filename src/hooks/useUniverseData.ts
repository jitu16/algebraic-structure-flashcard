/* src/hooks/useUniverseData.ts */
import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { StructureNode, Axiom, RootEnvironment, Theorem } from '../types';

export interface UniverseData {
  nodes: StructureNode[];
  axioms: Axiom[];
  theorems: Theorem[];
  activeEnvironment: RootEnvironment | null;
  isLoading: boolean;
}

/**
 * Custom Hook: Manages real-time subscriptions for a specific Universe.
 * * Responsibilities:
 * 1. Subscribes to the specific RootEnvironment metadata (Sets/Operators).
 * 2. Subscribes to StructureNodes filtered by this universe.
 * 3. Subscribes to the global Axiom and Theorem registries.
 * 4. Manages initialization loading state.
 * * @param universeId - The ID of the current Root Environment to load.
 * @returns An object containing live data arrays and loading status.
 */
export const useUniverseData = (universeId: string): UniverseData => {
  const [nodes, setNodes] = useState<StructureNode[]>([]);
  const [axioms, setAxioms] = useState<Axiom[]>([]);
  const [theorems, setTheorems] = useState<Theorem[]>([]);
  const [activeEnvironment, setActiveEnvironment] = useState<RootEnvironment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!universeId) return;

    setIsLoading(true);

    // 1. Environment Metadata Subscription
    const envRef = doc(db, 'environments', universeId);
    const unsubEnv = onSnapshot(envRef, (docSnap) => {
      if (docSnap.exists()) {
        setActiveEnvironment(docSnap.data() as RootEnvironment);
      }
      // Consider initial load complete when environment is found
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching environment:", error);
      setIsLoading(false);
    });

    // 2. Nodes Subscription (Filtered by Current Universe)
    const nodesQuery = query(
      collection(db, 'nodes'), 
      where('rootContextId', '==', universeId)
    );
    const unsubNodes = onSnapshot(nodesQuery, (snapshot) => {
      const liveNodes = snapshot.docs.map(doc => doc.data() as StructureNode);
      setNodes(liveNodes);
    }, (error) => console.error("Error fetching nodes:", error));

    // 3. Axioms Subscription (Global Registry)
    const unsubAxioms = onSnapshot(collection(db, 'axioms'), (snapshot) => {
      const liveAxioms = snapshot.docs.map(doc => doc.data() as Axiom);
      setAxioms(liveAxioms);
    }, (error) => console.error("Error fetching axioms:", error));

    // 4. Theorems Subscription (Global Registry)
    const unsubTheorems = onSnapshot(collection(db, 'theorems'), (snapshot) => {
      const liveTheorems = snapshot.docs.map(doc => doc.data() as Theorem);
      setTheorems(liveTheorems);
    }, (error) => console.error("Error fetching theorems:", error));

    return () => {
      unsubEnv();
      unsubNodes();
      unsubAxioms();
      unsubTheorems();
    };
  }, [universeId]);

  return {
    nodes,
    axioms,
    theorems,
    activeEnvironment,
    isLoading
  };
};
