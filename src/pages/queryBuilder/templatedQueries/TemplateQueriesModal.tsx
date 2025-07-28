import { Box, Modal, Tab, Tabs, Button, Stack } from '@mui/material';
import React, { useState, useEffect } from 'react';
import BookmarkedQueriesTab from './BookmarkedQueriesTab';
import ExampleQueriesTab from './ExampleQueriesTab';
import { useQueryBuilderContext } from '../../../context/queryBuilder';
import cloneDeep from 'lodash/cloneDeep';

interface TemplatedQueriesModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface TemplateTextPart {
  type: 'text';
  text: string;
  [key: string]: any;
}
export interface TemplateNodePart {
  type: 'node';
  id: string;
  name: string;
  filterType?: string;
  [key: string]: any;
}
interface TemplateJsonTextPart {
  type: 'json_text';
  text: string;
  [key: string]: any;
}

export type TemplatePart = TemplateTextPart | TemplateNodePart | TemplateJsonTextPart;

interface ExampleStructure {
  nodes: Record<string, { name: string; category: string; id?: string }>;
  edges: Record<string, { subject: string; object: string; predicate: string }>;
}

export interface ExampleTemplateInterface {
  type: string;
  tags?: string;
  template: TemplatePart[];
  structure: ExampleStructure;
}

function TemplateQueriesModal({ open, setOpen }: TemplatedQueriesModalProps) {
  const [selectedTab, setSelectedTab] = useState<'examples' | 'bookmarked'>('examples');
  const queryBuilder = useQueryBuilderContext();
  const [savedState, setSavedState] = useState<any>(null);

  useEffect(() => {
    if (open) {
      setSavedState(cloneDeep(queryBuilder.query_graph));
    }
  }, [open]);

  const handleCancel = () => {
    if (savedState) {
      queryBuilder.dispatch({
        type: 'restoreGraph',
        payload: savedState,
      });
    }
    setOpen(false);
  };

  const handleSave = () => {
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      disableEscapeKeyDown={false}
      disableAutoFocus={false}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '100%',
          maxWidth: 600,
          height: '80%',
          overflowY: 'auto',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 2,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          centered
          sx={{ mb: 2 }}
        >
          <Tab label="Examples" value="examples" />
          <Tab label="Bookmarked" value="bookmarked" />
        </Tabs>
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {selectedTab === 'bookmarked' && <BookmarkedQueriesTab />}
          {selectedTab === 'examples' && <ExampleQueriesTab />}
        </Box>
        <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}

export default TemplateQueriesModal;
