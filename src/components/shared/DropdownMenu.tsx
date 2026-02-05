import React from "react";
import { Menu, MenuItem, Typography } from "@mui/material";
import { Link } from "@tanstack/react-router";

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
          "& .MuiMenuItem-root": {
            transition: "background-color 0.15s ease",
          },
        },
      }}
      {...menuProps}
    >
      {items.map((item, idx) => {
        const key = item.key ?? `${id}-item-${idx}`;

        if (item.to) {
          return (
            <MenuItem
              key={key}
              component={Link}
              to={item.to}
              onClick={handleItemClick(item)}
              sx={{
                py: 1,
                px: 2,
                textDecoration: "none",
                color: "inherit",
                "&:hover": { backgroundColor: "action.hover" },
              }}
              disableRipple
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {item.label}
              </Typography>
            </MenuItem>
          );
        }

        return (
          <MenuItem
            key={key}
            onClick={handleItemClick(item)}
            sx={{
              py: 1,
              px: 2,
              "&:hover": { backgroundColor: "action.hover" },
            }}
            disableRipple
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {item.label}
            </Typography>
          </MenuItem>
        );
      })}
    </Menu>
  );
}

export default DropdownMenu;
