/* src/App.tsx */
import React, { useState, useCallback } from 'react';
import { AlgebraicStructureSpaceEngine } from './components/AlgebraicStructureSpaceEngine';
import { TheoremSpaceEngine } from './components/TheoremSpaceEngine.tsx';
import './index.css';

type ViewMode = 'algebraic-structure-space' | 'theorem-space';

/**
 * The Main Controller.
 * Manages the high-level state transition between the "Algebraic Structure Space" (The Map)
 * and the "Theorem Space" (The Proof Tree).
 */
const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('algebraic-structure-space');
  const [activeStructureId, setActiveStructureId] = useState<string | null>(null);

  /**
   * Transition: Flashcard -> Theorem Space
   * Drills down from a Structure Node (e.g., "Group") into its local Proof Tree.
   */
  const handleNavigateToTheoremSpace = useCallback((nodeId: string) => {
    setActiveStructureId(nodeId);
    setViewMode('theorem-space');
  }, []);

  /**
   * Transition: Theorem Space -> Algebraic Structure Space
   * Returns from the local Proof Tree back to the main universe map.
   */
  const handleNavigateToStructureSpace = useCallback(() => {
    setActiveStructureId(null);
    setViewMode('algebraic-structure-space');
  }, []);

  return (
    <main className="app-root" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {viewMode === 'algebraic-structure-space' ? (
        // Mode A: The Universe Map
        <AlgebraicStructureSpaceEngine 
          onNavigateToTheoremSpace={handleNavigateToTheoremSpace} 
        />
      ) : (
        // Mode B: The Local Proof Tree
        activeStructureId && (
          <TheoremSpaceEngine 
            rootNodeId={activeStructureId} 
            onNavigateToStructureSpace={handleNavigateToStructureSpace} 
          />
        )
      )}
    </main>
  );
};

export default App;
