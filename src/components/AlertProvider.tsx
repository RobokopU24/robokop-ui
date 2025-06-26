import React, { createContext, useContext, useState, useCallback } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

type AlertSeverity = 'success' | 'error' | 'info' | 'warning';

type AlertContextType = {
  displayAlert: (severity: AlertSeverity, message: string) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlert must be used within an AlertProvider');
  return context;
};

type AlertProviderProps = {
  children: React.ReactNode;
};

const AlertProvider = ({ children }: AlertProviderProps) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertSeverity>('info');

  const displayAlert = useCallback((severity: AlertSeverity, message: string) => {
    setMessage(message);
    setSeverity(severity);
    setOpen(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <AlertContext.Provider value={{ displayAlert }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={handleClose} severity={severity} variant="filled" elevation={6}>
          {message}
        </MuiAlert>
      </Snackbar>
    </AlertContext.Provider>
  );
};

export default AlertProvider;
