import React from 'react';
import { AppBar, Avatar, IconButton, Menu, MenuItem, Toolbar } from '@mui/material';

import './header.css';

import Logo from '../Logo';
import { useNavigate, Link } from '@tanstack/react-router';
import LoginDialog from '../LoginDialog';
import { useAuth } from '../../context/AuthContext';
import AccountCircle from '@mui/icons-material/AccountCircle';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  //   const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [loginDialogOpen, setLoginDialogOpen] = React.useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLoginClick = () => {
    setLoginDialogOpen(true);
    handleMenuClose();
  };

  const handleProfileClick = () => {
    navigate({ to: '/profile' });
    handleMenuClose();
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };
  return (
    <AppBar position="relative" className="header">
      <Toolbar id="headerToolbar">
        <Link to="/" style={{ cursor: 'pointer', margin: 0 }}>
          <Logo height="32px" width="100%" style={{ paddingTop: '6px' }} />
        </Link>
        <div className="grow" />
        <Link to="/question-builder">Question Builder</Link>
        <Link to="/details">Node Explorer</Link>
        <Link to="/explore">Explore</Link>
        <Link to="/about">About</Link>
        <Link to="/guide">Guide</Link>
        <Link to="/tutorial">Tutorial</Link>
        {/* This will go to the actual root of the host (robokop.renci.org/#contact), not an internal route in this application */}
        <Link to="/">Help</Link>
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
          <Menu
            style={{ marginTop: '48px' }}
            id="account-menu"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {user ? (
              [
                <MenuItem onClick={handleProfileClick} key="profile">
                  Profile
                </MenuItem>,
                <MenuItem onClick={handleLogout} key="logout">
                  Logout
                </MenuItem>,
              ]
            ) : (
              <MenuItem onClick={handleLoginClick}>Login</MenuItem>
            )}
          </Menu>
        </div>
      </Toolbar>
      <LoginDialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)} />
    </AppBar>
  );
}

export default Header;
