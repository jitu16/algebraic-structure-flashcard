/* src/components/modals/CreateUniverseModal.tsx */
import React, { useState } from 'react';
import { LatexRenderer } from '../LatexRenderer';
import styles from './CreateUniverseModal.module.css';

/**
 * Data structure for the universe creation form.
 * Includes the environment definition AND the genesis node details.
 */
export interface UniverseFormData {
  // Environment Details
  envName: string;
  sets: string[];
  operators: string[];
  
  // Genesis Node Details
  rootNodeName: string;   // e.g. "Magma"
  rootAxiomName: string;  // e.g. "Closure"
  rootAxiomLatex: string; // e.g. "\forall a, b \in S..."
}

interface CreateUniverseModalProps {
  /** Callback to close the modal without saving */
  onClose: () => void;
  /** Callback to submit the complete form data */
  onSubmit: (data: UniverseFormData) => void;
}

/**
 * A modal dialog that allows Administrators to define a new Algebraic Universe.
 * * Features:
 * - Collects Environment Metadata (Sets, Operators).
 * - Collects Genesis Node Metadata (Name, Initial Axiom).
 * - **NEW**: Provides real-time LaTeX preview for the axiom definition.
 * - Validates all inputs before submission.
 */
export const CreateUniverseModal = ({ onClose, onSubmit }: CreateUniverseModalProps) => {
  // Step 1: Environment
  const [envName, setEnvName] = useState('');
  const [setsInput, setSetsInput] = useState('');
  const [opsInput, setOpsInput] = useState('');

  // Step 2: Genesis Node
  const [rootNodeName, setRootNodeName] = useState('');
  const [rootAxiomName, setRootAxiomName] = useState('');
  const [rootAxiomLatex, setRootAxiomLatex] = useState('');

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // --- Validation ---
    if (!envName.trim()) return setError("Universe Name is required.");
    if (!setsInput.trim()) return setError("At least one Set is required.");
    if (!rootNodeName.trim()) return setError("Root Node Name is required.");
    if (!rootAxiomName.trim()) return setError("Initial Axiom Name is required.");
    if (!rootAxiomLatex.trim()) return setError("Initial Axiom LaTeX is required.");

    // --- Parsing ---
    const sets = setsInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const operators = opsInput.split(',').map(s => s.trim()).filter(s => s.length > 0);

    if (sets.length === 0) return setError("Please enter valid set notation.");

    // --- Submission ---
    onSubmit({
      envName: envName.trim(),
      sets,
      operators,
      rootNodeName: rootNodeName.trim(),
      rootAxiomName: rootAxiomName.trim(),
      rootAxiomLatex: rootAxiomLatex.trim()
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        
        <div className={styles.header}>
          <h2 className={styles.title}>Create New Universe</h2>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorBanner}>{error}</div>}

          {/* SECTION 1: ENVIRONMENT */}
          <div className={styles.sectionLabel}>1. Environment Context</div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Universe Name</label>
            <input
              type="text"
              value={envName}
              onChange={(e) => setEnvName(e.target.value)}
              placeholder="e.g. Group Theory"
              className={styles.input}
              autoFocus
            />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Sets (comma sep.)</label>
              <input
                type="text"
                value={setsInput}
                onChange={(e) => setSetsInput(e.target.value)}
                placeholder="e.g. G"
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Operators</label>
              <input
                type="text"
                value={opsInput}
                onChange={(e) => setOpsInput(e.target.value)}
                placeholder="e.g. *"
                className={styles.input}
              />
            </div>
          </div>

          <hr className={styles.divider} />

          {/* SECTION 2: GENESIS NODE */}
          <div className={styles.sectionLabel}>2. Genesis Node (Root)</div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Root Structure Name</label>
            <input
              type="text"
              value={rootNodeName}
              onChange={(e) => setRootNodeName(e.target.value)}
              placeholder="e.g. Magma"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Initial Axiom Name</label>
            <input
              type="text"
              value={rootAxiomName}
              onChange={(e) => setRootAxiomName(e.target.value)}
              placeholder="e.g. Closure"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Initial Axiom Definition (LaTeX)</label>
            <textarea
              value={rootAxiomLatex}
              onChange={(e) => setRootAxiomLatex(e.target.value)}
              placeholder="\forall a, b \in G, a * b \in G"
              className={styles.textarea}
              rows={3}
            />
            
            {/* --- PREVIEW SECTION --- */}
            {rootAxiomLatex && (
              <div className={styles.previewBox}>
                <span className={styles.previewLabel}>Preview:</span>
                <div className={styles.previewContent}>
                  <LatexRenderer latex={rootAxiomLatex} />
                </div>
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" className={styles.createBtn}>Initialize Universe</button>
          </div>
        </form>
      </div>
    </div>
  );
};
