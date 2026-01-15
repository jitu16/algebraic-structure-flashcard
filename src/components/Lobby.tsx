/* src/components/Lobby.tsx */
import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc,
  updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { LatexRenderer } from './LatexRenderer';
import { CreateUniverseModal, type UniverseFormData } from './modals/CreateUniverseModal';
import { ProfileModal } from './modals/ProfileModal';
import type { RootEnvironment, StructureNode, Axiom } from '../types';
import styles from './Lobby.module.css';

interface LobbyProps {
  /** Callback to notify the parent app which universe was selected */
  onSelectUniverse: (universeId: string) => void;
}

/**
 * The Lobby Component.
 * Displays all Universes and allows Admins to create, delete, and rename them.
 * * Updates:
 * - Header Bar now displays the Dual-Score (Creation | Contributor).
 * - Fixed avatar display to rely on Auth 'user' object instead of Firestore profile.
 */
export const Lobby = ({ onSelectUniverse }: LobbyProps) => {
  const { user, profile, signInWithGoogle } = useAuth();
  const isAdmin = profile?.role === 'admin';

  // --- STATE ---
  const [environments, setEnvironments] = useState<RootEnvironment[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // --- REAL-TIME FETCHING ---
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

  // --- HANDLERS: EDITING ---
  const startEditing = (e: React.MouseEvent, env: RootEnvironment) => {
    e.stopPropagation();
    setEditingId(env.id);
    setEditValue(env.name);
  };

  const cancelEditing = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(null);
    setEditValue('');
  };

  const saveName = async (e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!editingId || !editValue.trim()) return;

    try {
      await updateDoc(doc(db, 'environments', editingId), { name: editValue.trim() });
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update name:", error);
      alert("Failed to update name.");
    }
  };

  // --- HANDLERS: CREATE / DELETE ---
  const handleCreate = async (data: UniverseFormData) => {
    const timestamp = Date.now();
    const envId = `env-${timestamp}`;
    const axiomId = `ax-${timestamp}`;
    const nodeId = `node-${timestamp}`;
    const authorId = profile?.uid || 'system';

    const newEnv: RootEnvironment = {
      id: envId,
      name: data.envName,
      sets: data.sets,
      operators: data.operators
    };

    const newAxiom: Axiom = {
      id: axiomId,
      canonicalName: data.rootAxiomName,
      aliases: [],
      defaultLatex: data.rootAxiomLatex,
      authorId: authorId,
      createdAt: timestamp
    };

    const newRootNode: StructureNode = {
      id: nodeId,
      type: 'algebraic structure',
      parentId: null,
      axiomId: axiomId,
      authorId: authorId,
      displayLatex: `\\text{${data.rootNodeName}}`,
      status: 'verified',
      rootContextId: envId,
      toBeDeleted: false,
      stats: { greenVotes: 0, blackVotes: 0 },
      createdAt: timestamp
    };

    try {
      await setDoc(doc(db, 'environments', envId), newEnv);
      await setDoc(doc(db, 'axioms', axiomId), newAxiom);
      await setDoc(doc(db, 'nodes', nodeId), newRootNode);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create universe:", error);
      alert("Error creating universe.");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("⚠️ ADMIN WARNING ⚠️\nDelete this Universe?")) return;
    try {
      await deleteDoc(doc(db, 'environments', id));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      
      {/* --- HEADER BAR --- */}
      <header className={styles.headerBar}>
        <div className={styles.logo}>BuildMath</div>
        <div className={styles.authControls}>
          {user ? (
            <button 
              className={styles.profileBtn}
              onClick={() => setIsProfileModalOpen(true)}
              title="View Profile & Leaderboard"
            >
              {/* DUAL SCORE BADGE */}
              <div className={styles.repBadge}>
                <div className={styles.repRow}>
                  <span className={styles.repIcon}>🏗️</span>
                  <span className={styles.repValue}>{profile?.reputation?.creation || 0}</span>
                </div>
                <div className={styles.repRow}>
                  <span className={styles.repIcon}>🤝</span>
                  <span className={styles.repValue}>{profile?.reputation?.contributor || 0}</span>
                </div>
              </div>
              
              <div className={styles.avatarSmall}>
                {/* Use Firebase Auth 'user' for photo, fallback to initials from profile */}
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="User" />
                ) : (
                  <span>{profile?.displayName?.charAt(0) || 'U'}</span>
                )}
              </div>
            </button>
          ) : (
            <button onClick={signInWithGoogle} className={styles.signInBtn}>
              Sign In with Google
            </button>
          )}
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <h1 className={styles.title}>Algebraic Structures</h1>
      <p className={styles.subtitle}>
        Select an algebraic context to explore. Each algebraic structure defines its own sets and operators, anchoring the evolution of its structures.
      </p>

      <div className={styles.grid}>
        {/* Admin Create Button */}
        {isAdmin && (
          <div 
            className={`${styles.card} ${styles.createCard}`} 
            onClick={() => setIsCreateModalOpen(true)}
          >
            <div className={styles.createContent}>
              <div className={styles.plusIcon}>+</div>
              <h3>Create Universe</h3>
            </div>
          </div>
        )}

        {/* Existing Universes */}
        {environments.map((env) => (
          <div 
            key={env.id} 
            className={styles.card} 
            onClick={() => onSelectUniverse(env.id)}
          >
            <div className={styles.cardHeader}>
              
              {/* EDIT MODE */}
              {editingId === env.id ? (
                <div className={styles.editContainer} onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="text" 
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className={styles.editInput}
                    autoFocus
                  />
                  <div className={styles.editActions}>
                    <button onClick={saveName} className={styles.saveBtn} title="Save">✓</button>
                    <button onClick={cancelEditing} className={styles.cancelBtn} title="Cancel">✕</button>
                  </div>
                </div>
              ) : (
                /* VIEW MODE */
                <div className={styles.titleRow}>
                  <h2 className={styles.cardTitle}>{env.name}</h2>
                  
                  {isAdmin && (
                    <div className={styles.adminControls}>
                      <button 
                        className={styles.editIconBtn}
                        onClick={(e) => startEditing(e, env)}
                        title="Rename Universe"
                      >
                        ✏️
                      </button>
                      <button 
                        className={styles.deleteBtn} 
                        onClick={(e) => handleDelete(e, env.id)}
                        title="Delete Universe"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className={styles.tagContainer}>
                <span className={styles.tag}>
                  Sets: <LatexRenderer latex={`\\{ ${env.sets.join(', ')} \\}`} />
                </span>
                <span className={styles.tag}>
                  Ops: <LatexRenderer latex={`\\{ ${env.operators.join(', ')} \\}`} />
                </span>
              </div>
            </div>

            <div className={styles.description}>
              Contains <strong>{env.sets.length} Sets</strong> and <strong>{env.operators.length} Operators</strong>.
            </div>
            
            <button className={styles.enterBtn}>Enter &rarr;</button>
          </div>
        ))}
      </div>

      {/* --- MODALS --- */}
      {isCreateModalOpen && (
        <CreateUniverseModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onSubmit={handleCreate} 
        />
      )}
      
      {isProfileModalOpen && (
        <ProfileModal onClose={() => setIsProfileModalOpen(false)} />
      )}
    </div>
  );
};
