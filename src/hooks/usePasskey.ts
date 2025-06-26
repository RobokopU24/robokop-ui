import { useState } from 'react';
import {
  startAuthentication,
  startRegistration,
  browserSupportsWebAuthn,
} from '@simplewebauthn/browser';
import axios from 'axios';
import routes from '../API/routes';

interface Passkey {
  id: string;
  createdAt: string;
  deviceType: string;
}

export const usePasskey = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loadingPasskeys, setLoadingPasskeys] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
  });

  const fetchPasskeys = async () => {
    setLoadingPasskeys(true);
    setError(null);
    try {
      const response = await axios.get(routes.passkeyRoutes.list, {
        headers: getAuthHeader(),
        withCredentials: true,
      });
      setPasskeys(response.data);
    } catch (fetchError) {
      console.error('Error fetching passkeys:', fetchError);
      setError('Failed to load passkeys');
    } finally {
      setLoadingPasskeys(false);
    }
  };

  const deletePasskey = async (id: string) => {
    setDeleteLoading(id);
    try {
      await axios.delete(`${routes.passkeyRoutes.base}/${id}`, {
        headers: getAuthHeader(),
        withCredentials: true,
      });

      setPasskeys(passkeys.filter((passkey) => passkey.id !== id));
    } catch (deleteError) {
      if (
        typeof deleteError === 'object' &&
        deleteError !== null &&
        'response' in deleteError &&
        (deleteError as any).response
      ) {
        throw new Error((deleteError as any).response.data?.message || 'Error deleting passkey');
      }
      throw deleteError;
    } finally {
      setDeleteLoading(null);
    }
  };

  const registerPasskey = async (email?: string) => {
    setIsLoading(true);
    setRegistrationError(null);
    try {
      const { data: optionsJSON } = await axios.post(
        routes.passkeyRoutes.generateRegistrationOptions,
        email ? { email } : {},
        {
          headers: getAuthHeader(),
          withCredentials: true,
        }
      );

      const registrationResponse = await startRegistration({ optionsJSON });

      const verifyResponse = await axios.post(
        routes.passkeyRoutes.verifyRegistration,
        registrationResponse,
        {
          headers: getAuthHeader(),
          withCredentials: true,
        }
      );

      if (!verifyResponse.data.verified) {
        throw new Error('Passkey registration failed');
      }

      if (!email) {
        await fetchPasskeys();
      }

      return verifyResponse.data;
    } catch (registerError) {
      if (registerError && typeof registerError === 'object' && 'message' in registerError) {
        setRegistrationError(
          (registerError as { message: string }).message || 'Failed to register passkey'
        );
      } else {
        setRegistrationError('Failed to register passkey');
      }
      throw registerError;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPasskey = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: optionsJSON } = await axios.post(
        routes.passkeyRoutes.generateAuthenticationOptions,
        {},
        {
          withCredentials: true,
        }
      );

      const authResponse = await startAuthentication({ optionsJSON });

      const verifyResponse = await axios.post(
        routes.passkeyRoutes.verifyAuthentication,
        authResponse,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (!verifyResponse.data.verified) {
        throw new Error('Passkey authentication failed');
      }

      return verifyResponse.data;
    } catch (loginError) {
      if (loginError && typeof loginError === 'object' && 'message' in loginError) {
        setError((loginError as { message: string }).message || 'Failed to login with passkey');
      } else {
        setError('Failed to login with passkey');
      }
      throw loginError;
    } finally {
      setIsLoading(false);
    }
  };

  const browserSupport = browserSupportsWebAuthn();

  return {
    registerPasskey,
    loginWithPasskey,
    fetchPasskeys,
    deletePasskey,
    browserSupport,
    passkeys,
    isLoading,
    loadingPasskeys,
    deleteLoading,
    error,
    registrationError,
  };
};
