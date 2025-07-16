import React, { createContext, useContext, useState, useEffect, use } from 'react';
import { useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import routes from '../API/routes';
import { useAlert } from '../components/AlertProvider';
import posthog from 'posthog-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (userData: User, token: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

interface User {
  id: string;
  email: string;
  createdAt: string;
  name?: string;
  profilePicture?: string;
  _count?: {
    WebAuthnCredential: number;
  };
}
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const { displayAlert } = useAlert();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(routes.authRoutes.validateToken, {
          token,
        });
        const userData: User = response.data.user;
        setUser(userData);
        posthog.identify(userData.id, { email: userData.email, name: userData.name });
      } catch (error) {
        console.log(error);
        // TODO: Handle token validation errors
        // console.error('Token validation failed:', error);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
    posthog.identify(userData.id, { email: userData.email, name: userData.name });
    localStorage.setItem('authToken', token);
    displayAlert('success', 'You have successfully logged in.');
  };

  const logout = async () => {
    setUser(null);
    posthog.reset();
    localStorage.removeItem('authToken');
    displayAlert('success', 'You have successfully logged out.');
    navigate({ to: '/' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
