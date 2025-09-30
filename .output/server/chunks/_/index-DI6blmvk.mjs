import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { Navigate } from '@tanstack/react-router';
import { u as useAuth } from './AuthContext-MCs-YjR3.mjs';
import { u as useAlert, r as routes } from './AlertProvider-wxvwEFCh.mjs';
import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Grid, Paper, Avatar, Typography, Tabs, Tab, List, ListItemButton, ListItem, ListItemText, IconButton, Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ReactJsonView from 'react-json-view';
import { a as authApi } from './baseUrlProxy-CL-Lrxdy.mjs';
import { u as usePasskey } from './usePasskey-DKEsSi17.mjs';
import 'axios';
import '@mui/material/Snackbar';
import '@mui/material/Alert';
import '@simplewebauthn/browser';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { displayAlert } = useAlert();
  if (loading) {
    return /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("p", { children: "Loading..." }) });
  }
  if (!user) {
    displayAlert("error", "You must be logged in to access this page.");
    return /* @__PURE__ */ jsx(Navigate, { to: "/", replace: true });
  }
  return children;
};
function DeletePasskeyDialog({ open, onClose, onConfirm, deviceType }) {
  return /* @__PURE__ */ jsxs(Dialog, { open, onClose, maxWidth: "sm", fullWidth: true, children: [
    /* @__PURE__ */ jsx(DialogTitle, { children: /* @__PURE__ */ jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "h6", children: "Delete Passkey" }),
      /* @__PURE__ */ jsx(IconButton, { onClick: onClose, children: /* @__PURE__ */ jsx(CloseIcon, {}) })
    ] }) }),
    /* @__PURE__ */ jsx(DialogContent, { children: /* @__PURE__ */ jsxs(Typography, { children: [
      "Are you sure you want to delete this passkey ",
      deviceType ? `(${deviceType})` : "",
      "? This action cannot be undone."
    ] }) }),
    /* @__PURE__ */ jsxs(DialogActions, { children: [
      /* @__PURE__ */ jsx(Button, { onClick: onClose, color: "secondary", children: "Cancel" }),
      /* @__PURE__ */ jsx(Button, { onClick: onConfirm, variant: "contained", color: "primary", children: "Delete" })
    ] })
  ] });
}
function DeleteQueryDialog({ open, onClose, onConfirm, queryName }) {
  return /* @__PURE__ */ jsxs(Dialog, { open, onClose, maxWidth: "sm", fullWidth: true, children: [
    /* @__PURE__ */ jsx(DialogTitle, { children: /* @__PURE__ */ jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "h6", children: "Delete Query" }),
      /* @__PURE__ */ jsx(IconButton, { onClick: onClose, children: /* @__PURE__ */ jsx(CloseIcon, {}) })
    ] }) }),
    /* @__PURE__ */ jsx(DialogContent, { children: /* @__PURE__ */ jsxs(Typography, { children: [
      'Are you sure you want to delete the query "',
      queryName,
      '"? This action cannot be undone.'
    ] }) }),
    /* @__PURE__ */ jsxs(DialogActions, { children: [
      /* @__PURE__ */ jsx(Button, { onClick: onClose, color: "secondary", children: "Cancel" }),
      /* @__PURE__ */ jsx(Button, { onClick: onConfirm, variant: "contained", color: "primary", children: "Delete" })
    ] })
  ] });
}
function Profile() {
  const { user } = useAuth();
  const { displayAlert } = useAlert();
  const { registerPasskey } = usePasskey();
  const [passkeys, setPasskeys] = useState([]);
  const [savedQueries, setSavedQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passkeyToDelete, setPasskeyToDelete] = useState(null);
  const [deleteQueryDialogOpen, setDeleteQueryDialogOpen] = useState(false);
  const [queryToDelete, setQueryToDelete] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        const [passkeysRes, queriesRes] = await Promise.all([
          authApi.get(routes.passkeyRoutes.list),
          authApi.get(routes.queryRoutes.base)
        ]);
        setPasskeys(passkeysRes.data);
        setSavedQueries(queriesRes.data);
      } catch (err) {
        console.error("Failed to load profile data:", err);
        displayAlert("error", "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [displayAlert]);
  const handleDeleteClick = (passkey) => {
    setPasskeyToDelete(passkey);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (!passkeyToDelete) return;
    try {
      await authApi.delete(`${routes.passkeyRoutes.base}/${passkeyToDelete.id}`);
      setPasskeys(passkeys.filter((pk) => (pk == null ? void 0 : pk.id) !== passkeyToDelete.id));
      displayAlert("success", "Passkey deleted");
    } catch {
      displayAlert("error", "Failed to delete passkey");
    } finally {
      setDeleteDialogOpen(false);
      setPasskeyToDelete(null);
    }
  };
  const handleQueryDeleteClick = (query) => {
    setQueryToDelete(query);
    setDeleteQueryDialogOpen(true);
  };
  const handleQueryDeleteConfirm = async () => {
    try {
      await authApi.delete(`${routes.queryRoutes.base}/${queryToDelete == null ? void 0 : queryToDelete.id}`);
      setSavedQueries(savedQueries.filter((q) => (q == null ? void 0 : q.id) !== (queryToDelete == null ? void 0 : queryToDelete.id)));
      setSelectedQuery(null);
      displayAlert("success", "Query deleted");
    } catch {
      displayAlert("error", "Failed to delete query");
    } finally {
      setDeleteQueryDialogOpen(false);
      setQueryToDelete(null);
    }
  };
  const registerNewPasskey = async () => {
    try {
      await registerPasskey();
      displayAlert("success", "Passkey registered");
      const { data } = await authApi.get(routes.passkeyRoutes.list);
      setPasskeys(data);
    } catch (err) {
      displayAlert("error", err.message || "Failed to register passkey");
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", children: /* @__PURE__ */ jsx(CircularProgress, {}) });
  }
  return /* @__PURE__ */ jsxs(Grid, { container: true, direction: "column", spacing: 3, sx: { px: 4, pb: 4 }, children: [
    /* @__PURE__ */ jsx(Grid, { children: /* @__PURE__ */ jsx(Paper, { sx: { p: 4, width: "100%" }, children: /* @__PURE__ */ jsxs(Box, { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 3, children: [
      /* @__PURE__ */ jsx(Avatar, { src: user == null ? void 0 : user.profilePicture, alt: user == null ? void 0 : user.name, sx: { width: 100, height: 100 } }),
      /* @__PURE__ */ jsxs(Box, { children: [
        /* @__PURE__ */ jsx(Typography, { variant: "h4", children: user == null ? void 0 : user.name }),
        /* @__PURE__ */ jsxs(Typography, { children: [
          "Email: ",
          user == null ? void 0 : user.email
        ] }),
        (user == null ? void 0 : user.createdAt) && /* @__PURE__ */ jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
          "Member since: ",
          new Date(user.createdAt).toLocaleDateString()
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx(Grid, { children: /* @__PURE__ */ jsxs(Paper, { sx: { p: 4, width: "100%" }, children: [
      /* @__PURE__ */ jsxs(
        Tabs,
        {
          value: activeTab,
          onChange: (e, val) => setActiveTab(val),
          indicatorColor: "primary",
          textColor: "primary",
          sx: { mb: 2 },
          children: [
            /* @__PURE__ */ jsx(Tab, { label: "Saved Queries" }),
            /* @__PURE__ */ jsx(Tab, { label: "Passkeys" })
          ]
        }
      ),
      activeTab === 0 && /* @__PURE__ */ jsxs(Box, { display: "flex", sx: { height: 600 }, children: [
        /* @__PURE__ */ jsx(List, { sx: { width: 350, overflowY: "auto", borderRight: 1, borderColor: "divider" }, children: savedQueries.length === 0 ? /* @__PURE__ */ jsx(Typography, { color: "text.secondary", sx: { p: 2 }, children: "No saved queries" }) : savedQueries.map((query) => /* @__PURE__ */ jsx(
          ListItemButton,
          {
            selected: (selectedQuery == null ? void 0 : selectedQuery.id) === (query == null ? void 0 : query.id),
            onClick: () => setSelectedQuery(query),
            children: /* @__PURE__ */ jsx(
              ListItem,
              {
                sx: { p: 0 },
                secondaryAction: /* @__PURE__ */ jsx(
                  IconButton,
                  {
                    edge: "end",
                    onClick: () => {
                      if (query) handleQueryDeleteClick(query);
                    },
                    children: /* @__PURE__ */ jsx(DeleteIcon, {})
                  }
                ),
                children: /* @__PURE__ */ jsx(
                  ListItemText,
                  {
                    primary: query == null ? void 0 : query.name,
                    secondary: (query == null ? void 0 : query.createdAt) ? new Date(query.createdAt).toLocaleDateString() : "Unknown Date"
                  }
                )
              }
            )
          },
          query == null ? void 0 : query.id
        )) }),
        /* @__PURE__ */ jsx(Box, { flex: 1, sx: { p: 2, overflowY: "auto" }, children: selectedQuery ? /* @__PURE__ */ jsx(
          ReactJsonView,
          {
            src: selectedQuery.query.message.query_graph,
            name: false,
            theme: "rjv-default",
            collapseStringsAfterLength: 15,
            indentWidth: 2,
            iconStyle: "triangle",
            enableClipboard: false,
            displayObjectSize: false,
            displayDataTypes: false
          }
        ) : /* @__PURE__ */ jsx(
          Typography,
          {
            sx: {
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontStyle: "italic",
              color: "text.disabled"
            },
            children: "Please select a query from the list"
          }
        ) })
      ] }),
      activeTab === 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, children: [
          /* @__PURE__ */ jsx(Typography, { variant: "h5", children: "Passkeys" }),
          /* @__PURE__ */ jsx(Button, { variant: "contained", onClick: registerNewPasskey, children: "Add Passkey" })
        ] }),
        passkeys.length === 0 ? /* @__PURE__ */ jsx(Typography, { color: "text.secondary", children: "No passkeys registered" }) : /* @__PURE__ */ jsx(List, { children: passkeys.map((passkey, index) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsx(
            ListItem,
            {
              secondaryAction: /* @__PURE__ */ jsx(
                IconButton,
                {
                  edge: "end",
                  onClick: () => {
                    if (passkey) handleDeleteClick(passkey);
                  },
                  children: /* @__PURE__ */ jsx(DeleteIcon, {})
                }
              ),
              children: /* @__PURE__ */ jsx(
                ListItemText,
                {
                  primary: (passkey == null ? void 0 : passkey.deviceType) || "Unknown Device",
                  secondary: `Created: ${(passkey == null ? void 0 : passkey.createdAt) ? new Date(passkey.createdAt).toLocaleDateString() : "Unknown Date"}`
                }
              )
            }
          ),
          index < passkeys.length - 1 && /* @__PURE__ */ jsx(Divider, {})
        ] }, passkey == null ? void 0 : passkey.id)) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(
      DeletePasskeyDialog,
      {
        open: deleteDialogOpen,
        onClose: () => {
          setDeleteDialogOpen(false);
          setPasskeyToDelete(null);
        },
        onConfirm: handleDeleteConfirm,
        deviceType: passkeyToDelete == null ? void 0 : passkeyToDelete.deviceType
      }
    ),
    /* @__PURE__ */ jsx(
      DeleteQueryDialog,
      {
        open: deleteQueryDialogOpen,
        onClose: () => {
          setDeleteQueryDialogOpen(false);
          setQueryToDelete(null);
        },
        onConfirm: handleQueryDeleteConfirm,
        queryName: queryToDelete == null ? void 0 : queryToDelete.name
      }
    )
  ] });
}
const SplitComponent = function RouteComponent() {
  return /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(Profile, {}) });
};

export { SplitComponent as component };
//# sourceMappingURL=index-DI6blmvk.mjs.map
