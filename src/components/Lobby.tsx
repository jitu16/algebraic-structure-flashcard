/* src/components/Lobby.tsx */
import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { LatexRenderer } from './LatexRenderer';
import { CreateUniverseModal, type UniverseFormData } from './modals/CreateUniverseModal';
import type { RootEnvironment, StructureNode, Axiom } from '../types';
import styles from './Lobby.module.css';

interface LobbyProps {
  onSelectUniverse: (universeId: string) => void;
}

/**
 * The Lobby Component.
 * Displays all Universes and allows Admins to create new ones with a Root Node.
 */
export const Lobby = ({ onSelectUniverse }: LobbyProps) => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const [environments, setEnvironments] = useState<RootEnvironment[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- Real-Time Fetching ---
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'environments'), (snapshot) => {
      const envs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RootEnvironment[];
      setEnvironments(envs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Create Universe Logic ---
  const handleCreate = async (data: UniverseFormData) => {
    const timestamp = Date.now();
    const envId = `env-${timestamp}`;
    const axiomId = `ax-${timestamp}`;
    const nodeId = `node-${timestamp}`;
    const authorId = profile?.uid || 'system';

    // 1. Prepare Environment
    const newEnv: RootEnvironment = {
      id: envId,
      name: data.envName,
      sets: data.sets,
      operators: data.operators
    };

    // 2. Prepare Genesis Axiom
    const newAxiom: Axiom = {
      id: axiomId,
      canonicalName: data.rootAxiomName,
      aliases: [],
      defaultLatex: data.rootAxiomLatex,
      authorId: authorId,
      createdAt: timestamp
    };

    // 3. Prepare Root Node
    const newRootNode: StructureNode = {
      id: nodeId,
      type: 'algebraic structure',
      parentId: null,
      axiomId: axiomId, // Link to the new axiom
      authorId: authorId,
      displayLatex: `\\text{${data.rootNodeName}}`,
      status: 'verified',
      rootContextId: envId,
      toBeDeleted: false,
      stats: { greenVotes: 0, blackVotes: 0 },
      createdAt: timestamp
    };

    try {
      // Write all three documents
      await setDoc(doc(db, 'environments', envId), newEnv);
      await setDoc(doc(db, 'axioms', axiomId), newAxiom);
      await setDoc(doc(db, 'nodes', nodeId), newRootNode);
      
      console.log(`Created Universe: ${envId}, Node: ${nodeId}`);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create universe:", error);
      alert("Error creating universe. See console.");
    }
  };

  // --- Delete Logic ---
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("⚠️ ADMIN WARNING ⚠️\nDelete this Universe? This does not delete the nodes inside it yet.")) return;
    try {
      await deleteDoc(doc(db, 'environments', id));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Algebraic Structures</h1>
      <p className={styles.subtitle}>Select a context to explore.</p>

      <div className={styles.grid}>
        {/* Admin Create Button */}
        {isAdmin && (
          <div className={`${styles.card} ${styles.createCard}`} onClick={() => setIsCreateModalOpen(true)}>
            <div className={styles.createContent}>
              <div className={styles.plusIcon}>+</div>
              <h3>Create Universe</h3>
            </div>
          </div>
        )}

        {/* Existing Universes */}
        {environments.map((env) => (
          <div key={env.id} className={styles.card} onClick={() => onSelectUniverse(env.id)}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>{env.name}</h2>
              {isAdmin && (
                <button className={styles.deleteBtn} onClick={(e) => handleDelete(e, env.id)}>🗑️</button>
              )}
              <div className={styles.tagContainer}>
                <span className={styles.tag}>Sets: <LatexRenderer latex={`\\{ ${env.sets.join(', ')} \\}`} /></span>
                <span className={styles.tag}>Ops: <LatexRenderer latex={`\\{ ${env.operators.join(', ')} \\}`} /></span>
              </div>
            </div>
            <div className={styles.description}>
              Contains <strong>{env.sets.length} Sets</strong> and <strong>{env.operators.length} Operators</strong>.
            </div>
            <button className={styles.enterBtn}>Enter &rarr;</button>
          </div>
        ))}
      </div>

      {isCreateModalOpen && (
        <CreateUniverseModal onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreate} />
      )}
    </div>
  );
};
