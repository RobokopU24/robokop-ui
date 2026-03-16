"use no memo";

import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import OutlinedInput from "@mui/material/OutlinedInput";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useRoles, deleteRoles, createRole, updateRole, CreateRolePayload, UpdateRolePayload } from "../../stores/useRoles";
import { getFeatures } from "../../functions/featureFunctions";
import { RoleWithFeatures } from "../../utils/roles";
import { useAlert } from "../../components/AlertProvider";

interface RoleRowProps {
  role: RoleWithFeatures;
  onDeleteClick: (role: RoleWithFeatures) => void;
  onEditClick: (role: RoleWithFeatures) => void;
}

function RoleRow({ role, onDeleteClick, onEditClick }: RoleRowProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow
        sx={{
          "&:hover": { backgroundColor: "action.hover" },
        }}
      >
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{role.roleName}</TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {role.description}
          </Typography>
        </TableCell>
        <TableCell>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
            {role.features.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No features
              </Typography>
            ) : (
              <>
                <Chip
                  label={role.features[0].featureName}
                  size="small"
                  variant="outlined"
                  sx={{
                    maxWidth: 120,
                    "& .MuiChip-label": {
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    },
                  }}
                />
                {role.features.length > 1 && <Chip label={`+${role.features.length - 1} more`} size="small" variant="outlined" color="default" />}
              </>
            )}
          </Box>
        </TableCell>
        <TableCell>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton onClick={() => onEditClick(role)} color="primary" size="small">
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => onDeleteClick(role)} color="error" size="small">
              <DeleteIcon />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Features
              </Typography>
              {role.features.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No features assigned
                </Typography>
              ) : (
                <Table size="small" aria-label="features">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Feature Name</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Feature ID</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {role.features.map((feature) => (
                      <TableRow key={feature.id}>
                        <TableCell>{feature.featureName}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: "monospace", color: "text.secondary" }}>
                            {feature.featureId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {feature.description}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function RolesTable() {
  const queryClient = useQueryClient();
  const { data: roles, isLoading, isError } = useRoles();
  const { displayAlert } = useAlert();
  const { data: features } = useQuery({
    queryKey: ["features"],
    queryFn: getFeatures,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [roleToDelete, setRoleToDelete] = React.useState<RoleWithFeatures | null>(null);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [roleToEdit, setRoleToEdit] = React.useState<RoleWithFeatures | null>(null);
  const [editRole, setEditRole] = React.useState<UpdateRolePayload>({
    roleName: "",
    description: "",
    featureIds: [],
  });
  const [newRole, setNewRole] = React.useState<CreateRolePayload>({
    roleName: "",
    description: "",
    featureIds: [],
  });

  const deleteMutation = useMutation({
    mutationFn: (roleIds: number[]) => deleteRoles(roleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["features"] });
      handleCloseDeleteDialog();
      displayAlert("success", "Role deleted successfully");
    },
    onError: () => {
      displayAlert("error", "Failed to delete role");
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["features"] });
      handleCloseAddDialog();
      displayAlert("success", "Role created successfully");
    },
    onError: () => {
      displayAlert("error", "Failed to create role");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ roleId, payload }: { roleId: number; payload: UpdateRolePayload }) => updateRole(roleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["features"] });
      handleCloseEditDialog();
      displayAlert("success", "Role updated successfully");
    },
    onError: () => {
      displayAlert("error", "Failed to update role");
    },
  });

  const handleOpenDeleteDialog = (role: RoleWithFeatures) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setRoleToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (roleToDelete) {
      deleteMutation.mutate([roleToDelete.id]);
    }
  };

  const handleOpenAddDialog = () => {
    setAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
    setNewRole({
      roleName: "",
      description: "",
      featureIds: [],
    });
  };

  const handleNewRoleChange = (field: keyof CreateRolePayload) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewRole((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleNewRoleFeatureChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    setNewRole((prev) => ({
      ...prev,
      featureIds: typeof value === "string" ? value.split(",").map(Number) : value,
    }));
  };

  const handleAddRole = () => {
    createMutation.mutate(newRole);
  };

  const handleOpenEditDialog = (role: RoleWithFeatures) => {
    setRoleToEdit(role);
    setEditRole({
      roleName: role.roleName,
      description: role.description,
      featureIds: role.features.map((f) => f.id),
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setRoleToEdit(null);
    setEditRole({
      roleName: "",
      description: "",
      featureIds: [],
    });
  };

  const handleEditRoleChange = (field: keyof UpdateRolePayload) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditRole((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleEditRoleFeatureChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    setEditRole((prev) => ({
      ...prev,
      featureIds: typeof value === "string" ? value.split(",").map(Number) : value,
    }));
  };

  const handleUpdateRole = () => {
    if (roleToEdit) {
      updateMutation.mutate({ roleId: roleToEdit.id, payload: editRole });
    }
  };

  const isEditFormValid = editRole.roleName.trim() !== "";

  const isAddFormValid = newRole.roleName.trim() !== "";

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <Typography color="error">Failed to load roles</Typography>
      </Box>
    );
  }

  return (
    <div>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0" }}>
        <h2 style={{ margin: 0 }}>Roles Management</h2>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddDialog}>
          Add Role
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 600 }} aria-label="roles table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 50 }} />
              <TableCell sx={{ fontWeight: "bold" }}>Role Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Features Count</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles?.map((role) => (
              <RoleRow key={role.id} role={role} onDeleteClick={handleOpenDeleteDialog} onEditClick={handleOpenEditDialog} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="sm">
        <DialogTitle>Delete Role</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the role <strong>{roleToDelete?.roleName}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={deleteMutation.isPending} startIcon={deleteMutation.isPending ? <CircularProgress size={16} /> : <DeleteIcon />}>
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Role</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Role Name" value={newRole.roleName} onChange={handleNewRoleChange("roleName")} placeholder="e.g., moderator" required fullWidth helperText="Name for the role" />
            <TextField label="Description" value={newRole.description} onChange={handleNewRoleChange("description")} placeholder="Describe what this role can do..." multiline rows={3} fullWidth />
            <FormControl fullWidth>
              <InputLabel id="new-role-features-label">Features</InputLabel>
              <Select
                labelId="new-role-features-label"
                multiple
                value={newRole.featureIds}
                onChange={handleNewRoleFeatureChange}
                input={<OutlinedInput label="Features" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((featureId) => {
                      const feature = features?.find((f) => f.id === featureId);
                      return feature ? <Chip key={featureId} label={feature.featureName} size="small" /> : null;
                    })}
                  </Box>
                )}
              >
                {features?.map((feature) => (
                  <MenuItem key={feature.id} value={feature.id}>
                    <Checkbox checked={newRole.featureIds.includes(feature.id)} />
                    <ListItemText primary={feature.featureName} secondary={feature.featureId} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleAddRole} variant="contained" disabled={!isAddFormValid || createMutation.isPending} startIcon={createMutation.isPending ? <CircularProgress size={16} /> : null}>
            {createMutation.isPending ? "Adding..." : "Add Role"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Role</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Role Name" value={editRole.roleName} onChange={handleEditRoleChange("roleName")} placeholder="e.g., moderator" required fullWidth helperText="Name for the role" />
            <TextField label="Description" value={editRole.description} onChange={handleEditRoleChange("description")} placeholder="Describe what this role can do..." multiline rows={3} fullWidth />
            <FormControl fullWidth>
              <InputLabel id="edit-role-features-label">Features</InputLabel>
              <Select
                labelId="edit-role-features-label"
                multiple
                value={editRole.featureIds}
                onChange={handleEditRoleFeatureChange}
                input={<OutlinedInput label="Features" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((featureId) => {
                      const feature = features?.find((f) => f.id === featureId);
                      return feature ? <Chip key={featureId} label={feature.featureName} size="small" /> : null;
                    })}
                  </Box>
                )}
              >
                {features?.map((feature) => (
                  <MenuItem key={feature.id} value={feature.id}>
                    <Checkbox checked={editRole.featureIds.includes(feature.id)} />
                    <ListItemText primary={feature.featureName} secondary={feature.featureId} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleUpdateRole} variant="contained" disabled={!isEditFormValid || updateMutation.isPending} startIcon={updateMutation.isPending ? <CircularProgress size={16} /> : null}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default RolesTable;
