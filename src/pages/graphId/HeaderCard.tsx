import { Card, CardContent, Chip, Stack, Typography, Box } from "@mui/material";
import { Download, OpenInNew } from "@mui/icons-material";
import { formatFileSize } from "../../utils/getFileSize";
import stringUtils from "../../utils/strings";
import { formatBuildDate } from "../../utils/dateTime";
import { GraphMetadataV2, GraphSchemaV2 } from "../../API/graphMetadata";

interface HeaderCardProps {
  displayName: string;
  displayVersion: string;
  displayDescription: string;
  graphData: {
    graph_id: string;
    graph_url?: string;
    neo4j_dump: string;
    final_node_count: number;
    final_edge_count: number;
    build_time?: string;
  };
  v2Metadata?: GraphMetadataV2 | null;
  latestMetadataUrl?: string;
  fileSize?: number;
  setIsSankeyGraphModalOpen: (isOpen: boolean) => void;
  graph_id: string | undefined;
}

function HeaderCard({ displayName, displayVersion, displayDescription, graphData, v2Metadata, latestMetadataUrl, fileSize, setIsSankeyGraphModalOpen, graph_id }: HeaderCardProps) {
  console.log(v2Metadata, "v2Metadata in header card");
  let totalNodeCount = 0;
  let totalEdgeCount = 0;
  if (v2Metadata?.hasPart && Array.isArray(v2Metadata.hasPart)) {
    v2Metadata.hasPart.forEach((part) => {
      if (part["orion:nodeCount"]) {
        totalNodeCount += part["orion:nodeCount"];
      }
      if (part["orion:edgeCount"]) {
        totalEdgeCount += part["orion:edgeCount"];
      }
    });
  }
  return (
    <Card variant="outlined" sx={{ mt: 2 }} id="description">
      <CardContent>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "baseline" }}>
          <Box>
            <Typography variant="h4" component="h1">
              {displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Version <code>{displayVersion}</code>
              {v2Metadata?.dateCreated && (
                <>
                  , built <code>{formatBuildDate(v2Metadata.dateCreated)}</code>
                </>
              )}
              {v2Metadata?.dateModified && (
                <>
                  , modified <code>{formatBuildDate(v2Metadata.dateModified)}</code>
                </>
              )}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`${stringUtils.formatNumber(totalNodeCount)} nodes`} size="small" color="default" variant="outlined" />
            <Chip label={`${stringUtils.formatNumber(totalEdgeCount)} edges`} size="small" color="default" variant="outlined" />
            {v2Metadata?.biolinkVersion && <Chip label={`Biolink ${v2Metadata.biolinkVersion}`} size="small" color="default" variant="outlined" />}
            {v2Metadata?.babelVersion && <Chip label={`Babel ${v2Metadata.babelVersion}`} size="small" color="default" variant="outlined" />}
          </Stack>
        </Stack>

        <Typography variant="body1" sx={{ mt: 2 }}>
          {displayDescription}
        </Typography>

        {/* {v2Metadata?.keywords && v2Metadata.keywords.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
            {v2Metadata.keywords.map((keyword, index) => (
              <Chip key={index} label={keyword} size="small" variant="filled" />
            ))}
          </Stack>
        )} */}

        <Stack direction={"row"} justifyContent={"space-between"}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }} alignItems="center">
            {/* {graphData.graph_url && (
              <>
                <a className="external-links" href={graphData.graph_url} target="_blank" rel="noopener noreferrer">
                  {graphData.graph_id === "robokopkg" ? "Neo4j Browser" : "Knowledge Source"} <OpenInNew sx={{ fontSize: "1.25rem", ml: 0.5 }} />
                </a>
              </>
            )}
            <p>•</p> */}
            <a className="external-links" href={`https://robokop-automat.apps.renci.org/#/${graph_id}`} target="_blank" rel="noopener noreferrer">
              Automat API <OpenInNew sx={{ fontSize: "1.25rem", ml: 0.5 }} />
            </a>
            <p>•</p>
            {latestMetadataUrl && (
              <a className="external-links" href={latestMetadataUrl} target="_blank" rel="noopener noreferrer">
                Latest Metadata <OpenInNew sx={{ fontSize: "1.25rem", ml: 0.5 }} />
              </a>
            )}
            {v2Metadata?.license && (
              <>
                <p>•</p>
                <a className="external-links" href={v2Metadata.license} target="_blank" rel="noopener noreferrer">
                  License <OpenInNew sx={{ fontSize: "1.25rem", ml: 0.5 }} />
                </a>
              </>
            )}
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
            {/* <a
              className="details-card-button"
              href={graphData.neo4j_dump}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                maxWidth: "300px",
              }}
            >
              <span>Download Graph ({formatFileSize(fileSize || 0, 2)})</span> <Download />
            </a> */}
            <button
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                maxWidth: "200px",
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
  );
}

export default HeaderCard;
