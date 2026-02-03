import { Box, Typography } from "@mui/material";
import React from "react";

function SidebarV2() {
  const listOfContents = [
    {
      title: "Description",
      id: "description",
    },
    {
      title: "Download",
      id: "download",
    },
    {
      title: "Predicate Counts",
      id: "predicate-counts",
    },
    {
      title: "Node CURIE Prefixes",
      id: "node-curie-prefixes",
    },
    {
      title: "Edge Properties",
      id: "edge-properties",
    },
    {
      title: "Primary Knowledge Sources",
      id: "primary-knowledge-sources",
    },
    {
      title: "Aggregator Knowledge Sources",
      id: "aggregator-knowledge-sources",
    },
    {
      title: "Node Properties",
      id: "node-properties",
    },
    {
      title: "Data Sources",
      id: "data-sources",
    },
    {
      title: "Creators & Funders",
      id: "creators-funders",
    },
    {
      title: "Contact Points",
      id: "contact-points",
    },
    {
      title: "Conformance & Schema",
      id: "conformance-schema",
    },
  ];
  return (
    <Box
      sx={{
        position: "sticky",
        top: "80px",
        alignSelf: "flex-start",
        minWidth: "200px",
        pr: 4,
        height: "fit-content",
        maxHeight: "80vh",
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "#f1f1f1",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#c1c1c1",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#a8a8a8",
        },
      }}
    >
      <Typography variant="h6" gutterBottom>
        Contents
      </Typography>
      {listOfContents.map((item) => (
        <Box key={item.id} sx={{ mb: 1 }}>
          <a href={`#${item.id}`} style={{ textDecoration: "none", color: "#1976d2" }}>
            {item.title}
          </a>
        </Box>
      ))}
    </Box>
  );
}

export default SidebarV2;
