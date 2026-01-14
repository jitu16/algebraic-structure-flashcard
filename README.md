# Algebraic Structure Explorer

> *Drafted by Gemini based on the Owner's blueprint. Proofread and authorized by the Owner.*
### The Vision
We are building the first **crowdsourced map of algebraic structures**. 

Mathematics is often taught linearly, but this project visualizes it as an evolutionary tree. By starting with fundamental **Sets** and **Operations** at a root node and adding **Axioms** step-by-step, we can map how simple rules evolve into complex systems like Groups, Rings, or Vector Spaces.

**The Purpose**
We want to visualize the dramatic power of individual axioms. By studying this tree, we witness how a single rule change—like an asymmetrical distributive law—radically alters a system.

* **Insight:** Watching the map grow reveals the true significance of the axioms that birth new systems.
* **Rigor:** Every branch is anchored by its environment (Sets and Operators). The systematic classification of these growing structures creates a living, rigorous encyclopedia of mathematical reality.


### Directory Structure
```text
├── designs/                                      # Project documentation and diagrams
│   └── design-docs                               # MermaidJS source files
│       ├── logic-governance.mmd                  # Permissions: Trust Ladder & Domain separation
│       ├── logic-node-delete.mmd                 # Deprecation: Zombie Protocol & Survivor Links
│       ├── logic-score.mmd                       # Reputation: Voting logic & scoring rules
│       ├── logic.mmd                             # Lifecycle: Node validation flow (Red->Green->Gray)
│       └── schema.mmd                            # Data Models: RootEnvironment, StructureNode
└── src/                                          # Source code root
      ├── components/                             # UI Components & Graph Logic
      │   ├── modals/                             #
      │   │   ├── AxiomLibraryDrawer.tsx          # Axiom Discovery Engine
      │   │   ├── CreateStructureModal.tsx        # Hybrid Creation Form (Structure)
      │   │   ├── CreateTheoremModal.tsx          # [NEW] Hybrid Creation Form (Theorem)
      │   │   └── Modal.module.css                # Scoped Styles
      │   ├── AlgebraicStructureExplorer.tsx      # Main View: The Map of Algebraic Systems
      │   ├── GenericGraphEngine.tsx              # Pure Canvas: Handles React Flow rendering
      │   ├── Flashcard.tsx                       # Info Panel: Lists Axioms & Properties
      │   ├── MathNode.tsx                        # Custom Graph Node with KaTeX rendering
      │   ├── LatexRenderer.tsx                   # Rendering latex commands.
      │   └── Overlay.tsx                         # Legend, Navigation & Metadata display
      ├── data/                                   # Static content storage
      │   └── initialData.ts                      # Seed data for Alpha
      ├── hooks/                                  # React Hooks
      │   └── useVoting.ts                        # Manages local/remote voting state
      ├── styles/                                 # Design tokens
      │   └── theme.ts                            # Color palette & Status constants
      ├── types/                                  # TypeScript definitions
      │   └── index.ts                            # Core Interfaces (Nodes, Roles, Governance)
      ├── utils/                                  # Business logic & Helpers
      │   ├── checkStatus.ts                      # Governance logic (Red -> Green threshold)
      │   ├── graphAdapter.ts                     # Transformer: App Data -> React Flow Nodes
      │   └── lineage.ts                          # Recursion: Fetches inherited axioms
      ├── App.tsx                                 # Main Controller
      ├── index.css                               # Global styles & KaTeX imports
      └── main.tsx                                # React DOM Entry Point
```

### System Architecture: The Logic Engine

This is a **gamified, rigorous logic engine**. We have designed strict rules to ensure the tree remains mathematically sound while allowing for open contribution.

#### 1. The Foundation
* **Axioms vs. Nodes:** We separate the *Concept* (The Axiom) from its *Usage* (The Node).
* **The Registry:** A central library of axioms avoids duplicates. 
* **Environment Anchoring:** Every root node defines the **Sets** and **Operators** for its entire branch. Contributors must adhere to the notation (e.g., $\cdot$, $+$, $\oplus$) established at the root to maintain branch consistency.

#### 2. The Single Tree Architecture
We focus exclusively on the **Evolutionary Map of Structures**.
* **The Map:** Nodes represent **Algebraic Systems**. Edges represent the addition of a **New Axiom**.
* **The Properties Panel:** Inside every Structural Node, we display a list of **Known Theorems & Properties**. These are static truths (e.g., "Diagonals bisect each other") rather than a complex graph of proofs.

#### 3. The Lifecycle of Truth
Structure Nodes follow this lifecycle:
* **Red (Unverified):** Every new node starts here as a draft.
* **Green (Verified):** Final canonical status granted by **Admin Approval** or **Community Consensus**. Both carry the same visual weight, emphasizing the crowdsourced nature of the map.
* **Gray (Dead End):** Marks a "Trivial Structure" where the system collapses or no further axioms can be meaningfully added.

#### 4. Governance: The Trust Ladder
To protect the tree from "Axiomatic Pollution" while solving the "Cold Start" problem, we use a tiered permission system based on reputation.

* **Tier 0 (Visitor):** Read-only access.
* **Tier 1 (Novice):** Can **Propose** nodes. Proposals remain "Ghost Nodes" (visible only to the author) until upvoted by a Citizen.
* **Tier 2 (Citizen):** Verified Email + Reputation Threshold. Contributions appear immediately as **Unverified (Red)** on the public map. Can cast weighted votes and flag duplicates.
* **Tier 3 (Librarian/Admin):** Can trigger the **Zombie Protocol** (force-merge), lock controversial nodes, and blacklist bad actors.

#### 5. The "Zombie" Protocol
As the tree grows, users may inadvertently create duplicate structures. We handle this through the **Deprecation Protocol**:
* **Duplication Triggers:** This occurs due to **Notation Divergence** (naming the same operator differently) or **Permutation Divergence** (adding the same axioms in a different order).
* **The Zombie State:** The duplicate branch is flagged `toBeDeleted` and flashes Yellow.
* **The Migration:** This creates a window for the community to review the structure before the zombie node is auto-deleted.

### Immediate Tasks (Phase 4b: Creation & Discovery)
**Status: Implemented**

#### 1. Node Creation UI (Done)
* **Structure Creator:** A Hybrid Modal that allows "Smart Searching" existing axioms or defining new ones.
* **Notation Locking:** Enforces consistency by displaying immutable Root Environments.

#### 2. Discovery Engine (Done)
* **Axiom Library:** Implemented a side-drawer to browse the global registry of axioms, preventing duplication.

#### 3. Governance (Done)
* **Polymorphic Voting:** Both Nodes and Theorems now support independent Up/Down voting and Status coloring.

### Immediate Tasks (Phase 4c: Theorem Expansion)
**Status: In Progress**

#### 1. Theorem Creation UI
* **Theorem Creator:** Design a Hybrid Modal (similar to the Structure Creator) to append new Theorems to the Flashcard.
* **Library Integration:** Connect to the global theorem registry to allow re-use of common proofs (e.g., "Uniqueness of Identity").

#### 2. Persistence Layer (Next)
* **Backend Integration:** Connect the current in-memory state to **Firebase**.
* **Save/Load:** Ensure the tree state persists across page reloads.
