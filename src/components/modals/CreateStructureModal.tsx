/* src/components/modals/CreateStructureModal.tsx */
import { useState, useMemo, useEffect } from 'react';
import styles from './Modal.module.css';
import { LatexRenderer } from '../LatexRenderer';
import { AxiomLibraryDrawer } from './AxiomLibraryDrawer';
import type { RootEnvironment, Axiom } from '../../types';

/**
 * Props definition for the CreateStructureModal component.
 * Updated to include the full library of axioms for the search feature.
 */
interface CreateStructureModalProps {
  parentId: string;
  parentName: string;
  rootEnvironment: RootEnvironment;
  availableAxioms: Axiom[]; // <--- New Prop: The Library
  onClose: () => void;
  onSubmit: (data: StructureFormData) => void;
}

/**
 * Data structure for the submission.
 * Includes optional 'existingAxiomId' to link to the library.
 */
export interface StructureFormData {
  structureName: string;
  axiomName: string;
  axiomLatex: string;
  existingAxiomId?: string; // <--- Linked Data
}

export const CreateStructureModal = ({ 
  parentId, 
  parentName, 
  rootEnvironment, 
  availableAxioms,
  onClose, 
  onSubmit 
}: CreateStructureModalProps) => {
  // --- Form State ---
  const [structureName, setStructureName] = useState('');
  const [axiomName, setAxiomName] = useState('');
  const [axiomLatex, setAxiomLatex] = useState(`\\forall a, b \\in ${rootEnvironment.sets[0]}...`);
  
  // --- Hybrid Selection State ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedAxiomId, setSelectedAxiomId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter logic for Autocomplete
  const suggestions = useMemo(() => {
    if (!axiomName || selectedAxiomId) return [];
    const lowerQuery = axiomName.toLowerCase();
    return availableAxioms.filter(ax => 
      ax.canonicalName.toLowerCase().includes(lowerQuery)
    ).slice(0, 5); // Limit to top 5 matches
  }, [axiomName, availableAxioms, selectedAxiomId]);

  // --- Handlers ---

  const handleAxiomSelect = (axiom: Axiom) => {
    setAxiomName(axiom.canonicalName);
    setAxiomLatex(axiom.defaultLatex);
    setSelectedAxiomId(axiom.id);
    
    // UI Cleanup
    setShowSuggestions(false);
    setIsDrawerOpen(false);
  };

  const handleNameChange = (val: string) => {
    setAxiomName(val);
    setShowSuggestions(true);
    
    // If user edits the name, we break the link to the existing axiom
    // and revert to "New Creation" mode (Unlocking the LaTeX field).
    if (selectedAxiomId) {
      setSelectedAxiomId(null);
    }
  };

  const handleSubmit = () => {
    if (!structureName || !axiomName) return;
    onSubmit({
      structureName,
      axiomName,
      axiomLatex,
      existingAxiomId: selectedAxiomId || undefined
    });
    onClose();
  };

  const contextLatex = `\\text{Sets: } \\{ ${rootEnvironment.sets.join(', ')} \\} \\quad \\text{Operators: } \\{ ${rootEnvironment.operators.join(', ')} \\}`;

  return (
    <>
      <div className={styles.overlay}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2>Extend: {parentName}</h2>
            <button className={styles.closeButton} onClick={onClose}>&times;</button>
          </div>

          <div className={styles.body}>
            <p className={styles.description}>
              Add an axiom to <strong>{parentName}</strong> to create a new Structure.
            </p>

            <div className={styles.contextBox}>
              <div className={styles.contextLabel}>Defined Context (Immutable)</div>
              <LatexRenderer latex={contextLatex} />
            </div>

            {/* --- HYBRID AXIOM SELECTION --- */}
            <div className={styles.group} style={{ position: 'relative' }}>
              <label className={styles.label}>1. Select or Name New Axiom</label>
              
              <div className={styles.inputGroupRow}>
                {/* Search / Input Field */}
                <input 
                  className={styles.input}
                  placeholder="Type to search (e.g. 'Commutativity')..."
                  value={axiomName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                  autoComplete="off"
                />
                
                {/* Library Catalog Button */}
                <button 
                  className={styles.browseBtn}
                  onClick={() => setIsDrawerOpen(true)}
                  title="Browse Axiom Library"
                >
                  📂
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className={styles.suggestionsDropdown}>
                  {suggestions.map(ax => (
                    <div 
                      key={ax.id} 
                      className={styles.suggestionItem}
                      onClick={() => handleAxiomSelect(ax)}
                    >
                      <strong>{ax.canonicalName}</strong>
                      <span className={styles.suggestionDetail}>
                         - <LatexRenderer latex={ax.defaultLatex} />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Axiom LaTeX Field (Locked if linked) */}
            <div className={styles.group}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className={styles.label}>Axiom Formula (LaTeX)</label>
                {selectedAxiomId && (
                  <span style={{ fontSize: '0.75rem', color: '#2e7d32', fontWeight: 'bold' }}>
                    ✓ Linked to Library
                  </span>
                )}
              </div>
              
              <input 
                className={selectedAxiomId ? styles.inputLocked : styles.input}
                value={axiomLatex}
                onChange={(e) => !selectedAxiomId && setAxiomLatex(e.target.value)}
                readOnly={!!selectedAxiomId}
                title={selectedAxiomId ? "This formula is locked because it is linked to a library axiom." : ""}
              />
              <div className={styles.preview}>
                <LatexRenderer latex={axiomLatex || "Preview..."} />
              </div>
            </div>

            <hr className={styles.separator} />

            <div className={styles.group}>
              <label className={styles.label}>2. Resulting Structure Name</label>
              <input 
                className={styles.input}
                placeholder="e.g. Abelian Group"
                value={structureName}
                onChange={(e) => setStructureName(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button className={styles.submitBtn} onClick={handleSubmit}>Create Structure</button>
          </div>
        </div>
      </div>

      {/* --- SIDE DRAWER COMPONENT --- */}
      <AxiomLibraryDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelect={handleAxiomSelect}
        availableAxioms={availableAxioms}
      />
    </>
  );
};
