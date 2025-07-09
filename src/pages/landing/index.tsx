import { AcronymTagline } from './AcronymTagline/AcronymTagline';
import { Card } from './Card/Card';
import { CardContainer } from './CardContainer/CardContainer';
import { CitationList } from './CitationList/CitationList';
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
    <MainGrid numberOfRows={7}>
      <Navigation
        sections={[
          'Overview',
          'Additional Tools',
          'Citations',
          'Funding',
          'License',
          'Events',
          'Contact',
        ]}
      />

      <Section title="Overview" hideTitle index={0}>
        <Logo />
        <AcronymTagline />
        <OverviewSummary />
        <CardContainer>
          <Card
            title="Ask a Question"
            href="/question-builder"
            icon={<QueryIcon />}
            gradient="blue"
          >
            <p>
              Use the ROBOKOP Question Builder to construct a new query, then use the visualization
              tool to explore relevant publications.
            </p>
          </Card>
          <Card title="Explore the Data" href="/api-docs" icon={<DataIcon />} gradient="purple">
            <p>
              Learn about the data in ROBOKOP and how to access it programmatically using the
              Automat API.
            </p>
          </Card>
        </CardContainer>
      </Section>
      <Section title="Additional Tools" index={1}>
        <CardContainer>
          <Card title="ROBOKOP KG" href="http://robokopkg.renci.org/" target="_blank">
            <p>
              ROBOKOP KG is an open-source biomedical knowledge graph containing ~10M nodes and
              ~250M edges drawn from ~30 biological data sources and bio-ontologies. Query the
              ROBOKOP KG directly in the Neo4j browser.
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
              A collection of notebooks and other documents to help users get the most out of
              ROBOKOP.
            </p>
          </Card>
        </CardContainer>
      </Section>
      <Section title="Citations" index={2}>
        <p>If you use ROBOKOP in your work, please cite the following papers:</p>
        <CitationList>
          <li>
            Bizon C, Cox S, Balhoff J, Kebede Y, Wang P, Morton K, Fecho K, Tropsha A. ROBOKOP KG
            and KGB: integrated knowledge graphs from federated sources. J Chem Inf Model 2019 Dec
            23;59(12):4968–4973. doi: 10.1021/acs.jcim.9b00683.{' '}
            <a href="https://pubmed.ncbi.nlm.nih.gov/31769676/" target="_blank">
              https://pubmed.ncbi.nlm.nih.gov/31769676/
            </a>
            .
          </li>
          <li>
            Morton K, Wang P, Bizon C, Cox S, Balhoff J, Kebede Y, Fecho K, Tropsha A. ROBOKOP: an
            abstraction layer and user interface for knowledge graphs to support question answering.
            Bioinformatics 2019;pii:btz604. doi: 10.1093/bioinformatics/btz604.{' '}
            <a href="https://pubmed.ncbi.nlm.nih.gov/31410449/" target="_blank">
              https://pubmed.ncbi.nlm.nih.gov/31410449/
            </a>
            .
          </li>
        </CitationList>
      </Section>
      <Section title="Funding" index={3}>
        <p>
          ROBOKOP is a joint creation of the{' '}
          <a href="https://renci.org" target="_blank">
            Renaissance Computing Institute (RENCI)
          </a>{' '}
          at the{' '}
          <a href="https://www.unc.edu/" target="_blank">
            University of North Carolina at Chapel Hill
          </a>{' '}
          and{' '}
          <a href="https://covar.com/" target="_blank">
            CoVar LLC
          </a>
          . The prototype was developed with funding from the{' '}
          <a href="https://ncats.nih.gov/" target="_blank">
            National Center for Advancing Translational Sciences
          </a>
          ,{' '}
          <a href="https://www.nih.gov/" target="_blank">
            National Institutes of Health
          </a>{' '}
          (award{' '}
          <a
            href="https://taggs.hhs.gov/Detail/AwardDetail?arg_AwardNum=OT2TR002514&arg_ProgOfficeCode=264"
            target="_blank"
          >
            #OT2TR002514
          </a>
          ). ROBOKOP&apos;s continued development is supported with joint funding from the{' '}
          <a
            href="https://reporter.nih.gov/search/ALIFnrPqJU6PEtxDUvY9EA/project-details/10697371?"
            target="_blank"
          >
            National Institute of Environmental Health Sciences
          </a>{' '}
          and the{' '}
          <a href="https://datascience.nih.gov/about/odss" target="_blank">
            Office of Data Science Strategy
          </a>{' '}
          within the{' '}
          <a href="https://www.nih.gov/" target="_blank">
            National Institutes of Health
          </a>{' '}
          (award{' '}
          <a
            href="https://tools.niehs.nih.gov/portfolio/index.cfm?do=portfolio.grantDetail&grant_number=U24ES035214"
            target="_blank"
          >
            #U24ES035214
          </a>
          ).
        </p>
      </Section>
      <Section title="License" index={4}>
        <p>
          The ROBOKOP system and the ROBOKOP knowledge graph &quot;KG&quot; are governed under an
          open-source{' '}
          <a href="https://opensource.org/license/mit/" target="_blank">
            MIT License
          </a>
          . Both resources make use of open-source primary data sources. While we make every effort
          to ensure that those sources can be freely ingested and redistributed, we encourage users
          to review and comply with the specific license terms applicable to each source.
          Furthermore, copyright remains with the respective originators, contributors, and
          maintainers of the primary data sources. This resource does not claim ownership of such
          intellectual property unless explicitly stated. The open-source ROBOKOP system, including
          the ROBOKOP KG, is provided &quot;as is,&quot; without warranties or guarantees of any
          kind. The creators, maintainers, and distributors of the original primary data sources and
          derivative works disclaim any liability for errors, omissions, or misuse of the data.
          Users assume all responsibility for ensuring that the data sources are suitable for their
          specific applications and comply with all applicable legal and ethical guidelines.
        </p>
      </Section>
      <Section title="Events" index={5}>
        <p>
          ROBOKOP has weekly office hours from 2-3pm EST.{' '}
          <a
            href="https://outlook.office365.com/owa/calendar/f78771fc86a544fa87ba0c0d3e2eb20e@renci.org/f584171e733046f88746dc0c2d605b3815090452925078675798/calendar.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            View details on our calendar
          </a>{' '}
          or subscribe with the{' '}
          <a href="https://outlook.office365.com/owa/calendar/f78771fc86a544fa87ba0c0d3e2eb20e@renci.org/f584171e733046f88746dc0c2d605b3815090452925078675798/calendar.ics">
            ICS file
          </a>
          .
        </p>
      </Section>
    </MainGrid>
  );
}
