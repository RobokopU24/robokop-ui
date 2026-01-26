import React from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import { useAuth } from "../../context/AuthContext";
import { isAdmin } from "../../utils/roles";
import UserTable from "./UserTable";
import FeatureAccessTable from "./FeatureAccessTable";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`admin-tabpanel-${index}`} aria-labelledby={`admin-tab-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    "aria-controls": `admin-tabpanel-${index}`,
  };
}

function AdminPage() {
  const { user, loading } = useAuth();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !isAdmin(user.role)) {
    return <div>Access Denied</div>;
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="admin panel tabs"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.95rem",
            },
          }}
        >
          <Tab icon={<PeopleIcon />} iconPosition="start" label="User Management" {...a11yProps(0)} />
          <Tab icon={<SecurityIcon />} iconPosition="start" label="Feature Access" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <TabPanel value={tabValue} index={0}>
        <UserTable />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <FeatureAccessTable />
      </TabPanel>
    </Box>
  );
}

export default AdminPage;
