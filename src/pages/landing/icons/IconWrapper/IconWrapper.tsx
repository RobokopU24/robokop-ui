import styles from './IconWrapper.module.css';

interface IconWrapperProps {
  children: React.ReactNode;
}

export const IconWrapper = ({ children }: IconWrapperProps) => {
  return (
    <div className={styles.wrapper}>
      {children}
    </div>
  )
}