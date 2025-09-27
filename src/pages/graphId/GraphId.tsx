import React, { useEffect, useState } from 'react';
import Download from '@mui/icons-material/Download';
import OpenInNew from '@mui/icons-material/OpenInNew';
import {
  Button,
  ButtonGroup,
  Container,
  Grid,
  Paper,
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

interface GraphIdProps {
  graphData: any;
  fileSize?: number | null;
}

function GraphId({ graphData, fileSize }: GraphIdProps) {
  return (
    <Grid container spacing={4} sx={{ width: '100%', maxWidth: 1600, my: 8, mx: 'auto' }}>
      <Grid size={8}>
        <Typography variant="body2" component={Link} to="/explore/graphs">
          ← View all graphs
        </Typography>
        <HeadingWrapper>
          <Typography variant="h4" component="h1" my={2}>
            {graphData.graph_name}
          </Typography>
          <span>
            {stringUtils.formatNumber(graphData.final_node_count)} nodes,{' '}
            {stringUtils.formatNumber(graphData.final_edge_count)} edges
          </span>
        </HeadingWrapper>
        <Typography variant="body1">{graphData.graph_description}</Typography>
        <ButtonGroup color="inherit" sx={{ mt: 1 }}>
          {graphData.graph_url && (
            <Button
              endIcon={<OpenInNew />}
              href={graphData.graph_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Graph website
            </Button>
          )}
          <Button endIcon={<Download />} component={'a'} href={graphData.neo4j_dump}>
            Download Graph {fileSize !== null && ` (${formatFileSize(fileSize || 0, 1)})`}
          </Button>
        </ButtonGroup>
        <p>
          Graph version <code>{graphData.graph_version}</code>, built{' '}
          <code>{new Date(graphData.build_time).toLocaleDateString()}</code>
        </p>

        <Hr />

        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 2 }}>
          Predicates Counts
        </Typography>
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{ border: `1px solid rgba(0, 0, 0, 0.24)` }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Predicate</TableCell>
                <TableCell align="right">Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Object.entries(graphData.qc_results.predicate_totals)]
                .sort((a: any, b: any) => b[1] - a[1])
                .map(([predicate, count]) => (
                  <TableRow
                    key={predicate}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {predicate}
                    </TableCell>
                    <TableCell align="right">{(count as number).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* {
      Object.entries(graphData.qc_results.predicates_by_knowledge_sources).map(([ks, counts]: any) => (
        <Fragment key={ks}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 2 }}>Predicates in {ks}</Typography>
          <TableContainer component={Paper} elevation={2} sx={{ border: `1px solid rgba(0, 0, 0, 0.24)` }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Predicate</TableCell>
                  <TableCell align="right">Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...Object.entries(counts)].sort((a: any, b: any) => b[1] - a[1]).map(([predicate, count]) => (
                  <TableRow
                    key={predicate}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {predicate}
                    </TableCell>
                    <TableCell align="right">{(count as number).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Fragment>
      ))
    } */}

        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 2 }}>
          Node CURIE Prefixes
        </Typography>
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{ border: `1px solid rgba(0, 0, 0, 0.24)` }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Prefix</TableCell>
                <TableCell align="right">Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Object.entries(graphData.qc_results.node_curie_prefixes)]
                .sort((a: any, b: any) => b[1] - a[1])
                .map(([predicate, count]) => (
                  <TableRow
                    key={predicate}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {predicate}
                    </TableCell>
                    <TableCell align="right">{(count as number).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 2 }}>
          Edge Properties
        </Typography>
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{ border: `1px solid rgba(0, 0, 0, 0.24)` }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Property</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {graphData.qc_results.edge_properties.map((property: any) => (
                <TableRow key={property} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    {property}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* <pre>{JSON.stringify(graphData, null, 2)}</pre> */}
      </Grid>
      <Grid size={4}>
        <DownloadSection />
      </Grid>
    </Grid>
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
