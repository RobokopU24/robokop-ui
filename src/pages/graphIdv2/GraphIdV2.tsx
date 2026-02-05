import React from "react";
import Download from "@mui/icons-material/Download";
import OpenInNew from "@mui/icons-material/OpenInNew";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion, AccordionDetails, AccordionSummary, Box, Breadcrumbs, Card, CardContent, Chip, Container, Divider, Grid, List, ListItem, ListItemText, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Link as MuiLink } from "@mui/material";
import { Link, useParams } from "@tanstack/react-router";
import { formatFileSize } from "../../utils/getFileSize";
import stringUtils from "../../utils/strings";
import DownloadSection from "../graphId/Download";
import { useQuery } from "@tanstack/react-query";
import { fileRoutes } from "../../API/routes";
import axios from "axios";
import PredicateCount from "../graphId/PredicateCount";
import NodeCuriePrefixes from "../graphId/NodeCuriePrefixes";
import PrimaryKnowledgeSources from "../graphId/PrimaryKnowledgeSources";
import StringTableDisplay from "../graphId/StringTableDisplay";
import SidebarV2 from "./SidebarV2";
import "../graphId/GraphId.css";
import SankeyGraphModal from "../graphId/SankeyGraphModal";
import { formatBuildDate } from "../../utils/dateTime";
import { getGraphMetadataDownloads } from "../../functions/graphFunctions";
import { GraphMetadataV2 } from "../../API/graphMetadataV2";
import BreadcrumbsComponent from "./BreadcrumbsComponent";
import HeaderCard from "./HeaderCard";
import CreatorsFunders from "./CreatorsFunders";
import ContactPoint from "./ContactPoint";
import ConformanceSchema from "./ConformanceSchema";
import DataSource from "./DataSource";

interface GraphIdV2Props {
  graphData: any;
  v2Metadata: GraphMetadataV2;
}

function GraphIdV2({ graphData, v2Metadata }: GraphIdV2Props) {
  const { graph_id } = useParams({ strict: false });
  const [isSankeyGraphModalOpen, setIsSankeyGraphModalOpen] = React.useState(false);
  const { data: fileSize } = useQuery({
    queryKey: ["graph-metadata", graphData.graph_id, "file-size"],
    queryFn: async () => {
      const results = await axios.post(fileRoutes.fileSize, {
        fileUrl: graphData.neo4j_dump,
      });
      return results.data.size;
    },
  });
  const { data: downloadData } = useQuery({
    queryKey: ["graph-metadata", graph_id, "download"],
    queryFn: () => getGraphMetadataDownloads(graph_id!),
  });

  let nodeSet: Set<string> = new Set();
  let links: Array<{ source: string; target: string; value: number }> = [];
  for (const [key, value] of Object.entries(graphData?.qc_results?.predicates_by_knowledge_source || {})) {
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

  const latestMetadataUrl = downloadData?.data?.at(-1)?.links?.filter((link: any) => link.url.includes("meta.json"))[0]?.url;

  const displayName = v2Metadata?.name ?? graphData.graph_name;
  const displayDescription = v2Metadata?.description ?? graphData.graph_description;
  const displayVersion = v2Metadata?.version ?? graphData?.graph_version;

  return (
    <Container className="graph-id-v2-container" sx={{ my: 6, maxWidth: "1920px !important", display: "flex", gap: 4 }}>
      <SidebarV2 />
      <Box>
        <SankeyGraphModal isOpen={isSankeyGraphModalOpen} onClose={() => setIsSankeyGraphModalOpen(false)} graphData={graphDataset} />
        <BreadcrumbsComponent displayName={displayName} />
        <HeaderCard displayName={displayName} displayVersion={displayVersion} displayDescription={displayDescription} graphData={graphData} v2Metadata={v2Metadata} latestMetadataUrl={latestMetadataUrl} fileSize={fileSize} setIsSankeyGraphModalOpen={setIsSankeyGraphModalOpen} />

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
                <StringTableDisplay tableData={graphData?.qc_results?.edge_properties || []} title="Edge Properties" />
              </Card>
            </Grid>
            <Grid size={12}>
              <Card variant="outlined" id="primary-knowledge-sources">
                <PrimaryKnowledgeSources graphData={graphData} />
              </Card>
            </Grid>
            <Grid size={12}>
              <Card variant="outlined" id="aggregator-knowledge-sources">
                <StringTableDisplay tableData={graphData?.qc_results?.aggregator_knowledge_sources} title="Aggregator Knowledge Sources" />
              </Card>
            </Grid>
            <Grid size={12}>
              <Card variant="outlined" id="node-properties">
                <StringTableDisplay tableData={graphData?.qc_results?.node_properties} title="Node Properties" />
              </Card>
            </Grid>
            <DataSource v2Metadata={v2Metadata} />
            <CreatorsFunders v2Metadata={v2Metadata} />
            <ContactPoint v2Metadata={v2Metadata} />
            <ConformanceSchema v2Metadata={v2Metadata} />
          </Grid>
        </Grid>
      </Box>
      <DownloadSection />
    </Container>
  );
}

export default GraphIdV2;
