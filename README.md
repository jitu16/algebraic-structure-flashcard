# The Mathverse: An Axiomatic Tree

> *Drafted by Gemini based on the Owner's blueprint. Proofread and authorized by the Owner.*

### The Vision
We are building the first **crowdsourced map of mathematical structures**.

Most mathematics is taught linearly—chapter by chapter. This project aims to change that. It is an evolutionary tree. We start with fundamental **Axioms** (Commutativity, Associativity, etc.), and users build **Nodes** (Systems) by combining them.

If you take a specific path of axioms, what **mathematical structure** do you end up in? A Ring? A Lattice? A completely new algebra no one has named yet? This project allows us to find out.

**The Purpose**
We want to visualize the dramatic power of individual axioms. By studying this tree, we can witness how a single rule change—like a simple asymmetrical distributive law—can radically alter a system, giving rise to complex consequences like the headache of infinity.

* **Insight:** Watching theorems grow step-by-step reveals the true significance of the axioms that birth them.
* **Inspiration:** There is a unique beauty in discovering **Type 1 Isomorphisms**(detailed later)—seeing two entirely different sets of axioms converge into the exact same mathematical system.
* **Rigor:** The systematic classification of these growing structures is the cherry on the cake, creating a living, rigorous encyclopedia of mathematical reality.

---

### How It Works: The Logic of the Mathverse

This is not just a wiki. It is a **gamified, rigorous logic engine**. We have designed a strict set of rules to ensure the tree remains mathematically sound while allowing for open contribution.

All architectural decisions are documented in the `/designs/` directory. You will find the source Mermaid files in `/designs/design-docs/` and the compiled PDFs in `/designs/pdfs/` for easy side-by-side viewing.

#### 1. The Foundation (`schema.mmd`)
* **Axioms vs. Nodes:** We separate the *Concept* (The Axiom) from its *Usage* (The Node).
* **The Registry:** A central library of axioms avoids duplicates. Users can apply "aliasing" to concepts—linking synonymous terms (e.g., "Abelian" and "Commutative") so the system recognizes they represent the exact same logic.
* **See:** `designs/pdfs/schema.pdf`

#### 2. The Lifecycle of Truth (`logic.mmd`)
Nodes are the building blocks of the tree, containing specific axioms and the theorems derived from them.
* **Red (Unverified):** Every new node starts here. It is a draft.
* **Green (Verified):** The community casts votes to signal validity, but final canonical status is granted by Admins. This ensures the tree maintains rigorous academic standards.
* **Gray (Dead End):** This marks a "Trivial Structure." If a node collapses (e.g., contains only one element) or represents a mathematical dead end where no further axioms can be meaningfully added, we mark it Gray. It signifies the end of the road.
* **See:** `designs/pdfs/logic.pdf`

#### 3. The Economy of Reputation (`logic-score.mmd`)
We track user contributions through a reputation system. This allows users to quantify their impact while incentivizing the growth of a library of consistent mathematical systems.
* **Creation Score:** For building valid mathematical systems.
* **Contributor Score:** For verifying others' work.
* **The Librarian Bonus:** A special reward for users who find **Isomorphisms** or **Duplicates**.
* **See:** `designs/pdfs/logic-score.pdf`

#### 4. The "Zombie" Protocol (`logic-node-delete.mmd`)
As the tree grows, different users will inevitably discover the same structures via different paths. We handle this through two mechanisms:

1.  **Type 1 Isomorphism (Linking):** When two nodes use *different* axioms but produce the same mathematical system. We link these (see `logic.mmd`) and reward the finder.
2.  **Type 2 Isomorphism (Duplication):** When two nodes are actually identical. This happens if:
    * Duplicate axioms (named differently) are merged.
    * Users add the same axioms in a different order.

Both Type 2 cases trigger our **Deprecation Protocol**. Since deleting a parent node immediately would destroy all its children (theorems and sub-nodes), we use a "Zombie" state:
* **The Mark:** The duplicate branch is flagged `to_be_deleted`.
* **The Zombie State:** Nodes flash Yellow and block new submissions.
* **The Migration:** This creates a window for the community to move valuable theorems to the "Survivor Node" (earning rewards for the cleanup).
* **The Signal:** When the last child leaves, the node auto-deletes and signals its parent to check itself.
* **See:** `designs/pdfs/logic-node-delete.pdf`

---

### The Tech Stack (`stack.mmd`)
We are building this on a modern, reactive stack designed for heavy visual manipulation.

* **Core:** React + TypeScript (Vite)
* **Engine:** React Flow (for the Infinite Canvas)
* **Math:** KaTeX (for fast LaTeX rendering)
* **Database:** Firebase (NoSQL for the graph structure)
* **See:** `designs/pdfs/stack.pdf` and `designs/pdfs/view.pdf`

---

### For Contributors
If you are pulling this repo to look at the architecture:
1.  Navigate to `/designs/pdfs/` to see the blueprints.
2.  Compare them with the source logic in `/designs/design-docs/`.
3.  The `.mmd` files can be re-compiled using `mermaid-cli` if you modify the logic.

*Let's build the map.*




## Future Implementation Details & Notes

> *Technical decisions to be implemented during the Frontend/Logic phase.*

### 1. Recursive Axiom Rendering
* **Decision:** Nodes will not store the full history of their axioms.
* **Implementation:** The Frontend Component (`MathNode`) must traverse the `parentId` chain upwards to construct the full list of axioms ("The System") for display.
* **Reasoning:** Ensures Single Source of Truth. If a Root Axiom is edited, all descendants update automatically.

### 2. The "Duplicate" Flagging Flow
* **UI Logic:** When flagging a node as a duplicate, the user must provide the ID of the "Survivor Node."
* **Data Mapping:**
    * `targetNodeId`: The node to be deleted (The Zombie).
    * `duplicateOfId`: The node to keep (The Survivor).
* **Admin Action:** Admin confirms this relationship. The `targetNodeId` gets the `to_be_deleted` flag.

### 3. Flags as "Issue Tracker"
* **UI:** Verified (Green) nodes look clean. Contested (Yellow) nodes will display a list of "Open Flags" in a sidebar/modal.
* **Purpose:** This serves as the "Comment Section" for disputes. It ensures the reason for the Yellow status is public.

### 4. LaTeX Fix Storage
* **Capacity:** The `suggestedFixLatex` field in the Flag schema is designed to hold entire blocks of proof text, not just snippets.
* **Workflow:** Admins can "Accept" a flag to strictly swap the `node.displayLatex` or `theorem.proofLatex` with the suggestion. (We will award extra points to the flagger for this!)

### 5. Duplicate Flagging Guardrails (The "One-Way Ticket" Rule)
* **Risk:** The "Pending Queue" Deadlock. A user might flag "Node A is a duplicate of B," while another user flags "Node B is a duplicate of A." If both sit in the queue and the Admin approves the first (making A a Zombie), they might inadvertently approve the second later, making B a Zombie too. This creates a scenario where **both** A and B are Zombies.
* **The Guardrail:** The restriction is based on the `duplicateOfId` field, not the `to_be_deleted` status.
    * *Allowed:* Flagging a "Zombie" node (inherited status) is permitted. This is the primary mechanism for cleaning up child nodes and hence the parent node too (see "design/pdfs/logic-node-delete.pdf").
    * *Blocked:* If a node *already* has a `duplicateOfId` set, the system rejects any new Duplicate Flag pointing to a *different* ID.
* **The Insight Alert:** If a user (or Admin) tries to flag Node A -> Node C, but Node A is already a duplicate of Node B:
    * The system blocks the action.
    * The system alerts the Admin/User: *"Potential Multi-Duplication: Node A is already linked to B. Check if B and C are duplicates."* (This allows for multiple duplicated branches to be identified and cleaned up efficiently.)



---

## 🛠 TEMPORARY: ALPHA SCAFFOLDING & NEXT STEPS
> **Status:** Jan 9, 2026 - Visualization Logic Verified.
> **Action:** This section is to be deleted once the transition to Firebase/Live Data is complete.

### 1. Current Implementation Audit
The following files constitute the current "Visual Prototype" and require verification/refactoring in the next phase:
* **`App.tsx` & `index.css`**: Currently uses a "Full-Screen Canvas" approach with CSS-based animations for the **Deprecation Protocol**. 
* **`graphAdapter.ts`**: 
    * **Layout:** Uses hardcoded vertical/horizontal offsets ($250 \times 200$). This is a placeholder; a formal DAG (Directed Acyclic Graph) layout engine (e.g., `dagre`) is required for complex trees.
    * **Isomorphism (Type 1):** Currently rendered as a physical `Edge`. This is strictly for system verification. In production, these lines must be removed to prevent visual clutter across distant branches.
* **Dependencies**: Successfully migrated to `@xyflow/react` (v12). `reactflow` (v11) has been uninstalled to prevent namespace collisions.

### 2. Isomorphism Logic
* **Type 1 (Structural Equivalence):** Different axiom paths leading to the same result. Currently visualized with dashed lines.
* **Type 2 (Duplication):** Identical nodes/axioms. These trigger the **Zombie Protocol** (Pulsing Yellow status).

### 3. Tomorrow's Sprint (Jan 10, 2026)
To move from a static visualization to a functional Mathverse app, the following tasks are prioritized:
* **Custom Math Nodes:** Create a custom node component for `@xyflow/react` that integrates **KaTeX**. This will render the `displayLatex` field as professional math rather than raw text.
* **Interactive Flashcard Overlay:** Implement the `onNodeClick` handler to launch the Sidepanel/Modal defined in `view.mmd`.
* **Axiom Lineage Utility:** Develop a recursive function to traverse `parentId` pointers. This allows a selected node to display its full set of inherited axioms.
* **Teleportation Navigation:** Replace the physical isomorphism lines with a UI button on the Flashcard. Clicking "View Isomorph" will programmatically move the `ReactFlow` viewport to the equivalent node's coordinates.

---
