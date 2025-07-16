import React, { useState, useEffect, useMemo } from 'react';

import ShowEdges from './ShowEdges';
import ShowEdgesSummary from './ShowEdgesSummary';
import ShowNode from './ShowNode';
import ShowNodeProperties from './ShowNodeProperties';

import API from '../../API';
import { Grid } from '@mui/material';

export default function Info({ details_id }: { details_id: string }) {
  const match = details_id;

  const [nodeData, setNodeData] = useState<any>([]);

  const nodeId = useMemo(() => match, [match]);

  async function fetchNodeInfo() {
    const nodeResponse = await API.details.getNodeDetails(nodeId);
    setNodeData(nodeResponse);
  }

  useEffect(() => {
    fetchNodeInfo();
  }, []);

  return (
    <Grid style={{ marginBottom: '50px' }} maxWidth="1500px" mx="auto">
      <ShowNode node={nodeData} />
      <ShowNodeProperties properties={nodeData.properties} />
      <ShowEdgesSummary nodeId={nodeId} node={nodeData} />
      {/* <ShowEdges node={nodeData} nodeId={nodeId} /> */}
    </Grid>
  );
}
