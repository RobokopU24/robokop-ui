import { Card, CardContent, Grid, Link as MuiLink, Stack, Typography, Box } from "@mui/material";
import { GraphMetadataV2 } from "../../API/graphMetadataV2";

interface ContactPointProps {
  v2Metadata: GraphMetadataV2;
}

function ContactPoint({ v2Metadata }: ContactPointProps) {
  return (
    <>
      {v2Metadata?.contactPoint?.length > 0 && (
        <Grid size={12} id="contact-points">
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contact Points
              </Typography>
              <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
                {v2Metadata.contactPoint.map((contact, index) => (
                  <Box key={index}>
                    <Typography variant="subtitle2" sx={{ textTransform: "capitalize" }}>
                      {contact.contactType}
                    </Typography>
                    <Typography variant="body2">
                      <MuiLink href={`mailto:${contact.email}`}>{contact.email}</MuiLink>
                    </Typography>
                    {contact.url && (
                      <MuiLink href={contact.url} target="_blank" rel="noopener noreferrer" variant="body2">
                        Issues/Support
                      </MuiLink>
                    )}
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      )}
    </>
  );
}

export default ContactPoint;
