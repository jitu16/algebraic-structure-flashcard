/* src/components/modals/TheoremLibraryDrawer.tsx */
import React, { useState, useMemo } from 'react';
import styles from './Modal.module.css'; 
import { LatexRenderer } from '../LatexRenderer';
import type { Theorem } from '../../types';

interface TheoremLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (theorem: Theorem) => void;
  availableTheorems: Theorem[];
}

/**
 * A slide-out panel allowing users to browse and search the global Theorem Registry.
 * Acts as a "Template Picker" - users can select an existing theorem to copy its 
 * statement/proof into the current node context.
 */
export const TheoremLibraryDrawer = ({
  isOpen,
  onClose,
  onSelect,
  availableTheorems
}: TheoremLibraryDrawerProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic: Matches name OR the statement LaTeX
  const filteredTheorems = useMemo(() => {
    if (!searchQuery.trim()) return availableTheorems;
    
    const query = searchQuery.toLowerCase();
    return availableTheorems.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.statementLatex.toLowerCase().includes(query)
    );
  }, [availableTheorems, searchQuery]);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.drawerOverlay} onClick={onClose} />

      <div className={styles.drawer}>
        <div className={styles.drawerHeader}>
          <h3>Theorem Library</h3>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.drawerSearch}>
          <input 
            className={styles.input}
            placeholder="Search theorems (e.g. 'Identity')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.drawerBody}>
          {filteredTheorems.length > 0 ? (
            filteredTheorems.map(theorem => (
              <div 
                key={theorem.id} 
                className={styles.libraryItem}
                onClick={() => onSelect(theorem)}
                title="Click to use this theorem as a template"
              >
                <div className={styles.libraryItemHeader}>
                  <strong>{theorem.name}</strong>
                  <span className={styles.libraryItemTag}>ID: {theorem.id}</span>
                </div>
                
                <div className={styles.preview} style={{ marginBottom: '5px' }}>
                  <LatexRenderer latex={theorem.statementLatex} />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Proof: {theorem.proofLatex}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>
              No theorems found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </>
  );
};
