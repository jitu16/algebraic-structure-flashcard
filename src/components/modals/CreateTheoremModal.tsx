/* src/components/modals/CreateTheoremModal.tsx */
import { useState } from 'react';
import styles from './Modal.module.css';
import { LatexRenderer } from '../LatexRenderer';

interface CreateTheoremModalProps {
  rootId: string; // The structure this theorem belongs to
  rootName: string;
  onClose: () => void;
  onSubmit: (data: TheoremFormData) => void;
}

export interface TheoremFormData {
  name: string;
  statement: string;
  proof: string;
}

export const CreateTheoremModal = ({ rootId, rootName, onClose, onSubmit }: CreateTheoremModalProps) => {
  const [name, setName] = useState('');
  const [statement, setStatement] = useState('');
  const [proof, setProof] = useState('');

  const handleSubmit = () => {
    if (!name || !statement) return;
    onSubmit({ name, statement, proof });
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>New Theorem in {rootName}</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.body}>
          <div className={styles.group}>
            <label className={styles.label}>Theorem Name</label>
            <input 
              className={styles.input}
              placeholder="e.g. Uniqueness of Identity"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Statement (LaTeX)</label>
            <textarea 
              className={styles.textarea}
              placeholder="\forall a, b..."
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
            />
            <div className={styles.preview}>
              <LatexRenderer latex={statement || "Statement Preview..."} />
            </div>
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Proof (LaTeX)</label>
            <textarea 
              className={styles.textarea}
              style={{ minHeight: '120px' }}
              placeholder="Proof steps..."
              value={proof}
              onChange={(e) => setProof(e.target.value)}
            />
            <div className={styles.preview}>
              <LatexRenderer latex={proof || "Proof Preview..."} />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.submitBtn} onClick={handleSubmit}>Add Theorem</button>
        </div>
      </div>
    </div>
  );
};
