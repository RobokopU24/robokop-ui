import React from 'react'
import { useParams } from '@tanstack/react-router'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Link,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { OpenInNew as OpenInNewIcon, Update as UpdateIcon } from '@mui/icons-material'
import { ReleasesData } from '../../API/graphRegistry'

export interface ReleasesProps {
  releases?: ReleasesData[]
  loading?: boolean
}

function Releases({ releases, loading }: ReleasesProps) {
  console.log('releases', { releases, loading })
  const { graph_id, graph_version } = useParams({ strict: false })

  const isViewingVersion = (version: string, isLatest: boolean) => {
    if (!graph_version) return false
    if (graph_version === 'latest') return isLatest
    return graph_version === version
  }

  const renderSkeleton = () => (
    <Box>
      {Array(4)
        .fill('')
        .map((_, i) => (
          <Skeleton key={i} variant='rounded' height={44} width={360} sx={{ mb: 1.5 }} />
        ))}
    </Box>
  )

  const renderEmptyState = () => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        textAlign: 'center',
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <UpdateIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1 }} />
      <Typography variant='subtitle1' color='text.secondary' gutterBottom>
        No releases available
      </Typography>
      <Typography variant='body2' color='text.secondary'>
        Release history will appear here when available
      </Typography>
    </Paper>
  )

  return (
    <Box sx={{ marginTop: '36px', minWidth: '400px' }} id='releases'>
      <Card variant='outlined'>
        <CardHeader title='Releases' sx={{ pb: 0 }} />
        <CardContent>
          {loading ? (
            renderSkeleton()
          ) : releases && releases.length > 0 ? (
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant='subtitle2' fontWeight='bold'>
                        Version
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Typography variant='subtitle2' fontWeight='bold'>
                        Date
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {releases?.map((release) => {
                    const isActiveVersion = isViewingVersion(release.version, release.latest)

                    return (
                      <TableRow
                        key={release.version}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <TableCell>
                          <Link
                            href={`/graphs/${graph_id}/${release.version}`}
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
                            <OpenInNewIcon fontSize='small' />
                            <Typography variant='body2' fontWeight={isActiveVersion ? 700 : 500}>
                              {release.version}
                            </Typography>
                            {release.latest ? (
                              <Chip
                                label='Latest'
                                size='small'
                                color='success'
                                variant='outlined'
                              />
                            ) : null}
                          </Link>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography variant='body2' color='text.secondary'>
                            {new Date(release.release_date).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            renderEmptyState()
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default Releases
