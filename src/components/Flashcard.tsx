/* src/components/Flashcard.tsx */
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../firebase';
import 'katex/dist/katex.min.css';
import styles from './Flashcard.module.css';
import type { StructureNode, Theorem, Axiom } from '../types';
import { getCumulativeLineage } from '../utils/lineage';
import { LatexRenderer } from './LatexRenderer';
import { useVoting } from '../hooks/useVoting';
import { checkStatus } from '../utils/checkStatus';
import { CreateTheoremModal, type TheoremFormData } from './modals/CreateTheoremModal';
import { useAuth } from '../contexts/AuthContext';

interface UnifiedFlashcardProps {
  node: StructureNode;
  allNodes: StructureNode[];
  allAxioms: Axiom[];
  allTheorems: Theorem[];
  onClose: () => void;
  onAddTheorem: (data: TheoremFormData) => void;
  onDelete: (id: string) => void;
  onDeleteTheorem: (id: string) => void;
}

/**
 * A reusable component for inline Admin editing.
 * Switches between a display view (with edit icon) and an input form.
 */
const InlineAdminEdit = ({ 
  value, 
  collectionName, 
  docId, 
  field, 
  isAdmin, 
  className 
}: { 
  value: string, 
  collectionName: string, 
  docId: string, 
  field: string, 
  isAdmin: boolean,
  className?: string
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, collectionName, docId), { [field]: editValue });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update:", err);
      alert("Update failed.");
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={styles.inlineEditContainer} onClick={e => e.stopPropagation()}>
        <input 
          className={styles.inlineInput}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          autoFocus
        />
        <button onClick={handleSave} className={styles.saveBtn} title="Save">✓</button>
        <button onClick={handleCancel} className={styles.cancelBtn} title="Cancel">✕</button>
      </div>
    );
  }

  return (
    <div className={`${styles.inlineDisplay} ${className || ''}`}>
      {/* If the value looks like LaTeX (starts with \), we render it.
         Otherwise, we just display text. 
      */}
      {value.trim().startsWith('\\') ? <LatexRenderer latex={value} /> : value}
      
      {isAdmin && (
        <button 
          onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          className={styles.editIconBtn}
          title="Edit Name"
        >
          ✏️
        </button>
      )}
    </div>
  );
};

/**
 * The Detail Panel ("Flashcard") for an Algebraic Structure.
 * Displays the node's name, axiom, inherited lineage, and local theorems.
 */
export const Flashcard = (props: UnifiedFlashcardProps) => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  
  const { 
    node, 
    allNodes, 
    allAxioms, 
    allTheorems, 
    onClose, 
    onAddTheorem, 
    onDelete, 
    onDeleteTheorem 
  } = props;

  const lineage = getCumulativeLineage(node.id, allNodes, allAxioms, allTheorems);
  const [isTheoremModalOpen, setIsTheoremModalOpen] = useState(false);

  return (
    <div className={styles.panel}>
      <div className={styles.headerRow}>
        <h3 className={styles.headerTitle}>Structure Details</h3>
        <button onClick={onClose} className={styles.closeBtn}>Close ✕</button>
      </div>
      
      {/* Heritage Section */}
      <section className={styles.sectionInherited}>
        <h4 className={styles.sectionTitle}>Heritage</h4>
        <div className={styles.toggleContainer}>
          <div className={styles.toggleContent}>
             <strong>Inherited Axioms:</strong>
             {lineage.inheritedAxioms.length > 0 ? (
                <ul className={styles.axiomList}>
                  {lineage.inheritedAxioms.map(ax => (
                    <li key={ax.id} className={styles.axiomItem}>
                      <InlineAdminEdit 
                        value={ax.canonicalName} 
                        collectionName="axioms" 
                        docId={ax.id} 
                        field="canonicalName"
                        isAdmin={isAdmin}
                      />
                    </li>
                  ))}
                </ul>
             ) : <span className={styles.emptyState}> None</span>}
          </div>
        </div>
      </section>
      
      {/* Local Section */}
      <section className={styles.sectionCurrent}>
        {/* EDITABLE NODE NAME */}
        <h3>
          <InlineAdminEdit 
            value={node.displayLatex} 
            collectionName="nodes" 
            docId={node.id} 
            field="displayLatex"
            isAdmin={isAdmin}
          />
        </h3>
        
        {lineage.localAxiom && (
          <div className={styles.axiomBox}>
             <div className={styles.axiomLabel}>
               <strong>Axiom: </strong>
               {/* EDITABLE AXIOM NAME */}
               <InlineAdminEdit 
                 value={lineage.localAxiom.canonicalName} 
                 collectionName="axioms" 
                 docId={lineage.localAxiom.id} 
                 field="canonicalName" 
                 isAdmin={isAdmin}
               />
             </div>
             <span className={styles.latexBold}>
               <LatexRenderer latex={lineage.localAxiom.defaultLatex} />
             </span>
          </div>
        )}

        <div className={styles.localPropHeader}>
          <h4>Theorems:</h4>
          <button onClick={() => setIsTheoremModalOpen(true)} className={styles.proposeBtn}>
            + Add Theorem
          </button>
        </div>

        {lineage.localTheorems.length > 0 ? (
          lineage.localTheorems.map(t => (
            <TheoremItem 
              key={t.id} 
              theorem={t} 
              onDelete={onDeleteTheorem} 
            />
          ))
        ) : (
          <p className={styles.emptyState}>No properties defined yet.</p>
        )}
      </section>

      {isTheoremModalOpen && (
        <CreateTheoremModal 
          structureName={node.displayLatex}
          availableTheorems={allTheorems}
          onClose={() => setIsTheoremModalOpen(false)}
          onSubmit={onAddTheorem}
        />
      )}
      
      {isAdmin && (
        <div className={styles.adminZone}>
          <button onClick={() => onDelete(node.id)} className={styles.deleteBtn}>
             DELETE STRUCTURE
          </button>
        </div>
      )}
    </div>
  );
};

// --- SUBCOMPONENT: TheoremItem ---

interface TheoremItemProps {
  theorem: Theorem;
  onDelete?: (id: string) => void;
}

const TheoremItem = ({ theorem, onDelete }: TheoremItemProps) => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  
  const { stats, userVote, handleVote, isLoading } = useVoting(
    theorem.id, 
    'theorems', 
    theorem.stats.greenVotes,
    theorem.stats.blackVotes
  );

  const currentStatus = checkStatus({ ...theorem, stats });
  const containerClass = `theorem-item status-${currentStatus}`;
  const upButtonClass = `vote-btn ${userVote === 'up' ? 'active-up' : ''}`;
  const downButtonClass = `vote-btn ${userVote === 'down' ? 'active-down' : ''}`;

  return (
    <div className={containerClass}>
      <div className={styles.theoremHeaderRow}>
        <div className={styles.theoremName}>
          {/* EDITABLE THEOREM NAME */}
          <InlineAdminEdit 
            value={theorem.name} 
            collectionName="theorems" 
            docId={theorem.id} 
            field="name"
            isAdmin={isAdmin}
          />
        </div>
        <div className="math-node-stats" style={{margin:0, border:'none', padding:0}}>
           <button 
            className={upButtonClass}
            onClick={(e) => { e.stopPropagation(); handleVote('up'); }}
            disabled={isLoading}
            title="Vote Valid"
          >
            ▲ {stats.greenVotes}
          </button>
          <button 
            className={downButtonClass}
            onClick={(e) => { e.stopPropagation(); handleVote('down'); }}
            disabled={isLoading}
            title="Vote Invalid"
          >
            ▼ {stats.blackVotes}
          </button>
          {isAdmin && onDelete && (
             <button 
               onClick={(e) => { e.stopPropagation(); onDelete(theorem.id); }} 
               className={styles.miniDeleteBtn}
               title="Delete Theorem"
             >
               🗑️
             </button>
          )}
        </div>
      </div>
      <div style={{marginTop: '5px', fontSize: '0.9rem'}}>
         <LatexRenderer latex={theorem.statementLatex} />
      </div>
    </div>
  );
};
