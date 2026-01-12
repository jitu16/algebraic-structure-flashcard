# Changelog

All notable changes to the **Algebraic Structure Explorer** will be documented in this file.

## [Unreleased]
- **Phase 3: Logic Engine** (Voting & Governance hooks)

## [2026-01-11] - Phase 2: Visual Polish & Layouts
### Added
- **Auto-Layout (Dagre):** Implemented the `dagre` library to automatically organize trees in a hierarchy (Top-to-Bottom), replacing manual X/Y calculations.
- **Smart Graph Adapter:** Created a utility that detects if a node is an "Axiom System" (Circle) or a "Theorem" (Card) and sizes it correctly.
- **Theorem Detail View:** Created a specialized `TheoremFlashcard` component to handle proofs, separate from the main Structural Flashcard.
- **Collapsible Proofs:** Added an accordion toggle to Theorem items so long proofs don't clutter the list.
- **Search-Friendly Names:** Updated the data schema to include `canonicalName` (for Axioms) and `name` + `aliases` (for Theorems).

### Fixed
- **Math Rendering:** Fixed a bug where math formulas disappeared from Theorem nodes.
- **Label Logic:** Corrected labels in the Detail View to distinguish between "System Definition" (Root) and "Current Axiom" (Child).
- **UI Layers:** Fixed Z-Index issues where buttons overlapped the graph overlay.

## [2026-01-10] - Phase 1: Architecture Refactor
### Changed
- **Engine Split:** Separated the original single graph component into two distinct engines:
    - `StructuralEngine`: Displays the map of Algebraic Systems.
    - `DeductiveEngine`: Displays the tree of proofs for a specific system.
- **Strict Typing:** Split generic Node types into specific `StructureNode` and `TheoremNode` interfaces to prevent data mix-ups.
- **Navigation:** Implemented the full drill-down flow: *Map* $\to$ *Flashcard* $\to$ *Proof Tree*.
- **Rendering Pipeline:** Standardized all text rendering to use KaTeX for consistent math display.

## [2026-01-09] - Phase 0: Foundation & Prototype
### Added
- **Project Setup:** Initialized Vite + React + TypeScript environment.
- **Core UI:** Created the basic Graph Engine using React Flow.
- **Flashcard Prototype:** Implemented the first version of the Node Detail Panel (Flashcard) to display theorem lists.
- **Data Structure:** Defined the initial `initialData.ts` with seed data for Magma and Groups.
