import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { Link } from '@tanstack/react-router';

export type MenuItemConfig = {
  key?: string;
  label: React.ReactNode;
  to?: string;
  onClick?: () => void;
  closeOnClick?: boolean;
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
    <Menu id={id} anchorEl={anchorEl} open={open} onClose={onClose} keepMounted {...menuProps}>
      {items.map((item, idx) => {
        const key = item.key ?? `${id}-item-${idx}`;
        const content = item.to ? (
          <Link to={item.to} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
            {item.label}
          </Link>
        ) : (
          item.label
        );

        return (
          <MenuItem onClick={handleItemClick(item)} key={key} disableRipple>
            {content}
          </MenuItem>
        );
      })}
    </Menu>
  );
}

export default DropdownMenu;
