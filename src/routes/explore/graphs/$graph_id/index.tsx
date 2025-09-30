import { Download, OpenInNew } from '@mui/icons-material';
import {
  Button,
  ButtonGroup,
  Container,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { createFileRoute, Link } from '@tanstack/react-router';
import API from '../../../../API';
import { formatFileSize, getFileSize } from '../../../../utils/getFileSize';
import stringUtils from '../../../../utils/strings';
import { queryClient } from '../../../../utils/queryClient';
import { useQuery } from '@tanstack/react-query';
import GraphId from '../../../../pages/graphId/GraphId';

export const Route = createFileRoute('/explore/graphs/$graph_id/')({
  component: RouteComponent,
  ssr: false,
  loader: async ({ params }) => {
    console.log('params in loader', params);
    const graphData = await queryClient.ensureQueryData({
      queryKey: ['graph-metadata', params.graph_id],
      queryFn: () => API.graphMetadata.metadata(params.graph_id!),
    });

    return {
      graphData,
    };
  },
  head: ({ params }) => {
    const cachedData: any = queryClient.getQueryData(['graph-metadata', params.graph_id]);
    return {
      meta: [
        {
          title: cachedData ? `${cachedData.graph_name} | ROBOKOP` : 'Graph | ROBOKOP',
        },
      ],
    };
  },
});

function RouteComponent() {
  const { graph_id } = Route.useParams();
  console.log('graph_id', graph_id);
  const { data, isPending } = useQuery({
    queryKey: ['graph-metadata', graph_id],
    queryFn: () => {
      console.log('fetching graph metadata for', graph_id);
      return API.graphMetadata.metadata(graph_id!);
    },
    enabled: !!graph_id,
  });

  if (isPending) return 'Loading...';

  return <GraphId graphData={data} />;
}
