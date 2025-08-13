import React from 'react';
import { Link } from '@tanstack/react-router';
import './Details.css';
import strings from '../../utils/strings';
import { conceptColorMap, undefinedColor } from '../../utils/colors';

export interface DetailsResultCardProps {
  result: any | null;
  loading?: boolean;
  type: 'id' | 'name';
}

export default function DetailsResultCard({ result, loading, type }: DetailsResultCardProps) {
  if (loading) {
    return (
      <div className="details-card">
        <p style={{ margin: 0 }}>Loading...</p>
      </div>
    );
  }

  if (!result) {
    return null;
  }
  if (type === 'id') {
    const { curie, preferred_name, names = [], types = [], clique_identifier_count } = result || {};

    const synonymCount = names?.length || 0;
    const primaryTypes = (types || []).slice(0, 3);

    return (
      <div className="details-card">
        <div className="details-card-section">
          <div>
            <div className="details-card-label">Preferred Name</div>
            <div className="details-card-value details-card-value--large">
              {preferred_name || '—'}
            </div>
          </div>
          <div className="details-card-grid">
            <div className="details-card-label">Curie</div>
            <div className="details-card-value">{curie || '—'}</div>
            <div className="details-card-label">Types</div>
            <div className="details-card-value">
              {primaryTypes.length ? primaryTypes.join(', ') : '—'}
            </div>
            <div className="details-card-label">Synonyms</div>
            <div className="details-card-value">{synonymCount}</div>
            {clique_identifier_count !== undefined && (
              <>
                <div className="details-card-label">Clique IDs</div>
                <div className="details-card-value">{clique_identifier_count}</div>
              </>
            )}
          </div>
          <div className="details-card-type-tags">
            {primaryTypes.map((t: string) => (
              <span key={t} className="details-card-type-tag">
                {t}
              </span>
            ))}
          </div>
        </div>
        {curie && (
          <div className="details-card-actions">
            <Link
              to="/details/$details_id"
              params={{ details_id: curie }}
              className="details-card-button"
            >
              See more details →
            </Link>
          </div>
        )}
      </div>
    );
  } else {
    const { label, curie, highlighting, synonyms, types = [] } = result || {};
    const synonymDisplay = (synonyms || []).slice(0, 3).join(', ');
    return (
      <div className="details-card">
        <div className="details-card-section">
          <div>
            <div className="details-card-label">Preferred Name</div>
            <div className="details-card-value details-card-value--large">
              {highlighting?.labels?.length ? (
                <span dangerouslySetInnerHTML={{ __html: highlighting.labels[0] }} />
              ) : (
                label || '—'
              )}
            </div>
          </div>
          <div className="details-card-grid">
            <div className="details-card-label">Curie</div>
            <div className="details-card-value">{curie || '—'}</div>
            <div className="details-card-label">Synonyms</div>
            <div className="details-card-value">{synonymDisplay || '—'}</div>
          </div>
          <div className="details-card-type-tags">
            {types.map((t: string) => (
              <span
                key={t}
                className="details-card-type-tag"
                style={{ backgroundColor: conceptColorMap[t] || undefinedColor }}
              >
                {strings.displayCategory(t)}
              </span>
            ))}
          </div>
        </div>
        {curie && (
          <div className="details-card-actions">
            <Link
              to="/details/$details_id"
              params={{ details_id: curie }}
              className="details-card-button"
            >
              See more details →
            </Link>
          </div>
        )}
      </div>
    );
  }
}
