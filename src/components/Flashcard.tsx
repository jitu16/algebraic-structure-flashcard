/* src/components/Flashcard.tsx */
import { useState } from 'react';
import 'katex/dist/katex.min.css';
import styles from './Flashcard.module.css';
import type { StructureNode, Axiom, TheoremNode } from '../types';
import { getCumulativeLineage } from '../utils/lineage';
import { LatexRenderer } from './LatexRenderer';


// ==========================================
// 1. HELPER: Collapsible Theorem Details
// ==========================================

interface CollapsibleProps {
  statement: string;
  proof: string;
}

/**
 * Accordion component for hiding long theorem proofs.
 * @input statement - The formal mathematical statement.
 * @input proof - The step-by-step proof.
 */
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
          {/* Section 1: Statement */}
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: '#333' }}>Statement: </strong>
            <div style={{ marginTop: '4px', paddingLeft: '5px' }}>
              <LatexRenderer latex={statement} />
            </div>
          </div>

          {/* Section 2: Proof */}
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

// ==========================================
// 2. MAIN COMPONENT (Structural View)
// ==========================================

interface FlashcardProps {
  node: StructureNode;
  allNodes: StructureNode[];
  allAxioms: Axiom[];
  allTheorems: TheoremNode[];
  onClose: () => void;
  onToggleMode: () => void;
}

/**
 * The Detail View for a Structure Node (e.g., "Group").
 * Displays the node's lineage (Heritage) and its local axioms/theorems.
 */
export const Flashcard = ({ 
  node, 
  allNodes, 
  allAxioms, 
  allTheorems, 
  onClose,
  onToggleMode 
}: FlashcardProps) => {
  const lineage = getCumulativeLineage(node.id, allNodes, allAxioms, allTheorems);

  return (
    <div className={styles.panel}>
      <FlashcardHeader onClose={onClose} onToggleMode={onToggleMode} />
      
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

// ==========================================
// 3. MAIN COMPONENT (Theorem View)
// ==========================================

interface TheoremFlashcardProps {
  node: TheoremNode;
  onClose: () => void;
}

/**
 * The Detail View for a Theorem Node.
 * Displays the full statement, formal proof, and author stats.
 */
export const TheoremFlashcard = ({ node, onClose }: TheoremFlashcardProps) => {
  return (
    <div className={styles.panel}>
      {/* Simple Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <button onClick={onClose} style={{ cursor: 'pointer' }}>Close</button>
        <span className={styles.badge} style={{ alignSelf: 'center' }}>
          {node.status}
        </span>
      </div>

      <section className={styles.sectionCurrent}>
        <h3>Theorem Statement</h3>
        <div style={{ padding: '15px', background: '#fff', border: '1px solid #eee', fontSize: '1.1rem', marginBottom: '20px' }}>
           <LatexRenderer latex={node.statementLatex} />
        </div>

        <h3>Formal Proof</h3>
        {/* Full view for the Theorem Flashcard (Mode B) */}
        <div style={{ padding: '15px', background: '#fafafa', border: '1px solid #eee', minHeight: '150px' }}>
           <LatexRenderer latex={node.proofLatex} />
        </div>

        {/* Footer Stats */}
        <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <small style={{ color: '#666' }}>Author: {node.authorId}</small>
            <div>
                <span style={{ color: 'green', marginRight: '15px', fontWeight: 'bold' }}>
                  ▲ {node.stats?.greenVotes || 0}
                </span>
                <span style={{ color: 'black', fontWeight: 'bold' }}>
                  ▼ {node.stats?.blackVotes || 0}
                </span>
            </div>
        </div>
      </section>
    </div>
  );
};

// ==========================================
// 4. SUB-COMPONENTS (Helpers)
// ==========================================

// --- Header ---
interface HeaderProps {
  onClose: () => void;
  onToggleMode: () => void;
}

const FlashcardHeader = ({ onClose, onToggleMode }: HeaderProps) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
    <button onClick={onClose} style={{ cursor: 'pointer' }}>Close</button>
    <button 
      onClick={onToggleMode} 
      style={{ 
        background: '#e1f5fe', 
        border: '1px solid #01579b', 
        borderRadius: '4px', 
        padding: '4px 8px', 
        cursor: 'pointer', 
        fontWeight: 'bold'
      }}
    >
      View Proof Tree ➔
    </button>
  </div>
);

// --- Heritage Section ---
interface HeritageProps {
  axioms: Axiom[];
  theorems: TheoremNode[];
}

const HeritageSection = ({ axioms, theorems }: HeritageProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className={styles.sectionInherited}>
      {/* 1. Collapsible Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          cursor: 'pointer', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: isOpen ? '15px' : '0'
        }}
      >
        <h4 style={{ margin: 0 }}>Inherited Axioms & Theorems</h4>
        <span style={{ color: '#666', fontSize: '0.8rem' }}>
          {isOpen ? '▲ Collapse' : '▼ Expand'}
        </span>
      </div>

      {/* 2. Collapsible Content */}
      {isOpen && (
        <>
          {/* Inherited Axioms List */}
          <div style={{ marginBottom: '20px' }}>
            <strong style={{ display: 'block', marginBottom: '8px', color: '#555' }}>Inherited Axioms:</strong>
            {axioms.length > 0 ? (
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {axioms.map(ax => (
                  <li key={ax.id} style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
                    <strong><LatexRenderer latex={ax.canonicalName} />: </strong>
                    <span style={{ color: '#444' }}>
                      <LatexRenderer latex={ax.defaultLatex} />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <span style={{ color: '#999', fontStyle: 'italic', fontSize: '0.9rem' }}>None (Genesis)</span>
            )}
          </div>
          
          {/* Inherited Theorems List */}
          <div>
            <strong style={{ display: 'block', marginBottom: '8px', color: '#555' }}>Inherited Theorems:</strong>
            {theorems.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {theorems.map(t => (
                  <div key={t.id} className={styles.theoremItem} style={{ borderLeft: '3px solid #ccc' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                      <LatexRenderer latex={t.name} /> 
                    </div>
                    {/* Reuse the consistent collapsible detail view */}
                    <CollapsibleTheoremDetails 
                      statement={t.statementLatex}
                      proof={t.proofLatex}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <span style={{ color: '#999', fontStyle: 'italic', fontSize: '0.9rem' }}>None inherited.</span>
            )}
          </div>
        </>
      )}
    </section>
  );
};

// --- Local Scope Section ---
interface LocalScopeProps {
  node: StructureNode;
  axiom?: Axiom;
  theorems: TheoremNode[];
}

const LocalScopeSection = ({ node, axiom, theorems }: LocalScopeProps) => {

  const isRoot = !axiom;
  const headerLabel = isRoot ? "System Definition" : "Current Axiom";
  
  const headerValue = isRoot ? node.displayLatex : axiom.canonicalName;
  const formulaLabel = isRoot ? "Notation" : "Formula";

  return (
    <section className={styles.sectionCurrent}>
      {/* Dynamic Header */}
      <h3>
        {headerLabel}: <LatexRenderer latex={headerValue} />
      </h3>
      
      <div style={{ margin: '10px 0', padding: '10px', background: '#fff', border: '1px solid #eee' }}>
        <em>{formulaLabel}: </em> 
        <span style={{ fontWeight: 'bold' }}>
          <LatexRenderer latex={node.displayLatex} />
        </span>
      </div>
      
      <h4>Local Theorems</h4>
      {theorems.length > 0 ? (
        theorems.map(t => (
          <div key={t.id} className={styles.theoremItem} style={{ marginBottom: '10px' }}>
              <div style={{ fontWeight: 'bold' }}>
                <LatexRenderer latex={t.name} />
              </div>
              
              <CollapsibleTheoremDetails 
                statement={t.statementLatex}
                proof={t.proofLatex}
              />
          </div>
        ))
      ) : (
        <p style={{ color: '#888', fontStyle: 'italic' }}>
          No theorems proven in this scope yet.
        </p>
      )}
    </section>
  );
};
