/* src/contexts/AuthContext.tsx */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  type User 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import type { UserProfile } from '../types';

/**
 * Interface defining the shape of the Authentication Context.
 */
interface AuthContextType {
  /** The raw Firebase Auth user object (contains UID, email, photoURL). */
  user: User | null;
  
  /** The custom application profile (contains Role, Reputation, permissions). */
  profile: UserProfile | null;
  
  /** Boolean flag indicating if the auth state is currently being determined. */
  loading: boolean;
  
  /** Helper flag: returns true if the current user has the 'admin' role. */
  isAdmin: boolean;
  
  /** Triggers the Google Sign-In popup flow. */
  login: () => Promise<void>;
  
  /** Signs the user out of the application and clears state. */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Global Authentication Provider.
 * Wraps the application to provide user state and profile data to all components.
 * Automatically handles profile creation for new users in Firestore.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            // Case A: Returning User - Load existing profile
            setProfile(userSnap.data() as UserProfile);
          } else {
            // Case B: New User - Initialize default profile
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              role: 'novice',
              reputation: { creation: 0, contributor: 0 },
              createdAt: Date.now()
            };
            
            // Write the new profile to Firestore
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setProfile(null);
        }
      } else {
        // User logged out
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Initiates the login flow using Google Provider.
   */
  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  /**
   * Signs the user out and resets profile state.
   */
  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  // Derived state helper
  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access the AuthContext.
 * @throws {Error} If used outside of an AuthProvider.
 * @returns {AuthContextType} The current auth context.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
