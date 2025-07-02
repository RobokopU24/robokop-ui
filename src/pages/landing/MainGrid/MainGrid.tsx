import styles from './MainGrid.module.css';

interface MainGridProps {
  children: React.ReactNode;
  numberOfRows: number;
}

export const MainGrid = ({ children, numberOfRows }: MainGridProps) => {
  return (
    <main className={styles.grid} style={{ gridTemplateRows: `10vh repeat(${numberOfRows}, 1px min-content) auto` }}>

      {children}

      {/* Vertical dotted line */}
      <span className={`${styles.divider} ${styles.vertical}`} aria-hidden="true"></span>

      {/* Horizontal dotted lines based on the number of rows */}
      {
        new Array(numberOfRows).fill(null).map((_, i) => (
          <span
            key={i}
            className={`${styles.divider} ${styles.horizontal}`}
            style={{ gridRow: `${2 * (i + 1)} / span 1` }}
            aria-hidden="true"></span>
        ))
      }

    </main>
  )
}