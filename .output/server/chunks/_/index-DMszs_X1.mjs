import { jsx, jsxs } from 'react/jsx-runtime';
import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Input, Button } from '@mui/material';
import { u as useAuth } from './AuthContext-MCs-YjR3.mjs';
import { useSearch, useNavigate, Navigate } from '@tanstack/react-router';
import axios from 'axios';
import { u as useAlert, r as routes } from './AlertProvider-wxvwEFCh.mjs';
import '@mui/material/Snackbar';
import '@mui/material/Alert';

function ActivateUser() {
  const search = useSearch({ from: "/_appLayout/activate-user/" });
  const { user } = useAuth();
  const navigate = useNavigate();
  const { displayAlert } = useAlert();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [expiryTime, setExpiryTime] = React.useState("");
  const [countdownStr, setCountdownStr] = React.useState("");
  useEffect(() => {
    axios.get(`${routes.authRoutes.activateUserTokenHandler}/?token=${search.token}`).then((response) => {
      setEmail(response.data.email);
      setExpiryTime(response.data.exp);
    }).catch((error) => {
      console.error("Error fetching activation data:", error);
      displayAlert("error", "Invalid or expired activation link. Please try again.");
      navigate({ to: "/question-builder" });
    });
  }, []);
  const countdown = (expiry) => {
    const expiryDate = new Date(Number(expiry) * 1e3);
    const now = /* @__PURE__ */ new Date();
    const diff = expiryDate.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    const minutes = Math.floor(diff / 1e3 / 60 % 60);
    const seconds = Math.floor(diff / 1e3 % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds} mins`;
  };
  useEffect(() => {
    if (!expiryTime) return;
    const interval = setInterval(() => {
      setCountdownStr(countdown(expiryTime));
    }, 1e3);
    setCountdownStr(countdown(expiryTime));
    return () => clearInterval(interval);
  }, [expiryTime]);
  if (user) {
    return /* @__PURE__ */ jsx(Navigate, { to: "/", replace: true });
  }
  const handleActivate = () => {
    axios.post(routes.authRoutes.activateNewUser, {
      email: email.trim(),
      name: fullName.trim()
    }).then((response) => {
      displayAlert("success", "Account activated successfully!.");
      navigate({ to: `/oauth-callback?token=${response.data.token}` });
    }).catch((error) => {
      console.error("Error activating account:", error);
      displayAlert("error", "Failed to activate account. Please try again.");
    });
  };
  return /* @__PURE__ */ jsxs(Dialog, { open: true, maxWidth: "sm", fullWidth: true, children: [
    /* @__PURE__ */ jsx(DialogTitle, { children: "Activate Your Account" }),
    /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxs("p", { children: [
        "Hello ",
        /* @__PURE__ */ jsxs("strong", { children: [
          email,
          "!"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        "You're almost done activating your account. Please enter your full name and click",
        " ",
        /* @__PURE__ */ jsx("strong", { children: "Activate" }),
        "."
      ] }),
      /* @__PURE__ */ jsxs("p", { style: { fontSize: "1rem", color: "red" }, children: [
        "Your link will expire in ",
        countdownStr,
        "."
      ] }),
      /* @__PURE__ */ jsx(
        Input,
        {
          placeholder: "Full Name",
          fullWidth: true,
          required: true,
          value: fullName,
          onChange: (e) => setFullName(e.target.value)
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "contained",
          color: "primary",
          onClick: handleActivate,
          disabled: !fullName,
          style: { marginTop: "16px" },
          children: "Activate"
        }
      )
    ] })
  ] });
}
const SplitComponent = function RouteComponent() {
  return /* @__PURE__ */ jsx(ActivateUser, {});
};

export { SplitComponent as component };
//# sourceMappingURL=index-DMszs_X1.mjs.map
