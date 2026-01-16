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

    .
    ├── App.tsx                                       # Main Router: Switches between Lobby and Explorer
    ├── assets/                                       # Static Assets (Images, SVGs)
    ├── components/                                   # UI Components & Graph Logic
    │   ├── AlgebraicStructureExplorer.module.css     # Scoped Styles for the Explorer
    │   ├── AlgebraicStructureExplorer.tsx            # Main Controller: Manages State & Graph View
    │   ├── Flashcard.module.css                      # Styles for the Detail Panel
    │   ├── Flashcard.tsx                             # Detail Panel: Displays Theorems, Properties, and Voting UI
    │   ├── GenericGraphEngine.tsx                    # Pure Canvas: Wraps React Flow for rendering nodes/edges
    │   ├── LatexRenderer.tsx                         # Utility: Renders MathJax/KaTeX strings
    │   ├── Lobby.module.css                          # Styles for the Universe Selector
    │   ├── Lobby.tsx                                 # Landing Page: Action Bar, Universe Selection, & Admin Tools
    │   ├── MathNode.tsx                              # Custom Graph Node: Displays LaTeX label & Vote Buttons
    │   ├── Overlay.module.css                        # Styles for the Overlay
    │   ├── Overlay.tsx                               # UI Overlay: Legends and floating controls
    │   └── modals/                                   # Popups & Dialogs
    │       ├── AdminLibraryModal.module.css          # Styles for Admin Library
    │       ├── AdminLibraryModal.tsx                 # Admin Tool: Global Axiom/Theorem Registry Management
    │       ├── AdminUserModal.module.css             # Styles for User Management
    │       ├── AdminUserModal.tsx                    # [NEW] Admin Tool: User Roles & Reputation Management
    │       ├── AxiomLibraryDrawer.tsx                # Discovery: Slide-out panel to browse existing axioms
    │       ├── CreateStructureModal.tsx              # Hybrid Form: Add Nodes via Search or Creation
    │       ├── CreateTheoremModal.tsx                # Hybrid Form: Propose Theorems inside Flashcards
    │       ├── CreateUniverseModal.module.css        # Styles for Universe Creation
    │       ├── CreateUniverseModal.tsx               # Admin Tool: Genesis of new Algebraic Universes
    │       ├── Modal.module.css                      # Shared Modal Styles
    │       ├── ProfileModal.module.css               # Styles for Profile
    │       ├── ProfileModal.tsx                      # User Hub: Stats, Leaderboard & Avatar
    │       └── TheoremLibraryDrawer.tsx              # Discovery: Slide-out panel for theorem templates
    ├── contexts/
    │   └── AuthContext.tsx                           # Global State: Syncs Firebase Auth with Firestore User Profiles
    ├── data/
    │   └── initialData.ts                            # Seed Data: Initial sets of Axioms and Universes
    ├── firebase.ts                                   # Infrastructure: Firestore & Auth Configuration
    ├── hooks/
    │   ├── useEnvironments.ts                        # Data Hook: Fetches Universe list
    │   ├── useUniverseData.ts                        # Data Hook: Fetches Graph Data (Nodes/Edges)
    │   └── useVoting.ts                              # Logic Hook: Handles Local vs Server voting state
    ├── services/                                     # [NEW] Service Layer: Business Logic & DB Interactions
    │   ├── axiomService.ts
    │   ├── governanceService.ts                      # The Judge: Handles Verification, Scoring, and Penalties
    │   ├── structureService.ts
    │   ├── theoremService.ts
    │   ├── universeService.ts
    │   └── userService.ts                            # The Clerk: Handles Profiles, Roles, and Auth Sync
    ├── styles/
    │   └── theme.ts                                  # Global Theme Variables
    ├── types/
    │   └── index.ts                                  # Type Definitions: Discriminated Unions & Interfaces
    └── utils/
        ├── checkStatus.ts                            # Logic: Determines if a node moves Red -> Green
        ├── edgeFactory.ts                            # Logic: Calculates connections based on ancestry
        ├── graphAdapter.ts                           # Adapter: Transforms Firestore Documents -> React Flow Graph
        └── lineage.ts                                # Logic: Traces parent-child relationships

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

### Governance & Economy
This project uses a rigorous **"Trust-But-Verify"** protocol to manage quality control and reputation.
Please refer to [GOVERNANCE.md](./GOVERNANCE.md) for the detailed specification of:
* **The Trust Ladder:** Role definitions (Visitor, Novice, Citizen, Admin).
* **The Economy:** How Creation and Contributor points are awarded.
* **The Slash Protocol:** Penalties for spam and malicious behavior.
* **Voting Thresholds:** The mathematical rules for verifying a node.

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
