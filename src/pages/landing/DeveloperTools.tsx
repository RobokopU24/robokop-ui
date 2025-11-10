import { Card } from './Card/Card';
import { CardContainer } from './CardContainer/CardContainer';
import { Section } from './Section/Section';

function DeveloperTools() {
  return (
    <Section title="Developer Tools" index={1}>
      <CardContainer>
        <Card title="ROBOKOP KG" href="http://robokopkg.renci.org/" target="_blank">
          <p>
            ROBOKOP KG is an open-source biomedical knowledge graph containing ~10M nodes and ~250M
            edges drawn from ~30 biological data sources and bio-ontologies. Query the ROBOKOP KG
            directly in the Neo4j browser.
          </p>
        </Card>
        <Card title="Automat API" href="https://robokop-automat.apps.renci.org/" target="_blank">
          <p>
            The Automat API provides programmatic access to the ROBOKOP knowledge graph. Use it to
            submit queries and retrieve results in JSON format.
          </p>
        </Card>
      </CardContainer>
    </Section>
  );
}

export default DeveloperTools;
