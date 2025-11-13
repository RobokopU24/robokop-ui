import React, { useEffect, useState } from 'react';
import { Box, Modal } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { llmRoutes } from '../../../API/routes';
import Markdown from 'react-markdown';

function SummaryModal({
  isOpen,
  onModalClose,
  links,
}: {
  isOpen: boolean;
  onModalClose: () => void;
  links: string[];
}) {
  const [streamedText, setStreamedText] = useState<string>('');
  useEffect(() => {
    if (isOpen) setStreamedText('');
  }, [isOpen]);

  const { refetch, isFetching } = useQuery({
    queryKey: ['summaryLinks', links],
    enabled: false,
    queryFn: async () => {
      const response = await fetch(llmRoutes.summarizeLinks, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: links }),
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const chunk = decoder.decode(value);
        full += chunk;
        setStreamedText((prev) => prev + chunk);
      }
      return full;
    },
  });
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

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
        <Markdown>{streamedText || (isFetching ? 'Loading...' : '')}</Markdown>
      </Box>
    </Modal>
  );
}

export default SummaryModal;
