/* src/components/modals/CreateTheoremModal.tsx */
import { useState, useMemo } from 'react';
import styles from './Modal.module.css';
import { LatexRenderer } from '../LatexRenderer';
import { TheoremLibraryDrawer } from './TheoremLibraryDrawer';
import type { Theorem } from '../../types';

interface CreateTheoremModalProps {
  structureName: string;
  availableTheorems: Theorem[]; 
  onClose: () => void;
  onSubmit: (data: TheoremFormData) => void;
}

export interface TheoremFormData {
  name: string;
  statementLatex: string;
  proofLatex: string;
}

export const CreateTheoremModal = ({ 
  structureName, 
  availableTheorems,
  onClose, 
  onSubmit 
}: CreateTheoremModalProps) => {
  // --- Form State ---
  const [name, setName] = useState('');
  const [statementLatex, setStatementLatex] = useState('');
  const [proofLatex, setProofLatex] = useState('');
  
  // --- Hybrid Selection State ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter logic for Autocomplete
  const suggestions = useMemo(() => {
    if (!name) return [];
    const lowerQuery = name.toLowerCase();
    return availableTheorems.filter(t => 
      t.name.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);
  }, [name, availableTheorems]);

  // --- Handlers ---

  const handleTheoremSelect = (theorem: Theorem) => {
    // Populate fields to act as a template
    setName(theorem.name);
    setStatementLatex(theorem.statementLatex);
    setProofLatex(theorem.proofLatex);
    
    setShowSuggestions(false);
    setIsDrawerOpen(false);
  };

  const handleSubmit = () => {
    if (!name || !statementLatex || !proofLatex) return;
    onSubmit({
      name,
      statementLatex,
      proofLatex
    });
    onClose();
  };

  return (
    <>
      <div className={styles.overlay}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2>Propose Theorem</h2>
            <button className={styles.closeButton} onClick={onClose}>&times;</button>
          </div>

          <div className={styles.body}>
            <p className={styles.description}>
              Add a new property or theorem to <strong>{structureName}</strong>.
            </p>

            {/* --- HYBRID SELECTION --- */}
            <div className={styles.group} style={{ position: 'relative' }}>
              <label className={styles.label}>1. Theorem Name</label>
              
              <div className={styles.inputGroupRow}>
                <input 
                  className={styles.input}
                  placeholder="e.g. Uniqueness of Identity"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  autoComplete="off"
                />
                
                <button 
                  className={styles.browseBtn}
                  onClick={() => setIsDrawerOpen(true)}
                  title="Browse Theorem Library"
                >
                  📂
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className={styles.suggestionsDropdown}>
                  {suggestions.map(t => (
                    <div 
                      key={t.id} 
                      className={styles.suggestionItem}
                      onClick={() => handleTheoremSelect(t)}
                    >
                      <strong>{t.name}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* --- CONTENT EDITING --- */}
            <div className={styles.group}>
              <label className={styles.label}>Statement (LaTeX)</label>
              <textarea 
                className={styles.textarea}
                rows={2}
                value={statementLatex}
                onChange={(e) => setStatementLatex(e.target.value)}
                placeholder="\forall g \in G, ..."
              />
              <div className={styles.preview}>
                <LatexRenderer latex={statementLatex || "Preview..."} />
              </div>
            </div>

            <div className={styles.group}>
              <label className={styles.label}>Proof (LaTeX)</label>
              <textarea 
                className={styles.textarea}
                rows={4}
                value={proofLatex}
                onChange={(e) => setProofLatex(e.target.value)}
                placeholder="Suppose e and e' are identities..."
              />
              <div className={styles.preview}>
                <LatexRenderer latex={proofLatex || "Preview..."} />
              </div>
            </div>

          </div>

          <div className={styles.footer}>
            <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button className={styles.submitBtn} onClick={handleSubmit}>Propose Theorem</button>
          </div>
        </div>
      </div>

      <TheoremLibraryDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelect={handleTheoremSelect}
        availableTheorems={availableTheorems}
      />
    </>
  );
};
