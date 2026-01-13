/* src/components/LatexRenderer.tsx */
import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
  latex: string;
}

/**
 * Reusable component to render LaTeX strings using KaTeX.
 * Centralizes config like throwOnError and displayMode.
 * * @input latex - The LaTeX string to render.
 */

export const LatexRenderer = ({ latex }: LatexRendererProps) => {
  const containerRef = useRef<HTMLSpanElement>(null);

useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(latex, containerRef.current, {
          throwOnError: false,
          displayMode: false
        });
      } catch (e) {
        containerRef.current.innerText = "Invalid LaTeX";
      }
    }
  }, [latex]);

  return <span ref={containerRef} />;
};
