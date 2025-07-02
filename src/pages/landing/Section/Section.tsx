import styles from './Section.module.css';
import { toKebabCase } from '../toKebabCase';

interface SectionProps {
  children?: React.ReactNode;
  title: string;
  hideTitle?: boolean;
  index: number;
}

export const Section = ({ children, title, index, hideTitle = false }: SectionProps) => {
  return (
    <section
      id={toKebabCase(title)}
      className={styles.section}
      style={{ gridRow: `${2 * (index + 1) + 1} / span 1` }}
    >
      {!hideTitle && <h2 className={styles.title}>{title}</h2>}

      {children}
    </section>
  );
};
