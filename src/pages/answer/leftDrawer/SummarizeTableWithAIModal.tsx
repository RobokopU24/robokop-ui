import React, { useEffect, useRef, useState, useMemo, useContext } from 'react';
import { Box, Modal, Skeleton } from '@mui/material';
import useAnswerStore from '../useAnswerStore';
import { useQuery } from '@tanstack/react-query';
import { llmRoutes } from '../../../API/routes';
import Markdown from 'react-markdown';
import { graphQueryContext } from './graphQueryContext';
import BiolinkContext from '../../../context/biolink';
import { BiolinkContextType } from '../../queryBuilder/textEditor/types';

interface SummarizeTableWithAIModalProps {
  isOpen: boolean;
  onModalClose: () => void;
  answerStore: ReturnType<typeof useAnswerStore>;
}

function SummarizeTableWithAIModal({
  isOpen,
  onModalClose,
  answerStore,
}: SummarizeTableWithAIModalProps) {
  console.log('Answer Store Table Headers:', answerStore);
  const tableData = useMemo(() => {
    if (!answerStore.message.results || !answerStore.tableHeaders.length) {
      return { headers: [], rows: [] };
    }

    const headers = answerStore.tableHeaders.map((header) => ({
      id: header.id,
      label: header.Header,
      color: header.color,
      width: header.width,
    }));

    const rows = answerStore.message.results.map((result, index) => {
      const row: any = { _rowId: index };

      answerStore.tableHeaders.forEach((header) => {
        let cellValue;

        if (typeof header.accessor === 'function') {
          cellValue = header.accessor(result);
        } else if (typeof header.accessor === 'string') {
          cellValue = result[header.accessor];
        } else {
          cellValue = '';
        }

        const displayValue = header.Cell ? header.Cell({ value: cellValue }) : cellValue;

        row[header.id] = displayValue;
      });

      return row;
    });

    const maxRowsLimit = 150;
    if (rows.length > maxRowsLimit) {
      const sorted = [...rows].sort((a, b) => b.score - a.score);
      const highCutoff = Math.ceil(sorted.length * 0.2);
      const lowCutoff = Math.floor(sorted.length * 0.8);
      const high = sorted.slice(0, highCutoff);
      const mid = sorted.slice(highCutoff, lowCutoff);
      const low = sorted.slice(lowCutoff);
      const sample = (arr: any[], n: number) =>
        arr.length <= n
          ? arr
          : arr.filter((_, i) => i % Math.ceil(arr.length / n) === 0).slice(0, n);
      const highSampled = sample(high, Math.ceil(maxRowsLimit * 0.25));
      const midSampled = sample(mid, Math.floor(maxRowsLimit * 0.5));
      const lowSampled = sample(low, maxRowsLimit - highSampled.length - midSampled.length);
      const limitedRows = [...highSampled, ...midSampled, ...lowSampled];
      return { headers, rows: limitedRows, truncated: true };
    }
    return { headers, rows, truncated: false };
  }, [answerStore.message.results, answerStore.tableHeaders]);

  const transformTableDataToMarkdown = (tableData: { headers: any[]; rows: any[] }) => {
    const { headers, rows } = tableData;
    let markdown = '';
    markdown += '| ' + headers.map((header) => header.label).join(' | ') + ' |\n';
    markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
    rows.forEach((row) => {
      markdown += '| ' + headers.map((header) => row[header.id]).join(' | ') + ' |\n';
    });
    return markdown;
  };

  const [streamedText, setStreamedText] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen) setStreamedText('');
  }, [isOpen]);

  const tableDataMarkdown = transformTableDataToMarkdown(tableData);
  const { predicates } = useContext(BiolinkContext) as BiolinkContextType;
  const queryGraphContext = graphQueryContext(answerStore.message.query_graph, predicates);

  const { refetch } = useQuery({
    queryKey: ['summaryLinks', answerStore.message],
    enabled: false,
    queryFn: async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const token = localStorage.getItem('authToken');
      const response = await fetch(llmRoutes.summarizeTable, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          tableData: tableDataMarkdown,
          queryGraph: queryGraphContext,
          truncated: tableData.truncated,
        }),
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

export default SummarizeTableWithAIModal;
