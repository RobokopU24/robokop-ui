import { IconButton, Modal } from '@mui/material';
import { useEffect, useState } from 'react';

import './EntryPoint.css';
import { useQueryBuilderContext } from '../../context/queryBuilder';
import { useNavigate } from '@tanstack/react-router';
import { QueryGraph } from '../queryBuilder/textEditor/types';
import { authApi } from '../../API/baseUrlProxy';
import { useAlert } from '../../components/AlertProvider';
import API from '../../API/routes';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';

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

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
}

function BookmarkModal({ isOpen, onClose, onCancel }: BookmarkModalProps) {
  const navigate = useNavigate();
  const { displayAlert } = useAlert();
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkedQuery | null>(null);
  const [queries, setQueries] = useState<BookmarkedQuery[]>([]);
  const queryBuilder = useQueryBuilderContext();

  const handleSelectBookmarkedQuery = (query_graph: BookmarkedQuery) => {
    queryBuilder.dispatch({ type: 'saveGraph', payload: query_graph.query });
  };

  const onModalClose = () => {
    setSelectedBookmark(null);
    onCancel();
    onClose();
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
    <Modal open={isOpen} onClose={onModalClose}>
      <div
        style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          maxWidth: '500px',
          margin: 'auto',
          marginTop: '100px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img src="/react-icons/fiBookOpen.svg" alt="Example" />
          <h3 style={{ margin: '0 0 0 12px', fontWeight: 500 }}>Select a bookmarked query</h3>
        </div>
        <p style={{ color: '#5E5E5E', fontSize: '14px', margin: '8px 0 0 0' }}>
          Select one of the existing queries you have bookmarked
        </p>
        {queries.length > 0 &&
          queries.map((query) => (
            <div
              key={query.id}
              className={`example-box ${selectedBookmark?.id === query.id ? 'example-box-selected' : 'example-box-unselected'}`}
              style={{ display: 'flex' }}
              onClick={() => {
                setSelectedBookmark(query);
                handleSelectBookmarkedQuery(query);
              }}
            >
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 500, margin: 0 }}>{query.name}</h4>
                <p style={{ margin: 0, color: '#5E5E5E', fontSize: '14px', marginTop: '4px' }}>
                  Bookmarked on {new Date(query.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div style={{ paddingRight: '10px', gap: '10px', display: 'flex' }}>
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
            </div>
          ))}
        <div style={{ display: 'flex', justifyContent: 'end', marginTop: '32px', gap: '8px' }}>
          <button onClick={onModalClose} className="button-cancel">
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              navigate({ to: '/question-builder' });
            }}
            className="button-default"
            disabled={!selectedBookmark?.id}
          >
            Select Query
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default BookmarkModal;
