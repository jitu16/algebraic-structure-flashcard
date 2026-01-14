# Changelog

All notable changes to the **Algebraic Structure Explorer** will be documented in this file.

## [Unreleased]
- **Phase 4c: Theorem Creation** (Adding the `CreateTheoremModal` to the Flashcard)
- **Phase 5: Persistence** (Connecting to Firebase)

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
- **Graph Adapter 2.0:** Completely rewrote `graphAdapter.ts` to support complex, multi-line LaTeX labels (Structure Name + Axiom Name + Formula) using `matrix` environments.
- **Component Decoupling:** Refactored `Flashcard.tsx` to handle Theorem rendering internally.
- **Data Schema:** Updated `initialData.ts` to separate label names from display LaTeX.

### Fixed
- **Visual Glitches:** Fixed arrow positioning and CSS sizing issues for React Flow nodes.
- **Engine Isolation:** Fixed circular dependency errors between engines.

## [2026-01-11] - Phase 2: Visual Polish & Layouts
### Added
- **Auto-Layout (Dagre):** Implemented hierarchical layout.
- **Collapsible Proofs:** Added accordion toggles to Flashcard items.

## [2026-01-10] - Phase 1: Architecture Refactor
### Changed
- **Engine Split:** Separated `StructuralEngine` and `DeductiveEngine`.
- **Rendering Pipeline:** Standardized all text rendering to use KaTeX.
