import { jsx, jsxs } from 'react/jsx-runtime';
import { Container, Grid, Typography, Divider, Link } from '@mui/material';

function About() {
  return /* @__PURE__ */ jsx(Container, { maxWidth: "md", sx: { my: 6 }, children: /* @__PURE__ */ jsx(Grid, { container: true, spacing: 2, children: /* @__PURE__ */ jsxs(Grid, { children: [
    /* @__PURE__ */ jsx(Typography, { variant: "h4", gutterBottom: true, children: "About ROBOKOP" }),
    /* @__PURE__ */ jsx(Divider, { sx: { mb: 2 } }),
    /* @__PURE__ */ jsx(Typography, { variant: "h5", gutterBottom: true, children: "Overview" }),
    /* @__PURE__ */ jsxs(Typography, { component: "p", children: [
      "Knowledge graphs (KGs) are becoming more and more popular as an approach for storing data, integrating data, and implementing high-level reasoning algorithms to derive insights from the integrated and harmonized knowledge sources. KGs typically are stored as graph databases, and queries on those databases can be used to answer user questions. ROBOKOP has been developed specifically to support biomedical questions such as",
      " ",
      /* @__PURE__ */ jsx("em", { children: "\u201Cwhat diseases are associated with dioxins?\u201D" }),
      ". As such, nodes represent biomedical entities, and edges represent predicates that define the relationship between nodes. Statements or assertions in a graph are structured as subject-predicate-object relationships or triples, for example,",
      " ",
      /* @__PURE__ */ jsx("em", { children: "\u201Cdioxins (subject) - associated_with (predicate) - cancer (object)\u201D" }),
      " or",
      " ",
      /* @__PURE__ */ jsx("em", { children: "\u201Cdioxins are associated with cancer\u201D" }),
      "."
    ] }),
    /* @__PURE__ */ jsx(Typography, { component: "p", children: "The ROBOKOP KG can be queried through the ROBOKOP user interface (UI) or by direct Cypher query. Most users will find that the ROBOKOP UI provides a more convenient query tool than Cypher query and also allows users to more readily explore knowledge subgraphs or answers and associated provenance and publication support." }),
    /* @__PURE__ */ jsx(Divider, { sx: { my: 3 } }),
    /* @__PURE__ */ jsx(Typography, { variant: "h5", gutterBottom: true, children: "Questions and Answers" }),
    /* @__PURE__ */ jsx(Typography, { component: "p", children: "Questions or queries are represented in ROBOKOP as JSON templates that have been abstracted into a more friendly UI. Each node in the query graph denotes a biomedical entity with a defined category (e.g., disease) and defined properties (e.g., breast cancer versus cancer); likewise, each edge denotes a predicate that can be specified to limit the allowable relationships between nodes (e.g., associated_with). Nodes and edges can be specified by way of text description, using the autocomplete drop-down menu, or, for nodes, by directly entering a CURIE (Compact Uniform Resource Identifier) (e.g., MONDO:0004989 for breast cancer)." }),
    /* @__PURE__ */ jsxs(Typography, { component: "p", children: [
      "The node categories and edge categories are defined by Biolink Model, which is an open-source data model and upper-level ontology that formalizes the relationships between biomedical entities such as gene, disease, chemical, and phenotype as a set of hierarchical interconnected categories and relationships between them or predicates, e.g., ",
      /* @__PURE__ */ jsx("em", { children: "\u201Cchemical entity X causes disease Y\u201D" }),
      " or",
      " ",
      /* @__PURE__ */ jsx("em", { children: "\u201Cdrug X treats disease Y\u201D" }),
      ". Biolink serves as the \u201Csemantic glue\u201D for the ROBOKOP application by enabling integration and harmonization across ROBOKOP KG\u2019s diverse underlying knowledge sources. For more information on Biolink Model, please refer to",
      " ",
      /* @__PURE__ */ jsx(
        Link,
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
      /* @__PURE__ */ jsx(Link, { href: "https://biolink.github.io/biolink-model/", target: "_blank", rel: "noreferrer", children: "Biolink GitHub website" }),
      "."
    ] }),
    /* @__PURE__ */ jsx(Typography, { component: "p", children: "Query results are in the form of knowledge subgraphs or answers that match the categories and desired properties of the nodes and edges. In the Knowledge Graph Bubble, the size of each \u2018bubble\u2019 represents how relatively common that entity is represented among the full answer set." }),
    /* @__PURE__ */ jsx(Divider, { sx: { my: 3 } }),
    /* @__PURE__ */ jsx(Typography, { variant: "h5", gutterBottom: true, children: "Answer Scoring and Ranking" }),
    /* @__PURE__ */ jsx(Typography, { component: "p", children: "Questions or queries that include very few nodes and edges or that include many specified nodes and edges typically result in numerous knowledge subgraphs or answers. As such, the scoring and ranking of answers by relevance is critical for user analysis. ROBOKOP scores and ranks each answer within an answer set using a complex scoring algorithm. In brief, the ROBOKOP answer scoring-and-ranking algorithm weights each edge within each knowledge subgraph based on the number of supporting PubMed publications. The publication support is provided by either the curated knowledge source from which a particular edge was derived or by an additional ROBOKOP service, termed OmniCorp, which contains a graph of PubMed identifiers linked to node categories or biomedical entities co-occurring within PubMed abstracts. The ROBOKOP answer scoring-and-ranking algorithm treats publications derived from curated knowledge sources with greater importance than those derived from OmniCorp." }),
    /* @__PURE__ */ jsx(Divider, { sx: { my: 3 } }),
    /* @__PURE__ */ jsx(Typography, { variant: "h5", gutterBottom: true, children: "ROBOKOP Knowledge Sources" }),
    /* @__PURE__ */ jsxs(Typography, { component: "p", children: [
      "Information on ROBOKOP\u2019s knowledge sources, including URLs, their publicly available application programming interfaces (APIs), and other resources, can be found on the",
      " ",
      /* @__PURE__ */ jsx(Link, { href: "/api-docs/docs/category/automat", children: "Automat page" }),
      "."
    ] }),
    /* @__PURE__ */ jsx(Divider, { sx: { my: 3 } }),
    /* @__PURE__ */ jsx(Typography, { variant: "h5", gutterBottom: true, children: "Open-source Licensing" }),
    /* @__PURE__ */ jsxs(Typography, { component: "p", children: [
      "ROBOKOP is an open-source software application licensed under the",
      " ",
      /* @__PURE__ */ jsx(Link, { href: "https://opensource.org/license/mit/", target: "_blank", rel: "noreferrer", children: "MIT license" }),
      ". All software code can be found on the",
      " ",
      /* @__PURE__ */ jsx(Link, { href: "https://github.com/RobokopU24", target: "_blank", rel: "noreferrer", children: "ROBOKOP GitHub repository" }),
      "."
    ] })
  ] }) }) });
}
const SplitComponent = function RouteComponent() {
  return /* @__PURE__ */ jsx(About, {});
};

export { SplitComponent as component };
//# sourceMappingURL=about-CUoDGIPD.mjs.map
