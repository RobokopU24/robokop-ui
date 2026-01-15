import React from 'react';
import { Menu, MenuItem, Typography, Box } from '@mui/material';
import { Link } from '@tanstack/react-router';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export type MenuItemConfig = {
  key?: string;
  label: React.ReactNode;
  to?: string;
  onClick?: () => void;
  closeOnClick?: boolean;
  external?: boolean;
};

type DropdownMenuProps = {
  id: string;
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  items: MenuItemConfig[];
  menuProps?: Partial<React.ComponentProps<typeof Menu>>;
};

function DropdownMenu({ id, anchorEl, open, onClose, items, menuProps }: DropdownMenuProps) {
  const handleItemClick = (item: MenuItemConfig) => () => {
    item.onClick?.();
    if (item.closeOnClick !== false) onClose();
  };

  return (
    <Menu
      id={id}
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      keepMounted
      PaperProps={{
        elevation: 3,
        sx: {
          borderRadius: 2,
          mt: 1,
          minWidth: 180,
          '& .MuiMenuItem-root': {
            transition: 'background-color 0.15s ease',
          },
        },
      }}
      {...menuProps}
    >
      {items.map((item, idx) => {
        const key = item.key ?? `${id}-item-${idx}`;
        const labelContent = (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {item.label}
            </Typography>
            {item.external && <OpenInNewIcon sx={{ fontSize: 16 }} />}
          </Box>
        );

        const content = item.to ? (
          item.external ? (
            <a
              href={item.to}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
            >
              {labelContent}
            </a>
          ) : (
            <Link to={item.to} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
              {labelContent}
            </Link>
          )
        ) : (
          labelContent
        );

        return (
          <MenuItem
            key={key}
            onClick={handleItemClick(item)}
            sx={{
              py: 1,
              px: 2,
              '&:hover': { backgroundColor: 'action.hover' },
            }}
            disableRipple
          >
            {content}
          </MenuItem>
        );
      })}
    </Menu>
  );
}

export default DropdownMenu;
