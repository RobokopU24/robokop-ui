import { Modal } from '@mui/material';
import React from 'react';

function LoginWarning({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
        <h2>Please log in to use this feature.</h2>
        <button onClick={onClose} className="button-cancel" style={{ marginTop: '20px' }}>
          Close
        </button>
      </div>
    </Modal>
  );
}

export default LoginWarning;
