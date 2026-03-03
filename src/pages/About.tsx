import React from 'react';
import { Container, Grid, Typography, Divider, Link } from '@mui/material';

export default function About() {
  return (
    <Container maxWidth="md" sx={{ my: 6 }}>
      <Grid container spacing={2}>
        <Grid>
          <Typography variant="h4" gutterBottom>
            About ROBOKOP
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Typography variant="h5" gutterBottom>
            Overview
          </Typography>
          <Typography component={'p'}>
            Knowledge graphs (KGs) are becoming more and more popular as an approach for storing
            data, integrating data, and implementing high-level reasoning algorithms to derive
            insights from the integrated and harmonized knowledge sources. KGs typically are stored
            as graph databases, and queries on those databases can be used to answer user questions.
            ROBOKOP has been developed specifically to support biomedical questions such as{' '}
            <em>“what diseases are associated with dioxins?”</em>. As such, nodes represent
            biomedical entities, and edges represent predicates that define the relationship between
            nodes. Statements or assertions in a graph are structured as subject-predicate-object
            relationships or triples, for example,{' '}
            <em>“dioxins (subject) - associated_with (predicate) - cancer (object)”</em> or{' '}
            <em>“dioxins are associated with cancer”</em>.
          </Typography>
          <Typography component={'p'}>
            The ROBOKOP KG can be queried through the ROBOKOP user interface (UI) or by direct
            Cypher query. Most users will find that the ROBOKOP UI provides a more convenient query
            tool than Cypher query and also allows users to more readily explore knowledge subgraphs
            or answers and associated provenance and publication support.
          </Typography>

          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" gutterBottom>
            Questions and Answers
          </Typography>
          <Typography component={'p'}>
            Questions or queries are represented in ROBOKOP as JSON templates that have been
            abstracted into a more friendly UI. Each node in the query graph denotes a biomedical
            entity with a defined category (e.g., disease) and defined properties (e.g., breast
            cancer versus cancer); likewise, each edge denotes a predicate that can be specified to
            limit the allowable relationships between nodes (e.g., associated_with). Nodes and edges
            can be specified by way of text description, using the autocomplete drop-down menu, or,
            for nodes, by directly entering a CURIE (Compact Uniform Resource Identifier) (e.g.,
            MONDO:0004989 for breast cancer).
          </Typography>
          <Typography component={'p'}>
            The node categories and edge categories are defined by Biolink Model, which is an
            open-source data model and upper-level ontology that formalizes the relationships
            between biomedical entities such as gene, disease, chemical, and phenotype as a set of
            hierarchical interconnected categories and relationships between them or predicates,
            e.g., <em>“chemical entity X causes disease Y”</em> or{' '}
            <em>“drug X treats disease Y”</em>. Biolink serves as the “semantic glue” for the
            ROBOKOP application by enabling integration and harmonization across ROBOKOP KG’s
            diverse underlying knowledge sources. For more information on Biolink Model, please
            refer to{' '}
            <Link
              href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9372416/"
              target="_blank"
              rel="noreferrer"
            >
              Unni et al. 2022
            </Link>{' '}
            and the{' '}
            <Link href="https://biolink.github.io/biolink-model/" target="_blank" rel="noreferrer">
              Biolink GitHub website
            </Link>
            .
          </Typography>
          <Typography component={'p'}>
            Query results are in the form of knowledge subgraphs or answers that match the
            categories and desired properties of the nodes and edges. In the Knowledge Graph Bubble,
            the size of each &lsquo;bubble&rsquo; represents how relatively common that entity is
            represented among the full answer set.
          </Typography>

          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" gutterBottom>
            Answer Scoring and Ranking
          </Typography>
          <Typography component={'p'}>
            Questions or queries that include very few nodes and edges or that include many
            specified nodes and edges typically result in numerous knowledge subgraphs or answers.
            As such, the scoring and ranking of answers by relevance is critical for user analysis.
            ROBOKOP scores and ranks each answer within an answer set using a complex scoring
            algorithm. In brief, the ROBOKOP answer scoring-and-ranking algorithm weights each edge
            within each knowledge subgraph based on the number of supporting PubMed publications.
            The publication support is provided by either the curated knowledge source from which a
            particular edge was derived or by an additional ROBOKOP service, termed OmniCorp, which
            contains a graph of PubMed identifiers linked to node categories or biomedical entities
            co-occurring within PubMed abstracts. The ROBOKOP answer scoring-and-ranking algorithm
            treats publications derived from curated knowledge sources with greater importance than
            those derived from OmniCorp.
          </Typography>

          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" gutterBottom>
            ROBOKOP Knowledge Sources
          </Typography>
          <Typography component={'p'}>
            Information on ROBOKOP’s knowledge sources, including URLs, their publicly available
            application programming interfaces (APIs), and other resources, can be found on the{' '}
            <Link href="https://robokop-automat.apps.renci.org" target="_blank" rel="noreferrer noopener">Automat page</Link>.
          </Typography>

          <Typography component={'p'} sx={{ mt: 2 }}>
            Users may request the addition of new knowledge sources to ROBOKOP by submitting an
            issue on the New Source Proposal{' '}
            <Link href="https://github.com/RobokopU24/NewSourceProposals/issues/new?template=new-source-proposal.yml" target="_blank" rel="noreferrer noopener">Github repo</Link>.
          </Typography>

          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" gutterBottom>
            Open-source Licensing
          </Typography>
          <Typography component={'p'}>
            ROBOKOP is an open-source software application licensed under the{' '}
            <Link href="https://opensource.org/license/mit/" target="_blank" rel="noreferrer">
              MIT license
            </Link>
            . All software code can be found on the{' '}
            <Link href="https://github.com/RobokopU24" target="_blank" rel="noreferrer">
              ROBOKOP GitHub repository
            </Link>
            .
          </Typography>

          <Typography component={'p'} sx={{ mt: 2 }}>
            All issues and questions can be submitted to the{" "}
            <Link href="https://github.com/RobokopU24/Feedback/issues" target="_blank" rel="noreferrer noopener">ROBOKOP Feedback issues page</Link>.
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
}
