// src/App.tsx
import { useState } from 'react';
import { AlgebraicStructureExplorer } from './components/AlgebraicStructureExplorer';
import { Lobby } from './components/Lobby.tsx';

function App() {
  // State: Which Universe is currently active? Null = Lobby.
  const [currentUniverseId, setCurrentUniverseId] = useState<string | null>(null);

  return (
    <div className="app-container">
      {currentUniverseId ? (
        // 1. If Universe is selected, show Explorer
        <AlgebraicStructureExplorer 
          universeId={currentUniverseId}
          onExit={() => setCurrentUniverseId(null)} 
        />
      ) : (
        // 2. Otherwise, show the Lobby
        <Lobby onSelectUniverse={setCurrentUniverseId} />
      )}
    </div>
  );
}

export default App;

