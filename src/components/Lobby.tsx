/* src/components/Lobby.tsx */
import React, { useState } from 'react';
import { toast } from 'react-hot-toast'; 
import { useAuth } from '../contexts/AuthContext';
import { useEnvironments } from '../hooks/useEnvironments';
import { UniverseService } from '../services/universeService'; 
import { LatexRenderer } from './LatexRenderer';
import { CreateUniverseModal, type UniverseFormData } from './modals/CreateUniverseModal';
import { ProfileModal } from './modals/ProfileModal';
import { AdminUserModal } from './modals/AdminUserModal'; 
import type { RootEnvironment } from '../types';
import styles from './Lobby.module.css';

interface LobbyProps {
  /** Callback to notify the parent app which universe was selected. */
  onSelectUniverse: (universeId: string) => void;
}

/**
 * The Lobby Component.
 * Displays the list of available Algebraic Universes (Root Environments).
 * Allows Admins to create, rename, and delete universes.
 * * Data Source: Uses `useEnvironments` hook for real-time updates.
 * * Data Mutation: Uses `UniverseService` for all write operations.
 */
export const Lobby = ({ onSelectUniverse }: LobbyProps) => {
  const { user, profile, signInWithGoogle } = useAuth();
  const isAdmin = profile?.role === 'admin';

  // --- DATA FETCHING ---
  const { environments, isLoading } = useEnvironments();

  // --- UI STATE ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminUserModalOpen, setIsAdminUserModalOpen] = useState(false); 

  // --- EDIT STATE ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // --- HANDLERS: EDITING ---

  /**
   * Enters edit mode for a specific environment card.
   * @param e - The click event (preventing card selection).
   * @param env - The environment object to edit.
   */
  const startEditing = (e: React.MouseEvent, env: RootEnvironment) => {
    e.stopPropagation();
    setEditingId(env.id);
    setEditValue(env.name);
  };

  /**
   * Exits edit mode without saving.
   * @param e - Optional click event.
   */
  const cancelEditing = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(null);
    setEditValue('');
  };

  /**
   * Commits the new name via the UniverseService.
   * @param e - The form or button event.
   */
  const saveName = async (e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!editingId || !editValue.trim()) return;

    try {
      await UniverseService.renameUniverse(editingId, editValue);
      toast.success("Universe renamed successfully");
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update name:", error);
      toast.error("Failed to update name");
    }
  };

  // --- HANDLERS: CREATE / DELETE ---

  /**
   * Creates a new Universe (Root Environment) along with its Root Node and Axiom.
   * Delegates all business logic to the UniverseService.
   * @param data - The form data containing name, sets, and operators.
   */
  const handleCreate = async (data: UniverseFormData) => {
    const authorId = profile?.uid || 'system';

    try {
      await UniverseService.createUniverse(data, authorId);
      toast.success("Universe created successfully");
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create universe:", error);
      toast.error("Error creating universe");
    }
  };

  /**
   * Deletes a Universe and its reference.
   * Note: This does not currently cascade delete all child nodes (future admin task).
   * @param e - The click event.
   * @param id - The ID of the environment to delete.
   */
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("⚠️ ADMIN WARNING ⚠️\nDelete this Universe? This cannot be undone.")) return;
    try {
      await UniverseService.deleteUniverse(id);
      toast.success("Universe deleted");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete universe");
    }
  };

  if (isLoading) return <div className={styles.loading}>Loading Universes...</div>;

  return (
    <div className={styles.container}>
      
      {/* --- HEADER (Fixed / Static) --- */}
      <header className={styles.headerBar}>
        <div className={styles.logo}>BuildMath</div>
        <div className={styles.authControls}>
          
          {/* 1. ADMIN BUTTON (Icon Only) */}
          {isAdmin && (
            <button 
              className={styles.adminIconBtn}
              onClick={() => setIsAdminUserModalOpen(true)}
              title="Manage Users"
            >
              👥
            </button>
          )}

          {/* 2. AUTH STATUS (Profile Pill or Sign In) */}
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

      {/* --- MAIN SCROLLABLE CONTENT --- */}
      <main className={styles.mainContent}>
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
      </main>

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

      {isAdminUserModalOpen && (
        <AdminUserModal onClose={() => setIsAdminUserModalOpen(false)} />
      )}
    </div>
  );
};
