import { jsxs, jsx } from 'react/jsx-runtime';
import { useContext, createContext, useState, useCallback } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const baseAPI = "http://localhost:4000";
const baseAuthURL = `${baseAPI}/api`;
const authEndpoint = `${baseAuthURL}/auth`;
const authRoutes = {
  validateToken: `${authEndpoint}/validate-token`,
  github: `${authEndpoint}/github`,
  google: `${authEndpoint}/google`,
  login: `${authEndpoint}/login`,
  logout: `${authEndpoint}/logout`,
  magicLink: `${authEndpoint}/verification-link`,
  activateUserTokenHandler: `${authEndpoint}/activate-user-token`,
  activateNewUser: `${authEndpoint}/activate-new-user`
};
const passkeyEndpoint = `${baseAuthURL}/passkeys`;
const passkeyRoutes = {
  base: passkeyEndpoint,
  list: `${passkeyEndpoint}/list`,
  generateRegistrationOptions: `${passkeyEndpoint}/generate-registration-options`,
  verifyRegistration: `${passkeyEndpoint}/verify-registration`,
  generateAuthenticationOptions: `${passkeyEndpoint}/generate-authentication-options`,
  verifyAuthentication: `${passkeyEndpoint}/verify-authentication`
};
const queryEndpoint = `${baseAuthURL}/queries`;
const queryRoutes = {
  base: queryEndpoint
};
const routes = { authRoutes, passkeyRoutes, queryRoutes };
const AlertContext = createContext(void 0);
const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlert must be used within an AlertProvider");
  return context;
};
const AlertProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("info");
  const displayAlert = useCallback((severity2, message2) => {
    setMessage(message2);
    setSeverity(severity2);
    setOpen(true);
  }, []);
  const handleClose = () => {
    setOpen(false);
  };
  return /* @__PURE__ */ jsxs(AlertContext.Provider, { value: { displayAlert }, children: [
    children,
    /* @__PURE__ */ jsx(
      Snackbar,
      {
        open,
        autoHideDuration: 6e3,
        onClose: handleClose,
        anchorOrigin: { vertical: "top", horizontal: "center" },
        children: /* @__PURE__ */ jsx(MuiAlert, { onClose: handleClose, severity, variant: "filled", elevation: 6, children: message })
      }
    )
  ] });
};

export { AlertProvider as A, baseAuthURL as a, baseAPI as b, routes as r, useAlert as u };
//# sourceMappingURL=AlertProvider-wxvwEFCh.mjs.map
