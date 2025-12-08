import { AcronymTagline } from './AcronymTagline/AcronymTagline';
import { Card } from './Card/Card';
import { CardContainer } from './CardContainer/CardContainer';
import { CitationList } from './CitationList/CitationList';
import { ContactForm } from './ContactForm/ContactForm';
import { RecaptchaProvider } from './ContactForm/recaptcha-context';
// import { ContactForm } from './ContactForm/ContactForm';
import { Logo } from './Logo/Logo';
import { MainGrid } from './MainGrid/MainGrid';
import { Navigation } from './Navigation/Navigation';
import { OverviewSummary } from './OverviewSummary/OverviewSummary';
import { Section } from './Section/Section';
import { DataIcon } from './icons/DataIcon';
import { QueryIcon } from './icons/QueryIcon';

import './landing.css';

export default function LandingPage() {
  return (
    <Section title="Overview" hideTitle index={0}>
      <div style={{ height: '20px' }}></div>
      <Logo />
      <AcronymTagline />
      <OverviewSummary />
      <CardContainer>
        <Card title="Ask a Question" href="/welcome" icon={<QueryIcon />} gradient="blue">
          <p>
            Use the ROBOKOP Question Builder to construct a new query, then use the visualization
            tool to explore relevant publications.
          </p>
        </Card>
        <Card
          title="Explore the Graphs"
          href="/explore/graphs"
          icon={<DataIcon />}
          gradient="purple"
        >
          <p>
            Learn about the data in ROBOKOP and explore the knowledge graph using our data browser.
          </p>
        </Card>
      </CardContainer>
    </Section>
  );
}
