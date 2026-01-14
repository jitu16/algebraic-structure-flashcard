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

interface UnifiedFlashcardProps {
  /** The currently selected Structure Node to display */
  node: StructureNode;
  /** Complete list of nodes for lineage calculation */
  allNodes: StructureNode[];
  /** Complete list of axioms for context */
  allAxioms: Axiom[];
  /** Complete list of theorems for property listing */
  allTheorems: Theorem[];
  onClose: () => void;
  /** Callback to handle the submission of a new theorem */
  onAddTheorem: (data: TheoremFormData) => void;
}

/**
 * The Detail Panel ("Flashcard") for an Algebraic Structure.
 * Displays the node's name, axiom, inherited lineage, and local theorems.
 */
export const Flashcard = (props: UnifiedFlashcardProps) => {
  const { node, allNodes, allAxioms, allTheorems, onClose, onAddTheorem } = props;

  // Calculate the full mathematical context (Inherited vs Local)
  const lineage = getCumulativeLineage(node.id, allNodes, allAxioms, allTheorems);
  
  // State for the Theorem Creation Modal
  const [isTheoremModalOpen, setIsTheoremModalOpen] = useState(false);

  return (
    <div className={styles.panel}>
      <FlashcardHeader onClose={onClose} />
      
      <HeritageSection 
        axioms={lineage.inheritedAxioms} 
        theorems={lineage.inheritedTheorems} 
      />
      
      <LocalScopeSection 
        node={node} 
        axiom={lineage.localAxiom} 
        theorems={lineage.localTheorems}
        onOpenAddTheorem={() => setIsTheoremModalOpen(true)}
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

      {/* --- INHERITED AXIOMS TOGGLE --- */}
      <div style={{ marginBottom: '10px' }}>
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
      
      {/* --- INHERITED THEOREMS TOGGLE --- */}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {theorems.map(t => (
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
}

const LocalScopeSection = ({ node, axiom, theorems, onOpenAddTheorem }: LocalScopeProps) => {
  return (
    <section className={styles.sectionCurrent}>
      <h3>
        Structure: <LatexRenderer latex={node.displayLatex} />
      </h3>
      
      {axiom && (
        <div className={styles.axiomBox}>
          <div className={styles.axiomLabel}>
             Added Axiom: <strong>{axiom.canonicalName}</strong>
          </div>
          <span style={{ fontWeight: 'bold' }}>
            <LatexRenderer latex={axiom.defaultLatex} />
          </span>
        </div>
      )}

      {/* --- Header with Propose Theorem Button --- */}
      <div className={styles.localPropHeader}>
        <h4 className={styles.localPropTitle}>
          Defined Properties (Local)
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
          <TheoremItem key={t.id} theorem={t} />
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
}

/**
 * Renders a single theorem with voting buttons and status styling.
 * Uses global classes from index.css for governance styling.
 */
const TheoremItem = ({ theorem }: TheoremItemProps) => {
  // 1. Voting Hook
  const { stats, userVote, handleVote } = useVoting({
    greenVotes: theorem.stats.greenVotes,
    blackVotes: theorem.stats.blackVotes
  });

  // 2. Polymorphic Status Check
  const currentStatus = checkStatus({
    ...theorem,
    stats: stats
  });

  // 3. Construct CSS Class String
  // Note: 'theorem-item' and 'status-X' are global classes in index.css
  const containerClass = `theorem-item status-${currentStatus}`;
  const upButtonClass = `vote-btn ${userVote === 'up' ? 'active-up' : ''}`;
  const downButtonClass = `vote-btn ${userVote === 'down' ? 'active-down' : ''}`;

  return (
    <div className={containerClass}>
      
      {/* Header: Name & Votes */}
      <div className={styles.theoremHeaderRow}>
        <div className={styles.theoremName}>
          {theorem.name}
        </div>
        
        {/* Reusing the math-node-stats class which behaves differently inside theorem-header */}
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
        </div>
      </div>

      {/* Body: Collapsible Proof */}
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
            <strong style={{ color: '#333' }}>Statement: </strong>
            <div style={{ marginTop: '4px', paddingLeft: '5px' }}>
              <LatexRenderer latex={statement} />
            </div>
          </div>

          <div>
            <strong style={{ color: '#333' }}>Proof: </strong>
            <div style={{ marginTop: '4px', paddingLeft: '5px', color: '#555' }}>
              <LatexRenderer latex={proof} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
