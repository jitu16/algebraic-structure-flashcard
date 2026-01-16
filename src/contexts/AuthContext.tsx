/* src/contexts/AuthContext.tsx */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  type User 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { UserService } from '../services/userService'; // NEW SERVICE
import type { UserProfile } from '../types'; 

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
 * @throws {Error} If used outside of an AuthProvider.
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
 * * Responsibilities:
 * 1. Monitors Firebase Auth state changes (Login/Logout).
 * 2. Delegates User Profile synchronization to the UserService.
 * 3. Exposes auth methods to the rest of the application.
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
        try {
          // Delegate profile fetching/creation to the Service Layer
          const userProfile = await UserService.syncUser(currentUser);
          setProfile(userProfile);
        } catch (error) {
          console.error("AuthContext: Failed to sync user profile", error);
          // Optional: handle specific error states (e.g., set error flag)
        }
      } else {
        // User is logged out, clear profile state
        setProfile(null);
      }

      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  /**
   * Initiates the Google Sign-In process via popup.
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
