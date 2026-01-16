/* src/services/userService.ts */
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from '../firebase';
import type { UserProfile, UserRole } from '../types';

/**
 * Service: Manages User Profiles and Permissions.
 * Responsibilities:
 * 1. Syncing Auth Users with Firestore Profiles (Creation).
 * 2. Managing Roles (Promoting Citizens/Admins).
 * 3. Handling Reputation Adjustments (Gamification).
 */
export const UserService = {

  /**
   * Ensures a Firestore profile exists for the authenticated user.
   * If missing, creates a default profile with the 'Dual-Score' schema.
   * * @param authUser - The raw Firebase Auth user object.
   * @returns The existing or newly created UserProfile.
   */
  async syncUser(authUser: User): Promise<UserProfile> {
    const userRef = doc(db, 'users', authUser.uid);
    
    try {
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        return snapshot.data() as UserProfile;
      }

      // Profile doesn't exist? Create default 'Citizen' profile.
      const newProfile: UserProfile = {
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
        role: 'citizen',     // Default start role
        reputation: {
          creation: 0,       // Points for verified nodes
          contributor: 1     // Points for voting/flagging
        },
        createdAt: serverTimestamp()
      };

      await setDoc(userRef, newProfile);
      console.log(`[UserService] Created new profile for ${authUser.uid}`);
      return newProfile;

    } catch (error) {
      console.error("UserService: Sync failed", error);
      throw error;
    }
  },

  /**
   * Updates a user's role (Power Edit).
   * Useful for Admins promoting users to 'admin' or 'citizen'.
   * * @param userId - The UID of the user to update.
   * @param newRole - The new role to assign ('novice' | 'citizen' | 'admin').
   */
  async updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    const userRef = doc(db, 'users', userId);
    try {
      await updateDoc(userRef, { role: newRole });
      console.log(`[UserService] Role updated for ${userId} -> ${newRole}`);
    } catch (error) {
      console.error("UserService: Failed to update role", error);
      throw error;
    }
  },

  /**
   * Awards (or penalizes) reputation points for a specific user.
   * * @param userId - The UID of the user.
   * @param type - Which score to adjust ('creation' or 'contributor').
   * @param amount - The amount to add (can be negative).
   */
  async adjustReputation(
    userId: string, 
    type: 'creation' | 'contributor', 
    amount: number
  ): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const fieldPath = `reputation.${type}`;

    try {
      await updateDoc(userRef, {
        [fieldPath]: increment(amount)
      });
    } catch (error) {
      console.error("UserService: Failed to adjust reputation", error);
      throw error;
    }
  }
};
