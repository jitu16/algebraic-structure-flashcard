/* src/components/modals/ProfileModal.tsx */
import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import styles from './ProfileModal.module.css';
import type { UserProfile } from '../../types';

interface ProfileModalProps {
  onClose: () => void;
}

// Ensure local interface matches the DB schema for displaying list items
interface LeaderboardEntry extends Omit<UserProfile, 'createdAt'> {
  // We can omit fields we don't display to keep it clean, 
  // but inheriting from UserProfile ensures type safety.
}

type Tab = 'profile' | 'leaderboard';

/**
 * Displays User Profile statistics and the Global Leaderboard.
 * * Features:
 * - Shows current user's details (Avatar, Role, Split Reputation).
 * - Fetches and displays the top 10 users, sorted by Contributor Score.
 * - Handles tab switching between Profile and Leaderboard.
 */
export const ProfileModal = ({ onClose }: ProfileModalProps) => {
  const { user, profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Fetch Leaderboard Data ---
  useEffect(() => {
    if (activeTab === 'leaderboard') {
      const fetchLeaderboard = async () => {
        setLoading(true);
        try {
          // Sort by Contributor Score as the primary activity metric
          const q = query(
            collection(db, 'users'),
            orderBy('reputation.contributor', 'desc'),
            limit(10)
          );
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
          })) as LeaderboardEntry[];
          
          setLeaderboard(data);
        } catch (error) {
          console.error("Failed to fetch leaderboard:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchLeaderboard();
    }
  }, [activeTab]);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Citizen Hub</h2>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            My Profile
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'leaderboard' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            Leaderboard
          </button>
        </div>

        {/* Content Area */}
        <div className={styles.content}>
          
          {/* TAB: MY PROFILE */}
          {activeTab === 'profile' && (
            <div className={styles.profileContainer}>
              <div className={styles.avatarLarge}>
                {/* Use Firebase Auth 'user' object for photo, as Firestore 'profile' does not store it */}
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" />
                ) : (
                  <span className={styles.initials}>
                    {profile?.displayName?.charAt(0).toUpperCase() || '?'}
                  </span>
                )}
              </div>
              
              <h3 className={styles.userName}>
                {profile?.displayName || user?.email || 'Anonymous'}
              </h3>
              
              <div className={styles.badgeContainer}>
                <span className={`${styles.roleBadge} ${profile?.role === 'admin' ? styles.admin : styles.citizen}`}>
                  {profile?.role === 'admin' ? '🛡️ Administrator' : '🌍 Citizen'}
                </span>
              </div>

              {/* DUAL SCORE DISPLAY */}
              <div className={styles.statsRow}>
                <div className={styles.statBox}>
                  <span className={styles.statValue}>
                    {profile?.reputation?.creation || 0}
                  </span>
                  <span className={styles.statLabel}>🏗️ Creation Point</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statValue}>
                    {profile?.reputation?.contributor || 0}
                  </span>
                  <span className={styles.statLabel}>🤝 Contribution Point</span>
                </div>
              </div>

              <div className={styles.footer}>
                <button onClick={logout} className={styles.logoutBtn}>
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* TAB: LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <div className={styles.leaderboardContainer}>
              {loading ? (
                <div className={styles.loading}>Loading rankings...</div>
              ) : (
                <>
                  <div className={styles.tableHeader}>
                     <span style={{width: '40px'}}>#</span>
                     <span style={{flex: 1}}>Citizen</span>
                     <span style={{width: '50px', textAlign: 'center'}}>🏗️</span>
                     <span style={{width: '50px', textAlign: 'center'}}>🤝</span>
                  </div>
                  <ul className={styles.leaderboardList}>
                    {leaderboard.map((entry, index) => (
                      <li key={entry.uid} className={styles.leaderboardItem}>
                        <span className={styles.rank}>#{index + 1}</span>
                        <div className={styles.playerInfo}>
                          <span className={styles.playerName}>
                            {entry.displayName || 'Anonymous'}
                            {entry.uid === user?.uid && <span className={styles.youTag}>(You)</span>}
                          </span>
                        </div>
                        {/* Creation Score */}
                        <span className={styles.playerScoreSecondary} title="Creation Score">
                          {entry.reputation?.creation || 0}
                        </span>
                        {/* Contributor Score (Primary Sort) */}
                        <span className={styles.playerScore} title="Contributor Score">
                          {entry.reputation?.contributor || 0}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
