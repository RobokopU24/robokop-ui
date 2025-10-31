import React from 'react';
import { Box, IconButton, Modal } from '@mui/material';
import Close from '@mui/icons-material/Close';
import { Sankey } from './Sankey';

function SankeyGraphModal({
  isOpen,
  onClose,
  graphData,
}: {
  isOpen: boolean;
  onClose: () => void;
  graphData: any;
}) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'background.paper',
          p: 2,
          borderRadius: 1,
          width: 700,
          maxHeight: '80vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#c1c1c1', borderRadius: '4px' },
          '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#a8a8a8' },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <h2>Predicate Count Details</h2>
          <IconButton onClick={onClose} style={{ alignSelf: 'flex-end' }}>
            <Close />
          </IconButton>
        </Box>
        <p>To highlight connections in the Sankey diagram, click on any of the boxes to toggle to highlight mode on or off.</p>
        <Sankey data={graphData} height={3400} />
      </Box>
    </Modal>
  );
}

export default SankeyGraphModal;
