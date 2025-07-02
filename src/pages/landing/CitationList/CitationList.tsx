import styles from './CitationList.module.css';

interface CitationListProps {
  children: React.ReactNode;
}

export const CitationList = ({ children }: CitationListProps) => {
  return (
    <ol className={styles.list}>
      {children}
    </ol>
  )
}