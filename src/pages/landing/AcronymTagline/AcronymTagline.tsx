import styles from './AcronymTagline.module.css';

export const AcronymTagline = () => {
  return (
    <p className={styles.acronymTagline}>
      <span className={styles.largeLetter}>r</span>easoning{" "}
      <span className={styles.largeLetter}>o</span>ver{" "}
      <span className={styles.largeLetter}>b</span>iomedical{" "}
      <span className={styles.largeLetter}>o</span>bjects linked in{" "}
      <span className={styles.largeLetter}>k</span>nowledge{" "}
      <span className={styles.largeLetter}>o</span>riented{" "}
      <span className={styles.largeLetter}>p</span>athways
    </p>
  )
}