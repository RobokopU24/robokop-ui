import React from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';

import { conceptColorMap, undefinedColor } from '../../utils/colors';

export default function ShowNode({
  node,
}: {
  node: {
    name: string;
    category: Array<string>;
    properties?: Record<string, string | number | boolean | Array<string | number>>;
    id: string;
  };
}) {
  return (
    <Box>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        columnGap={2}
        mt={6}
        borderBottom={1}
        borderColor="divider"
        pb={2}
        justifyContent="space-between"
      >
        <Box display="flex" flexDirection="row" alignItems="center" columnGap={2}>
          <Typography variant="h4" component="h2">
            {node.name}
          </Typography>
          <Chip label={node.id} size="small" />
        </Box>
        <Box>
          <Stack direction="row" spacing={1}>
            {node?.category?.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                size="small"
                sx={{
                  backgroundColor: conceptColorMap[cat] || undefinedColor,
                }}
              />
            ))}
          </Stack>
        </Box>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 4 }}>
        {node?.properties?.['description'] || 'No description available.'}
      </Typography>
    </Box>
  );
}
