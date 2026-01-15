/* src/components/Lobby.tsx */
import styles from './Lobby.module.css';
import { initialEnvironments } from '../data/initialData';
import { LatexRenderer } from './LatexRenderer';

interface LobbyProps {
  onSelectUniverse: (universeId: string) => void;
}

export const Lobby = ({ onSelectUniverse }: LobbyProps) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Algebraic Structures</h1>
      <p className={styles.subtitle}>
        Select an algebraic context to explore. Each algebraic structure defines its own sets and operators, anchoring the evolution of its structures.
      </p>

      <div className={styles.grid}>
        {initialEnvironments.map((env) => (
          <div 
            key={env.id} 
            className={styles.card}
            onClick={() => onSelectUniverse(env.id)}
          >
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>{env.name}</h2>
              <div className={styles.tagContainer}>
                <span className={styles.tag}>
                  Sets: <LatexRenderer latex={`\\{ ${env.sets.join(', ')} \\}`} />
                </span>
                <span className={styles.tag}>
                  Ops: <LatexRenderer latex={`\\{ ${env.operators.join(', ')} \\}`} />
                </span>
              </div>
            </div>
            
            <div className={styles.description}>
              Explore the algebraic structures defined over 
              <strong> {env.sets.length} {env.sets.length>1 ? 'sets':'set'}</strong> and 
              <strong> {env.operators.length} {env.operators.length>1 ? 'operators':'operator'} </strong>.
            </div>

            <button className={styles.enterBtn}>
              Enter Universe &rarr;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
