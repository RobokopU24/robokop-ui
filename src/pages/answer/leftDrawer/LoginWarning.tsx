import { Modal } from '@mui/material';
import React from 'react';

function LoginWarning({
  isOpen,
  onClose,
  warningType = 'login',
}: {
  isOpen: boolean;
  onClose: () => void;
  warningType?: 'login' | 'premium' | null;
}) {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <div
        style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          maxWidth: '500px',
          margin: 'auto',
          marginTop: '100px',
        }}
      >
        {/* <h2>Please log in to use this feature.</h2> */}
        {warningType === 'login' && <h2>Please log in to use this feature.</h2>}
        {warningType === 'premium' && (
          <h2>This feature is available for premium users only. Please upgrade your account.</h2>
        )}
        <button onClick={onClose} className="button-cancel" style={{ marginTop: '20px' }}>
          Close
        </button>
      </div>
    </Modal>
  );
}

export default LoginWarning;
