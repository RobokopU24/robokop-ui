import { type HTMLAttributeAnchorTarget } from 'react';
import { ExternalLinkIcon } from '../icons/ExternalLinkIcon/ExternalLinkIcon';
import styles from './Card.module.css';
import { InternalLinkIcon } from '../icons/InternalLinkIcon/InternalLinkIcon';

interface CardProps {
  children: React.ReactNode;
  title: string;
  href: string;
  target?: HTMLAttributeAnchorTarget | undefined;
  icon?: React.ReactNode;
  gradient?: "blue" | "purple";
  warning?: string;
}

export const Card = ({ children, title, href, target, icon, gradient, warning }: CardProps) => {
  return (
    <a
      className={`${styles.card} ${gradient ? styles.gradientCard : ''}`}
      href={href}
      target={target}
      style={gradient && {
        background: gradient === "blue" ? "var(--first-gradient)" : "var(--second-gradient)",
        color: "white",
      }}
    >
      <article>

        {icon}

        <div className={`${styles.cardHeader} ${icon ? styles.iconCardHeader : ''}`}>
          <h2 className={styles.title}>{title}</h2>
          {
            target === "_blank" ?
              <ExternalLinkIcon color={gradient ? 'white' : undefined} />
              : <InternalLinkIcon color={gradient ? 'white' : undefined} />
          }
        </div>

        {!icon && <hr />}

        {children}

        {
          Boolean(warning) && <div className={styles.warning}>
            <p>{warning}</p>
          </div>
        }

      </article>
    </a>
  )
}