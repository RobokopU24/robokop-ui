import React from 'react';
import {
  AppBar,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Link as MuiLink,
  Toolbar,
} from '@mui/material';

import './header.css';

import Logo from '../Logo';
import { Link, useNavigate } from 'react-router-dom';
import LoginDialog from '../LoginDialog';
import { useAuth } from '../../context/AuthContext';
import { AccountCircle } from '@mui/icons-material';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  //   const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [loginDialogOpen, setLoginDialogOpen] = React.useState(false);

  const handleMenuOpen = (event) => {
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
    navigate('/profile');
    handleMenuClose();
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };
  return (
    <AppBar position="relative" className="header">
      <Toolbar id="headerToolbar">
        <MuiLink href="/" sx={{ cursor: 'pointer', margin: 0 }}>
          <Logo height="32px" width="100%" style={{ paddingTop: '6px' }} />
        </MuiLink>
        <div className="grow" />
        <Link to="/">Question Builder</Link>
        <Link to="/explore">Explore</Link>
        <Link to="/about">About</Link>
        <Link to="/guide">Guide</Link>
        <Link to="/tutorial">Tutorial</Link>
        {/* This will go to the actual root of the host (robokop.renci.org/#contact), not an internal route in this application */}
        <a href="/#contact">Help</a>
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
