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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FEATURES, DEFAULT_FEATURE_ROLES } from "../../utils/features";
import { Role, ROLE_OPTIONS, ROLES } from "../../utils/roles";
import { getFeatureAccess, updateFeatureAccess } from "../../functions/featureFunctions";

const ROLE_COLORS: Record<Role, "default" | "info" | "error"> = {
  [ROLES.USER]: "default",
  [ROLES.PREMIUM]: "info",
  [ROLES.ADMIN]: "error",
};

const ROLE_LABELS: Record<Role, string> = {
  [ROLES.USER]: "User",
  [ROLES.PREMIUM]: "Premium",
  [ROLES.ADMIN]: "Admin",
};

function FeatureAccessTable() {
  const queryClient = useQueryClient();
  const [editingFeatureId, setEditingFeatureId] = React.useState<string | null>(null);
  const [editingRoles, setEditingRoles] = React.useState<Role[]>([]);

  const { data: featureAccessList, isLoading } = useQuery({
    queryKey: ["featureAccess"],
    queryFn: getFeatureAccess,
  });

  const updateMutation = useMutation({
    mutationFn: ({ featureId, roles }: { featureId: string; roles: Role[] }) => updateFeatureAccess(featureId, roles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureAccess"] });
      setEditingFeatureId(null);
    },
  });

  const featureRolesMap = React.useMemo(() => {
    const map: Record<string, Role[]> = {};
    if (featureAccessList) {
      featureAccessList.forEach((f) => {
        map[f.featureId] = f.roles;
      });
    }
    FEATURES.forEach((feature) => {
      if (!map[feature.id]) {
        map[feature.id] = DEFAULT_FEATURE_ROLES[feature.id] || [];
      }
    });
    return map;
  }, [featureAccessList]);

  const handleEditClick = (featureId: string) => {
    setEditingFeatureId(featureId);
    setEditingRoles([...featureRolesMap[featureId]]);
  };

  const handleCancelEdit = () => {
    setEditingFeatureId(null);
    setEditingRoles([]);
  };

  const handleSaveEdit = () => {
    if (editingFeatureId) {
      updateMutation.mutate({ featureId: editingFeatureId, roles: editingRoles });
    }
  };

  const handleRoleChange = (event: SelectChangeEvent<Role[]>) => {
    const value = event.target.value;
    setEditingRoles(typeof value === "string" ? (value.split(",") as Role[]) : value);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
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
              <TableCell sx={{ fontWeight: "bold" }}>Feature</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Allowed Roles</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {FEATURES.map((feature) => {
              const isEditing = editingFeatureId === feature.id;
              const currentRoles = featureRolesMap[feature.id] || [];

              return (
                <TableRow
                  key={feature.id}
                  sx={{
                    "&:last-child td": { border: 0 },
                    "&:hover": { backgroundColor: "action.hover" },
                  }}
                >
                  <TableCell>{feature.name}</TableCell>
                  <TableCell>
                    {isEditing ? (
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <Select
                          multiple
                          value={editingRoles}
                          onChange={handleRoleChange}
                          input={<OutlinedInput />}
                          renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {selected.map((role) => (
                                <Chip key={role} label={ROLE_LABELS[role]} size="small" color={ROLE_COLORS[role]} />
                              ))}
                            </Box>
                          )}
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <MenuItem key={role} value={role}>
                              <Checkbox checked={editingRoles.includes(role)} />
                              <ListItemText primary={ROLE_LABELS[role]} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>{currentRoles.length === 0 ? <Chip label="No access" size="small" variant="outlined" /> : currentRoles.map((role) => <Chip key={role} label={ROLE_LABELS[role]} size="small" color={ROLE_COLORS[role]} />)}</Box>
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
                      <IconButton onClick={() => handleEditClick(feature.id)} color="primary" size="small">
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
