import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Box, Modal, Skeleton } from '@mui/material';
import useAnswerStore from '../useAnswerStore';
import { useQuery } from '@tanstack/react-query';
import { llmRoutes } from '../../../API/routes';
import { useQueryBuilderContext } from '../../../context/queryBuilder';
import Markdown from 'react-markdown';
import { transformKGToMinimalDynamic } from '../resultsTable/metaDataTransformation';

interface SummarizeWithAIModalProps {
  isOpen: boolean;
  onModalClose: () => void;
  answerStore: ReturnType<typeof useAnswerStore>;
}

function SummarizeWithAIModal({ isOpen, onModalClose, answerStore }: SummarizeWithAIModalProps) {
  const minifiedJsonArray = useMemo(() => {
    if (!answerStore.message.results || !answerStore.message.knowledge_graph) {
      return [];
    }

    const first10Results = answerStore.message.results.slice(0, 10);

    return first10Results.map((result) => {
      const resultWithKG = {
        knowledge_graph: answerStore.message.knowledge_graph,
        result,
      };
      return transformKGToMinimalDynamic(resultWithKG);
    });
  }, [answerStore.message.results, answerStore.message.knowledge_graph]);

  console.log('Transformed first 10 rows:', minifiedJsonArray);

  const [streamedText, setStreamedText] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen) setStreamedText('');
  }, [isOpen]);

  const { refetch } = useQuery({
    queryKey: ['summaryLinks', answerStore.message],
    enabled: false,
    queryFn: async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const response = await fetch(llmRoutes.summarizeGraph, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ graphs: minifiedJsonArray }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let full = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          const chunk = decoder.decode(value);
          full += chunk;
          setStreamedText((prev) => prev + chunk);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Stream aborted');
          return '';
        }
        throw error;
      } finally {
        reader.releaseLock();
      }

      return full;
    },
  });

  useEffect(() => {
    if (isOpen) {
      refetch();
    } else {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    }
  }, [isOpen, refetch]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
          p: 4,
          borderRadius: 1,
          width: 700,
          maxHeight: '80vh',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <h2 style={{ marginBottom: '1em' }}>Summarize with AI</h2>
        {streamedText ? (
          <Markdown
            components={{
              h2: ({ node, ...props }) => <h2 style={{ marginTop: '0.5em' }} {...props} />,
              h3: ({ node, ...props }) => <h3 style={{ marginTop: '0.5em' }} {...props} />,
              p: ({ node, ...props }) => (
                <p style={{ marginTop: '0.5em', marginBottom: '0.5em' }} {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul
                  style={{ paddingLeft: '1.5em', marginTop: '0.5em', marginBottom: '0.5em' }}
                  {...props}
                />
              ),
            }}
          >
            {streamedText}
          </Markdown>
        ) : (
          <>
            {Array(10).fill(<Skeleton variant="rounded" width="100%" height={20} sx={{ mb: 1 }} />)}
          </>
        )}
      </Box>
    </Modal>
  );
}

export default SummarizeWithAIModal;
