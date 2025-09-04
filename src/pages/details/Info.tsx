import React, { useState, useEffect, useMemo } from 'react';

import ShowEdges from './ShowEdges';
import ShowEdgesSummary from './ShowEdgesSummary';
import ShowNode from './ShowNode';
import ShowNodeProperties from './ShowNodeProperties';

import API from '../../API';
import { Grid } from '@mui/material';

interface InfoProps {
  details_id: string;
  nodeData: any;
}

export default function Info({ details_id, nodeData }: InfoProps) {
  const match = details_id;
  const nodeId = useMemo(() => match, [match]);

  return (
    <Grid style={{ marginBottom: '50px' }} maxWidth="1500px" mx="auto">
      <ShowNode node={nodeData} />
      <ShowNodeProperties properties={nodeData.properties} />
      <ShowEdgesSummary nodeId={nodeId} node={nodeData} />
      {/* <ShowEdges node={nodeData} nodeId={nodeId} /> */}
    </Grid>
  );
}
