/* src/contexts/AuthContext.tsx */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  type User 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';

/**
 * Represents the persistent user data stored in the 'users' Firestore collection.
 * This separates the Auth/Login data (Google) from the App data (Role, Reputation).
 */
interface UserProfile {
  /** The unique Firebase Auth ID (matches user.uid) */
  uid: string;
  /** The user's email address */
  email: string | null;
  /** The user's public display name */
  displayName: string | null;
  /** URL to the user's avatar image */
  photoURL: string | null;
  /** * The user's permission level.
   * - 'citizen': Standard user, can vote and create proposals.
   * - 'admin': Can manage system-wide settings and moderation.
   */
  role: 'admin' | 'citizen';
  /** The user's accumulated reputation score */
  reputation: number;
  /** Timestamp of when the profile was first created */
  createdAt: any;
}

/**
 * The shape of the data provided by the AuthContext.
 */
interface AuthContextType {
  /** The current Firebase Auth user object, or null if logged out */
  user: User | null;
  /** The additional Firestore profile data, or null if logged out/loading */
  profile: UserProfile | null;
  /** True if the initial auth check is still running */
  loading: boolean;
  /** Triggers the Google Sign-In popup flow */
  signInWithGoogle: () => Promise<void>;
  /** Signs the user out of the application */
  logout: () => Promise<void>;
}

// Create the context with undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to access the authentication context.
 * Must be used within an AuthProvider.
 * * @throws {Error} If used outside of an AuthProvider.
 * @returns {AuthContextType} The current auth context values.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that encapsulates authentication logic and state management.
 * It handles:
 * 1. Monitoring Firebase Auth state changes.
 * 2. Syncing the Auth user with the Firestore User Profile.
 * 3. Automatically creating a profile for new users.
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Synchronization Logic ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // 1. Check if User Profile exists in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        
        try {
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            // A. Profile exists? Load it.
            setProfile(userSnap.data() as UserProfile);
          } else {
            // B. No Profile? Create it automatically.
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: 'citizen',     // Default role for new users
              reputation: 1,       // Start with 1 reputation
              createdAt: serverTimestamp()
            };

            await setDoc(userRef, newProfile);
            setProfile(newProfile);
            console.log("New User Profile Created in Firestore via AuthProvider.");
          }
        } catch (error) {
          console.error("Error fetching/creating user profile:", error);
        }
      } else {
        // User is logged out, clear profile
        setProfile(null);
      }

      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  /**
   * Initiates the Google Sign-In process via popup.
   * The actual state update is handled by the onAuthStateChanged listener above.
   */
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Failed:", error);
      throw error;
    }
  };

  /**
   * Logs the current user out.
   */
  const logout = () => signOut(auth);

  const value = {
    user,
    profile,
    loading,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
