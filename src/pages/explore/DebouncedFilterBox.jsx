import { IconButton, InputLabel, FormControl, InputAdornment, FilledInput } from '@mui/material';
import Clear from '@mui/icons-material/Clear';
import React from 'react';

function DebouncedFilterBox({ value: initialValue, onChange, debounce = 500, ...props }) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <FormControl fullWidth variant="filled">
      <InputLabel htmlFor="filter">Filter</InputLabel>
      <FilledInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        variant="filled"
        margin="dense"
        endAdornment={
          <InputAdornment position="end">
            <IconButton aria-label="Clear filter" onClick={() => setValue('')} size="small">
              <Clear />
            </IconButton>
          </InputAdornment>
        }
        {...props}
      />
    </FormControl>
  );
}

export default React.memo(DebouncedFilterBox);
