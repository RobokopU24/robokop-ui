import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { Container, Grid, Typography, Divider, Modal, IconButton } from '@mui/material';
import { Link } from '@tanstack/react-router';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

const Figure = ({ image, imageAlt, children, figureStyle }) => {
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("figure", { style: figureStyle, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          style: { all: "unset", cursor: "pointer" },
          type: "button",
          onClick: () => setOpen(true),
          children: /* @__PURE__ */ jsx("img", { src: image, alt: imageAlt })
        }
      ),
      children && /* @__PURE__ */ jsx("figcaption", { children })
    ] }),
    /* @__PURE__ */ jsx(
      Modal,
      {
        open,
        onClose: () => setOpen(false),
        "aria-labelledby": "Make image fullscreen",
        "aria-describedby": imageAlt,
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        BackdropProps: {
          style: {
            backgroundColor: "rgba(0 0 0 / 0.75)"
          }
        },
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              maxWidth: "80vw",
              height: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2rem"
            },
            children: [
              /* @__PURE__ */ jsx(
                IconButton,
                {
                  onClick: () => setOpen(false),
                  style: { alignSelf: "flex-end", color: "white" },
                  children: /* @__PURE__ */ jsx(CloseIcon, {})
                }
              ),
              /* @__PURE__ */ jsx("img", { src: image, alt: imageAlt, style: { width: "100%" } }),
              children && /* @__PURE__ */ jsx(
                "figcaption",
                {
                  style: {
                    alignSelf: "center",
                    color: "white",
                    fontStyle: "italic",
                    fontSize: "2rem",
                    textAlign: "center"
                  },
                  children
                }
              )
            ]
          }
        )
      }
    )
  ] });
};
const fig1 = "/images/tutorial/1.png";
const fig2 = "/images/tutorial/2.png";
const fig3 = "/images/tutorial/3.png";
const fig4 = "/images/tutorial/4.png";
const fig5 = "/images/tutorial/5.png";
const fig6 = "/images/tutorial/6.png";
const fig7 = "/images/tutorial/7.png";
function Tutorial() {
  return /* @__PURE__ */ jsx(Container, { sx: { my: 6 }, maxWidth: "md", children: /* @__PURE__ */ jsx(Grid, { container: true, justifyContent: "center", children: /* @__PURE__ */ jsxs(Grid, { children: [
    /* @__PURE__ */ jsx(Typography, { variant: "h4", gutterBottom: true, children: "ROBOKOP Tutorial" }),
    /* @__PURE__ */ jsx(Divider, { sx: { mb: 2 } }),
    /* @__PURE__ */ jsx(Typography, { variant: "h5", gutterBottom: true, children: "ROBOKOP One-hop Queries" }),
    /* @__PURE__ */ jsxs(Typography, { component: "p", children: [
      "For new users, simple one-hop queries provide a good starting point. For example, the query below asks for all diseases in ROBOKOP that are associated with the input node",
      " ",
      /* @__PURE__ */ jsx("code", { children: "2,3,7,8-tetrachlorodibenzo-P-dioxin" }),
      ". The query is structured as a subject-predicate-object ",
      /* @__PURE__ */ jsx("code", { children: "triple" }),
      ":"
    ] }),
    /* @__PURE__ */ jsx(Typography, { align: "center", component: "p", sx: { margin: "1rem 0" }, children: /* @__PURE__ */ jsx("em", { children: "2 3 7 8-tetrachlorodibenzo-p-dioxin -> associated with -> disease" }) }),
    /* @__PURE__ */ jsxs(Typography, { component: "p", children: [
      "In the ROBOKOP user interface (UI), a user either enters",
      " ",
      /* @__PURE__ */ jsx("code", { children: "2,3,7,8-tetrachlorodibenzo-P-dioxin" }),
      " or the equivalent CURIE (PUBCHEM.COMPOUND:15625) in the first node (n0). If the autocomplete dropdown menu cannot identify an exact text match, then a user can try simplifying the entry by, for example, not specifying a specific isomer and entering",
      " ",
      /* @__PURE__ */ jsx("code", { children: "tetrachlorodibenzo-p-dioxin" }),
      "."
    ] }),
    /* @__PURE__ */ jsxs(Typography, { component: "p", children: [
      "Note that users can lookup CURIEs by name using the",
      " ",
      /* @__PURE__ */ jsx("a", { href: "https://name-resolution-sri.renci.org/docs#/", target: "_blank", rel: "noreferrer", children: "Translator Name Resolver service" }),
      ", which is a service that was created by the",
      " ",
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "https://ncats.nih.gov/translator/about",
          target: "_blank",
          rel: "noopener noreferrer",
          children: "Biomedical Data Translator Consortium"
        }
      ),
      ", funded by the National Center for Advancing Translational Sciences."
    ] }),
    /* @__PURE__ */ jsxs(Typography, { component: "p", children: [
      "After selecting n0, a user can then select a predicate from the autocomplete dropdown menu. In this case, ",
      /* @__PURE__ */ jsx("code", { children: "associated with" }),
      " was selected. For the second node (n1), a user can select a category from Biolink Model. Here, ",
      /* @__PURE__ */ jsx("code", { children: "Disease" }),
      " was selected."
    ] }),
    /* @__PURE__ */ jsxs(Typography, { component: "p", children: [
      "Note that users can refer to this",
      " ",
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "http://tree-viz-biolink.herokuapp.com/",
          target: "_blank",
          rel: "noopener noreferrer",
          children: "Biolink Model tree visualization"
        }
      ),
      " ",
      "for help with node and predicate categories."
    ] }),
    /* @__PURE__ */ jsx(
      Figure,
      {
        image: fig1,
        imageAlt: "One-hop query for all diseases associated with 2,3,7,8-tetrachlorodibenzo-P-dioxin in ROBOKOP.",
        children: "One-hop query for all diseases associated with 2,3,7,8-tetrachlorodibenzo-P-dioxin in ROBOKOP."
      }
    ),
    /* @__PURE__ */ jsxs(Typography, { component: "p", children: [
      "After clicking on ",
      /* @__PURE__ */ jsx("code", { children: "SUBMIT" }),
      ", ROBOKOP will return an answer set, or a set of knowledge subgraphs."
    ] }),
    /* @__PURE__ */ jsx(
      Figure,
      {
        image: fig2,
        figureStyle: { marginBottom: 0 },
        imageAlt: "Bubble graph for one-hop query results."
      }
    ),
    /* @__PURE__ */ jsx(
      Figure,
      {
        image: fig3,
        figureStyle: { marginTop: 0 },
        imageAlt: "One-hop query results for all diseases associated with 2,3,7,8-tetrachlorodibenzo-P-dioxin in ROBOKOP.",
        children: "One-hop query results for all diseases associated with 2,3,7,8-tetrachlorodibenzo-P-dioxin in ROBOKOP."
      }
    ),
    /* @__PURE__ */ jsx(Typography, { component: "p", children: "Users can then explore answers or knowledge subgraphs. Note that the size of each \u2018bubble\u2019 in the Knowledge Graph Bubble reflects how relatively common that entity is represented among the full answer set. In this example, the top-ranked answer is for neoplasm, with a score of 0.814. Clicking the answer path will display the answer knowledge subgraph in the Answer Explorer." }),
    /* @__PURE__ */ jsx(
      Figure,
      {
        image: fig4,
        imageAlt: "Exploring one-hop query results for all diseases associated with 2,3,7,8-tetrachlorodibenzo-P-dioxin in ROBOKOP.",
        children: "Exploring one-hop query results for all diseases associated with 2,3,7,8-tetrachlorodibenzo-P-dioxin in ROBOKOP."
      }
    ),
    /* @__PURE__ */ jsxs(Typography, { component: "p", children: [
      "Clicking on the ",
      /* @__PURE__ */ jsx("code", { children: "positively correlated with" }),
      " edge shows the provenance underlying the assertion, which takes the form:",
      " ",
      /* @__PURE__ */ jsx("em", { children: "biolink:primary_knowledge_source" }),
      " : ",
      /* @__PURE__ */ jsx("em", { children: "infores:ctd" }),
      ";",
      " ",
      /* @__PURE__ */ jsx("em", { children: "biolink:aggregator_knowledge_source" }),
      " : ",
      /* @__PURE__ */ jsx("em", { children: "infores:automat-robokop" }),
      ". In this example, CTD is the primary knowledge source from which the edge is derived, and Automat ROBOKOP KG is the aggregator knowledge source that contributed the CTD edge."
    ] }),
    /* @__PURE__ */ jsxs(Typography, { component: "p", children: [
      "Clicking on ",
      /* @__PURE__ */ jsx("code", { children: "Result JSON" }),
      " exposes the answer knowledge subgraph in JSON format."
    ] }),
    /* @__PURE__ */ jsxs(
      Figure,
      {
        image: fig5,
        imageAlt: "Provenance for \u2018positively correlated with\u2019 edge shows that CTD is the primary knowledge source and that it was contributed by the aggregator knowledge source, Automat ROBOKOP KG. The answer knowledge subgraph is also displayed in JSON format.",
        children: [
          "Provenance for ",
          /* @__PURE__ */ jsx("code", { children: "positively correlated with" }),
          " edge shows that CTD is the primary knowledge source and that it was contributed by the aggregator knowledge source, Automat ROBOKOP KG. The answer knowledge subgraph is also displayed in JSON format."
        ]
      }
    ),
    /* @__PURE__ */ jsx(Figure, { image: fig6, imageAlt: "PubMed abstract", children: "Example PubMed abstract contributed by the curated primary knowledge source, CTD." }),
    /* @__PURE__ */ jsxs(Typography, { component: "p", children: [
      "Clicking on the ",
      /* @__PURE__ */ jsx("code", { children: "occurs together in literature with" }),
      " edge shows that there are 1722 co-occurrences of ",
      /* @__PURE__ */ jsx("code", { children: "2,3,7,8-tetrachlorodibenzo-P-dioxin" }),
      " and",
      " ",
      /* @__PURE__ */ jsx("code", { children: "neoplasm" }),
      " in PubMed abstracts, as determined by OmniCorp."
    ] }),
    /* @__PURE__ */ jsxs(
      Figure,
      {
        image: fig7,
        imageAlt: "Provenance for \u2018occurs together in literature with\u2019 edge shows that there are 1722 co-occurrences of \u20182,3,7,8-tetrachlorodibenzo-P-dioxin\u2019 and \u2018neoplasm\u2019 in PubMed abstracts, as determined by OmniCorp.",
        children: [
          "Provenance for ",
          /* @__PURE__ */ jsx("code", { children: "occurs together in literature with" }),
          " edge shows that there are 1722 co-occurrences of ",
          /* @__PURE__ */ jsx("code", { children: "2,3,7,8-tetrachlorodibenzo-P-dioxin" }),
          " and",
          " ",
          /* @__PURE__ */ jsx("code", { children: "neoplasm" }),
          " in PubMed abstracts, as determined by OmniCorp."
        ]
      }
    ),
    /* @__PURE__ */ jsx(Divider, { sx: { my: 3 } }),
    /* @__PURE__ */ jsx(Typography, { variant: "h5", gutterBottom: true, children: "ROBOKOP Multi-hop and Non-linear Queries" }),
    /* @__PURE__ */ jsx(Typography, { component: "p", children: "In addition to one-hop queries, ROBOKOP supports multi-hop and non-linear queries. Theoretically, ROBOKOP supports any query graph that a user creates. However, the more complex the query, the longer the running time and the higher the chance that ROBOKOP will not return an answer set, especially if very specific nodes/predicates are included in a complex query. In general, users will find it easier to begin with simple high-level queries and then iteratively refine them until the desired level of knowledge can be obtained within the constraints of the overall knowledge available in ROBOKOP." }),
    /* @__PURE__ */ jsxs(Typography, { component: "p", children: [
      "For examples of other queries, please see the templated preloaded queries on the",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/", children: "ROBOKOP question-builder page" }),
      "."
    ] })
  ] }) }) });
}
const SplitComponent = function RouteComponent() {
  return /* @__PURE__ */ jsx(Tutorial, {});
};

export { SplitComponent as component };
//# sourceMappingURL=tutorial-Qk8me0NG.mjs.map
