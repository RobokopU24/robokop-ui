import { jsx } from 'react/jsx-runtime';
import { useEffect } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import axios from 'axios';
import { r as routes } from './AlertProvider-wxvwEFCh.mjs';
import { u as useAuth } from './AuthContext-MCs-YjR3.mjs';
import '@mui/material/Snackbar';
import '@mui/material/Alert';

function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  useEffect(() => {
    const validateToken = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        if (!token) {
          navigate({ to: "/question-builder" });
          return;
        }
        const response = await axios.post(
          routes.authRoutes.validateToken,
          { token },
          { headers: { "Content-Type": "application/json" } }
        );
        if (response.status === 200 && response.data.message === "Token is valid") {
          login(response.data.user, token);
          navigate({ to: "/question-builder" });
        } else {
          navigate({ to: "/question-builder" });
        }
      } catch (error) {
        console.log("Error validating token:", error);
        navigate({ to: "/question-builder" });
      }
    };
    validateToken();
  }, [location, navigate, login]);
  return /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("h2", { children: "Validating your login..." }) });
}
const SplitComponent = function RouteComponent() {
  return /* @__PURE__ */ jsx(OAuthCallback, {});
};

export { SplitComponent as component };
//# sourceMappingURL=oauth-callback-Dj9ShAuY.mjs.map
