/* src/hooks/useEnvironments.ts */
import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { RootEnvironment } from '../types';

/**
 * Return type for the useEnvironments hook.
 */
interface EnvironmentsData {
  /** The list of available Root Environments (Universes). */
  environments: RootEnvironment[];
  /** Indicates if the initial data load is in progress. */
  isLoading: boolean;
  /** Error object if the subscription fails. */
  error: Error | null;
}

/**
 * Custom Hook: Manages real-time subscriptions for the list of Universes.
 * * Responsibilities:
 * 1. Subscribes to the 'environments' Firestore collection.
 * 2. Maps raw Firestore documents to the RootEnvironment type.
 * 3. Handles loading and error states for the Lobby.
 * * @returns An object containing the live list of environments and status flags.
 */
export const useEnvironments = (): EnvironmentsData => {
  const [environments, setEnvironments] = useState<RootEnvironment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);

    const unsubscribe = onSnapshot(
      collection(db, 'environments'),
      (snapshot) => {
        try {
          const envs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as RootEnvironment[];
          
          setEnvironments(envs);
          setIsLoading(false);
          setError(null);
        } catch (err) {
          console.error("Error processing environments data:", err);
          setError(err as Error);
          setIsLoading(false);
        }
      },
      (err) => {
        console.error("Error fetching environments:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { environments, isLoading, error };
};
