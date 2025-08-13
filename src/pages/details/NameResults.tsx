import React from 'react';
import DetailsResultCard from './DetailsResultCard';

interface NameResultsProps {
  nameResults: any[];
}

function NameResults({ nameResults }: NameResultsProps) {
  return (
    <div className="details-card-multi-grid">
      {nameResults.map((result, index) => (
        <DetailsResultCard key={index} result={result} type="name" />
      ))}
    </div>
  );
}

export default NameResults;
