import { Card } from './Card/Card';
import { CardContainer } from './CardContainer/CardContainer';
import { Section } from './Section/Section';

function DeveloperTools() {
  return (
    <Section title="Developer Tools" index={1}>
      <CardContainer>
        <Card title="Automat API" href="https://robokop-automat.apps.renci.org/" target="_blank">
          <p>
            The Automat API provides programmatic access to the ROBOKOP knowledge graph. Use it to
            submit queries and retrieve results in JSON format.
          </p>
        </Card>
        <Card
          title="Name Resolver"
          href="https://github.com/NCATSTranslator/NameResolution"
          target='_blank'
        >
          <p>
            Name Resolver supports entity resolution across the disparate naming conventions invoked by different knowledge sources. Name Resolver takes a lexical string as input, searches for it in a database of all known synonyms, and returns resolved synonyms and identifiers from controlled vocabularies and ontologies, as well as Biolink Model categories.
          </p>
        </Card>
        <Card
          title="Node Normalizer"
          href="https://github.com/NCATSTranslator/NodeNormalization"
          target='_blank'
        >
          <p>
            Node Normalizer supports entity resolution across the disparate identifier systems invoked by different knowledge sources. Node Normalizer takes an identifier as input, searches for it in a database of all known identifiers, and returns the Biolink Model preferred identifier for that concept, all equivalent identifiers from controlled vocabularies and ontologies, and the Biolink Model semantic type(s) for the entity.
          </p>
        </Card>
        <Card
          title="ORION"
          href="https://github.com/RobokopU24/ORION"
          target='_blank'
        >
          <p>
            ORION (<u>O</u>perational <u>R</u>outine for the <u>I</u>nput and <u>O</u>utput of <u>N</u>etworks) is a custom software pipeline that leverages Biolink Model and tools such as Name Resolver / Node Normalizer to support harmonization across ROBOKOP’s knowledge sources. ORION ingests each of ROBOKOP’s underlying knowledge sources, normalizes them, integrates them as needed, and outputs them as a collection of harmonized and interoperable knowledge graphs, including the ROBOKOP knowledge graph.
          </p>
        </Card>
      </CardContainer>
    </Section>
  );
}

export default DeveloperTools;
