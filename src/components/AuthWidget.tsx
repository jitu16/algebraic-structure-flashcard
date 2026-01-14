/* src/components/AuthWidget.tsx */
import { useAuth } from '../contexts/AuthContext';
import styles from './AuthWidget.module.css';

/**
 * A UI component that displays the current user's authentication status.
 * - If logged out: Shows a "Sign in with Google" button.
 * - If logged in: Shows the user's avatar, display name, and role badge.
 */
export const AuthWidget = () => {
  const { user, profile, login, logout } = useAuth();

  // 1. Render Login Button for unauthenticated users
  if (!user) {
    return (
      <button onClick={login} className={styles.loginBtn}>
        Sign in with Google
      </button>
    );
  }

  // 2. Render User Profile for authenticated users
  return (
    <div className={styles.container}>
      {/* Avatar */}
      {user.photoURL && (
        <img 
          src={user.photoURL} 
          alt={`${user.displayName}'s avatar`} 
          className={styles.avatar}
        />
      )}
      
      {/* Name and Role Badge */}
      <div className={styles.userInfo}>
        <span className={styles.userName}>
          {user.displayName}
        </span>
        
        {/* Admin Badge */}
        {profile?.role === 'admin' && (
          <span className={styles.adminBadge}>
            Administrator
          </span>
        )}
      </div>

      {/* Logout Button */}
      <button 
        onClick={logout} 
        className={styles.logoutBtn}
        aria-label="Sign out"
      >
        Sign Out
      </button>
    </div>
  );
};
