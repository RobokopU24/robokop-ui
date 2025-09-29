import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useQueryBuilderContext } from '../../../context/queryBuilder';
import axios from 'axios';
import API from '../../../API/routes';
import { useAlert } from '../../../components/AlertProvider';

type TypeOptions = 'bookmark' | 'share';

type ShareRouteParams = {
  type: TypeOptions;
};

export const Route = createFileRoute('/share/$share_id/')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): ShareRouteParams => {
    return {
      type: (search.type as TypeOptions) || 'bookmark',
    };
  },
});

function RouteComponent() {
  const { displayAlert } = useAlert();
  const { share_id } = Route.useParams();
  const { type } = Route.useSearch();
  const queryBuilder = useQueryBuilderContext();
  const navigate = useNavigate();
  useEffect(() => {
    if (share_id && type) {
      axios
        .get(`${API.queryRoutes.share}/${share_id}?type=${type}`)
        .then((response) => {
          queryBuilder.dispatch({ type: 'saveGraph', payload: response.data.query });
          displayAlert('success', 'Graph loaded successfully!');
          navigate({ to: '/question-builder' });
        })
        .catch((error) => {
          displayAlert('error', 'Failed to load graph.');
          console.error(error);
          navigate({ to: '/question-builder' });
        });
    }
  }, [share_id, type]);

  return <div>Loading</div>;
}
