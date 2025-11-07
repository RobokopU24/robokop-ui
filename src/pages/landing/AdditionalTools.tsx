import { Card } from './Card/Card';
import { CardContainer } from './CardContainer/CardContainer';
import { Section } from './Section/Section';

function AdditionalTools() {
  return (
    <Section title="Additional Tools" index={1}>
      <CardContainer>
        <Card title="ROBOKOP KG" href="http://robokopkg.renci.org/" target="_blank">
          <p>
            ROBOKOP KG is an open-source biomedical knowledge graph containing ~10M nodes and ~250M
            edges drawn from ~30 biological data sources and bio-ontologies. Query the ROBOKOP KG
            directly in the Neo4j browser.
          </p>
        </Card>
        <Card
          title="ExEmPLAR"
          href="https://www.exemplar.mml.unc.edu/"
          target="_blank"
          warning="ExEmPLAR is not a formal component of ROBOKOP but rather an experimental tool that supports queries of the ROBOKOP KG."
        >
          <p>
            The Extracting, Exploring and Embedding Pathways Leading to Actionable Research
            (ExEmPLAR) application is an experimental, generic Neo4j question-and-answer browser
            tool that supports queries of the ROBOKOP KG and other Neo4j databases.
          </p>
        </Card>
        <Card
          title="RoboDocumentation"
          href="https://github.com/RobokopU24/RoboDocumentation/"
          target="_blank"
        >
          <p>
            A collection of notebooks and other documents to help users get the most out of ROBOKOP.
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

export default AdditionalTools;
