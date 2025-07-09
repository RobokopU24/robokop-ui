import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, Input, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate, useSearch } from '@tanstack/react-router';
import axios from 'axios';
import routes from '../API/routes';
import { useAlert } from '../components/AlertProvider';

function ActivateUser() {
  const search = useSearch({ from: '/_appLayout/activate-user/' });
  console.log(search);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { displayAlert } = useAlert();

  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [expiryTime, setExpiryTime] = React.useState('');
  const [countdownStr, setCountdownStr] = React.useState('');

  useEffect(() => {
    axios
      .get(`${routes.authRoutes.activateUserTokenHandler}/?token=${search.token}`)
      .then((response) => {
        setEmail(response.data.email);
        setExpiryTime(response.data.exp);
      })
      .catch((error) => {
        console.error('Error fetching activation data:', error);
        displayAlert('error', 'Invalid or expired activation link. Please try again.');
        navigate({ to: '/question-builder' });
      });
  }, []);

  const countdown = (expiry: string | number) => {
    const expiryDate = new Date(Number(expiry) * 1000);
    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();
    if (diff <= 0) return 'Expired';
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds} mins`;
  };

  useEffect(() => {
    if (!expiryTime) return;
    const interval = setInterval(() => {
      setCountdownStr(countdown(expiryTime));
    }, 1000);
    setCountdownStr(countdown(expiryTime));
    return () => clearInterval(interval);
  }, [expiryTime]);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleActivate = () => {
    axios
      .post(routes.authRoutes.activateNewUser, {
        email: email.trim(),
        name: fullName.trim(),
      })
      .then((response) => {
        displayAlert('success', 'Account activated successfully!.');
        navigate({ to: `/oauth-callback?token=${response.data.token}` });
      })
      .catch((error) => {
        console.error('Error activating account:', error);
        displayAlert('error', 'Failed to activate account. Please try again.');
      });
  };

  return (
    <Dialog open maxWidth="sm" fullWidth>
      <DialogTitle>Activate Your Account</DialogTitle>
      <DialogContent>
        <p>
          Hello <strong>{email}!</strong>
        </p>
        <p>
          You&apos;re almost done activating your account. Please enter your full name and click{' '}
          <strong>Activate</strong>.
        </p>
        <p style={{ fontSize: '1rem', color: 'red' }}>Your link will expire in {countdownStr}.</p>
        <Input
          placeholder="Full Name"
          fullWidth
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleActivate}
          disabled={!fullName}
          style={{ marginTop: '16px' }}
        >
          Activate
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default ActivateUser;
