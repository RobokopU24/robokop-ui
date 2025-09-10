import { Button, ButtonGroup } from '@mui/material';
import { withStyles } from '@mui/styles';
import { blue } from '@mui/material/colors';
import React, { useState, useEffect, useRef } from 'react';
import usePageStatus from '../../stores/usePageStatus';
import { useAuth } from '../../context/AuthContext';
import { usePasskey } from '../../hooks/usePasskey';
import ARAs from '../../API/services';
import { useAlert } from '../../components/AlertProvider';
import { useNavigate } from '@tanstack/react-router';
import queryGraphUtils from '../../utils/queryGraph';
import API from '../../API';
import { useQueryBuilderContext } from '../../context/queryBuilder';
import cloneDeep from 'lodash/cloneDeep';

import { set as idbSet } from 'idb-keyval';
import RegisterPasskeyDialog from '../../components/RegisterPasskeyDialog';
import TextEditor from './textEditor/TextEditor';
import GraphEditor from './graphEditor/GraphEditor';
import JsonEditor from './jsonEditor/JsonEditor';
import DownloadDialog from '../../components/DownloadDialog';
import './queryBuilder.css';
import TemplateQueriesModal from './templatedQueries/TemplateQueriesModal';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ExampleModal from '../entryPoint/ExampleModal';
import TemplateModal from '../entryPoint/TemplateModal';
import BookmarkModal from '../entryPoint/BookmarkModal';

const SubmitButton = withStyles((theme) => ({
  root: {
    marginLeft: 'auto',
    color: theme.palette.getContrastText(blue[600]),
    backgroundColor: blue[600],
    '&:hover': {
      backgroundColor: blue[700],
    },
  },
}))(Button);

/**
 * Query Builder parent component
 *
 * Displays the text, graph, and json editors
 */
export default function QueryBuilder() {
  const queryBuilder = useQueryBuilderContext();
  const { user } = useAuth();

  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [exampleModalOpen, setExampleModalOpen] = useState(false);
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const buttonOptions = [
    {
      label: 'Load Example',
      onClick: () => {
        setSavedState(cloneDeep(queryBuilder.query_graph));
        setExampleModalOpen(true);
      },
      disabled: false,
    },
    {
      label: 'Load Template',
      onClick: () => {
        setSavedState(cloneDeep(queryBuilder.query_graph));
        setTemplateModalOpen(true);
      },
      disabled: false,
    },
    {
      label: 'Load Bookmark',
      onClick: () => {
        setSavedState(cloneDeep(queryBuilder.query_graph));
        setBookmarkModalOpen(true);
      },
      disabled: !user,
    },
  ];
  const [openMenu, setOpenMenu] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(1);

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number
  ) => {
    setSelectedIndex(index);
    setOpenMenu(false);
  };
  const handleToggle = () => {
    setOpenMenu((prevOpen) => !prevOpen);
  };
  const handleClose = (event: Event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpenMenu(false);
  };
  const handleClick = () => {
    buttonOptions[selectedIndex].onClick();
  };

  const pageStatus = usePageStatus(false);
  const { browserSupport } = usePasskey();
  const [showJson, toggleJson] = useState(false);
  const [registerPasskeyOpen, setRegisterPasskeyOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [ara] = useState(ARAs[0]);
  const { displayAlert } = useAlert();
  const navigate = useNavigate();
  const [exampleQueriesOpen, setExampleQueriesOpen] = useState(false);
  const [savedState, setSavedState] = useState<any>(null);

  const passkeyPopupDenied = localStorage.getItem('passkeyPopupDenied');

  // Display modal for the user to create a passkey if they don't have one
  useEffect(() => {
    if (user && browserSupport) {
      // eslint-disable-next-line no-underscore-dangle
      if (user._count?.WebAuthnCredential === 0 && passkeyPopupDenied !== 'true') {
        setRegisterPasskeyOpen(true);
      }
    }
  }, [user, browserSupport, passkeyPopupDenied]);

  /**
   * Submit this query directly to an ARA and then navigate to the answer page
   */
  async function onQuickSubmit() {
    pageStatus.setLoading('Fetching answer, this may take a while');
    const prunedQueryGraph = queryGraphUtils.prune(queryBuilder.query_graph);
    const response = await API.ara.getQuickAnswer(ara, {
      message: { query_graph: prunedQueryGraph },
    });

    if (response.status === 'error') {
      const failedToAnswer = 'Please try asking this question later.';
      displayAlert('error', `${response.message}. ${failedToAnswer}`);
      // go back to rendering query builder
      pageStatus.setSuccess();
    } else {
      // stringify to stay consistent with answer page json parsing
      idbSet('quick_message', JSON.stringify(response))
        .then(() => {
          displayAlert('success', 'Your answer is ready!');
          // once message is stored, navigate to answer page to load and display
          navigate({ to: '/answer' });
        })
        .catch((err) => {
          displayAlert(
            'error',
            `Failed to locally store this answer. Please try again later. Error: ${err}`
          );
          pageStatus.setSuccess();
        });
    }
  }

  const handleCancel = () => {
    if (savedState) {
      queryBuilder.dispatch({
        type: 'restoreGraph',
        payload: savedState,
      });
    }
  };

  return (
    <>
      <pageStatus.Display />
      {pageStatus.displayPage && (
        <div id="queryBuilderContainer">
          <div id="queryEditorContainer">
            <RegisterPasskeyDialog
              open={registerPasskeyOpen}
              onClose={() => setRegisterPasskeyOpen(false)}
            />
            <div style={{ flex: 1 }}>
              <TextEditor rows={queryBuilder.textEditorRows || []} />
            </div>
            <div>
              <GraphEditor
                editJson={() => toggleJson(true)}
                downloadQuery={() => setDownloadOpen(true)}
                onSubmit={() => onQuickSubmit()}
                buttonOptions={buttonOptions}
              />
              <div id="queryBuilderButtons">
                {/* <Button onClick={() => setExampleQueriesOpen(true)} variant="outlined">
                  Load Query
                </Button> */}
                {/* <ButtonGroup
                  variant="contained"
                  ref={anchorRef}
                  aria-label="Button group with a nested menu"
                >
                  <Button onClick={handleClick}>{buttonOptions[selectedIndex].label}</Button>
                  <Button
                    size="small"
                    aria-controls={openMenu ? 'split-button-menu' : undefined}
                    aria-expanded={openMenu ? 'true' : undefined}
                    aria-label="select merge strategy"
                    aria-haspopup="menu"
                    onClick={handleToggle}
                  >
                    <ArrowDropDownIcon />
                  </Button>
                </ButtonGroup>
                <Popper
                  sx={{ zIndex: 1 }}
                  open={openMenu}
                  anchorEl={anchorRef.current}
                  role={undefined}
                  transition
                  disablePortal
                >
                  {({ TransitionProps, placement }) => (
                    <Grow
                      {...TransitionProps}
                      style={{
                        transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                      }}
                    >
                      <Paper>
                        <ClickAwayListener onClickAway={handleClose}>
                          <MenuList id="split-button-menu" autoFocusItem>
                            {buttonOptions.map((option, index) => (
                              <MenuItem
                                key={option.label}
                                selected={index === selectedIndex}
                                onClick={(event) => handleMenuItemClick(event, index)}
                                disabled={option.disabled}
                              >
                                {option.label}
                              </MenuItem>
                            ))}
                          </MenuList>
                        </ClickAwayListener>
                      </Paper>
                    </Grow>
                  )}
                </Popper> */}
                {/* <TemplateQueriesModal open={exampleQueriesOpen} setOpen={setExampleQueriesOpen} /> */}
                <ExampleModal
                  isOpen={exampleModalOpen}
                  onClose={() => setExampleModalOpen(false)}
                  onCancel={handleCancel}
                />
                <TemplateModal
                  isOpen={templateModalOpen}
                  onClose={() => setTemplateModalOpen(false)}
                  onCancel={handleCancel}
                />
                <BookmarkModal
                  isOpen={bookmarkModalOpen}
                  onClose={() => setBookmarkModalOpen(false)}
                  onCancel={handleCancel}
                />
                {/* <Button onClick={() => toggleJson(true)} variant="outlined">
                  Edit JSON
                </Button>
                <Button onClick={() => setDownloadOpen(true)} variant="outlined">
                  Download Query
                </Button> */}
                <div style={{ flexGrow: 1 }}></div>
                {/* <SubmitButton onClick={() => onQuickSubmit()} variant="contained">
                  Submit
                </SubmitButton> */}
              </div>
            </div>
            <JsonEditor show={showJson} close={() => toggleJson(false)} />
            <DownloadDialog
              open={downloadOpen}
              setOpen={setDownloadOpen}
              message={queryBuilder.query_graph}
              download_type="all_queries"
            />
          </div>
        </div>
      )}
    </>
  );
}
