# Changelog

All notable changes to the **Algebraic Structure Explorer** will be documented in this file.

## [Unreleased]
- **Phase 5: Persistence** (Connecting to Firebase)

## [2026-01-14] - Phase 4c: Theorem Expansion & UX Polish
### Added
- **Theorem Creation Engine:** Implemented `CreateTheoremModal` allowing users to propose new properties directly inside the Flashcard.
- **Theorem Library Drawer:** Added a slide-out discovery panel to search and template existing theorems.
- **Flashcard Integration:** Added a "Propose Theorem" button to the Local Scope section.
- **Design Tool Interaction:** Enabled `panOnScroll` in the Graph Engine. Trackpads now pan with two fingers (Figma-style) instead of zooming.

### Changed
- **Styling Architecture:** Refactored `Flashcard.tsx` and `AlgebraicStructureExplorer.tsx` to use Modular CSS (`.module.css`), removing inline style clutter.
- **Animation Polish:** Fixed "Jumping Button" glitch on the "Extend Structure" button by isolating transform contexts.

## [2026-01-14] - Phase 4b: Creation & Discovery Engine
### Added
- **Hybrid Axiom Selection:** Created a "Smart Search" system for the `CreateStructureModal`. Users can now:
    - Type to **Autocomplete** from the existing library.
    - Click "Browse" 📂 to open the new **Axiom Library Drawer** side-panel.
    - Define a **New Axiom** seamlessly if no match is found.
- **Polymorphic Governance:** Extended the Verification Protocol to Theorems.
    - Theorems inside the Flashcard now have independent **Status States** (Verified/Unverified/Trash) and **Voting Buttons**.
    - Created distinct "Card Styles" (Left-Border accents) for theorems to distinguish them from Graph Nodes.
- **Axiom Library Drawer:** A new modular component handling search, filtering, and LaTeX previews of the global axiom registry.

### Changed
- **Single Tree Architecture:** Finalized the removal of the separate "Theorem Space" view. `App.tsx` now exclusively renders the `AlgebraicStructureExplorer`.
- **Explorer Refactor:** Decoupled creation logic from `AlgebraicStructureExplorer`. It now acts as a pure viewer/coordinator, delegating creation to `CreateStructureModal`.
- **Strict Graph Adapter:** Updated `graphAdapter.ts` to strictly reject Theorem nodes, ensuring the main graph remains a pure "Structure Map."

## [2026-01-12] - Phase 4a: Governance Logic
### Added
- **Interactive Voting:** Implemented `useVoting` hook to manage local green/black vote state.
- **Dynamic Status:** Added `checkStatus` utility to automatically verify nodes (Red $\to$ Green) when the vote threshold is met.
- **Interactive UI:** Updated `MathNode` to include functional voting buttons that trigger state changes.

## [2026-01-12] - Phase 3: Core Architecture & Rendering Hardening
### Changed
- **Strict Typing:** Refactored the entire codebase to use **Discriminated Unions** (`algebraic structure` vs `theorem`).
- **Graph Adapter 2.0:** Completely rewrote `graphAdapter.ts` to support complex, multi-line LaTeX labels using `matrix` environments.
- **Component Decoupling:** Refactored `Flashcard.tsx` to handle Theorem rendering internally.

### Fixed
- **Visual Glitches:** Fixed arrow positioning and CSS sizing issues for React Flow nodes.
- **Engine Isolation:** Fixed circular dependency errors between engines.
