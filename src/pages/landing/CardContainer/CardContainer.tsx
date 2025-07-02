import styles from './CardContainer.module.css';

interface CardContainerProps {
  children: React.ReactNode;
}

export const CardContainer = ({ children }: CardContainerProps) => {
  return (
    <div className={styles.container}>
      {children}
    </div>
  )
}