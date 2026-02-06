import { Breadcrumbs, Typography } from "@mui/material";
import { Link } from "@tanstack/react-router";

function BreadcrumbsComponent({ displayName }: { displayName: string }) {
  return (
    <Breadcrumbs aria-label="graph breadcrumbs">
      <Typography component={Link} to="/explore/graphs" color="text.secondary" variant="body2" sx={{ textDecoration: "none" }}>
        Explore graphs
      </Typography>
      <Typography color="text.primary" variant="body2">
        {displayName}
      </Typography>
    </Breadcrumbs>
  );
}

export default BreadcrumbsComponent;
