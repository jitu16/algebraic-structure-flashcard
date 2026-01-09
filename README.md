# The Mathverse: An Axiomatic Tree

> *Drafted by Gemini based on the Owner's blueprint. Proofread and authorized by the Owner.*

### The Vision
We are building the first **crowdsourced map of mathematical structures**.

Most mathematics is taught linearly—chapter by chapter. This project aims to change that. It is an evolutionary tree. We start with fundamental **Axioms** (Commutativity, Associativity, etc.), and users build **Nodes** (Systems) by combining them.

If you take a specific path of axioms, what **mathematical structure** do you end up in? A Ring? A Lattice? A completely new algebra no one has named yet? This project allows us to find out.

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
* **The Librarian Bonus:** A special reward for users who find **Isomorphisms** (wormholes between branches) or **Duplicates**.
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
