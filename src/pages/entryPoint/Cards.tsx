import React from 'react';

interface CardsProps {
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  action: () => void;
}

function Cards({ icon, title, description, buttonText, action }: CardsProps) {
  return (
    <div
      style={{
        border: '1px solid #D9D9D9',
        borderRadius: '8px',
        padding: '32px 16px',
        width: '260px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: '#D9D9D9',
          borderRadius: '8px',
          width: 'fit-content',
          margin: '0 auto',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img src={icon} alt={title} />
      </div>
      <h3 style={{ margin: '20px 0 0 0', fontWeight: 500 }}>{title}</h3>
      <p style={{ color: '#5E5E5E', fontSize: '14px', margin: '12px 0 32px 0' }}>{description}</p>
      <button
        onClick={action}
        style={{
          width: '100%',
          background: 'linear-gradient(89deg, #627DFF 0%, #7A5AFB 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 0',
          cursor: 'pointer',
        }}
      >
        <p style={{ margin: 0, fontWeight: 400, fontSize: '14px' }}>{buttonText}</p>
      </button>
    </div>
  );
}

export default Cards;
