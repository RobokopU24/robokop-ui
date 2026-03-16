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
          width: 1000,
          maxHeight: '80vh',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <h2>Predicate Count Details</h2>
          <IconButton onClick={onClose} style={{ alignSelf: 'flex-end' }}>
            <Close />
          </IconButton>
        </Box>
        <p>
          To highlight connections in the Sankey diagram, click on any of the boxes to toggle
          highlight mode on or off.
        </p>
        <Sankey data={graphData} height={3400} />
      </Box>
    </Modal>
  );
}

export default SankeyGraphModal;
