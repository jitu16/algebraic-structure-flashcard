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
  /** The currently selected Structure Node to display */
  node: StructureNode;
  /** Complete list of nodes for lineage calculation */
  allNodes: StructureNode[];
  /** Complete list of axioms for context */
  allAxioms: Axiom[];
  /** Complete list of theorems for property listing */
  allTheorems: Theorem[];
  /** Callback to close the flashcard panel */
  onClose: () => void;
  /** Callback to handle the submission of a new theorem */
  onAddTheorem: (data: TheoremFormData) => void;
  /** Callback to handle admin deletion of a node */
  onDelete: (id: string) => void;
  /** Callback to handle admin deletion of a theorem */
  onDeleteTheorem: (id: string) => void;
}

/**
 * The Detail Panel ("Flashcard") for an Algebraic Structure.
 * Displays the node's name, axiom, inherited lineage, and local theorems.
 */
export const Flashcard = (props: UnifiedFlashcardProps) => {
  const { profile } = useAuth();
  
  // Destructure all props, including the delete functions
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

  // Calculate the full mathematical context (Inherited vs Local)
  const lineage = getCumulativeLineage(node.id, allNodes, allAxioms, allTheorems);
  
  // State for the Theorem Creation Modal
  const [isTheoremModalOpen, setIsTheoremModalOpen] = useState(false);

  return (
    <div className={styles.panel}>
      <FlashcardHeader onClose={onClose} />
      
      {/* 1. HERITAGE SECTION */}
      {/* We DO NOT pass onDeleteTheorem here. Inherited theorems cannot be deleted from a child. */}
      <HeritageSection 
        axioms={lineage.inheritedAxioms} 
        theorems={lineage.inheritedTheorems} 
      />
      
      {/* 2. LOCAL SECTION */}
      {/* We PASS onDeleteTheorem here. These properties belong to this node. */}
      <LocalScopeSection 
        node={node} 
        axiom={lineage.localAxiom} 
        theorems={lineage.localTheorems}
        onOpenAddTheorem={() => setIsTheoremModalOpen(true)}
        onDeleteTheorem={onDeleteTheorem} 
      />

      {/* --- THEOREM CREATION MODAL --- */}
      {isTheoremModalOpen && (
        <CreateTheoremModal 
          structureName={node.displayLatex}
          availableTheorems={allTheorems}
          onClose={() => setIsTheoremModalOpen(false)}
          onSubmit={onAddTheorem}
        />
      )}
      
      {/* --- ADMIN ZONE (Node Deletion) --- */}
      {profile?.role === 'admin' && (
        <div className={styles.adminZone}>
          <button 
            onClick={() => onDelete(node.id)}
            className={styles.deleteBtn}
          >
             🗑️ ADMIN DELETE STRUCTURE
          </button>
        </div>
      )}
    </div>
  );
};

// --- INTERNAL SECTIONS ---

interface HeaderProps {
  onClose: () => void;
}

const FlashcardHeader = ({ onClose }: HeaderProps) => (
  <div className={styles.headerRow}>
    <h3 className={styles.headerTitle}>Structure Details</h3>
    <button onClick={onClose} className={styles.closeBtn}>
      Close ✕
    </button>
  </div>
);

interface HeritageProps {
  axioms: Axiom[];
  theorems: Theorem[];
}

const HeritageSection = ({ axioms, theorems }: HeritageProps) => {
  const [isAxiomsOpen, setIsAxiomsOpen] = useState(false);
  const [isTheoremsOpen, setIsTheoremsOpen] = useState(false);

  return (
    <section className={styles.sectionInherited}>
      <h4 className={styles.sectionTitle}>
        Heritage (Ancestry)
      </h4>

      {/* Inherited Axioms */}
      <div className={styles.toggleContainer}>
        <button 
          onClick={() => setIsAxiomsOpen(!isAxiomsOpen)}
          className={styles.toggleBtn}
        >
          <span>Inherited Axioms ({axioms.length})</span>
          <span>{isAxiomsOpen ? '▼' : '▶'}</span>
        </button>

        {isAxiomsOpen && (
          <div className={styles.toggleContent}>
            {axioms.length > 0 ? (
              <ul className={styles.axiomList}>
                {axioms.map(ax => (
                  <li key={ax.id} className={styles.axiomItem}>
                    <strong>{ax.canonicalName}: </strong>
                    <span style={{ color: '#444' }}>
                      <LatexRenderer latex={ax.defaultLatex} />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className={styles.emptyState}>
                None (Genesis Node)
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Inherited Theorems */}
      <div>
        <button 
          onClick={() => setIsTheoremsOpen(!isTheoremsOpen)}
          className={styles.toggleBtn}
        >
          <span>Inherited Theorems ({theorems.length})</span>
          <span>{isTheoremsOpen ? '▼' : '▶'}</span>
        </button>

        {isTheoremsOpen && (
          <div className={styles.toggleContent}>
            {theorems.length > 0 ? (
              <div className={styles.theoremList}>
                {theorems.map(t => (
                  // Note: No onDelete passed here!
                  <TheoremItem key={t.id} theorem={t} />
                ))}
              </div>
            ) : (
              <span className={styles.emptyState}>
                None inherited.
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

interface LocalScopeProps {
  node: StructureNode;
  axiom?: Axiom;
  theorems: Theorem[];
  onOpenAddTheorem: () => void;
  onDeleteTheorem: (id: string) => void;
}

const LocalScopeSection = ({ node, axiom, theorems, onOpenAddTheorem, onDeleteTheorem }: LocalScopeProps) => {
  return (
    <section className={styles.sectionCurrent}>
      <h3>
        Structure Name : <LatexRenderer latex={node.displayLatex} />
      </h3>
      
      {axiom && (
        <div className={styles.axiomBox}>
          <div className={styles.axiomLabel}>
             Added Axiom: <strong>{axiom.canonicalName}</strong>
          </div>
          <span className={styles.latexBold}>
            <LatexRenderer latex={axiom.defaultLatex} />
          </span>
        </div>
      )}

      {/* Local Properties */}
      <div className={styles.localPropHeader}>
        <h4 className={styles.localPropTitle}>
		Local Theorems:
        </h4>
        <button 
          onClick={onOpenAddTheorem}
          className={styles.proposeBtn}
        >
          + Propose Theorem
        </button>
      </div>

      {theorems.length > 0 ? (
        theorems.map(t => (
          // We pass onDelete here because these are local
          <TheoremItem 
            key={t.id} 
            theorem={t} 
            onDelete={onDeleteTheorem} 
          />
        ))
      ) : (
        <p className={styles.emptyState}>
          No properties defined yet.
        </p>
      )}
    </section>
  );
};

// --- THEOREM ITEM COMPONENT ---

interface TheoremItemProps {
  theorem: Theorem;
  onDelete?: (id: string) => void; // Optional: Only provided for local theorems
}

const TheoremItem = ({ theorem, onDelete }: TheoremItemProps) => {
  const { profile } = useAuth();
  
  const { stats, userVote, handleVote } = useVoting({
    greenVotes: theorem.stats.greenVotes,
    blackVotes: theorem.stats.blackVotes
  });

  const currentStatus = checkStatus({
    ...theorem,
    stats: stats
  });

  const containerClass = `theorem-item status-${currentStatus}`;
  const upButtonClass = `vote-btn ${userVote === 'up' ? 'active-up' : ''}`;
  const downButtonClass = `vote-btn ${userVote === 'down' ? 'active-down' : ''}`;

  return (
    <div className={containerClass}>
      <div className={styles.theoremHeaderRow}>
        <div className={styles.theoremName}>
          {theorem.name}
        </div>
        
        <div className="math-node-stats" style={{ margin: 0, padding: 0, border: 'none' }}>
           <button 
            className={upButtonClass}
            onClick={(e) => { e.stopPropagation(); handleVote('up'); }}
            title="Vote Valid (Green)"
          >
            ▲ {stats.greenVotes}
          </button>

          <button 
            className={downButtonClass}
            onClick={(e) => { e.stopPropagation(); handleVote('down'); }}
            title="Vote Invalid (Black)"
          >
            ▼ {stats.blackVotes}
          </button>
          
          {/* Admin Delete Button: Only renders if user is Admin AND onDelete is provided */}
          {profile?.role === 'admin' && onDelete && (
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 onDelete(theorem.id);
               }}
               className={styles.miniDeleteBtn}
               title="Admin Delete"
             >
               🗑️
             </button>
          )}
        </div>
      </div>

      <CollapsibleTheoremDetails 
        statement={theorem.statementLatex}
        proof={theorem.proofLatex}
      />
    </div>
  );
};

interface CollapsibleProps {
  statement: string;
  proof: string;
}

const CollapsibleTheoremDetails = ({ statement, proof }: CollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ marginTop: '2px' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={styles.detailsToggle}
      >
        {isOpen ? '▼ Hide Details' : '▶ Show Statement & Proof'}
      </button>
      
      {isOpen && (
        <div className={styles.detailsBox}>
          <div className={styles.detailsRow}>
            <strong className={styles.detailsLabel}>Statement: </strong>
            <div className={styles.detailsContent}>
              <LatexRenderer latex={statement} />
            </div>
          </div>

          <div>
            <strong className={styles.detailsLabel}>Proof: </strong>
            <div className={styles.proofContent}>
              <LatexRenderer latex={proof} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
