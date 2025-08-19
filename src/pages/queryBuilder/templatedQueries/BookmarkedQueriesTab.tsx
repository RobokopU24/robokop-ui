import { IconButton, Input, List, ListItem, ListItemText } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { QueryGraph } from '../textEditor/types';
import { authApi } from '../../../API/baseUrlProxy';
import API from '../../../API/routes';
import { useQueryBuilderContext } from '../../../context/queryBuilder';

import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import { useAlert } from '../../../components/AlertProvider';

interface BookmarkedQuery {
  id: string;
  name: string;
  createdAt: string;
  query: {
    message: {
      query_graph: QueryGraph;
    };
  };
}

function BookmarkedQueriesTab() {
  const [bookmarkSearch, setBookmarkSearch] = useState('');
  const [queries, setQueries] = useState<BookmarkedQuery[]>([]);
  const queryBuilder = useQueryBuilderContext();
  const { displayAlert } = useAlert();

  const handleSelectBookmarkedQuery = (query_graph: BookmarkedQuery) => {
    queryBuilder.dispatch({ type: 'saveGraph', payload: query_graph.query });
  };

  useEffect(() => {
    authApi
      .get(API.queryRoutes.base)
      .then((response) => {
        setQueries(response.data);
      })
      .catch(() => {
        // TODO: Handle error appropriately
      });
  }, []);

  return (
    <div>
      <Input
        placeholder="Search bookmarked queries"
        fullWidth
        value={bookmarkSearch}
        onChange={(e) => setBookmarkSearch(e.target.value)}
      />
      <List>
        {queries.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem 0rem' }}>No bookmarked queries found.</p>
        ) : (
          queries
            .filter((query) => query.name.toLowerCase().includes(bookmarkSearch.toLowerCase()))
            .map((query, i) => (
              <ListItem
                divider
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f0f0f0' } }}
                key={i}
                onClick={() => {
                  handleSelectBookmarkedQuery(query);
                }}
                secondaryAction={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <IconButton
                      edge="end"
                      aria-label="share"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(
                          `${window.location.origin}/share/${query.id}?type=bookmark`
                        );
                        displayAlert('success', 'Link copied to clipboard');
                      }}
                    >
                      <ShareIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        authApi
                          .delete(API.queryRoutes.base + '/' + query.id)
                          .then(() => {
                            setQueries((prev) => prev.filter((q) => q.id !== query.id));
                            displayAlert('success', 'Query deleted successfully');
                          })
                          .catch(() => {
                            console.error('Error deleting query:', query.id);
                          });
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                }
              >
                <ListItemText
                  primary={query.name}
                  secondary={'Bookmarked on ' + new Date(query.createdAt).toLocaleDateString()}
                />
              </ListItem>
            ))
        )}
      </List>
    </div>
  );
}

export default BookmarkedQueriesTab;
