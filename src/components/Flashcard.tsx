/* src/components/Flashcard.tsx */
import { useState } from 'react';
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
 * The Detail Panel ("Flashcard") for an Algebraic Structure.
 * Displays the node's name, axiom, inherited lineage, and local theorems.
 */
export const Flashcard = (props: UnifiedFlashcardProps) => {
  const { profile } = useAuth();
  
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
                    <li key={ax.id}>{ax.canonicalName}</li>
                  ))}
                </ul>
             ) : <span className={styles.emptyState}> None</span>}
          </div>
        </div>
      </section>
      
      {/* Local Section */}
      <section className={styles.sectionCurrent}>
        <h3>{node.displayLatex}</h3>
        
        {lineage.localAxiom && (
          <div className={styles.axiomBox}>
             <strong>Axiom: </strong> 
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
      
      {profile?.role === 'admin' && (
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
  
  // FIX: Use new hook signature (primitives) to prevent loops
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
        <div className={styles.theoremName}>{theorem.name}</div>
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
          {profile?.role === 'admin' && onDelete && (
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
