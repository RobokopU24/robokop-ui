import React from 'react';
import DetailsResultCard from './DetailsResultCard';

function IDResults({ idResults }: { idResults: any }) {
  let firstResult: any = null;
  let searchedId: string | undefined;

  if (Array.isArray(idResults)) {
    firstResult = idResults[0];
  } else if (idResults && typeof idResults === 'object') {
    const keys = Object.keys(idResults);
    if (keys.length > 0) {
      searchedId = keys[0];
      const value = (idResults as any)[searchedId];
      if (Array.isArray(value)) firstResult = value[0];
      else firstResult = value;
    }
  }

  return (
    <div
      style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
    >
      {searchedId && (
        <p style={{ fontSize: '20px', marginBottom: 0 }}>
          Search Results for ID: <span style={{ fontWeight: 500 }}>{searchedId}</span>
        </p>
      )}
      <DetailsResultCard result={firstResult} type="id" />
    </div>
  );
}

export default IDResults;
