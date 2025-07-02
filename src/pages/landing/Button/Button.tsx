import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
  id?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  icon: React.ReactNode;
}

export const Button = ({ children, id, type, disabled, icon }: ButtonProps) => {
  return (
    <button id={id} className={styles.pushable} type={type} disabled={disabled}>
      <span className={styles.shadow} aria-hidden="true"></span>
      <span className={styles.edge} aria-hidden="true"></span>
      <span className={styles.front} aria-hidden="true">
        {children}
        {icon}
      </span>
    </button>
  );
};
