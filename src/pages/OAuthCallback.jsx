import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import routes from '../API/routes';
import { useAuth } from '../context/AuthContext';

function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const validateToken = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
          // TODO: Handle the case where no token is provided
          navigate('/');
          return;
        }

        const response = await axios.post(
          routes.authRoutes.validateToken,
          { token },
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (response.status === 200 && response.data.message === 'Token is valid') {
          login(response.data.user, token);
          navigate('/dashboard');
        } else {
          // TODO: Handle invalid token case
          navigate('/');
        }
      } catch (error) {
        console.log('Error validating token:', error);
        // TODO: Handle errors, such as network issues or server errors
        navigate('/');
      }
    };

    validateToken();
  }, [location, navigate, login]);

  return (
    <div>
      <h2>Validating your login...</h2>
    </div>
  );
}

export default OAuthCallback;
