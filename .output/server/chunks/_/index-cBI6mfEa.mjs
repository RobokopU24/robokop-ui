import { jsx, jsxs } from 'react/jsx-runtime';
import { Container, Typography, Divider, Box, Link } from '@mui/material';
import { Link as Link$1 } from '@tanstack/react-router';

function Explore() {
  return /* @__PURE__ */ jsxs(Container, { sx: { my: 6 }, children: [
    /* @__PURE__ */ jsx(Typography, { variant: "h5", gutterBottom: true, children: "Explore" }),
    /* @__PURE__ */ jsx(Typography, { variant: "body1", sx: { mb: 3 }, children: "Click a link below to view a tool or a curated dataset that can be further explored in the ROBOKOP query builder or answer explorer." }),
    /* @__PURE__ */ jsx(Divider, { sx: { mb: 4 } }),
    /* @__PURE__ */ jsxs(Box, { sx: { mb: 6 }, children: [
      /* @__PURE__ */ jsxs(Link, { component: Link$1, to: `/enrichment-analysis`, underline: "hover", children: [
        "Enrichment Analysis",
        /* @__PURE__ */ jsx(
          Box,
          {
            component: "span",
            sx: {
              fontSize: "0.75rem",
              backgroundColor: "#e9e9e9",
              borderRadius: "4px",
              padding: "2px 4px",
              ml: 1
            },
            children: "Tool"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(Typography, { sx: { mt: 1 }, children: "This tool allows you to query the ROBOKOP knowledge graph using a list of nodes." })
    ] }),
    /* @__PURE__ */ jsxs(Box, { children: [
      /* @__PURE__ */ jsx(Link, { component: Link$1, to: `/explore/drug-chemical`, underline: "hover", children: "Drug to Disease Pairs" }),
      /* @__PURE__ */ jsx(Typography, { sx: { mt: 1 }, children: "These drug-disease pairs were generated using a machine learning model to align with the nodes in the ROBOKOP knowledge graph. They highlight potential associations between various drugs and a broad range of diseases, suggesting possible avenues for further research. These connections can serve as a starting point for a new query by hovering over a pair and clicking \u201CStart a Query\u201D." })
    ] })
  ] });
}
const SplitComponent = function RouteComponent() {
  return /* @__PURE__ */ jsx(Explore, {});
};

export { SplitComponent as component };
//# sourceMappingURL=index-cBI6mfEa.mjs.map
