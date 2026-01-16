/* src/App.tsx */
import { useState } from 'react';
import { Toaster } from 'react-hot-toast'; 
import { AlgebraicStructureExplorer } from './components/AlgebraicStructureExplorer';
import { Lobby } from './components/Lobby';
import { AuthProvider } from './contexts/AuthContext';
// REMOVED: import { AuthWidget } from './components/AuthWidget'; (No longer needed)

function App() {
  // State: Which Universe is currently active? Null = Lobby.
  const [currentUniverseId, setCurrentUniverseId] = useState<string | null>(null);

  return (
    <AuthProvider>
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          className: 'dark-toast',
          duration: 4000,
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: 'black',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white',
            },
          },
        }}
      />

      {/* REMOVED: The floating AuthWidget div was here. 
          The Lobby component now handles its own header and auth controls. 
      */}

      <div className="app-container">
        {currentUniverseId ? (
          <AlgebraicStructureExplorer 
            universeId={currentUniverseId}
            onExit={() => setCurrentUniverseId(null)} 
          />
        ) : (
          <Lobby onSelectUniverse={setCurrentUniverseId} />
        )}
      </div>
    </AuthProvider>
  );
}

export default App;
