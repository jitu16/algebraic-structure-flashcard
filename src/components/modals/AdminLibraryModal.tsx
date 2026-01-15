/* src/components/modals/AdminLibraryModal.tsx */
import { useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  getCountFromServer 
} from 'firebase/firestore'; // <--- Import Aggregation tools
import { db } from '../../firebase';
import { LatexRenderer } from '../LatexRenderer';
import type { Axiom, Theorem } from '../../types';
import styles from './AdminLibraryModal.module.css';

interface AdminLibraryModalProps {
  /** Full list of global axioms for auditing */
  axioms: Axiom[];
  /** Full list of global theorems for auditing */
  theorems: Theorem[];
  
  onClose: () => void;
  onDeleteAxiom: (id: string) => void;
  onDeleteTheorem: (id: string) => void;
}

type Tab = 'axioms' | 'theorems';

/**
 * A "Control Center" modal for Administrators.
 * Allows searching and deleting global definitions (Axioms/Theorems).
 * * * Integrity Protection Strategy:
 * Uses Firestore Aggregation Queries (`getCountFromServer`) to perform an 
 * atomic, server-side check across the entire `nodes` collection before deletion.
 * This guarantees safety across all universes without downloading heavy graph data.
 */
export const AdminLibraryModal = ({
  axioms,
  theorems,
  onClose,
  onDeleteAxiom,
  onDeleteTheorem
}: AdminLibraryModalProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('axioms');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Tracks which axiom is currently undergoing the integrity check
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // --- Filtering Logic ---
  const filteredAxioms = axioms.filter(ax => 
    ax.canonicalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ax.defaultLatex.includes(searchTerm)
  );

  const filteredTheorems = theorems.filter(th => 
    th.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    th.statementLatex.includes(searchTerm)
  );

  // --- Handlers ---

  /**
   * Performs an asynchronous server-side check for usage before deleting an Axiom.
   */
  const handleDeleteAxiomSafe = async (ax: Axiom) => {
    setVerifyingId(ax.id);

    try {
      // 1. Server-Side Count: How many nodes GLOBALLY use this axiom?
      // This costs 1 index read (very cheap) and checks all universes.
      const coll = collection(db, 'nodes');
      const q = query(coll, where('axiomId', '==', ax.id));
      const snapshot = await getCountFromServer(q);
      const count = snapshot.data().count;

      // 2. Block if in use
      if (count > 0) {
        alert(
          `⛔ CANVAS INTEGRITY PROTECTION ⛔\n\n` +
          `Cannot delete axiom "${ax.canonicalName}".\n` +
          `It is currently the foundation for ${count} structure(s) across the system.\n\n` +
          `You must delete those structures first.`
        );
        return;
      }

      // 3. Proceed if safe
      if (confirm(`Are you sure you want to delete the axiom "${ax.canonicalName}"?\nThis cannot be undone.`)) {
        onDeleteAxiom(ax.id);
      }

    } catch (error) {
      console.error("Integrity check failed:", error);
      alert("Failed to verify axiom usage. Please check your connection.");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDeleteTheoremSafe = (th: Theorem) => {
    // Theorems are leaf nodes (properties), so deleting them is generally safe.
    if (confirm(`Are you sure you want to delete the theorem "${th.name}"?`)) {
      onDeleteTheorem(th.id);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>System Library</h2>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        {/* Tabs & Search */}
        <div className={styles.toolbar}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'axioms' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('axioms')}
            >
              Axioms ({axioms.length})
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'theorems' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('theorems')}
            >
              Theorems ({theorems.length})
            </button>
          </div>
          
          <input 
            type="text" 
            placeholder="Search library..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Content List */}
        <div className={styles.listContainer}>
          
          {/* AXIOMS TAB */}
          {activeTab === 'axioms' && (
            <ul className={styles.list}>
              {filteredAxioms.map(ax => {
                const isChecking = verifyingId === ax.id;
                return (
                  <li key={ax.id} className={styles.item}>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemName}>
                        {ax.canonicalName}
                      </div>
                      <div className={styles.itemLatex}>
                        <LatexRenderer latex={ax.defaultLatex} />
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteAxiomSafe(ax)}
                      className={`${styles.deleteBtn} ${isChecking ? styles.disabled : ''}`}
                      disabled={isChecking}
                      title="Delete Axiom"
                    >
                      {isChecking ? '⏳' : '🗑️'}
                    </button>
                  </li>
                );
              })}
              {filteredAxioms.length === 0 && <div className={styles.empty}>No axioms found.</div>}
            </ul>
          )}

          {/* THEOREMS TAB */}
          {activeTab === 'theorems' && (
            <ul className={styles.list}>
              {filteredTheorems.map(th => (
                <li key={th.id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{th.name}</div>
                    <div className={styles.itemLatex}>
                      <LatexRenderer latex={th.statementLatex} />
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteTheoremSafe(th)}
                    className={styles.deleteBtn}
                    title="Delete Theorem"
                  >
                    🗑️
                  </button>
                </li>
              ))}
              {filteredTheorems.length === 0 && <div className={styles.empty}>No theorems found.</div>}
            </ul>
          )}

        </div>
      </div>
    </div>
  );
};
