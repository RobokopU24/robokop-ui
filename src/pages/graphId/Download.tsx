import { useParams } from "@tanstack/react-router";
import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import API from "../../API/routes";
import { Chip, Container, Link, Skeleton } from "@mui/material";
import { formatFileSize } from "../../utils/getFileSize";

const DOWNLOAD_LINK = "https://stars.renci.org/var/plater/bl-3.5.4/BINDING_Automat/6ff4faf347a97f7f/BINDING_Automat.meta.json";

function DownloadSection() {
  const { graph_id } = useParams({ strict: false });
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const { data: downloadData, isLoading: isLoadingDownload } = useQuery({
    queryKey: ["graph-metadata", graph_id, "download"],
    queryFn: async () => {
      const res = await axios.get(API.fileRoutes.base + `/${graph_id}`);
      return res.data;
    },
  });

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };
  return (
    <div>
      <Typography variant="h5" component="h2" mb={2} sx={{ fontWeight: 500 }}>
        Download Options
      </Typography>
      {isLoadingDownload
        ? Array(5)
            .fill("")
            .map((_, i) => <Skeleton variant="rounded" width={"100%"} height={80} key={i} sx={{ mb: 1 }} />)
        : downloadData?.data?.length > 0 &&
          [...downloadData.data].reverse().map((file: any, index: number) => (
            <Accordion key={index} expanded={expanded === file.id} onChange={handleChange(file.id)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${file.id}-content`} id={`${file.id}-header`}>
                <Typography component="span" sx={{ width: "33%", flexShrink: 0 }}>
                  {file.version}
                </Typography>
                <Chip label={file.id} />
              </AccordionSummary>
              <AccordionDetails>
                {file?.links?.length > 0 &&
                  file.links.map((link: any, idx: number) => (
                    <Container key={idx} sx={{ mb: 1 }}>
                      <Link href={link.url} target="_blank" rel="noopener">
                        {link.name || "Download"}
                      </Link>
                      {link.size && ` - ${formatFileSize(link.size)}`}
                      {link.time && ` - uploaded ${new Date(link.time).toLocaleDateString()}`}
                    </Container>
                  ))}
              </AccordionDetails>
            </Accordion>
          ))}
    </div>
  );
}

export default DownloadSection;
