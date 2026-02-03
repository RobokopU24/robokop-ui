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
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFeatures, updateFeatureRoles, Feature } from "../../functions/featureFunctions";
import { useRoles } from "../../stores/useRoles";

function FeatureAccessTable() {
  const queryClient = useQueryClient();
  const { data: roles } = useRoles();
  const [editingFeatureId, setEditingFeatureId] = React.useState<number | null>(null);
  const [editingRoleIds, setEditingRoleIds] = React.useState<number[]>([]);

  const {
    data: features,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["features"],
    queryFn: getFeatures,
  });

  const updateMutation = useMutation({
    mutationFn: ({ featureId, roleIds }: { featureId: number; roleIds: number[] }) => updateFeatureRoles(featureId, roleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["features"] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setEditingFeatureId(null);
    },
  });

  const handleEditClick = (feature: Feature) => {
    setEditingFeatureId(feature.id);
    setEditingRoleIds(feature.rolesAllowed.map((r) => r.id));
  };

  const handleCancelEdit = () => {
    setEditingFeatureId(null);
    setEditingRoleIds([]);
  };

  const handleSaveEdit = () => {
    if (editingFeatureId !== null) {
      updateMutation.mutate({ featureId: editingFeatureId, roleIds: editingRoleIds });
    }
  };

  const handleRoleChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    setEditingRoleIds(typeof value === "string" ? value.split(",").map(Number) : value);
  };

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
        <Typography color="error">Failed to load features</Typography>
      </Box>
    );
  }

  return (
    <div>
      <h2 style={{ margin: "20px 0" }}>Feature Access Control</h2>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 600 }} aria-label="feature access table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Feature Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Feature ID</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Allowed Roles</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {features?.map((feature) => {
              const isEditing = editingFeatureId === feature.id;

              return (
                <TableRow
                  key={feature.id}
                  sx={{
                    "&:last-child td": { border: 0 },
                    "&:hover": { backgroundColor: "action.hover" },
                  }}
                >
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
                  <TableCell>
                    {isEditing ? (
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <Select
                          multiple
                          value={editingRoleIds}
                          onChange={handleRoleChange}
                          input={<OutlinedInput />}
                          renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {selected.map((roleId) => {
                                const role = roles?.find((r) => r.id === roleId);
                                return role ? <Chip key={roleId} label={role.roleName} size="small" variant="outlined" /> : null;
                              })}
                            </Box>
                          )}
                        >
                          {roles?.map((role) => (
                            <MenuItem key={role.id} value={role.id}>
                              <Checkbox checked={editingRoleIds.includes(role.id)} />
                              <ListItemText primary={role.roleName} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {feature.rolesAllowed.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No access
                          </Typography>
                        ) : (
                          feature.rolesAllowed.map((role) => <Chip key={role.id} label={role.roleName} size="small" variant="outlined" />)
                        )}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton onClick={handleSaveEdit} color="primary" size="small" disabled={updateMutation.isPending}>
                          {updateMutation.isPending ? <CircularProgress size={20} /> : <SaveIcon />}
                        </IconButton>
                        <IconButton onClick={handleCancelEdit} size="small" disabled={updateMutation.isPending}>
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <IconButton onClick={() => handleEditClick(feature)} color="primary" size="small">
                        <EditIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default FeatureAccessTable;
