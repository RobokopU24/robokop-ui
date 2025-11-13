import React from 'react';
import { Box, Modal } from '@mui/material';

function SummaryModal({
  isOpen,
  onModalClose,
  links,
}: {
  isOpen: boolean;
  onModalClose: () => void;
  links: string[];
}) {
  return (
    <Modal
      open={isOpen}
      onClose={onModalClose}
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
        }}
      >
        <div>Summary of Publications</div>
        <ul>
          {links.map((link, index) => (
            <li key={index}>
              <a href={link} target="_blank" rel="noreferrer">
                {link}
              </a>
            </li>
          ))}
        </ul>
      </Box>
    </Modal>
  );
}

export default SummaryModal;
