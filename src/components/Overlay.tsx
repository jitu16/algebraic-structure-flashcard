/* src/components/Overlay.tsx */
import { STATUS_MAP } from '../styles/theme';
import styles from './Overlay.module.css';
import { LatexRenderer } from './LatexRenderer';

interface OverlayProps {
  structureName?: string;
}

/**
 * UI Overlay displaying the current view title and the Legend.
 * @input structureName - Title string (supports LaTeX) to display at the top-left.
 */
export const Overlay = ({ structureName = "Algebraic Structure (Alpha)" }: OverlayProps) => {
  return (
    <div className={styles.overlay}>
      {/* Replaced manual Ref/Effect logic with the shared component */}
      <h2>
        <LatexRenderer latex={structureName} />
      </h2>
      
      <div className={styles.legend}>
        <p>✅ {STATUS_MAP.verified.label}: Green</p>
        <p>⚠️ {STATUS_MAP.deprecated.label}: Flashing Yellow</p>
        <p>🔵 Duplicate Link: Dashed Blue Line</p>
        <p>⚪ {STATUS_MAP.unverified.label}: Red</p>
      </div>
    </div>
  );
};
