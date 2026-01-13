/* src/components/modals/CreateStructureModal.tsx */
import { useState } from 'react';
import styles from './Modal.module.css';
import { LatexRenderer } from '../LatexRenderer';
import type { RootEnvironment } from '../../types';

/**
 * Props definition for the CreateStructureModal component.
 * @property parentId - The unique identifier of the parent structure being extended.
 * @property parentName - The display name (LaTeX) of the parent structure.
 * @property rootEnvironment - The immutable context (Sets and Operators) defined at the root of this structure branch.
 * @property onClose - Callback function to close the modal without saving.
 * @property onSubmit - Callback function to handle the creation of the new structure with the form data.
 */
interface CreateStructureModalProps {
  parentId: string;
  parentName: string;
  rootEnvironment: RootEnvironment;
  onClose: () => void;
  onSubmit: (data: StructureFormData) => void;
}

/**
 * Data structure representing the form fields required to create a new algebraic structure.
 */
export interface StructureFormData {
  structureName: string;
  structureLatex: string;
  axiomName: string;
  axiomLatex: string;
}

/**
 * Modal component for extending an algebraic structure.
 * * This component provides a form for users to define a new Algebraic Structure by adding an axiom
 * to an existing parent structure. It enforces notation consistency by displaying the 
 * immutable Root Environment (Sets and Operators) which must be used in the new axiom definitions.
 * * @param props - The CreateStructureModalProps containing context and event handlers.
 * @returns The rendered modal component.
 */
export const CreateStructureModal = ({ 
  parentId, 
  parentName, 
  rootEnvironment, 
  onClose, 
  onSubmit 
}: CreateStructureModalProps) => {
  const [structureName, setStructureName] = useState('');
  
  const defaultNotation = `(${rootEnvironment.sets[0]}, ${rootEnvironment.operators[0]})`;
  const [structureLatex, setStructureLatex] = useState(defaultNotation);
  
  const [axiomName, setAxiomName] = useState('');
  const [axiomLatex, setAxiomLatex] = useState(`\\forall a, b \\in ${rootEnvironment.sets[0]}...`);

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

  const contextLatex = `\\text{Sets: } \\{ ${rootEnvironment.sets.join(', ')} \\} \\quad \\text{Operators: } \\{ ${rootEnvironment.operators.join(', ')} \\}`;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Extend: {parentName}</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.body}>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
            You are adding a new axiom to <strong>{parentName}</strong> to create a new Algebraic Structure.
          </p>

          <div style={{ 
            background: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '6px', 
            border: '1px solid #ddd',
            marginBottom: '20px'
          }}>
            <div style={{ 
              fontSize: '0.75rem', 
              textTransform: 'uppercase', 
              color: '#888', 
              marginBottom: '4px',
              fontWeight: 'bold' 
            }}>
		 Defined Operators and Sets (Immutable)
            </div>
            <LatexRenderer latex={contextLatex} />
          </div>

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
            <label className={styles.label}>Structure Notation (Display Label)</label>
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
