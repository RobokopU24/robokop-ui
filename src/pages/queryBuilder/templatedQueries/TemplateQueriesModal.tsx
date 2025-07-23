import { Box, Modal, Tab, Tabs } from '@mui/material';
import React, { useState } from 'react';
import BookmarkedQueriesTab from './BookmarkedQueriesTab';
import ExampleQueriesTab from './ExampleQueriesTab';

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

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '100%',
          maxWidth: 600,
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 2,
          borderRadius: 2,
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
        <Box>
          {selectedTab === 'bookmarked' && <BookmarkedQueriesTab />}
          {selectedTab === 'examples' && <ExampleQueriesTab />}
        </Box>
      </Box>
    </Modal>
  );
}

export default TemplateQueriesModal;
