import React from "react";
import { Card, CardContent, Grid, Link as MuiLink, List, ListItem, ListItemText, Typography } from "@mui/material";
import { OpenInNew } from "@mui/icons-material";
import { GraphMetadataV2 } from "../../API/graphMetadata";

interface ConformanceSchemaProps {
  v2Metadata: GraphMetadataV2;
}

function ConformanceSchema({ v2Metadata }: ConformanceSchemaProps) {
  return (
    <>
      {(v2Metadata?.conformsTo?.length > 0 || v2Metadata?.schema) && (
        <Grid size={12} id="conformance-schema">
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Conformance & Schema
              </Typography>
              <Grid container spacing={2}>
                {v2Metadata?.conformsTo?.length > 0 && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Conforms To
                    </Typography>
                    <List dense>
                      {v2Metadata.conformsTo.map((standard, index) => (
                        <ListItem key={index} disablePadding>
                          <ListItemText
                            primary={
                              <MuiLink href={standard["@id"]} target="_blank" rel="noopener noreferrer">
                                {standard.name}
                              </MuiLink>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
                {v2Metadata?.schema && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Data Schema
                    </Typography>
                    <Typography variant="body2">{v2Metadata.schema.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {v2Metadata.schema.description}
                    </Typography>
                    <MuiLink href={v2Metadata.schema["@id"]} target="_blank" rel="noopener noreferrer" sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      View Schema <OpenInNew sx={{ fontSize: "1rem", ml: 0.5 }} />
                    </MuiLink>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}
    </>
  );
}

export default ConformanceSchema;
