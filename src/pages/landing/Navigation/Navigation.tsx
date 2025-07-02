import { toKebabCase } from '../toKebabCase';
import styles from './Navigation.module.css';

interface NavigationProps {
  sections: string[];
}

export const Navigation = ({ sections }: NavigationProps) => {
  return (
    <nav className={styles.navigation}>
      <ul>
        {sections.map((title, i) => (
          <li key={i}>
            <a href={`#${toKebabCase(title)}`}>{title}</a>
          </li>
        ))}
        {/* <li><a href="#overview">Overview</a></li>
        <li><a href="#additional-tools">Additional Tools</a></li>
        <li><a href="#citations">Citations</a></li>
        <li><a href="#funding">Funding</a></li>
        <li><a href="#license">License</a></li>
        <li><a href="#events">Events</a></li>
        <li><a href="#contact">Contact</a></li> */}
      </ul>
    </nav>
  );
};
