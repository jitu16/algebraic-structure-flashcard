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
│       ├── schema.mmd                            # Data Models: RootEnvironment, StructureNode
│       ├── stack.mmd                             # Tech Stack: React Flow Engines & Data Layers
│       └── view.mmd                              # UX Flow: Map Explorer & Detail Panel
└── src/                                          # Source code root
      ├── components/                             # UI Components & Graph Logic
      │   ├── AlgebraicStructureSpace.tsx         # Main View: The Map of Algebraic Systems
      │   ├── GenericGraphEngine.tsx              # Pure Canvas: Handles React Flow rendering
      │   ├── NodeDetailPanel.tsx                 # Info Panel: Lists Axioms & Properties
      │   ├── MathNode.tsx                        # Custom Graph Node with KaTeX rendering
      │   ├── Overlay.module.css                  # Scoped styles for UI controls
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
      │   ├── edgeFactory.ts                      # Helper to generate graph connections	  
      │   ├── graphAdapter.ts                     # Transformer: App Data -> React Flow Nodes
      │   └── lineage.ts                          # Recursion: Fetches inherited axioms
      ├── App.tsx                                 # Main Controller
      ├── index.css                               # Global styles & KaTeX imports
      └── main.tsx                                # React DOM Entry Point

### System Architecture: The Logic Engine

This is a **gamified, rigorous logic engine**. We have designed strict rules to ensure the tree remains mathematically sound while allowing for open contribution.

#### 1. The Foundation (`schema.mmd`)
* **Axioms vs. Nodes:** We separate the *Concept* (The Axiom) from its *Usage* (The Node).
* **The Registry:** A central library of axioms avoids duplicates. 
* **Environment Anchoring:** Every root node defines the **Sets** and **Operators** for its entire branch. Contributors must adhere to the notation (e.g., $\cdot$, $+$, $\oplus$) established at the root to maintain branch consistency.

#### 2. The Single Tree Architecture
We focus exclusively on the **Evolutionary Map of Structures**.
* **The Map:** Nodes represent **Algebraic Systems**. Edges represent the addition of a **New Axiom**.
* **The Properties Panel:** Inside every Structural Node, we display a list of **Known Theorems & Properties**. These are static truths (e.g., "Diagonals bisect each other") rather than a complex graph of proofs.

#### 3. The Lifecycle of Truth (`logic.mmd`)
Structure Nodes follow this lifecycle:
* **Red (Unverified):** Every new node starts here as a draft.
* **Green (Verified):** Final canonical status granted by **Admin Approval** or **Community Consensus**. Both carry the same visual weight, emphasizing the crowdsourced nature of the map.
* **Gray (Dead End):** Marks a "Trivial Structure" where the system collapses or no further axioms can be meaningfully added. Status granted by **Admin Approval** or **Community Consensus**.

#### 4. The Economy of Reputation (`logic-score.mmd`)
We track user contributions through a reputation system:
* **Creation Score:** For building valid mathematical systems or defining key properties.
* **Contributor Score:** For verifying work or identifying structural overlaps.

#### 5. Governance: The Trust Ladder (`logic-governance.mmd`)
To protect the tree from "Axiomatic Pollution" while solving the "Cold Start" problem, we use a tiered permission system based on reputation.

* **Tier 0 (Visitor):** Read-only access.
* **Tier 1 (Novice):** Can **Propose** nodes. Proposals remain "Ghost Nodes" (visible only to the author) until upvoted by a Citizen.
* **Tier 2 (Citizen):** Verified Email + Reputation Threshold. Contributions appear immediately as **Unverified (Red)** on the public map. Can cast weighted votes and flag duplicates.
* **Tier 3 (Librarian/Admin):** Can trigger the **Zombie Protocol** (force-merge), lock controversial nodes, and blacklist bad actors.

**5.1 The Beta Protocol ("Founding Members")**
During the initial launch phase, all authenticated users are granted **Citizen** status to encourage growth. However, we strictly enforce **Domain Separation** to prevent structural damage:
* **Structural Domain (Roots):** **Restricted.** Only Admins can define new Root Environments (Sets/Operators) to ensure consistency.

#### 6. The "Zombie" Protocol (`logic-node-delete.mmd`)
As the tree grows, users may inadvertently create duplicate structures. We handle this through the **Deprecation Protocol**:
* **Duplication Triggers:** This occurs due to **Notation Divergence** (naming the same operator differently) or **Permutation Divergence** (adding the same axioms in a different order).
* **The Zombie State:** The duplicate branch is flagged `toBeDeleted` and flashes Yellow.
* **The Migration:** This creates a window for the community to review the structure before the zombie node is auto-deleted.

### 6.1 The "Permanent Zombie" Strategy (Anti-Vacuum Protocol)
As the tree grows, users will inevitably rediscover the same mathematical structures via different axiom permutations or naming conventions. 

**Our Algorithm Choice:** We use a **Recursive Progenitor Check**. A node is only physically deleted if its parent is also marked for deletion (`toBeDeleted: true`). If the parent is "healthy," the node is preserved as a **Progenitor Zombie**.

**The Reasoning:**
1. **Vacuum Prevention:** If we physically delete a redundant path, we leave the "math-space" empty. A new contributor may unknowingly recreate the exact same redundant path. 
2. **Historical Marker:** By keeping the Progenitor Zombie in a "Locked/Flashing" state, we signify to all future contributors that this specific logical sequence has already been mapped and merged.
3. **Survivor Link:** The Progenitor Zombie acts as a "Redirection Node." The UI provides an immediate link to the **Survivor Node**, guiding users toward the canonical branch while preserving the context of their exploration.

**The Recursive Cleanup Flow:**
* **The Progenitor:** This node detects that its parent is "Healthy" (not marked for deletion). It remains as a permanent, non-interactive warning marker.
* **The Followers (Children):** These detect that their parent is a Zombie. They delete themselves and send a "Death Signal" upward. This facilitates a clean, automated purge of the redundant branch until it hits the Progenitor and stops.



### The Tech Stack (`stack.mmd`)
* **Core:** React + TypeScript (Vite)
* **Engine:** React Flow / @xyflow/react (Generic Tree Explorer)
* **Math:** KaTeX (for fast LaTeX rendering)
* **Database:** Firebase (NoSQL for the graph structure)



## Future Implementation Details & Notes

### 1. Asynchronous Property Contribution
* **Living Documents:** A node is never "finished." Even after a node is created, contributors can return to add new **Theorems or Properties** to its detail panel.
* **Verification:** Just like the Structure Node itself, these added properties will require **Community Verification (Red -> Green)** to ensure accuracy.

### 2. Recursive Axiom & Environment Rendering
* **Implementation:** The `MathNode` must traverse the `parentId` chain upwards to construct the full list of axioms and the active **Sets/Operators** environment.
* **UI Side Note:** When a contributor adds a child node, the UI must display the active operator's LaTeX render (e.g., $\cdot$) and its raw form (e.g., `\cdot`) to ensure notation consistency.

### 3. The "Duplicate" Flagging Flow
* **UI Logic:** The user must provide the ID of the "Survivor Node".
* **Data Mapping:** `targetNodeId` (The Zombie) points to `duplicateOfId` (The Survivor).

### 4. Duplicate Flagging Guardrails (The "One-Way Ticket" Rule)
* **The Guardrail:** If a node already has a `duplicateOfId` set, the system rejects new Duplicate Flags pointing elsewhere.
* **The Insight Alert:** If a user flags A -> C, but A is already a duplicate of B, the system blocks this and alerts the Admin to check if B and C are also duplicates.


### Immediate Tasks (Phase 4b: Creation)
We are now entering the "God Mode" phase, allowing users to expand the map.

#### 1. Node Creation UI
* **Structure Creator:** Design a Modal Form to add new Algebraic Structures.
    * *Requirements:* User must define a Name (e.g., "Ring"), LaTeX Notation, and select or define the Axiom that creates it.
* **Property Editor:** Design a simple interface to append new Theorems/Properties to an existing node.

#### 2. Validation & Logic Guards
* **Axiom Deduping:** Prevent users from adding the same axiom twice in the same branch.
* **Auto-Linking:** Ensure new nodes automatically link to the correct `parentId` based on the user's current view.

#### 3. Persistence Layer
* **Backend Integration:** Connect the current in-memory state to **Firebase**.
* **Save/Load:** Ensure the tree state persists across page reloads.
