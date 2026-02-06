import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Link as MuiLink,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { OpenInNew } from "@mui/icons-material";
import { GraphMetadataV2 } from "../../API/graphMetadataV2";

interface DataSourceProps {
  v2Metadata: GraphMetadataV2;
}

function DataSource({ v2Metadata }: DataSourceProps) {
  return (
    <>
      {v2Metadata?.isBasedOn?.length > 0 && (
        <Grid size={12} id="data-sources">
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Data Sources ({v2Metadata.isBasedOn.length})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This knowledge graph integrates data from the following sources:
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Name</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Version</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Description</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Links</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {v2Metadata.isBasedOn.map((source, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {source.url ? (
                              <MuiLink href={source.url} target="_blank" rel="noopener noreferrer" title="Source URL">
                                {source.name || source.id}{' '}
                                <OpenInNew fontSize="small" sx={{ transform: "scale(0.85) translateY(5px)" }}/>
                              </MuiLink>
                            ) : source.name || source.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={source.version}
                            size="small"
                            variant="outlined"
                            sx={{ color: "#848484" }}
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 800 }}>
                          <Typography variant="body2">
                            {source.description || "No description available"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            {source.citation && (
                              <MuiLink
                                href={source.citation[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Citation"
                              >
                                DOI
                              </MuiLink>
                            )}
                            {source.license && (
                              <MuiLink
                                href={source.license}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="License"
                              >
                                License
                              </MuiLink>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Accordion variant="outlined" sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">Full Citations</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {v2Metadata.isBasedOn
                      .filter(
                        (source) =>
                          Array.isArray(source.citation) &&
                          source.citation.length >= 2 &&
                          source.citation.every((c) => c.trim() !== ""),
                      )
                      .map((source, index, arr) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <span>
                                  {source.name}{" "}
                                  <a
                                    href={source.citation[0]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {source.citation[0]}
                                  </a>
                                </span>
                              }
                              secondary={source.citation[1]}
                              secondaryTypographyProps={{
                                sx: { whiteSpace: "pre-wrap" },
                              }}
                            />
                          </ListItem>
                          {index < arr.length - 1 && <Divider component="li" />}
                        </React.Fragment>
                      ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        </Grid>
      )}
    </>
  );
}

export default DataSource;
