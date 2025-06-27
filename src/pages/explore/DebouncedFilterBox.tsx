import { IconButton, InputLabel, FormControl, InputAdornment, FilledInput } from '@mui/material';
import Clear from '@mui/icons-material/Clear';
import React from 'react';

interface DebouncedFilterBoxProps {
  value: string;
  onChange: (value: string) => void;
  debounce?: number;
  [key: string]: any;
}

function DebouncedFilterBox({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: DebouncedFilterBoxProps) {
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
