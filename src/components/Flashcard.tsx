/* src/components/Flashcard.tsx */
import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import styles from './Flashcard.module.css';
import type { StructureNode, Axiom, TheoremNode } from '../types';
import { getCumulativeLineage } from '../utils/lineage';

// ==========================================
// 1. HELPER: LaTeX Renderer
// ==========================================
const LatexRenderer: React.FC<{ latex: string }> = ({ latex }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      katex.render(latex, containerRef.current, {
        throwOnError: false,
        displayMode: false // Inline rendering
      });
    }
  }, [latex]);

  return <span ref={containerRef} />;
};

// ==========================================
// 2. MAIN COMPONENT
// ==========================================

interface FlashcardProps {
  node: StructureNode;
  allNodes: StructureNode[];
  allAxioms: Axiom[];
  allTheorems: TheoremNode[];
  onClose: () => void;
  onToggleMode: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ 
  node, 
  allNodes, 
  allAxioms, 
  allTheorems, 
  onClose,
  onToggleMode 
}) => {
  // Logic Layer: Fetch data once
  const lineage = getCumulativeLineage(node.id, allNodes, allAxioms, allTheorems);

  // Presentation Layer: Composition
  return (
    <div className={styles.panel}>
      <FlashcardHeader 
        onClose={onClose} 
        onToggleMode={onToggleMode} 
      />
      
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
// 3. SUB-COMPONENTS
// ==========================================

// --- Header ---
interface HeaderProps {
  onClose: () => void;
  onToggleMode: () => void;
}

const FlashcardHeader: React.FC<HeaderProps> = ({ onClose, onToggleMode }) => (
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

const HeritageSection: React.FC<HeritageProps> = ({ axioms, theorems }) => (
  <section className={styles.sectionInherited}>
    <h4>Heritage</h4>
    
    {/* Inherited Axioms */}
    <div style={{ marginBottom: '8px' }}>
      <strong>Active Axioms:</strong>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
        {axioms.map(ax => (
          <span key={ax.id} className={styles.badge}>
            <LatexRenderer latex={ax.canonicalName} />
          </span>
        ))}
      </div>
    </div>
    
    {/* Inherited Theorems */}
    {theorems.length > 0 && (
      <div style={{ marginTop: '10px' }}>
        <strong>Inherited Toolkit (Theorems):</strong>
        <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
          {theorems.map(t => (
            <li key={t.id} style={{ fontSize: '0.9rem' }}>
              <LatexRenderer latex={t.statementLatex} />
            </li>
          ))}
        </ul>
      </div>
    )}
  </section>
);

// --- Local Scope Section ---
interface LocalScopeProps {
  node: StructureNode;
  axiom?: Axiom;
  theorems: TheoremNode[];
}

const LocalScopeSection: React.FC<LocalScopeProps> = ({ node, axiom, theorems }) => (
  <section className={styles.sectionCurrent}>
    <h3>
      Current System: <LatexRenderer latex={axiom?.canonicalName || "Genesis Definition"} />
    </h3>
    
    <div style={{ margin: '10px 0', padding: '10px', background: '#fff', border: '1px solid #eee' }}>
      <em>Formula: </em> 
      <span style={{ fontWeight: 'bold' }}>
        <LatexRenderer latex={node.displayLatex} />
      </span>
    </div>
    
    <h4>Local Theorems</h4>
    {theorems.length > 0 ? (
      theorems.map(t => (
        <div key={t.id} className={styles.theoremItem} style={{ marginBottom: '10px' }}>
            <strong><LatexRenderer latex={t.statementLatex} /></strong>
            <p style={{ fontSize: '0.8rem', color: '#666', margin: '4px 0' }}>
              Proof: <LatexRenderer latex={t.proofLatex} />
            </p>
        </div>
      ))
    ) : (
      <p style={{ color: '#888', fontStyle: 'italic' }}>
        No theorems proven in this scope yet.
      </p>
    )}
  </section>
);
