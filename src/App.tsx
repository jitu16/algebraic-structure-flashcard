/* src/App.tsx */
import React from 'react';
import { AlgebraicStructureExplorer } from './components/AlgebraicStructureExplorer';
import './index.css';

/**
 * The Main Application Controller.
 * In the new Single Tree Architecture, the App component has been simplified.
 * It no longer manages view routing between "Structure" and "Theorem" spaces,
 * as the Explorer now handles all navigation internally via the Detail Panel.
 */
const App: React.FC = () => {
  return (
    <main className="app-root" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <AlgebraicStructureExplorer />
    </main>
  );
};

export default App;
