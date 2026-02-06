import { Card, CardContent, Grid, Link as MuiLink, List, ListItem, ListItemText, Typography } from "@mui/material";
import { GraphMetadataV2 } from "../../API/graphMetadataV2";

interface CreatorsFundersProps {
  v2Metadata: GraphMetadataV2;
}

function CreatorsFunders({ v2Metadata }: CreatorsFundersProps) {
  return (
    <>
      {(v2Metadata?.creator?.length > 0 || v2Metadata?.funder?.length > 0) && (
        <Grid size={12} id="creators-funders">
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Creators & Funders
              </Typography>
              <Grid container spacing={2}>
                {v2Metadata?.creator?.length > 0 && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Creators
                    </Typography>
                    <List dense>
                      {v2Metadata.creator.map((creator, index) => (
                        <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                          <ListItemText
                            primary={creator.name}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.secondary">
                                  {creator["@type"]}
                                </Typography>
                                {creator.url && (
                                  <>
                                    {" • "}
                                    <MuiLink href={creator.url} target="_blank" rel="noopener noreferrer">
                                      Website
                                    </MuiLink>
                                  </>
                                )}
                                {creator.email && (
                                  <>
                                    {" • "}
                                    <MuiLink href={`mailto:${creator.email}`}>{creator.email}</MuiLink>
                                  </>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
                {v2Metadata?.funder?.length > 0 && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Funders
                    </Typography>
                    <List dense>
                      {v2Metadata.funder.map((funder, index) => (
                        <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                          <ListItemText
                            primary={
                              <MuiLink href={funder.url} target="_blank" rel="noopener noreferrer">
                                {funder.name}
                              </MuiLink>
                            }
                            secondary={funder["@id"]}
                          />
                        </ListItem>
                      ))}
                    </List>
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

export default CreatorsFunders;
