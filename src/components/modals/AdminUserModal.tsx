/* src/components/modals/AdminUserModal.tsx */
import { useEffect, useState, useMemo } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs 
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { db } from '../../firebase';
import { UserService } from '../../services/userService';
import styles from './AdminUserModal.module.css';
import type { UserProfile, UserRole } from '../../types';

interface AdminUserModalProps {
  /** Callback to close the modal */
  onClose: () => void;
}

// --- SUBCOMPONENT: USER ROW ---

interface UserRowProps {
  /** The user profile data to display */
  user: UserProfile;
  /** Callback to refresh the parent list after a mutation */
  onRefresh: () => void;
}

/**
 * Renders a single row in the user management table.
 * Handles the logic for:
 * 1. Displaying user identity and status.
 * 2. Changing user roles (guarded against modifying other admins).
 * 3. Adjusting reputation scores manually.
 */
const UserRow = ({ user, onRefresh }: UserRowProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [creationDelta, setCreationDelta] = useState('');
  const [contributorDelta, setContributorDelta] = useState('');

  // 1. ELIGIBILITY CHECK: Is this a Novice with enough points to be a Citizen?
  const totalScore = (user.reputation?.creation || 0) + (user.reputation?.contributor || 0);
  const isEligibleForPromotion = user.role === 'novice' && totalScore >= 50;

  // 2. SECURITY CHECK: Is the target user an Admin?
  // If yes, we disable ALL controls to prevent "Coup" attempts.
  const isProtectedAdmin = user.role === 'admin';

  /**
   * Handles the role change request.
   * Prevents changes if the target is an admin.
   */
  const handleRoleChange = async (newRole: UserRole) => {
    if (newRole === user.role) return;
    
    // Security Guard
    if (isProtectedAdmin) {
      toast.error("Cannot modify another Admin");
      return;
    }
    
    if (!confirm(`Change role of ${user.displayName} to ${newRole}?`)) return;

    setIsProcessing(true);
    try {
      await UserService.updateUserRole(user.uid, newRole);
      toast.success(`Role updated to ${newRole}`);
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update role");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handles manual reputation adjustment.
   * @param type - Which score to adjust ('creation' or 'contributor')
   * @param valueStr - The input value (can be negative)
   * @param resetFn - State setter to clear the input field
   */
  const handleAdjustRep = async (
    type: 'creation' | 'contributor', 
    valueStr: string,
    resetFn: (val: string) => void
  ) => {
    // Security Guard
    if (isProtectedAdmin) {
      toast.error("Cannot modify Admin reputation");
      return;
    }
    
    const amount = parseInt(valueStr, 10);
    if (isNaN(amount) || amount === 0) return;

    setIsProcessing(true);
    try {
      await UserService.adjustReputation(user.uid, type, amount);
      toast.success(`${type} adjusted by ${amount > 0 ? '+' : ''}${amount}`);
      resetFn('');
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("Adjustment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <tr className={`
      ${styles.row} 
      ${isEligibleForPromotion ? styles.eligibleRow : ''}
      ${isProtectedAdmin ? styles.adminRow : ''}
    `}>
      {/* IDENTITY COLUMN */}
      <td className={styles.identityCell}>
        <div className={styles.userInfo}>
           <div className={styles.avatar}>
             {user.displayName?.charAt(0).toUpperCase() || '?'}
           </div>
           <div className={styles.meta}>
             <span className={styles.name}>
                {user.displayName || 'Anonymous'}
                {isProtectedAdmin && <span title="Protected User"> 🛡️</span>}
             </span>
             <span className={styles.email}>{user.email}</span>
             <span className={styles.uid}>ID: {user.uid}</span>
             {isEligibleForPromotion && (
               <span className={styles.eligibleBadge}>🌟 Promotion Ready</span>
             )}
           </div>
        </div>
      </td>

      {/* ROLE COLUMN */}
      <td>
        <select 
          value={user.role} 
          onChange={(e) => handleRoleChange(e.target.value as UserRole)}
          disabled={isProcessing || isProtectedAdmin}
          className={`${styles.roleSelect} ${styles[user.role]} ${isProtectedAdmin ? styles.disabled : ''}`}
        >
          <option value="novice">Novice</option>
          <option value="citizen">Citizen</option>
          <option value="admin">Admin</option>
        </select>
        {isProtectedAdmin && <div className={styles.lockMsg}>Locked</div>}
      </td>

      {/* CREATION SCORE COLUMN */}
      <td className={styles.scoreCell}>
        <div className={styles.scoreControl}>
          <span className={styles.currentScore}>🏗️ {user.reputation?.creation || 0}</span>
          {!isProtectedAdmin && (
            <div className={styles.adjustWrapper}>
              <input 
                type="number" 
                className={styles.deltaInput}
                placeholder="±"
                value={creationDelta}
                onChange={(e) => setCreationDelta(e.target.value)}
              />
              <button 
                onClick={() => handleAdjustRep('creation', creationDelta, setCreationDelta)}
                disabled={!creationDelta || isProcessing}
                className={styles.applyBtn}
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </td>

      {/* CONTRIBUTOR SCORE COLUMN */}
      <td className={styles.scoreCell}>
        <div className={styles.scoreControl}>
          <span className={styles.currentScore}>🤝 {user.reputation?.contributor || 0}</span>
          {!isProtectedAdmin && (
            <div className={styles.adjustWrapper}>
              <input 
                type="number" 
                className={styles.deltaInput}
                placeholder="±"
                value={contributorDelta}
                onChange={(e) => setContributorDelta(e.target.value)}
              />
              <button 
                onClick={() => handleAdjustRep('contributor', contributorDelta, setContributorDelta)}
                disabled={!contributorDelta || isProcessing}
                className={styles.applyBtn}
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

// --- MAIN MODAL COMPONENT ---

/**
 * The Admin User Management Modal.
 * Provides a searchable, filterable interface to manage all users in the system.
 * Features:
 * - List view of all registered users.
 * - Search by Name, Email, or UID.
 * - Batch Promotion for eligible novices.
 * - Row-level management via UserRow.
 */
export const AdminUserModal = ({ onClose }: AdminUserModalProps) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  /**
   * Fetches all user profiles from Firestore, ordered by creation date (newest first).
   */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => d.data() as UserProfile);
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Could not load user list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- FILTERING & COMPUTED LISTS ---

  /**
   * Filters the user list based on the search query.
   * Matches against Display Name, Email, or UID.
   */
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const lowerQ = searchQuery.toLowerCase();
    return users.filter(u => 
      (u.displayName?.toLowerCase().includes(lowerQ)) ||
      (u.email?.toLowerCase().includes(lowerQ)) ||
      (u.uid.includes(lowerQ))
    );
  }, [users, searchQuery]);

  /**
   * Identifies novices who have met the point threshold (50) for promotion.
   */
  const eligibleNovices = useMemo(() => {
    return users.filter(u => {
      const score = (u.reputation?.creation || 0) + (u.reputation?.contributor || 0);
      return u.role === 'novice' && score >= 50;
    });
  }, [users]);

  // --- BATCH ACTION ---

  /**
   * Promotes all eligible novices to 'citizen' status in a single batch operation.
   * Uses Promise.all to execute parallel requests.
   */
  const handleBatchPromote = async () => {
    if (eligibleNovices.length === 0) return;
    if (!confirm(`Are you sure you want to promote ${eligibleNovices.length} eligible novices to Citizen?`)) return;

    setIsBatchProcessing(true);
    try {
      // Execute all updates in parallel
      await Promise.all(
        eligibleNovices.map(u => UserService.updateUserRole(u.uid, 'citizen'))
      );
      toast.success(`Successfully promoted ${eligibleNovices.length} users!`);
      fetchUsers(); // Refresh list to update UI
    } catch (error) {
      console.error("Batch failed", error);
      toast.error("Batch promotion encountered an error");
    } finally {
      setIsBatchProcessing(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        
        {/* Header */}
        <div className={styles.header}>
          <h2>User Management</h2>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        {/* Toolbar: Search & Actions */}
        <div className={styles.toolbar}>
          <input 
            type="text" 
            className={styles.searchInput}
            placeholder="Search by name, email, or UID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {eligibleNovices.length > 0 && (
            <button 
              className={styles.batchBtn}
              onClick={handleBatchPromote}
              disabled={isBatchProcessing}
              title={`Promote ${eligibleNovices.length} users to Citizen`}
            >
              ✨ Auto-Promote ({eligibleNovices.length})
            </button>
          )}
        </div>

        {/* Content: User List Table */}
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>Loading Users...</div>
          ) : (
            <table className={styles.userTable}>
              <thead>
                <tr>
                  <th>User Identity</th>
                  <th>Role</th>
                  <th>Creation Score</th>
                  <th>Contributor Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <UserRow 
                      key={user.uid} 
                      user={user} 
                      onRefresh={fetchUsers} 
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className={styles.emptySearch}>
                      No users found matching "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
