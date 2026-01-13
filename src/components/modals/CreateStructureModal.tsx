/* src/components/modals/CreateStructureModal.tsx */
import { useState } from 'react';
import styles from './Modal.module.css';
import { LatexRenderer } from '../LatexRenderer';

interface CreateStructureModalProps {
  parentId: string;
  parentName: string;
  onClose: () => void;
  onSubmit: (data: StructureFormData) => void;
}

export interface StructureFormData {
  structureName: string;
  structureLatex: string;
  axiomName: string;
  axiomLatex: string;
}

export const CreateStructureModal = ({ parentId, parentName, onClose, onSubmit }: CreateStructureModalProps) => {
  const [structureName, setStructureName] = useState('');
  const [structureLatex, setStructureLatex] = useState('(S, \\cdot)');
  const [axiomName, setAxiomName] = useState('');
  const [axiomLatex, setAxiomLatex] = useState('\\forall a, b \\in S...');

  const handleSubmit = () => {
    if (!structureName || !axiomName) return;
    onSubmit({
      structureName,
      structureLatex,
      axiomName,
      axiomLatex
    });
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Extend: {parentName}</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.body}>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            You are adding a new axiom to <strong>{parentName}</strong> to create a new Algebraic Structure.
          </p>

          <div className={styles.group}>
            <label className={styles.label}>1. New Axiom Name</label>
            <input 
              className={styles.input}
              placeholder="e.g. Commutativity"
              value={axiomName}
              onChange={(e) => setAxiomName(e.target.value)}
            />
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Axiom Formula (LaTeX)</label>
            <input 
              className={styles.input}
              value={axiomLatex}
              onChange={(e) => setAxiomLatex(e.target.value)}
            />
            <div className={styles.preview}>
              <LatexRenderer latex={axiomLatex || "Preview..."} />
            </div>
          </div>

          <hr style={{ width: '100%', border: '0', borderTop: '1px solid #eee' }} />

          <div className={styles.group}>
            <label className={styles.label}>2. Resulting Structure Name</label>
            <input 
              className={styles.input}
              placeholder="e.g. Abelian Group"
              value={structureName}
              onChange={(e) => setStructureName(e.target.value)}
            />
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Structure Notation (LaTeX)</label>
            <input 
              className={styles.input}
              value={structureLatex}
              onChange={(e) => setStructureLatex(e.target.value)}
            />
            <div className={styles.preview}>
              <LatexRenderer latex={structureLatex || "Preview..."} />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.submitBtn} onClick={handleSubmit}>Create Structure</button>
        </div>
      </div>
    </div>
  );
};
