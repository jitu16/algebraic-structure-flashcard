/* src/components/Flashcard.tsx */
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore'; 
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

// --- HELPER COMPONENTS ---

/**
 * A reusable component for inline Admin editing.
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
 * GENERIC COLLAPSIBLE SHELL
 * Handles the open/close state, arrow rotation, and layout.
 */
interface CollapsibleCardProps {
  header: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

const CollapsibleCard = ({ 
  header, 
  children, 
  defaultOpen = false, 
  className = '' 
}: CollapsibleCardProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`${styles.collapsibleCard} ${className}`}>
      <div 
        className={`${styles.collapsibleHeader} ${isOpen ? styles.expanded : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.toggleArrow}>▶</span>
        <div className={styles.headerContent}>
          {header}
        </div>
      </div>

      {isOpen && (
        <div className={styles.collapsibleBody}>
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * Subcomponent: Displays an Inherited/Local Axiom or Inherited Theorem.
 * Uses CollapsibleCard to manage expansion.
 */
interface InheritedItemProps {
  id: string;
  name: string;
  latex: string;
  proof?: string;
  collectionName: 'axioms' | 'theorems';
  nameField: string;
  label: string;
  isAdmin: boolean;
}

const InheritedItem = ({ 
  id, 
  name, 
  latex, 
  proof, 
  collectionName, 
  nameField, 
  label, 
  isAdmin 
}: InheritedItemProps) => {
  const [showProof, setShowProof] = useState(false);

  return (
    <CollapsibleCard
      className={styles.inheritedItem}
      header={
        <div className={styles.simpleHeader}>
          <span className={styles.inheritedLabel}>{label}:</span>
          <InlineAdminEdit 
            value={name} 
            collectionName={collectionName} 
            docId={id} 
            field={nameField} 
            isAdmin={isAdmin} 
          />
        </div>
      }
    >
      <div className={styles.latexBlock}>
        <LatexRenderer latex={latex} />
      </div>
      
      {/* Nested Proof Toggle */}
      {proof && (
        <div className={styles.proofToggleContainer}>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowProof(!showProof); }}
            className={styles.proofToggleBtn}
          >
            {showProof ? 'Hide Proof' : 'Show Proof'}
          </button>
          {showProof && (
            <div className={styles.proofBlock}>
              <strong>Proof:</strong> <LatexRenderer latex={proof} />
            </div>
          )}
        </div>
      )}
    </CollapsibleCard>
  );
};

// --- MAIN COMPONENT ---

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
      
      {/* --- HERITAGE SECTION (Collapsible) --- */}
      <section className={styles.sectionInherited}>
        <CollapsibleCard
          header={<h4 className={styles.sectionTitle} style={{ margin: 0, border: 'none' }}>Heritage</h4>}
          defaultOpen={true}
          className={styles.sectionCollapsible}
        >
          <div className={styles.toggleContent}>
            
            {/* 1. Inherited Axioms List */}
            <CollapsibleCard 
              header={<h5 className={styles.listSectionTitle}>Inherited Axioms</h5>}
              defaultOpen={true}
              className={styles.listSection}
            >
              {lineage.inheritedAxioms.length > 0 ? (
                <div className={styles.inheritedList}>
                  {lineage.inheritedAxioms.map(ax => (
                    <InheritedItem 
                      key={ax.id}
                      id={ax.id}
                      name={ax.canonicalName}
                      latex={ax.defaultLatex}
                      collectionName="axioms"
                      nameField="canonicalName"
                      label="Axiom"
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              ) : <span className={styles.emptyState}>None</span>}
            </CollapsibleCard>

            {/* 2. Inherited Theorems List */}
            <CollapsibleCard
              header={<h5 className={styles.listSectionTitle}>Inherited Theorems</h5>}
              defaultOpen={false}
              className={styles.listSection}
            >
              {lineage.inheritedTheorems && lineage.inheritedTheorems.length > 0 ? (
                <div className={styles.inheritedList}>
                  {lineage.inheritedTheorems.map(thm => (
                    <InheritedItem 
                      key={thm.id}
                      id={thm.id}
                      name={thm.name}
                      latex={thm.statementLatex}
                      proof={thm.proofLatex}
                      collectionName="theorems"
                      nameField="name"
                      label="Theorem"
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              ) : <span className={styles.emptyState}>None</span>}
            </CollapsibleCard>

          </div>
        </CollapsibleCard>
      </section>
      
      {/* --- LOCAL SECTION --- */}
      <section className={styles.sectionCurrent}>
        <h3>
          <InlineAdminEdit 
            value={node.displayLatex} 
            collectionName="nodes" 
            docId={node.id} 
            field="displayLatex"
            isAdmin={isAdmin}
          />
        </h3>
        
        {/* Local Axiom */}
        {lineage.localAxiom && (
          <div className={styles.localItemWrapper}>
             <InheritedItem 
               id={lineage.localAxiom.id}
               name={lineage.localAxiom.canonicalName}
               latex={lineage.localAxiom.defaultLatex}
               collectionName="axioms"
               nameField="canonicalName"
               label="New Axiom"
               isAdmin={isAdmin}
             />
          </div>
        )}

        <div className={styles.localPropHeader}>
          <h4>Local Theorems:</h4>
          <button onClick={() => setIsTheoremModalOpen(true)} className={styles.proposeBtn}>
            + Add Theorem
          </button>
        </div>

        {/* Local Theorems */}
        {lineage.localTheorems.length > 0 ? (
          <div className={styles.inheritedList}>
            {lineage.localTheorems.map(t => (
              <TheoremItem 
                key={t.id} 
                theorem={t} 
                onDelete={onDeleteTheorem} 
              />
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>No properties defined locally.</p>
        )}
      </section>

      {/* --- MODALS --- */}
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

// --- SUBCOMPONENT: TheoremItem (Local) ---

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

  return (
    <CollapsibleCard
      className={containerClass}
      header={
        <div className={styles.theoremHeaderContent}>
          <div className={styles.theoremName}>
            <InlineAdminEdit 
              value={theorem.name} 
              collectionName="theorems" 
              docId={theorem.id} 
              field="name"
              isAdmin={isAdmin}
            />
          </div>

          {/* Stats & Actions (Stacked Below Name) */}
          <div 
            className={`math-node-stats ${styles.statsContainer}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className={`vote-btn ${userVote === 'up' ? 'active-up' : ''}`}
              onClick={(e) => { e.stopPropagation(); handleVote('up'); }}
              disabled={isLoading}
              title="Vote Valid"
            >
              ▲ {stats.greenVotes}
            </button>
            <button 
              className={`vote-btn ${userVote === 'down' ? 'active-down' : ''}`}
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
      }
    >
      {/* Body Content */}
      <div className={styles.latexBlock}>
        <LatexRenderer latex={theorem.statementLatex} />
      </div>
      {theorem.proofLatex && (
          <div className={styles.proofBlock}>
            <strong>Proof:</strong> <LatexRenderer latex={theorem.proofLatex} />
          </div>
      )}
    </CollapsibleCard>
  );
};
