import { Box, Card, Container, Grid } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import axios from "axios";
import React from "react";
import { GraphMetadataV2 } from "../../API/graphMetadata";
import { fileRoutes } from "../../API/routes";
import { getGraphMetadataDownloads } from "../../functions/graphFunctions";
import DownloadSection from "../graphId/Download";
import "../graphId/GraphId.css";
import NodeCuriePrefixes from "../graphId/NodeCuriePrefixes";
import PredicateCount from "../graphId/PredicateCount";
import PrimaryKnowledgeSources from "../graphId/PrimaryKnowledgeSources";
import SankeyGraphModal from "../graphId/SankeyGraphModal";
import StringTableDisplay from "../graphId/StringTableDisplay";
import BreadcrumbsComponent from "./BreadcrumbsComponent";
import ConformanceSchema from "./ConformanceSchema";
import ContactPoint from "./ContactPoint";
import CreatorsFunders from "./CreatorsFunders";
import DataSource from "./DataSource";
import HeaderCard from "./HeaderCard";
import SidebarV2 from "./Sidebar";

const COMMON_SIDEBAR_ITEMS = [
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
];

const V2_METADATA_SIDEBAR_ITEMS = [
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

interface GraphIdV2Props {
  graphData: any;
  v2Metadata: GraphMetadataV2 | null;
}

function GraphId({ graphData, v2Metadata }: GraphIdV2Props) {
  const { graph_id } = useParams({ strict: false });
  const [isSankeyGraphModalOpen, setIsSankeyGraphModalOpen] =
    React.useState(false);
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
  for (const [key, value] of Object.entries(
    graphData?.qc_results?.predicates_by_knowledge_source || {},
  )) {
    nodeSet.add(key);
    for (const [predicate, count] of Object.entries(
      value as Record<string, number>,
    )) {
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
    ?.links?.filter((link: any) => link.url.includes("meta.json"))[0]?.url;

  const displayName = v2Metadata?.name ?? graphData.graph_name;
  const displayDescription =
    v2Metadata?.description ?? graphData.graph_description;
  const displayVersion = v2Metadata?.version ?? graphData?.graph_version;

  const sidebarItems = v2Metadata !== null && Object.entries(v2Metadata).length > 0
    ? [...COMMON_SIDEBAR_ITEMS, ...V2_METADATA_SIDEBAR_ITEMS]
    : COMMON_SIDEBAR_ITEMS;

  return (
    <Container
      className="graph-id-v2-container"
      sx={{ my: 6, maxWidth: "1920px !important", display: "flex", gap: 4 }}
    >
      <SidebarV2 listOfContents={sidebarItems} />
      <Box>
        <SankeyGraphModal
          isOpen={isSankeyGraphModalOpen}
          onClose={() => setIsSankeyGraphModalOpen(false)}
          graphData={graphDataset}
        />
        <BreadcrumbsComponent displayName={displayName} />
        <HeaderCard
          displayName={displayName}
          displayVersion={displayVersion}
          displayDescription={displayDescription}
          graphData={graphData}
          v2Metadata={v2Metadata}
          latestMetadataUrl={latestMetadataUrl}
          fileSize={fileSize}
          setIsSankeyGraphModalOpen={setIsSankeyGraphModalOpen}
        />

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
                  tableData={
                    graphData?.qc_results?.aggregator_knowledge_sources
                  }
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

            {v2Metadata !== null && (
              <>
                <DataSource v2Metadata={v2Metadata} />
                <CreatorsFunders v2Metadata={v2Metadata} />
                <ContactPoint v2Metadata={v2Metadata} />
                <ConformanceSchema v2Metadata={v2Metadata} />
              </>
            )}
          </Grid>
        </Grid>
      </Box>
      <DownloadSection />
    </Container>
  );
}

export default GraphId;
