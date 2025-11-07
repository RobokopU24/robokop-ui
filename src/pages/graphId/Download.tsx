import { useParams } from '@tanstack/react-router';
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Link,
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardHeader,
  CardContent,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  OpenInNew as OpenInNewIcon,
  CloudDownload as CloudDownloadIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import API from '../../API/routes';
import { formatFileSize } from '../../utils/getFileSize';

function DownloadSection() {
  const { graph_id } = useParams({ strict: false });
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const { data: downloadData, isLoading: isLoadingDownload } = useQuery({
    queryKey: ['graph-metadata', graph_id, 'download'],
    queryFn: async () => {
      const res = await axios.get(API.fileRoutes.base + `/${graph_id}`);
      return res.data;
    },
  });

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const renderSkeleton = () => (
    <Box>
      {Array(5)
        .fill('')
        .map((_, i) => (
          <Skeleton key={i} variant="rounded" height={48} sx={{ mb: 2 }} />
        ))}
    </Box>
  );

  const renderEmptyState = () => (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        textAlign: 'center',
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <CloudDownloadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No download files available
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Check back later for available downloads
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ mt: 5 }} id="download">
      <Card variant="outlined">
        <CardHeader title="Prior releases" sx={{ pb: 0 }} />
        <CardContent>
          <Box>
            {isLoadingDownload ? (
              renderSkeleton()
            ) : downloadData?.data?.length > 0 ? (
              <Box>
                {[...downloadData.data].reverse().map((file: any, index: number) => (
                  <Accordion
                    key={index}
                    expanded={expanded === file.id}
                    onChange={handleChange(file.id)}
                    sx={{
                      mb: 2,
                      '&:before': { display: 'none' },
                      '&.Mui-expanded': { margin: '0 0 16px 0' },
                      borderRadius: '4px',
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`${file.id}-content`}
                      id={`${file.id}-header`}
                      sx={{
                        borderRadius: '12px',
                        '&.Mui-expanded': {
                          borderRadius: '12px 12px 0 0',
                        },
                      }}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        width="100%"
                        py={1}
                      >
                        {/* <Typography variant="h6" component="span" fontWeight={400}>
                    {file.id}, {file.version}, build date {file.build_date || "Unknown"}
                  </Typography> */}
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            Build Date:{' '}
                            {file.build_date
                              ? new Date(file.build_date).toLocaleDateString()
                              : 'Unknown'}
                          </Typography>

                          <Typography variant="body2" color="text.secondary">
                            Graph ID: {file.id}
                          </Typography>
                        </Box>
                        {/* <Box>
                          {file.version && (
                            <Chip
                              label={file.version}
                              size="small"
                              color="primary"
                              sx={{ mr: 1, height: 24 }}
                            />
                          )}
                        </Box> */}
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      {file?.links?.length > 0 ? (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>
                                  <Typography variant="subtitle2" fontWeight="bold">
                                    File Name
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="subtitle2" fontWeight="bold">
                                    Size
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="subtitle2" fontWeight="bold">
                                    Upload Date
                                  </Typography>
                                </TableCell>
                                {/* <TableCell align="center">
                            <Typography variant="subtitle2" fontWeight="bold">
                              Action
                            </Typography>
                          </TableCell> */}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {file.links.map((link: any, idx: number) => (
                                <TableRow
                                  key={idx}
                                  sx={{
                                    '&:hover': {
                                      backgroundColor: 'action.hover',
                                    },
                                  }}
                                >
                                  <TableCell>
                                    <Link
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        textDecoration: 'none',
                                        color: 'primary.main',
                                        '&:hover': {
                                          textDecoration: 'underline',
                                        },
                                      }}
                                    >
                                      <OpenInNewIcon fontSize="small" />
                                      <Typography variant="body2" fontWeight={500}>
                                        {link.name || 'Download'}
                                      </Typography>
                                    </Link>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                      {link.size ? formatFileSize(link.size) : 'Unknown'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                      {link.time
                                        ? new Date(link.time).toLocaleDateString()
                                        : 'Unknown'}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            No download links available for this version
                          </Typography>
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            ) : (
              renderEmptyState()
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default DownloadSection;
