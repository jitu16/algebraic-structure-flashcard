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
.
├── App.tsx                                       # Main Router: Switches between Lobby and Explorer
├── assets/                                       # Static Assets (Images, SVGs)
├── components/                                   # UI Components & Graph Logic
│   ├── AlgebraicStructureExplorer.module.css     # Scoped Styles for the Explorer
│   ├── AlgebraicStructureExplorer.tsx            # Main Controller: Manages State (Nodes, Axioms) & Graph View
│   ├── AuthWidget.tsx                            # [Legacy] Standalone Auth Component (now integrated into Lobby)
│   ├── Flashcard.module.css                      # Styles for the Detail Panel
│   ├── Flashcard.tsx                             # Detail Panel: Displays Theorems, Properties, and Voting UI
│   ├── GenericGraphEngine.tsx                    # Pure Canvas: Wraps React Flow for rendering nodes/edges
│   ├── LatexRenderer.tsx                         # Utility: Renders MathJax/KaTeX strings
│   ├── Lobby.module.css                          # Styles for the Universe Selector
│   ├── Lobby.tsx                                 # Landing Page: Universe Selection, Auth Header, & Admin Tools
│   ├── MathNode.tsx                              # Custom Graph Node: Displays LaTeX label & Vote Buttons
│   ├── Overlay.tsx                               # UI Overlay: Legends and floating controls
│   └── modals/                                   # Popups & Dialogs
│       ├── AdminLibraryModal.tsx                 # Admin Tool: Global Axiom/Theorem Registry Management
│       ├── AxiomLibraryDrawer.tsx                # Discovery: Slide-out panel to browse existing axioms
│       ├── CreateStructureModal.tsx              # Hybrid Form: Add Nodes via Search or Creation
│       ├── CreateTheoremModal.tsx                # Hybrid Form: Propose Theorems inside Flashcards
│       ├── CreateUniverseModal.tsx               # [NEW] Admin Tool: Genesis of new Algebraic Universes
│       ├── ProfileModal.tsx                      # [NEW] User Hub: Stats, Leaderboard & Avatar
│       └── TheoremLibraryDrawer.tsx              # Discovery: Slide-out panel for theorem templates
├── contexts/
│   └── AuthContext.tsx                           # Global State: Syncs Firebase Auth with Firestore User Profiles
├── data/
│   └── initialData.ts                            # Seed Data: Initial sets of Axioms and Universes
├── firebase.ts                                   # Infrastructure: Firestore & Auth Configuration
├── hooks/
│   └── useVoting.ts                              # Logic Hook: Handles Local vs Server voting state
├── types/
│   └── index.ts                                  # Type Definitions: Discriminated Unions & Interfaces
└── utils/
    ├── checkStatus.ts                            # Logic: Determines if a node moves Red -> Green
    ├── edgeFactory.ts                            # Logic: Calculates connections based on ancestry
    ├── graphAdapter.ts                           # Adapter: Transforms Firestore Documents -> React Flow Graph
    └── lineage.ts                                # Logic: Traces parent-child relationships
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

### Immediate Tasks (Phase 5: Persistence & User System)
**Status: Implemented**

#### 1. Persistence Layer (Done)
* **Firebase Integration:** The application is now fully online. All data (Nodes, Axioms, Theorems) persists in Firestore.
* **Real-Time Sync:** Voting (Likes/Unlikes) and Node creation events broadcast immediately to all connected users.

#### 2. User System (Done)
* **Dual-Scoring:** Implemented a split reputation system (Creation vs. Contributor) to distinguish between builders and reviewers.
* **Profile Hub:** Added a modal to view personal stats and the global leaderboard.

#### 3. Admin Tools (Done)
* **Content Management:** Admins now have full edit access to rename Universes, Nodes, Axioms, and Theorems to correct typos or refine nomenclature.
* **Universe Genesis:** Enabled the creation of new algebraic Universes directly from the Lobby.

### Next Steps (Phase 6: Polish & Expansion)
**Status: Pending**

#### 1. Advanced Moderation
* **Flagging System:** Implement the logic to handle "Node Issue" and "Duplicate" flags in the UI.
* **Zombie Protocol:** Automate the deprecation flow for duplicate branches.
