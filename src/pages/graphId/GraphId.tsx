import React from 'react';
import Download from '@mui/icons-material/Download';
import OpenInNew from '@mui/icons-material/OpenInNew';
import {
  Box,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Link } from '@tanstack/react-router';
import { formatFileSize } from '../../utils/getFileSize';
import stringUtils from '../../utils/strings';
import DownloadSection from './Download';
import { useQuery } from '@tanstack/react-query';
import { fileRoutes } from '../../API/routes';
import axios from 'axios';

interface GraphIdProps {
  graphData: any;
}

function GraphId({ graphData }: GraphIdProps) {
  const { data: fileSize } = useQuery({
    queryKey: ['graph-metadata', graphData.graph_id, 'file-size'],
    queryFn: async () => {
      const results = await axios.post(fileRoutes.fileSize, {
        fileUrl: graphData.neo4j_dump,
      });
      return results.data.size;
    },
  });
  return (
    <Container sx={{ my: 6, maxWidth: '1600px !important' }}>
      <Stack spacing={3}>
        <Breadcrumbs aria-label="graph breadcrumbs">
          <Typography
            component={Link}
            to="/explore/graphs"
            color="text.secondary"
            variant="body2"
            sx={{ textDecoration: 'none' }}
          >
            Explore graphs
          </Typography>
          <Typography color="text.primary" variant="body2">
            {graphData.graph_name}
          </Typography>
        </Breadcrumbs>

        <Card variant="outlined">
          <CardContent>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'baseline' }}
            >
              <Box>
                <Typography variant="h4" component="h1">
                  {graphData.graph_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Graph version <code>{graphData.graph_version}</code>, built{' '}
                  <code>{new Date(graphData.build_time).toLocaleDateString()}</code>
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  label={`${stringUtils.formatNumber(graphData.final_node_count)} nodes`}
                  color="default"
                  variant="outlined"
                />
                <Chip
                  label={`${stringUtils.formatNumber(graphData.final_edge_count)} edges`}
                  color="default"
                  variant="outlined"
                />
              </Stack>
            </Stack>

            <Typography variant="body1" sx={{ mt: 2 }}>
              {graphData.graph_description}
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
              {graphData.graph_url && (
                <Button
                  endIcon={<OpenInNew />}
                  href={graphData.graph_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                >
                  Graph website
                </Button>
              )}
              <Button
                endIcon={<Download />}
                component={'a'}
                href={graphData.neo4j_dump}
                variant="contained"
              >
                Download Graph {formatFileSize(fileSize || 0, 2)}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={2}>
          <Grid size={8}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '1000px',
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0,0,0,.2)',
                      borderRadius: '2px',
                    },
                  }}
                >
                  <CardHeader title="Predicate Counts" sx={{ pb: 0 }} />
                  <CardContent sx={{ p: 1 }}>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer component={Paper} elevation={0}>
                      <Table size="small" aria-label="predicate counts">
                        <TableHead>
                          <TableRow>
                            <TableCell>Predicate</TableCell>
                            <TableCell align="right">Count</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[...Object.entries(graphData.qc_results.predicate_totals)]
                            .sort((a: any, b: any) => (b[1] as number) - (a[1] as number))
                            .map(([predicate, count]) => (
                              <TableRow key={predicate} hover>
                                <TableCell component="th" scope="row">
                                  {predicate}
                                </TableCell>
                                <TableCell align="right">
                                  {(count as number).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={12}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '1000px',
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0,0,0,.2)',
                      borderRadius: '2px',
                    },
                  }}
                >
                  <CardHeader title="Node CURIE Prefixes" sx={{ pb: 0 }} />
                  <CardContent sx={{ p: 1 }}>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer component={Paper} elevation={0}>
                      <Table size="small" aria-label="node curie prefixes">
                        <TableHead>
                          <TableRow>
                            <TableCell>Prefix</TableCell>
                            <TableCell align="right">Count</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[...Object.entries(graphData.qc_results.node_curie_prefixes)]
                            .sort((a: any, b: any) => (b[1] as number) - (a[1] as number))
                            .map(([predicate, count]) => (
                              <TableRow key={predicate} hover>
                                <TableCell component="th" scope="row">
                                  {predicate}
                                </TableCell>
                                <TableCell align="right">
                                  {(count as number).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={12}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '1000px',
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0,0,0,.2)',
                      borderRadius: '2px',
                    },
                  }}
                >
                  <CardHeader title="Edge Properties" sx={{ pb: 0 }} />
                  <CardContent sx={{ p: 1 }}>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer component={Paper} elevation={0}>
                      <Table size="small" aria-label="edge properties">
                        <TableHead>
                          <TableRow>
                            <TableCell>Property</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {graphData.qc_results.edge_properties.map((property: any) => (
                            <TableRow key={property} hover>
                              <TableCell component="th" scope="row">
                                {property}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={4}>
            <Card variant="outlined">
              <CardHeader title="Downloads" />
              <CardContent>
                <DownloadSection />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}

export default GraphId;
const Hr = styled('hr')`
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.23);
  margin: 1rem 0;
`;

const HeadingWrapper = styled('div')`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;

  & span {
    font-size: 1rem;
    white-space: nowrap;
    color: #767676;
  }
`;
