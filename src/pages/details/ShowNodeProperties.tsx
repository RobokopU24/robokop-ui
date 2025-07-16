import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from '@mui/material';

import propertyFriendlyNames from './property-friendly-names.json';
import ShowPropertyValue from './ShowPropertyValue';
import { convertObjectToArray } from './functions';

export default function ShowNodeProperties({
  properties,
}: {
  properties?: Record<string, string | number | boolean | Array<string | number>>;
}) {
  const propertyArray = convertObjectToArray(properties);
  const excludedProperties = ['description'];
  // const excludedProperties = ['description', 'equivalent_identifiers'];

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Node Properties
      </Typography>
      {propertyArray.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          No properties available for this node.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableBody>
              {propertyArray.map(({ key, value }) => (
                <React.Fragment key={key}>
                  {/* Exclude certain properties from display */}
                  {excludedProperties.includes(key) ? null : (
                    <TableRow key={key}>
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{
                          backgroundColor: 'action.hover',
                          fontWeight: 'bold',
                          width: '30%',
                        }}
                      >
                        {propertyFriendlyNames[key as keyof typeof propertyFriendlyNames] ?? key}
                      </TableCell>
                      <TableCell>
                        <ShowPropertyValue propertyValue={value}></ShowPropertyValue>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
