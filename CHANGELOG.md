# Changelog

All notable changes to the **Algebraic Structure Explorer** will be documented in this file.

## [Unreleased]
- **Phase 4b: Node Creation** (Forms for adding new Structures & Theorems, Firebase Integration)

## [2026-01-12] - Phase 4a: Governance Logic
### Added
- **Interactive Voting:** Implemented `useVoting` hook to manage local green/black vote state.
- **Dynamic Status:** Added `checkStatus` utility to automatically verify nodes (Red $\to$ Green) when the vote threshold is met.
- **Interactive UI:** Updated `MathNode` to include functional voting buttons that trigger state changes.

## [2026-01-12] - Phase 3: Core Architecture & Rendering Hardening
### Changed
- **Strict Typing:** Refactored the entire codebase to use **Discriminated Unions** (`algebraic structure` vs `theorem`). Removed unsafe type casting.
- **Graph Adapter 2.0:** Completely rewrote `graphAdapter.ts`.
    - Now supports complex, multi-line LaTeX labels (Structure Name + Axiom Name + Formula) using `matrix` environments.
    - Fixed CSS sizing issues by passing explicit `width`/`height` styles to React Flow nodes.
- **Component Decoupling:** Refactored `Flashcard.tsx` into a "Smart Dispatcher" that automatically selects between `StructureFlashcard` and `TheoremFlashcard` views.
- **Data Schema:** Updated `initialData.ts` to strictly separate `name` (for labels) from `displayLatex` (for formulas), fixing the "Formula: Magma" display bug.

### Fixed
- **Visual Glitches:** Fixed arrow positioning (offsets) so edges connect to the border of the node, not inside the text.
- **Engine Isolation:** Fixed circular dependency and import errors between `TheoremSpaceEngine` and the Flashcard system.

## [2026-01-11] - Phase 2: Visual Polish & Layouts
### Added
- **Auto-Layout (Dagre):** Implemented the `dagre` library to automatically organize trees in a hierarchy (Top-to-Bottom).
- **Smart Graph Adapter:** Created a utility that detects if a node is an "Axiom System" (Circle) or a "Theorem" (Card) and sizes it correctly.
- **Theorem Detail View:** Created a specialized `TheoremFlashcard` component to handle proofs.
- **Collapsible Proofs:** Added an accordion toggle to Theorem items.

## [2026-01-10] - Phase 1: Architecture Refactor
### Changed
- **Engine Split:** Separated `StructuralEngine` and `DeductiveEngine`.
- **Strict Typing:** Split generic Node types into specific `StructureNode` and `TheoremNode` interfaces.
- **Rendering Pipeline:** Standardized all text rendering to use KaTeX.

## [2026-01-09] - Phase 0: Foundation & Prototype
### Added
- **Project Setup:** Initialized Vite + React + TypeScript.
- **Core UI:** Basic Graph Engine using React Flow.
- **Data Structure:** Defined the initial `initialData.ts` seed data.
