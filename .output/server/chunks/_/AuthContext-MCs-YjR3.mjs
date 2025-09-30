import { jsx } from 'react/jsx-runtime';
import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { u as useAlert, r as routes } from './AlertProvider-wxvwEFCh.mjs';

const AuthContext = createContext(null);
const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const { displayAlert } = useAlert();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.post(routes.authRoutes.validateToken, {
          token
        });
        setUser(response.data.user);
      } catch (error) {
        console.log(error);
        localStorage.removeItem("authToken");
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, []);
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("authToken", token);
    displayAlert("success", "You have successfully logged in.");
  };
  const logout = async () => {
    setUser(null);
    localStorage.removeItem("authToken");
    await new Promise((resolve) => setTimeout(resolve, 0));
    displayAlert("success", "You have successfully logged out.");
    navigate({ to: "/" });
  };
  return /* @__PURE__ */ jsx(
    AuthContext.Provider,
    {
      value: {
        user,
        loading,
        setUser,
        login,
        logout
      },
      children
    }
  );
};
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider as A, useAuth as u };
//# sourceMappingURL=AuthContext-MCs-YjR3.mjs.map
