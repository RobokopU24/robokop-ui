import { Box, Typography } from '@mui/material';
import React from 'react';

interface SidebarProps {
  listOfContents: {id: string, title: string}[];
}

function Sidebar({ listOfContents }: SidebarProps) {
  return (
    <Box
      sx={{
        position: "sticky",
        top: "80px",
        alignSelf: "flex-start",
        minWidth: "200px",
        pr: 4,
        height: "fit-content",
        maxHeight: "80vh",
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "#f1f1f1",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#c1c1c1",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#a8a8a8",
        },
      }}
    >
      <Typography variant="h6" gutterBottom>
        Contents
      </Typography>
      {listOfContents.map((item) => (
        <Box key={item.id} sx={{ mb: 1 }}>
          <a href={`#${item.id}`} style={{ textDecoration: "none", color: "#1976d2" }}>
            {item.title}
          </a>
        </Box>
      ))}
    </Box>
  );
}

export default Sidebar;
