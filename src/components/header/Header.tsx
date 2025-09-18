import React from 'react';
import { AppBar, Avatar, Button, IconButton, Toolbar } from '@mui/material';

import './header.css';

import Logo from '../Logo';
import { useNavigate, Link } from '@tanstack/react-router';
import LoginDialog from '../LoginDialog';
import { useAuth } from '../../context/AuthContext';
import AccountCircle from '@mui/icons-material/AccountCircle';
import DropdownMenu, { MenuItemConfig } from '../shared/DropdownMenu';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [loginDialogOpen, setLoginDialogOpen] = React.useState(false);

  const [supportAnchorEl, setSupportAnchorEl] = React.useState<null | HTMLElement>(null);
  const supportMenuOpen = Boolean(supportAnchorEl);
  const openSupportMenu = (event: React.MouseEvent<HTMLElement>) =>
    setSupportAnchorEl(event.currentTarget);
  const closeSupportMenu = () => setSupportAnchorEl(null);

  // Explore dropdown state
  const [exploreAnchorEl, setExploreAnchorEl] = React.useState<null | HTMLElement>(null);
  const exploreMenuOpen = Boolean(exploreAnchorEl);
  const openExploreMenu = (event: React.MouseEvent<HTMLElement>) =>
    setExploreAnchorEl(event.currentTarget);
  const closeExploreMenu = () => setExploreAnchorEl(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLoginClick = () => {
    setLoginDialogOpen(true);
    handleMenuClose();
  };

  const handleProfileClick = () => navigate({ to: '/profile' });

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };
  const navLinks: { to: string; label: string }[] = [
    { to: '/question-builder', label: 'Question Builder' },
    // 'Explore' group handled as dropdown below
    { to: '/about', label: 'About' },
  ];

  const supportItems: MenuItemConfig[] = [
    { to: '/guide', label: 'Guide' },
    { to: '/tutorial', label: 'Tutorial' },
    { to: '/', label: 'Help' },
  ];

  const accountItems: MenuItemConfig[] = user
    ? [
        { key: 'profile', label: 'Profile', onClick: handleProfileClick },
        { key: 'logout', label: 'Logout', onClick: handleLogout },
      ]
    : [{ key: 'login', label: 'Login', onClick: handleLoginClick }];

  return (
    <AppBar position="relative" className="header">
      <Toolbar id="headerToolbar">
        <Link to="/" style={{ cursor: 'pointer', margin: 0 }}>
          <Logo height="32px" width="100%" style={{ paddingTop: '6px' }} />
        </Link>
        <div className="grow" />
        {navLinks.map((item) => (
          <Link className="nav-link" key={item.to} to={item.to}>
            {item.label}
          </Link>
        ))}
        <Button
          className="nav-link"
          id="explore-button"
          aria-controls={exploreMenuOpen ? 'explore-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={exploreMenuOpen ? 'true' : undefined}
          onClick={openExploreMenu}
        >
          Explore
        </Button>
        <DropdownMenu
          id="explore-menu"
          anchorEl={exploreAnchorEl}
          open={exploreMenuOpen}
          onClose={closeExploreMenu}
          items={[
            { to: '/explore/graphs', label: 'Graphs' },
            { to: '/details', label: 'Node Explorer' },
            { to: '/explore/enrichment-analysis', label: 'Enrichment Analysis' },
            { to: '/explore/drug-chemical', label: 'Drug to Disease Pair' },
          ]}
        />
        <Button
          className="nav-link"
          id="basic-button"
          aria-controls={supportMenuOpen ? 'support-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={supportMenuOpen ? 'true' : undefined}
          onClick={openSupportMenu}
        >
          Support
        </Button>
        <DropdownMenu
          id="support-menu"
          anchorEl={supportAnchorEl}
          open={supportMenuOpen}
          onClose={closeSupportMenu}
          items={supportItems}
          menuProps={{
            slotProps: {
              list: { 'aria-labelledby': 'basic-button' },
            },
          }}
        />
        <div>
          <IconButton onClick={handleMenuOpen}>
            {user ? (
              <Avatar src={user.profilePicture} sizes="small">
                {user.name ? user.name.charAt(0).toUpperCase() : ''}
              </Avatar>
            ) : (
              <AccountCircle style={{ fontSize: '32px' }} />
            )}
          </IconButton>
          <DropdownMenu
            id="account-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            items={accountItems}
            menuProps={{
              style: { marginTop: '48px' },
              anchorOrigin: { vertical: 'top', horizontal: 'right' },
              transformOrigin: { vertical: 'top', horizontal: 'right' },
            }}
          />
        </div>
      </Toolbar>
      <LoginDialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)} />
    </AppBar>
  );
}

export default Header;
