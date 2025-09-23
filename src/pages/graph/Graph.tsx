import ChevronRight from '@mui/icons-material/ChevronRight';
import OpenInNew from '@mui/icons-material/OpenInNew';
import {
  Button,
  Container,
  ButtonGroup as MuiButtonGroup,
  Paper,
  styled,
  Typography,
} from '@mui/material';
import { Link } from '@tanstack/react-router';
import API from '../../API';
import stringUtils from '../../utils/strings';

interface GraphProps {
  graphData: any[];
}

function Graph({ graphData }: GraphProps) {
  return (
    <Container sx={{ my: 6 }}>
      <Typography variant="h4" component="h1" mb={2}>
        ROBOKOP Graphs
      </Typography>
      <Typography variant="body1" gutterBottom my={2}>
        Browse the available ROBOKOP knowledge graphs below. Click "Details" to see more information
        about each graph, including download links and statistics.
      </Typography>
      <Grid>
        {graphData.map((graph) => (
          <Tile key={graph.graph_id} elevation={3}>
            <div id="tile-content">
              <div>
                <h2>{graph.graph_name}</h2>
                <span>
                  {stringUtils.formatNumber(graph.final_node_count)} nodes,{' '}
                  {stringUtils.formatNumber(graph.final_edge_count)} edges
                </span>
              </div>
              <hr />
              <p>{graph.graph_description}</p>
            </div>

            <ButtonGroup fullWidth variant="text" color="inherit">
              {graph.graph_url && (
                <Button
                  endIcon={<OpenInNew />}
                  href={graph.graph_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Graph website
                </Button>
              )}
              <Button
                endIcon={<ChevronRight />}
                component={Link}
                to={`/explore/graphs/${graph.graph_id}`}
              >
                Details
              </Button>
            </ButtonGroup>
          </Tile>
        ))}
      </Grid>
    </Container>
  );
}

export default Graph;

const Grid = styled('div')`
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr 1fr;
`;

const Tile = styled(Paper)`
  border-radius: 8px;
  border: 1px solid #ddd;

  display: flex;
  flex-direction: column;

  & h2 {
    margin: 0;
    display: inline-block;
    font-size: 1.3rem;
    font-weight: 400;
    font-family: 'Roboto';
  }

  & #tile-content {
    flex: 1;
    padding: 1rem;

    & div {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    & span {
      font-size: 1rem;
      white-space: nowrap;
      color: #767676;
    }

    & p {
      margin: 0;
    }
  }

  & hr {
    border: none;
    border-top: 1px solid rgba(0, 0, 0, 0.23);
    margin: 1rem 0;
  }
`;

const ButtonGroup = styled(MuiButtonGroup)`
  color: #767676;
  border-top: 1px solid rgba(0, 0, 0, 0.23);
  border-radius: 0px;

  & .MuiButton-root {
    border-radius: 0px;
  }
`;
