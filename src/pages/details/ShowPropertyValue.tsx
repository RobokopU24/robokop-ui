import React from 'react';

export default function ShowPropertyValue({
  propertyValue,
}: {
  propertyValue: string | number | boolean | Array<string | number>;
}) {
  if (typeof propertyValue === 'boolean') {
    if (propertyValue) {
      return <span>Yes</span>;
    }
    return <span>No</span>;
  } else if (Array.isArray(propertyValue)) {
    return (
      <span
        style={{ display: 'flex', flexDirection: 'column', maxHeight: '350px', overflowY: 'auto' }}
      >
        {propertyValue.map((m) => (
          <div key={m}>{m}</div>
        ))}
      </span>
    );
  } else {
    return <span>{propertyValue}</span>;
  }
}
