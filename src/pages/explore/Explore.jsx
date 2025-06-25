import React from 'react';
import { Container, Typography, Box, Divider, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Explore() {
  return (
    <Container sx={{ my: 6 }}>
      <Typography variant="h5" gutterBottom>
        Explore
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Click a link below to view a tool or a curated dataset that can be further explored in the
        ROBOKOP query builder or answer explorer.
      </Typography>

      <Divider sx={{ mb: 4 }} />

      <Box sx={{ mb: 6 }}>
        <MuiLink component={Link} to={`/enrichment-analysis`} underline="hover">
          Enrichment Analysis
          <Box
            component="span"
            sx={{
              fontSize: '0.75rem',
              backgroundColor: '#e9e9e9',
              borderRadius: '4px',
              padding: '2px 4px',
              ml: 1,
            }}
          >
            Tool
          </Box>
        </MuiLink>
        <Typography sx={{ mt: 1 }}>
          This tool allows you to query the ROBOKOP knowledge graph using a list of nodes.
        </Typography>
      </Box>

      <Box>
        <MuiLink component={Link} to={`/explore/drug-chemical`} underline="hover">
          Drug to Disease Pairs
        </MuiLink>
        <Typography sx={{ mt: 1 }}>
          These drug-disease pairs were generated using a machine learning model to align with the
          nodes in the ROBOKOP knowledge graph. They highlight potential associations between
          various drugs and a broad range of diseases, suggesting possible avenues for further
          research. These connections can serve as a starting point for a new query by hovering over
          a pair and clicking &ldquo;Start a Query&rdquo;.
        </Typography>
      </Box>
    </Container>
  );
}
