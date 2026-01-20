import React from 'react';
import Download from '@mui/icons-material/Download';
import OpenInNew from '@mui/icons-material/OpenInNew';
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { Link, useParams } from '@tanstack/react-router';
import { formatFileSize } from '../../utils/getFileSize';
import stringUtils from '../../utils/strings';
import DownloadSection from './Download';
import { useQuery } from '@tanstack/react-query';
import { fileRoutes } from '../../API/routes';
import axios from 'axios';
import PredicateCount from './PredicateCount';
import NodeCuriePrefixes from './NodeCuriePrefixes';
import PrimaryKnowledgeSources from './PrimaryKnowledgeSources';
import StringTableDisplay from './StringTableDisplay';
import Sidebar from './Sidebar';
import './GraphId.css';
import SankeyGraphModal from './SankeyGraphModal';
import { formatBuildDate } from '../../utils/dateTime';
import { getGraphMetadataDownloads } from '../../functions/graphFunctions';

interface GraphIdProps {
  graphData: any;
}

function GraphId({ graphData }: GraphIdProps) {
  const { graph_id } = useParams({ strict: false });
  const [isSankeyGraphModalOpen, setIsSankeyGraphModalOpen] = React.useState(false);
  const { data: fileSize } = useQuery({
    queryKey: ['graph-metadata', graphData.graph_id, 'file-size'],
    queryFn: async () => {
      const results = await axios.post(fileRoutes.fileSize, {
        fileUrl: graphData.neo4j_dump,
      });
      return results.data.size;
    },
  });
  const { data: downloadData } = useQuery({
    queryKey: ['graph-metadata', graph_id, 'download'],
    queryFn: () => getGraphMetadataDownloads(graph_id!),
  });

  let nodeSet: Set<string> = new Set();
  let links: Array<{ source: string; target: string; value: number }> = [];
  for (const [key, value] of Object.entries(
    graphData?.qc_results?.predicates_by_knowledge_source || {}
  )) {
    nodeSet.add(key);
    for (const [predicate, count] of Object.entries(value as Record<string, number>)) {
      nodeSet.add(predicate);
      links.push({ source: key, target: predicate, value: count });
    }
  }

  const graphDataset = {
    nodes: Array.from(nodeSet).map((id) => ({ id })),
    links,
  };

  const latestMetadataUrl = downloadData?.data
    ?.at(-1)
    ?.links?.filter((link: any) => link.url.includes('meta.json'))[0]?.url;

  return (
    <Container sx={{ my: 6, maxWidth: '1920px !important', display: 'flex', gap: 4 }}>
      <Sidebar />
      <Box>
        <SankeyGraphModal
          isOpen={isSankeyGraphModalOpen}
          onClose={() => setIsSankeyGraphModalOpen(false)}
          graphData={graphDataset}
        />
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
        <Card variant="outlined" sx={{ mt: 2 }} id="description">
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
                  Graph version <code>{graphData?.graph_version}</code>, built{' '}
                  <code>
                    {graphData?.build_time ? formatBuildDate(graphData?.build_time) : 'N/A'}
                  </code>
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
            <Stack direction={'row'} justifyContent={'space-between'}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ mt: 2 }}
                alignItems="center"
              >
                {graphData.graph_url && (
                  <>
                    <a
                      className="external-links"
                      href={graphData.graph_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {graphData.graph_id === 'robokopkg' ? 'Neo4j Browser' : 'Knowledge Source'}{' '}
                      <OpenInNew sx={{ fontSize: '1.25rem', ml: 0.5 }} />
                    </a>
                  </>
                )}
                <p>•</p>
                <a
                  className="external-links"
                  href={`https://robokop-automat.apps.renci.org/#/${graphData.graph_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Automat API <OpenInNew sx={{ fontSize: '1.25rem', ml: 0.5 }} />
                </a>
                <p>•</p>
                {latestMetadataUrl && (
                  <a
                    className="external-links"
                    href={latestMetadataUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Latest Metadata <OpenInNew sx={{ ml: 0.5 }} />
                  </a>
                )}
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
                <a
                  className="details-card-button"
                  href={graphData.neo4j_dump}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    maxWidth: '300px',
                  }}
                >
                  <span>Download Graph ({formatFileSize(fileSize || 0, 2)})</span> <Download />
                </a>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    maxWidth: '200px',
                  }}
                  className="details-card-secondary-button"
                  onClick={() => setIsSankeyGraphModalOpen(true)}
                >
                  Sankey Chart
                </button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
        <Grid size={8} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={12} id="predicate-counts">
              <Card variant="outlined">
                <PredicateCount graphData={graphData} />
              </Card>
            </Grid>
            <Grid size={12} id="node-curie-prefixes">
              <Card variant="outlined">
                <NodeCuriePrefixes graphData={graphData} />
              </Card>
            </Grid>
            <Grid size={12}>
              <Card variant="outlined" id="edge-properties">
                <StringTableDisplay
                  tableData={graphData?.qc_results?.edge_properties || []}
                  title="Edge Properties"
                />
              </Card>
            </Grid>
            <Grid size={12}>
              <Card variant="outlined" id="primary-knowledge-sources">
                <PrimaryKnowledgeSources graphData={graphData} />
              </Card>
            </Grid>
            <Grid size={12}>
              <Card variant="outlined" id="aggregator-knowledge-sources">
                <StringTableDisplay
                  tableData={graphData?.qc_results?.aggregator_knowledge_sources}
                  title="Aggregator Knowledge Sources"
                />
              </Card>
            </Grid>
            <Grid size={12}>
              <Card variant="outlined" id="node-properties">
                <StringTableDisplay
                  tableData={graphData?.qc_results?.node_properties}
                  title="Node Properties"
                />
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <DownloadSection />
    </Container>
  );
}

export default GraphId;
