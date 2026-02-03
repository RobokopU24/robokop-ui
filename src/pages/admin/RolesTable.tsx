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
import { useRoles } from "../../stores/useRoles";
import { RoleWithFeatures } from "../../utils/roles";

interface RoleRowProps {
  role: RoleWithFeatures;
}

function RoleRow({ role }: RoleRowProps) {
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
          <Chip label={role.features.length} size="small" variant="outlined" />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
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
  const { data: roles, isLoading, isError } = useRoles();

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
      <h2 style={{ margin: "20px 0" }}>Roles Management</h2>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 600 }} aria-label="roles table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 50 }} />
              <TableCell sx={{ fontWeight: "bold" }}>Role Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Features Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles?.map((role) => (
              <RoleRow key={role.id} role={role} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default RolesTable;
