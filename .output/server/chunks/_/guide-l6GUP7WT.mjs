import { jsx, jsxs } from 'react/jsx-runtime';
import { Container, Grid, Typography, Divider, Card, Button } from '@mui/material';
import { blue } from '@mui/material/colors';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { Link } from '@tanstack/react-router';

function Guide() {
  return /* @__PURE__ */ jsx(Container, { sx: { my: 6 }, maxWidth: "md", children: /* @__PURE__ */ jsx(Grid, { container: true, spacing: 4, justifyContent: "center", children: /* @__PURE__ */ jsxs(Grid, { children: [
    /* @__PURE__ */ jsx(Typography, { variant: "h4", gutterBottom: true, children: "ROBOKOP Quick Start Guide" }),
    /* @__PURE__ */ jsx(Divider, { sx: { mb: 2 } }),
    /* @__PURE__ */ jsxs(Typography, { children: [
      "ROBOKOP is a knowledge graph (KG)\u2013based biomedical application for deriving answers to user questions such as: ",
      /* @__PURE__ */ jsx("em", { children: "\u201CWhat diseases are associated with dioxin?\u201D" }),
      " ",
      /* @__PURE__ */ jsx("em", { children: "\u201CWhat genes are regulated by 2,4-dichlorophenoxyacetic acid?\u201D" }),
      " ",
      /* @__PURE__ */ jsx("em", { children: "\u201CWhat chemical entities might alleviate Huntington\u2019s Disease?\u201D" }),
      " ",
      /* @__PURE__ */ jsx("em", { children: "\u201CWhat diseases share a genetic association with Ebola?\u201D" }),
      " ",
      /* @__PURE__ */ jsx("em", { children: "\u201CWhat genes are involved in histone H3 deacetylation?\u201D" }),
      " ",
      /* @__PURE__ */ jsx("em", { children: "\u201CWhat genes and chemical entities are related to GLUT1 deficiency, and to each other?\u201D" }),
      " ",
      /* @__PURE__ */ jsx("em", { children: "\u201CWhat biological mechanisms might explain the relationship between airborne pollutant exposure and asthma exacerbations?\u201D" })
    ] }),
    /* @__PURE__ */ jsxs(
      Card,
      {
        elevation: 4,
        sx: { my: 4, p: 3, display: "flex", flexDirection: "column", gap: 2 },
        children: [
          /* @__PURE__ */ jsx(Typography, { variant: "h6", children: "Looking for a step-by-step introduction to ROBOKOP?" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              component: Link,
              to: "/tutorial",
              variant: "contained",
              endIcon: /* @__PURE__ */ jsx(ArrowForward, {}),
              sx: {
                backgroundColor: blue[600],
                color: "#fff",
                "&:hover": {
                  backgroundColor: blue[700]
                },
                alignSelf: "flex-start"
              },
              children: "View the tutorial"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx(Divider, { sx: { my: 3 } }),
    /* @__PURE__ */ jsx(Typography, { variant: "h5", gutterBottom: true, children: "Ask a Question" }),
    /* @__PURE__ */ jsx(Typography, { component: "p", children: "Questions or queries in ROBOKOP are specified as JSON query graph templates that define categories of nodes or biomedical entities and edges or predicates describing the relationship between nodes within the ROBOKOP KG. The JSON templates have been abstracted into a more friendly user interface (UI). Each node in the query graph denotes a biomedical entity with a defined category (e.g., disease) and defined properties (e.g., breast cancer versus cancer); likewise, each edge denotes a predicate that can be specified to limit the allowable relationships between nodes (e.g., associated_with). Nodes and edges can be specified by way of text description, using the autocomplete drop-down menu, or, for nodes, by directly entering a CURIE (Compact Uniform Resource Identifier) (e.g., MONDO:0004989 for breast cancer)." }),
    /* @__PURE__ */ jsx(Divider, { sx: { my: 3 } }),
    /* @__PURE__ */ jsx(Typography, { variant: "h5", gutterBottom: true, children: "Receive an Answer" }),
    /* @__PURE__ */ jsx(Typography, { component: "p", children: "The ROBOKOP KG drives the ROBOKOP application and contains integrated and harmonized knowledge derived from dozens of public data sources. The ROBOKOP KG can be queried through the ROBOKOP UI or by direct Cypher query. Most users will find that the ROBOKOP UI provides a more convenient query tool than Cypher query and also allows users to more readily explore knowledge subgraphs or answers and associated provenance and publication support. When a user poses a question to the ROBOKOP application, ROBOKOP creates an \u2018answer set\u2019, which consists of a ranked list of potential answers to the question or query, derived using the ROBOKOP reasoning engine. Note that the size of each \u2018bubble\u2019 in the Knowledge Graph Bubble reflects how relatively common that entity is represented among the full answer set." }),
    /* @__PURE__ */ jsx(Typography, { component: "p", children: "Note that the ROBOKOP KG is continuously evolving; as such, answers derived today may not be the same as answers derived tomorrow. This behavior is expected, as additional knowledge sources are integrated into the ROBOKOP KG and the reasoning engine matures." }),
    /* @__PURE__ */ jsx(Divider, { sx: { my: 3 } }),
    /* @__PURE__ */ jsx(Typography, { variant: "h5", gutterBottom: true, children: "Understand an Answer" }),
    /* @__PURE__ */ jsx(Typography, { component: "p", children: "Each answer within an answer set is a knowledge subgraph that meets the criteria specified in a user\u2019s question or Cypher query. The answer subgraph provides linkages between the biomedical entities (nodes) and the connections between them (predicates), as inferred by the ROBOKOP reasoning engine and based on the integrated and harmonized knowledge sources within the ROBOKOP KG." }),
    /* @__PURE__ */ jsx(Divider, { sx: { my: 3 } }),
    /* @__PURE__ */ jsx(Typography, { variant: "h5", gutterBottom: true, children: "Interpret a Score and Rank" }),
    /* @__PURE__ */ jsx(Typography, { component: "p", children: "Questions or queries typically result in numerous knowledge subgraphs or answers. As such, the scoring and ranking of answers by relevance is critical for user analysis. ROBOKOP scores and ranks each answer within an answer set using a complex scoring algorithm. In brief, the ROBOKOP answer scoring-and-ranking algorithm weights each edge within each knowledge subgraph based on the number of supporting PubMed publications. The publication support is provided by either the curated knowledge source from which a particular edge was derived or by an additional ROBOKOP service, termed OmniCorp, which contains a graph of PubMed identifiers linked to node categories or biomedical entities co-occurring within abstracts. The ROBOKOP answer scoring-and-ranking algorithm treats publications derived from curated knowledge sources with greater importance than those derived from OmniCorp." }),
    /* @__PURE__ */ jsx(Divider, { sx: { my: 3 } }),
    /* @__PURE__ */ jsx(Typography, { variant: "h5", gutterBottom: true, children: "Explore an Answer" }),
    /* @__PURE__ */ jsx(Typography, { component: "p", children: "ROBOKOP is equipped with tools to explore knowledge subgraphs or answers within an answer set. For example, users can click on edges to see the provenance of each connection in an answer subgraph, as well as the supporting publications, when available." }),
    /* @__PURE__ */ jsxs(Typography, { component: "p", children: [
      "The provenance of each edge takes the form:",
      " ",
      /* @__PURE__ */ jsx("em", { children: "biolink:primary_knowledge_source : infores:ctd; biolink:aggregator_knowledge_source : infores:automat-robokop" }),
      ". In this example, CTD is the primary knowledge source from which the edge is derived, and Automat ROBOKOP KG is the aggregator knowledge source that contributed the CTD edge."
    ] }),
    /* @__PURE__ */ jsx(Typography, { component: "p", children: "The supporting publications are provided directly from a curated knowledge source within the ROBOKOP KG or are inferred by OmniCorp. Publications from curated knowledge sources are provided as URLs to PubMed abstracts, whereas publications derived from OmniCorp are provided as total counts." }),
    /* @__PURE__ */ jsx(Divider, { sx: { my: 3 } }),
    /* @__PURE__ */ jsx(Typography, { variant: "h5", gutterBottom: true, children: "Refine the Answer Set" }),
    /* @__PURE__ */ jsx(Typography, { component: "p", children: "For simple ROBOKOP questions or queries that are structured with only a few connected nodes and edges, the number of connections in the ROBOKOP KG is limited, and the exploration of results is relatively simple. However, for more complex ROBOKOP queries with numerous nodes and edges, the exploration of results becomes exponentially more challenging. For instance, a relatively complex query can return a knowledge subgraph with hundreds of thousands of individual answers within the overall answer set. Moreover, ROBOKOP\u2019s response time for complex queries can be very slow (e.g., an hour or more)." }),
    /* @__PURE__ */ jsx(Typography, { component: "p", children: "In addition to the challenges associated with complex queries and extremely large answers, another challenge is that ROBOKOP may not be able to generate an answer set for a particular user question or query. This issue typically arises when the ROBOKOP KG is incomplete with respect to the structure of the question or query." }),
    /* @__PURE__ */ jsxs(Typography, { component: "p", children: [
      "In cases where ROBOKOP returns an answer set containing too many answers to effectively explore or where ROBOKOP is unable to return an answer set, users are encouraged to refine their question or query by specifying more specific nodes and edges. New users may find this process to be challenging. For help with node and edge categories, please refer to",
      " ",
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9372416/",
          target: "_blank",
          rel: "noreferrer",
          children: "Unni et al. 2022"
        }
      ),
      " ",
      "and the",
      " ",
      /* @__PURE__ */ jsx("a", { href: "https://biolink.github.io/biolink-model/", target: "_blank", rel: "noreferrer", children: "Biolink GitHub website" }),
      ". Users may also find this",
      " ",
      /* @__PURE__ */ jsx("a", { href: "http://tree-viz-biolink.herokuapp.com/", target: "_blank", rel: "noreferrer", children: "Biolink tree visualization" }),
      " ",
      "to be helpful. For help with identifying more specific named nodes and CURIEs, users are encouraged to explore ontologies such as",
      " ",
      /* @__PURE__ */ jsx("a", { href: "https://monarchinitiative.org/", target: "_blank", rel: "noreferrer", children: "Monarch Disease Ontology (MONDO)" }),
      "."
    ] }),
    /* @__PURE__ */ jsx(Divider, { sx: { my: 3 } }),
    /* @__PURE__ */ jsx(Typography, { variant: "h5", gutterBottom: true, children: "Survey the Knowledge Sources" }),
    /* @__PURE__ */ jsxs(Typography, { component: "p", children: [
      "Information on ROBOKOP\u2019s knowledge sources, including URLs, their publicly available application programming interfaces (APIs), and other resources, can be found on the",
      " ",
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "https://robokop.renci.org/api-docs/docs/category/automat",
          target: "_blank",
          rel: "noreferrer",
          children: "Automat page"
        }
      ),
      "."
    ] }),
    /* @__PURE__ */ jsx(Divider, { sx: { my: 3 } }),
    /* @__PURE__ */ jsx(Typography, { variant: "h5", gutterBottom: true, children: "Review the Open-source Licensing" }),
    /* @__PURE__ */ jsxs(Typography, { component: "p", children: [
      "ROBOKOP is an open-source software application licensed under the",
      " ",
      /* @__PURE__ */ jsx("a", { href: "https://opensource.org/license/mit/", target: "_blank", rel: "noreferrer", children: "MIT license" }),
      ". All software code can be found on the",
      " ",
      /* @__PURE__ */ jsx("a", { href: "https://github.com/RobokopU24", target: "_blank", rel: "noreferrer", children: "ROBOKOP GitHub repository" }),
      "."
    ] }),
    /* @__PURE__ */ jsx(Divider, { sx: { my: 3 } }),
    /* @__PURE__ */ jsx(Typography, { variant: "h5", gutterBottom: true, children: "Find Additional User Documentation" }),
    /* @__PURE__ */ jsxs(Typography, { component: "p", children: [
      "Users who are seeking additional information can review",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/tutorial", children: "the ROBOKOP tutorial" }),
      " or refer to the publications below. Users may also submit a ",
      /* @__PURE__ */ jsx("a", { href: "https://robokop.renci.org/#contact", children: "HELP request" }),
      "."
    ] }),
    /* @__PURE__ */ jsxs(Typography, { component: "p", children: [
      "Bizon C, Cox S, Balhoff J, Kebede Y, Wang P, Morton K, Fecho K, Tropsha A. ROBOKOP KG and KGB: integrated knowledge graphs from federated sources. J Chem Inf Model 2019 Dec 23;59(12):4968\u20134973. doi: 10.1021/acs.jcim.9b00683.",
      " ",
      /* @__PURE__ */ jsx("a", { href: "https://pubmed.ncbi.nlm.nih.gov/31769676/", target: "_blank", rel: "noreferrer", children: "https://pubmed.ncbi.nlm.nih.gov/31769676/" }),
      "."
    ] }),
    /* @__PURE__ */ jsxs(Typography, { component: "p", children: [
      "Morton K, Wang P, Bizon C, Cox S, Balhoff J, Kebede Y, Fecho K, Tropsha A. ROBOKOP: an abstraction layer and user interface for knowledge graphs to support question answering. Bioinformatics 2019;pii:btz604. doi: 10.1093/bioinformatics/btz604.",
      " ",
      /* @__PURE__ */ jsx("a", { href: "https://pubmed.ncbi.nlm.nih.gov/31410449/", target: "_blank", rel: "noreferrer", children: "https://pubmed.ncbi.nlm.nih.gov/31410449/" }),
      "."
    ] })
  ] }) }) });
}
const SplitComponent = function RouteComponent() {
  return /* @__PURE__ */ jsx(Guide, {});
};

export { SplitComponent as component };
//# sourceMappingURL=guide-l6GUP7WT.mjs.map
