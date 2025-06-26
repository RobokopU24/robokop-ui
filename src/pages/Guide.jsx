import React from 'react';
import { Container, Grid, Typography, Card, Button, Divider } from '@mui/material';
import { blue } from '@mui/material/colors';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { Link } from '@tanstack/react-router';

export default function Guide() {
  return (
    <Container sx={{ my: 6 }} maxWidth="md">
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={8}>
          <Typography variant="h4" gutterBottom>
            ROBOKOP Quick Start Guide
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Typography>
            ROBOKOP is a knowledge graph (KG)–based biomedical application for deriving answers to
            user questions such as: <em>“What diseases are associated with dioxin?”</em>{' '}
            <em>“What genes are regulated by 2,4-dichlorophenoxyacetic acid?”</em>{' '}
            <em>“What chemical entities might alleviate Huntington’s Disease?”</em>{' '}
            <em>“What diseases share a genetic association with Ebola?”</em>{' '}
            <em>“What genes are involved in histone H3 deacetylation?”</em>{' '}
            <em>
              “What genes and chemical entities are related to GLUT1 deficiency, and to each other?”
            </em>{' '}
            <em>
              “What biological mechanisms might explain the relationship between airborne pollutant
              exposure and asthma exacerbations?”
            </em>
          </Typography>

          <Card
            elevation={4}
            sx={{ my: 4, p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Typography variant="h6">
              Looking for a step-by-step introduction to ROBOKOP?
            </Typography>
            <Button
              component={Link}
              to="/tutorial"
              variant="contained"
              endIcon={<ArrowForward />}
              sx={{
                backgroundColor: blue[600],
                color: '#fff',
                '&:hover': {
                  backgroundColor: blue[700],
                },
                alignSelf: 'flex-start',
              }}
            >
              View the tutorial
            </Button>
          </Card>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" gutterBottom>
            Ask a Question
          </Typography>
          <Typography component={'p'}>
            Questions or queries in ROBOKOP are specified as JSON query graph templates that define
            categories of nodes or biomedical entities and edges or predicates describing the
            relationship between nodes within the ROBOKOP KG. The JSON templates have been
            abstracted into a more friendly user interface (UI). Each node in the query graph
            denotes a biomedical entity with a defined category (e.g., disease) and defined
            properties (e.g., breast cancer versus cancer); likewise, each edge denotes a predicate
            that can be specified to limit the allowable relationships between nodes (e.g.,
            associated_with). Nodes and edges can be specified by way of text description, using the
            autocomplete drop-down menu, or, for nodes, by directly entering a CURIE (Compact
            Uniform Resource Identifier) (e.g., MONDO:0004989 for breast cancer).
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" gutterBottom>
            Receive an Answer
          </Typography>
          <Typography component={'p'}>
            The ROBOKOP KG drives the ROBOKOP application and contains integrated and harmonized
            knowledge derived from dozens of public data sources. The ROBOKOP KG can be queried
            through the ROBOKOP UI or by direct Cypher query. Most users will find that the ROBOKOP
            UI provides a more convenient query tool than Cypher query and also allows users to more
            readily explore knowledge subgraphs or answers and associated provenance and publication
            support. When a user poses a question to the ROBOKOP application, ROBOKOP creates an
            &lsquo;answer set&rsquo;, which consists of a ranked list of potential answers to the
            question or query, derived using the ROBOKOP reasoning engine. Note that the size of
            each &lsquo;bubble&rsquo; in the Knowledge Graph Bubble reflects how relatively common
            that entity is represented among the full answer set.
          </Typography>
          <Typography component={'p'}>
            Note that the ROBOKOP KG is continuously evolving; as such, answers derived today may
            not be the same as answers derived tomorrow. This behavior is expected, as additional
            knowledge sources are integrated into the ROBOKOP KG and the reasoning engine matures.
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" gutterBottom>
            Understand an Answer
          </Typography>
          <Typography component={'p'}>
            Each answer within an answer set is a knowledge subgraph that meets the criteria
            specified in a user’s question or Cypher query. The answer subgraph provides linkages
            between the biomedical entities (nodes) and the connections between them (predicates),
            as inferred by the ROBOKOP reasoning engine and based on the integrated and harmonized
            knowledge sources within the ROBOKOP KG.
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" gutterBottom>
            Interpret a Score and Rank
          </Typography>
          <Typography component={'p'}>
            Questions or queries typically result in numerous knowledge subgraphs or answers. As
            such, the scoring and ranking of answers by relevance is critical for user analysis.
            ROBOKOP scores and ranks each answer within an answer set using a complex scoring
            algorithm. In brief, the ROBOKOP answer scoring-and-ranking algorithm weights each edge
            within each knowledge subgraph based on the number of supporting PubMed publications.
            The publication support is provided by either the curated knowledge source from which a
            particular edge was derived or by an additional ROBOKOP service, termed OmniCorp, which
            contains a graph of PubMed identifiers linked to node categories or biomedical entities
            co-occurring within abstracts. The ROBOKOP answer scoring-and-ranking algorithm treats
            publications derived from curated knowledge sources with greater importance than those
            derived from OmniCorp.
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" gutterBottom>
            Explore an Answer
          </Typography>
          <Typography component={'p'}>
            ROBOKOP is equipped with tools to explore knowledge subgraphs or answers within an
            answer set. For example, users can click on edges to see the provenance of each
            connection in an answer subgraph, as well as the supporting publications, when
            available.
          </Typography>
          <Typography component={'p'}>
            The provenance of each edge takes the form:{' '}
            <em>
              biolink:primary_knowledge_source : infores:ctd; biolink:aggregator_knowledge_source :
              infores:automat-robokop
            </em>
            . In this example, CTD is the primary knowledge source from which the edge is derived,
            and Automat ROBOKOP KG is the aggregator knowledge source that contributed the CTD edge.
          </Typography>
          <Typography component={'p'}>
            The supporting publications are provided directly from a curated knowledge source within
            the ROBOKOP KG or are inferred by OmniCorp. Publications from curated knowledge sources
            are provided as URLs to PubMed abstracts, whereas publications derived from OmniCorp are
            provided as total counts.
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" gutterBottom>
            Refine the Answer Set
          </Typography>
          <Typography component={'p'}>
            For simple ROBOKOP questions or queries that are structured with only a few connected
            nodes and edges, the number of connections in the ROBOKOP KG is limited, and the
            exploration of results is relatively simple. However, for more complex ROBOKOP queries
            with numerous nodes and edges, the exploration of results becomes exponentially more
            challenging. For instance, a relatively complex query can return a knowledge subgraph
            with hundreds of thousands of individual answers within the overall answer set.
            Moreover, ROBOKOP’s response time for complex queries can be very slow (e.g., an hour or
            more).
          </Typography>
          <Typography component={'p'}>
            In addition to the challenges associated with complex queries and extremely large
            answers, another challenge is that ROBOKOP may not be able to generate an answer set for
            a particular user question or query. This issue typically arises when the ROBOKOP KG is
            incomplete with respect to the structure of the question or query.
          </Typography>
          <Typography component={'p'}>
            In cases where ROBOKOP returns an answer set containing too many answers to effectively
            explore or where ROBOKOP is unable to return an answer set, users are encouraged to
            refine their question or query by specifying more specific nodes and edges. New users
            may find this process to be challenging. For help with node and edge categories, please
            refer to{' '}
            <a
              href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9372416/"
              target="_blank"
              rel="noreferrer"
            >
              Unni et al. 2022
            </a>{' '}
            and the{' '}
            <a href="https://biolink.github.io/biolink-model/" target="_blank" rel="noreferrer">
              Biolink GitHub website
            </a>
            . Users may also find this{' '}
            <a href="http://tree-viz-biolink.herokuapp.com/" target="_blank" rel="noreferrer">
              Biolink tree visualization
            </a>{' '}
            to be helpful. For help with identifying more specific named nodes and CURIEs, users are
            encouraged to explore ontologies such as{' '}
            <a href="https://monarchinitiative.org/" target="_blank" rel="noreferrer">
              Monarch Disease Ontology (MONDO)
            </a>
            .
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" gutterBottom>
            Survey the Knowledge Sources
          </Typography>
          <Typography component={'p'}>
            Information on ROBOKOP’s knowledge sources, including URLs, their publicly available
            application programming interfaces (APIs), and other resources, can be found on the{' '}
            <a
              href="https://robokop.renci.org/api-docs/docs/category/automat"
              target="_blank"
              rel="noreferrer"
            >
              Automat page
            </a>
            .
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" gutterBottom>
            Review the Open-source Licensing
          </Typography>
          <Typography component={'p'}>
            ROBOKOP is an open-source software application licensed under the{' '}
            <a href="https://opensource.org/license/mit/" target="_blank" rel="noreferrer">
              MIT license
            </a>
            . All software code can be found on the{' '}
            <a href="https://github.com/RobokopU24" target="_blank" rel="noreferrer">
              ROBOKOP GitHub repository
            </a>
            .
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" gutterBottom>
            Find Additional User Documentation
          </Typography>
          <Typography component={'p'}>
            Users who are seeking additional information can review{' '}
            <Link to="/tutorial">the ROBOKOP tutorial</Link> or refer to the publications below.
            Users may also submit a <a href="https://robokop.renci.org/#contact">HELP request</a>.
          </Typography>
          <Typography component={'p'}>
            Bizon C, Cox S, Balhoff J, Kebede Y, Wang P, Morton K, Fecho K, Tropsha A. ROBOKOP KG
            and KGB: integrated knowledge graphs from federated sources. J Chem Inf Model 2019 Dec
            23;59(12):4968–4973. doi: 10.1021/acs.jcim.9b00683.{' '}
            <a href="https://pubmed.ncbi.nlm.nih.gov/31769676/" target="_blank" rel="noreferrer">
              https://pubmed.ncbi.nlm.nih.gov/31769676/
            </a>
            .
          </Typography>
          <Typography component={'p'}>
            Morton K, Wang P, Bizon C, Cox S, Balhoff J, Kebede Y, Fecho K, Tropsha A. ROBOKOP: an
            abstraction layer and user interface for knowledge graphs to support question answering.
            Bioinformatics 2019;pii:btz604. doi: 10.1093/bioinformatics/btz604.{' '}
            <a href="https://pubmed.ncbi.nlm.nih.gov/31410449/" target="_blank" rel="noreferrer">
              https://pubmed.ncbi.nlm.nih.gov/31410449/
            </a>
            .
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
}
