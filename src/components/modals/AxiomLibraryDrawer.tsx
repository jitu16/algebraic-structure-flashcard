/* src/components/modals/AxiomLibraryDrawer.tsx */
import { useState, useMemo } from 'react';
import styles from './Modal.module.css'; 
import { LatexRenderer } from '../LatexRenderer';
import type { Axiom } from '../../types';

/**
 * Props for the Axiom Library Drawer.
 * @property isOpen - Controls visibility of the side drawer.
 * @property onClose - Callback to close the drawer without selection.
 * @property onSelect - Callback returning the selected Axiom to the parent.
 * @property availableAxioms - The full catalog of axioms to search through.
 */
interface AxiomLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (axiom: Axiom) => void;
  availableAxioms: Axiom[];
}

/**
 * A slide-out panel allowing users to browse and search the global Axiom Registry.
 * * Features:
 * 1. Real-time search by Name or LaTeX content.
 * 2. Visual previews of the mathematical notation.
 * 3. One-click selection to populate the parent form.
 */
export const AxiomLibraryDrawer = ({
  isOpen,
  onClose,
  onSelect,
  availableAxioms
}: AxiomLibraryDrawerProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic: Matches name OR the raw latex string
  const filteredAxioms = useMemo(() => {
    if (!searchQuery.trim()) return availableAxioms;
    
    const query = searchQuery.toLowerCase();
    return availableAxioms.filter(ax => 
      ax.canonicalName.toLowerCase().includes(query) ||
      ax.defaultLatex.toLowerCase().includes(query)
    );
  }, [availableAxioms, searchQuery]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop: Darkens the rest of the screen (z-index handled in CSS) */}
      <div className={styles.drawerOverlay} onClick={onClose} />

      {/* The Sliding Panel */}
      <div className={styles.drawer}>
        
        {/* Header Section */}
        <div className={styles.drawerHeader}>
          <h3>Axiom Library</h3>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        {/* Search Bar */}
        <div className={styles.drawerSearch}>
          <input 
            className={styles.input}
            placeholder="Search axioms (e.g. 'Commutativity' or '\forall')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Results List */}
        <div className={styles.drawerBody}>
          {filteredAxioms.length > 0 ? (
            filteredAxioms.map(axiom => (
              <div 
                key={axiom.id} 
                className={styles.libraryItem}
                onClick={() => onSelect(axiom)}
                title="Click to select this axiom"
              >
                <div className={styles.libraryItemHeader}>
                  <strong>{axiom.canonicalName}</strong>
                  <span className={styles.libraryItemTag}>ID: {axiom.id}</span>
                </div>
                
                <div className={styles.preview}>
                  <LatexRenderer latex={axiom.defaultLatex} />
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>
              No axioms found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </>
  );
};
