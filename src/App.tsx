/* src/App.tsx */
import React, { useState, useCallback } from 'react';
import { StructuralEngine } from './components/StructuralEngine';
import { DeductiveEngine } from './components/DeductiveEngine';
import './index.css';

type ViewMode = 'structural' | 'deductive';

const App: React.FC = () => {
  // 1. App State
  const [viewMode, setViewMode] = useState<ViewMode>('structural');
  const [activeStructureId, setActiveStructureId] = useState<string | null>(null);

  // 2. Navigation Handlers
  
  // Transition: Flashcard -> Proof Tree
  const handleNavigateToDeductive = useCallback((nodeId: string) => {
    setActiveStructureId(nodeId);
    setViewMode('deductive');
  }, []);

  // Transition: Proof Tree -> Structural Map
  const handleBackToMap = useCallback(() => {
    setActiveStructureId(null);
    setViewMode('structural');
  }, []);

  // 3. Render
  return (
    <main className="app-root" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {viewMode === 'structural' ? (
        // Mode A: The Universe Map
        <StructuralEngine 
          onNavigateToDeductive={handleNavigateToDeductive} 
        />
      ) : (
        // Mode B: The Local Proof Tree
        activeStructureId && (
          <DeductiveEngine 
            rootNodeId={activeStructureId} 
            onBack={handleBackToMap} 
          />
        )
      )}
    </main>
  );
};

export default App;
