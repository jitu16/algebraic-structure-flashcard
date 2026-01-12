/* src/components/Overlay.tsx */
import React, { useEffect, useRef } from 'react';
import katex from 'katex'; // Import KaTeX
import { STATUS_MAP } from '../styles/theme';
import styles from './Overlay.module.css';
import 'katex/dist/katex.min.css'; // Ensure CSS is imported

interface OverlayProps {
  structureName?: string;
}

export const Overlay: React.FC<OverlayProps> = ({ structureName = "Algebraic Structure (Alpha)" }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Effect to render the title LaTeX whenever structureName changes
  useEffect(() => {
    if (titleRef.current) {
      katex.render(structureName, titleRef.current, {
        throwOnError: false,
        displayMode: false
      });
    }
  }, [structureName]);

  return (
    <div className={styles.overlay}>
      {/* Attach ref here so KaTeX can inject the HTML */}
      <h2 ref={titleRef}> </h2>
      
      <div className={styles.legend}>
        <p>✅ {STATUS_MAP.verified.label}: Green</p>
        <p>⚠️ {STATUS_MAP.deprecated.label}: Flashing Yellow</p>
        <p>🔵 Duplicate Link: Dashed Blue Line</p>
        <p>⚪ {STATUS_MAP.unverified.label}: Red</p>
      </div>
    </div>
  );
};
