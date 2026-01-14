/* src/components/Flashcard.tsx */
import { useState } from 'react';
import 'katex/dist/katex.min.css';
import styles from './Flashcard.module.css';
import type { StructureNode, Theorem, Axiom } from '../types';
import { getCumulativeLineage } from '../utils/lineage';
import { LatexRenderer } from './LatexRenderer';
import { useVoting } from '../hooks/useVoting';
import { checkStatus } from '../utils/checkStatus';

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
}

/**
 * The Detail Panel ("Flashcard") for an Algebraic Structure.
 * Displays the node's name, axiom, inherited lineage, and local theorems.
 */
export const Flashcard = (props: UnifiedFlashcardProps) => {
  const { node, allNodes, allAxioms, allTheorems, onClose } = props;

  // Calculate the full mathematical context (Inherited vs Local)
  const lineage = getCumulativeLineage(node.id, allNodes, allAxioms, allTheorems);

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
      />
    </div>
  );
};

// --- INTERNAL SECTIONS ---

interface HeaderProps {
  onClose: () => void;
}

const FlashcardHeader = ({ onClose }: HeaderProps) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
    <h3 style={{ margin: 0, color: '#444' }}>Structure Details</h3>
    <button onClick={onClose} style={{ cursor: 'pointer', padding: '5px 10px' }}>
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
      <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
        Heritage (Ancestry)
      </h4>

      {/* --- INHERITED AXIOMS TOGGLE --- */}
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={() => setIsAxiomsOpen(!isAxiomsOpen)}
          style={{ 
            width: '100%',
            textAlign: 'left',
            background: '#f5f5f5',
            border: '1px solid #ddd',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 'bold',
            color: '#555',
            borderRadius: '4px'
          }}
        >
          <span>Inherited Axioms ({axioms.length})</span>
          <span>{isAxiomsOpen ? '▼' : '▶'}</span>
        </button>

        {isAxiomsOpen && (
          <div style={{ padding: '10px', background: '#fafafa', border: '1px solid #eee', borderTop: 'none' }}>
            {axioms.length > 0 ? (
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {axioms.map(ax => (
                  <li key={ax.id} style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
                    <strong>{ax.canonicalName}: </strong>
                    <span style={{ color: '#444' }}>
                      <LatexRenderer latex={ax.defaultLatex} />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <span style={{ color: '#999', fontStyle: 'italic', fontSize: '0.9rem' }}>
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
          style={{ 
            width: '100%',
            textAlign: 'left',
            background: '#f5f5f5',
            border: '1px solid #ddd',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 'bold',
            color: '#555',
            borderRadius: '4px'
          }}
        >
          <span>Inherited Theorems ({theorems.length})</span>
          <span>{isTheoremsOpen ? '▼' : '▶'}</span>
        </button>

        {isTheoremsOpen && (
          <div style={{ padding: '10px', background: '#fafafa', border: '1px solid #eee', borderTop: 'none' }}>
            {theorems.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {theorems.map(t => (
                  <TheoremItem key={t.id} theorem={t} />
                ))}
              </div>
            ) : (
              <span style={{ color: '#999', fontStyle: 'italic', fontSize: '0.9rem' }}>
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
}

const LocalScopeSection = ({ node, axiom, theorems }: LocalScopeProps) => {
  return (
    <section className={styles.sectionCurrent}>
      <h3>
        Structure: <LatexRenderer latex={node.displayLatex} />
      </h3>
      
      {axiom && (
        <div style={{ margin: '10px 0', padding: '10px', background: '#fff', border: '1px solid #eee' }}>
          <div style={{ marginBottom: '5px', color: '#555', fontSize: '0.9rem' }}>
             Added Axiom: <strong>{axiom.canonicalName}</strong>
          </div>
          <span style={{ fontWeight: 'bold' }}>
            <LatexRenderer latex={axiom.defaultLatex} />
          </span>
        </div>
      )}

      <h4 style={{ marginTop: '20px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
        Defined Properties (Local)
      </h4>
      {theorems.length > 0 ? (
        theorems.map(t => (
          <TheoremItem key={t.id} theorem={t} />
        ))
      ) : (
        <p style={{ color: '#888', fontStyle: 'italic' }}>
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
  const containerClass = `theorem-item status-${currentStatus}`;
  const upButtonClass = `vote-btn ${userVote === 'up' ? 'active-up' : ''}`;
  const downButtonClass = `vote-btn ${userVote === 'down' ? 'active-down' : ''}`;

  return (
    <div className={containerClass}>
      
      {/* Header: Name & Votes */}
      <div className="theorem-header">
        <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
          {theorem.name}
        </div>
        
        {/* Reusing the math-node-stats class which behaves differently inside theorem-header */}
        <div className="math-node-stats">
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
        style={{
          background: 'none',
          border: 'none',
          color: '#0288d1',
          cursor: 'pointer',
          fontSize: '0.8rem',
          padding: 0,
          textDecoration: 'underline'
        }}
      >
        {isOpen ? '▼ Hide Details' : '▶ Show Statement & Proof'}
      </button>
      
      {isOpen && (
        <div style={{ 
          marginTop: '8px', 
          padding: '10px', 
          background: '#f9f9f9', 
          borderRadius: '4px',
          borderLeft: '3px solid #ddd',
          fontSize: '0.9rem'
        }}>
          <div style={{ marginBottom: '10px' }}>
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
