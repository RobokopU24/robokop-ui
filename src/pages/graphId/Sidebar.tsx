import { Box, Typography } from '@mui/material'
import React from 'react'
import { captureEvent } from '../../utils/analytics'

interface SidebarProps {
  listOfContents: { id: string; title: string }[]
}

function Sidebar({ listOfContents }: SidebarProps) {
  return (
    <Box
      sx={{
        position: 'sticky',
        top: '80px',
        alignSelf: 'flex-start',
        minWidth: '200px',
        pr: 4,
        height: 'fit-content',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
      <Typography variant='h6' gutterBottom>
        Contents
      </Typography>
      {listOfContents.map((item) => (
        <Box key={item.id} sx={{ mb: 1 }}>
          <a
            href={`#${item.id}`}
            style={{ textDecoration: 'none', color: '#1976d2' }}
            onClick={() => captureEvent('graph_section_selected', { section: item.id })}
          >
            {item.title}
          </a>
        </Box>
      ))}
    </Box>
  )
}

export default Sidebar
