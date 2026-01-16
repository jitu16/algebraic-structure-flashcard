# Governance & Economic Protocol

> **Status:** Definition Phase
> **Objective:** To establish a rigorous, self-sustaining quality control system for the Algebraic Structure Map. This protocol balances optimistic contribution with strict administrative oversight to maintain mathematical accuracy and prevent abuse.

## 1. The Trust Hierarchy (Role-Based Access Control)
Access to the system is tiered to prevent low-quality contributions.

| Tier | Role | Requirements | Capabilities |
| :--- | :--- | :--- | :--- |
| **0** | **Visitor** | None | **Read Only:** Access to the public map and verified theorems. |
| **1** | **Novice** | Verified Email | **Voter:** Can only vote on existing structures. |
| **2** | **Citizen** | Reputation > 50 | **Publication:** Nodes appear immediately as "Unverified" (Red) on the public map.<br>**Voting:** Votes count toward verification thresholds.<br>**Flagging:** Can flag duplicates or issues. |
| **3** | **Administrator** | Hand-Picked | **Executive Control:** Instant Verification, Force Merge, System Lock, and any action. |

---

## 2. Structure Lifecycle & Status Definitions
The application manages the state of every algebraic structure (Node) based on community consensus.

| Status | Trigger Condition | Visual Indicator | Definition |
| :--- | :--- | :--- | :--- |
| **Unverified** | Default upon creation. | 🔴 Red Border | **Draft State.** The node is visible to the public but marked as tentative. It requires community review. |
| **Verified** | Net Score ≥ 10 AND Quality Criteria Met. | 🟢 Green Border | **Canonical State.** The node is accepted as a valid mathematical structure. Rewards are distributed. |
| **Trash** | Net Score ≤ -10. | ⚠️ Pulsing Red | **Quarantine State.** It enters a queue for Administrative Review. |
| **Delete Requested** | Owner manually requests deletion. | 🟢 Pulsing Green | **Retirement State.** The owner wishes to remove the node. Pending Admin approval to ensure valuable history is not lost. |
| **Duplicated Tree** | Found a node which is duplicate of another node. | 🟠 Pulsing Yellow | **Duplicate State.** Applies to parent and child nodes. An algorithm has been devised to clean this up! (check "logic-delete.md") |

---

## 3. Consensus Logic: Weighted Voting & Verification
To ensure high-quality standards, a simple majority is insufficient. Verification requires weighted consensus.

### The Weighted Voting Algorithm
A node transitions from **Unverified** to **Verified** only when **all** of the following conditions are met:

1.  **Vote Differential:** The number of Green Votes minus Black Votes must be greater than or equal to **10**.
2.  **Quality Assurance Threshold:**
    * **Condition A:** At least one **Citizen** (Tier 2) has voted Green.
    * **OR**
    * **Condition B:** The sum of the reputation points of all Green voters exceeds **100**.
3.  **Admin Notification:** Once the vote differential exceeds 10, a system message is sent to every Admin for final verification.

*Rationale:* This prevents a swarm of low-reputation accounts (Sybil attack) from validating incorrect mathematical data.

---

## 4. Economic Protocol (Incentive Structure)
The system uses a dual-reputation economy to reward constructive behavior and penalize malicious activity.

### A. Reward Events (Positive Reinforcement)
Rewards are only distributed when a **Consensus Event** occurs (e.g., a Node becomes Verified).

* **Owner Rewards:**
    * **Creation Point (+1):** Awarded when a node achieves **Verified** status.
    * **Contributor Point (+2):** Awarded for successfully contributing a structure that survives the vetting process.
* **Voter Rewards (Consensus Prediction):**
    * **Validation Reward (+1):** User voted Green, and the node subsequently became Verified.
    * **Rejection Reward (+1):** User voted Black, and the node was subsequently rejected (Trash/Deleted).

### B. Penalties (Negative Reinforcement)
To deter spam and incorrect data, the system penalizes inaccuracies.

* **Prediction Error (-1):** User voted Green, but the node was deemed Trash. OR user voted Black, but the node was Verified.

### C. Flagging Rewards (The Bounty Protocol)
Users who identify duplicate nodes or structural issues can flag them. The reward is variable to encourage high-quality curation over "farming."

* **Variable Reward (0 to 4 Contributor Points):** Assigned by the Admin upon approval.
    * **0 Points:** Assigned for "Obvious Flags" (e.g., minor typos or trivial tree rearrangements). This restriction prevents users from creating deliberate duplicates just to flag them for points (farming).
    * **1-4 Points:** Assigned for identifying deep, complex duplicates or subtle mathematical inconsistencies that require significant expertise to spot.

---

## 5. Administrative Protocols (Judgment & Mitigation)
When nodes enter the **Trash** or **Delete Requested** states, they require Administrative adjudication. The Admin interface provides three distinct resolution paths.

### Scenario A: The Honest Mistake (Mercy Resolution)
* **Context:** A user creates a duplicate node or makes a mathematical error but acts in good faith. The node is downvoted to Trash.
* **Action:** **[Confirm Deletion]**
* **Outcome:**
    * **Node:** Permanently removed from the database.
    * **Author:** No Reputation Penalty, however points are taken out according to what was gained (reversal of gains).
    * **Voters:** Votes are voided; no points are exchanged. **The Black Votes are rewarded +1** (Prediction Reward).
* **Rationale:** We should not penalize users for attempting to contribute, even if they are incorrect, provided there is no malicious intent.

### Scenario B: Malicious Spam (Punitive Invalidation)
* **Context:** A user posts vandalism, nonsense, or intentional disinformation.
* **Action:** **[Delete & Penalize]**
* **Outcome:**
    * **Node:** Permanently removed.
    * **Author:** **-10 Creation Points** (Major Penalty).
    * **Green Voters:** **-5 Contributor Points** (Penalty for supporting spam).
    * **Black Voters:** **+4 Contributor Points** (Bounty for policing the ecosystem).
* **Rationale:** Making spam economically irrational ensures the community self-polices.

### Scenario C: Malicious Suppression (Mob Bullying)
* **Context:** A group of users coordinates to mass-downvote a mathematically valid node to suppress it.
* **Action:** **[Restore & Sanction]**
* **Outcome:**
    * **Node:** Status manually reset to **Verified** (Green).
    * **Author:** Retains/Receives original rewards.
    * **Black Voters:** **-10 Contributor Points** (Severe sanction for malicious flagging).
* **Rationale:** Protects contributors from targeted harassment or "gatekeeping" by bad actors.

---

## 6. Technical Implementation & Security Rules
To enforce this protocol, specific logic must be implemented in the Service Layer and enforced by Firestore Security Rules.

### A. Idempotency (The "Flip-Flop" Prevention)
**Risk:** Users toggling a node between Verified and Unverified repeatedly to accumulate rewards.
**Solution:**
* Add a boolean field `rewardsClaimed` to the `StructureNode` schema.
* When `GovernanceService` processes a verification event, it checks this flag.
* If `true`, no new `GovernanceEvent` is created.
* If `false`, points are awarded, and the flag is set to `true` atomically.

### B. Firebase Security Rules Requirements
The client-side application must be restricted from performing critical state changes directly.

#### 1. Trash Lockdown
Once a node is marked as `trash`, it must become immutable to everyone except the Admin to preserve evidence for review.

```
// Rule Logic
allow update: if resource.data.status != 'trash' || request.auth.token.role == 'admin';
```

#### 2. Verification Lock
Verified nodes represent the shared history of the map. Owners cannot unilaterally delete them.

```
// Rule Logic
allow delete: if false; // Deletion must occur via Admin SDK or Cloud Function
allow update: if (request.resource.data.status == 'deleteRequested') 
              && (resource.data.status != 'verified'); 
```

#### 3. Vote Locking
To prevent manipulation of the record during Administrative review, voting must be suspended on Trash nodes.

```
// Rule Logic inside /votes subcollection
allow write: if get(/databases/$(database)/documents/nodes/$(nodeId)).data.status != 'trash';
```

#### 4. Reputation Integrity
Users cannot modify their own reputation scores. These fields are strictly read-only for the client and writable only by the `GovernanceService` (Admin context).

```
// Rule Logic inside /users collection
allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['displayName', 'photoURL', 'bio']);
```
