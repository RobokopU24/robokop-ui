import React from 'react';
import { Chip, Container, Skeleton, styled, Typography } from '@mui/material';
import { Link } from '@tanstack/react-router';
import stringUtils from '../../utils/strings';
import '../details/Details.css';

interface GraphProps {
  graphData: any[];
  isLoading?: boolean;
}

function Graph({ graphData, isLoading }: GraphProps) {
  return (
    <Container sx={{ width: '100%', maxWidth: 1200, my: 8 }}>
      <Typography variant="h4" component="h1" mb={1} sx={{ fontWeight: 500, textAlign: 'center' }}>
        ROBOKOP Graphs
      </Typography>
      <Typography
        variant="body1"
        gutterBottom
        sx={{
          color: '#5E5E5E',
          fontSize: '16px',
          maxWidth: 900,
          mx: 'auto',
          textAlign: 'center',
          my: 2,
        }}
      >
        Browse the available ROBOKOP knowledge graphs below. Click "Details" to see more information
        about each graph, including download links and statistics.
      </Typography>
      <Grid>
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={302} />
            ))
          : graphData.map((graph) => (
              <div
                key={graph.graph_id}
                className="details-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div className="details-card-section">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 8,
                      justifyContent: 'space-between',
                    }}
                  >
                    <div className="details-card-value details-card-value--large">
                      {graph.graph_name || '—'}
                    </div>
                    <div>
                      <Chip
                        label={`Nodes: ${stringUtils.formatNumber(graph.final_node_count) || '—'}`}
                        size="small"
                        sx={{ mr: 1, fontSize: '0.75rem' }}
                      />
                      <Chip
                        label={`Edges: ${stringUtils.formatNumber(graph.final_edge_count) || '—'}`}
                        size="small"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </div>
                  </div>

                  <div className="details-card-value">{graph.graph_description}</div>
                </div>
                <div
                  className="details-card-actions"
                  style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}
                >
                  <Link
                    className="details-card-button"
                    to="/explore/graphs/$graph_id"
                    params={{ graph_id: graph.graph_id }}
                  >
                    Details →
                  </Link>
                </div>
              </div>
            ))}
      </Grid>
    </Container>
  );
}

export default Graph;

const Grid = styled('div')`
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;

  @media (min-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
`;
