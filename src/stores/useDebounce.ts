import { useState, useEffect } from 'react';

function useDebounce(value: unknown, delay: number | undefined) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(debounce);
    };
  }, [value]);

  return debouncedValue;
}

export default useDebounce;
