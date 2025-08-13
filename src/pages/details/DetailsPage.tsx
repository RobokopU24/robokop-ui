import React, { useEffect } from 'react';
import './Details.css';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import IDResults from './IDResults';
import NameResults from './NameResults';
import { Link, useSearch } from '@tanstack/react-router';

function DetailsPage() {
  const searchParams = useSearch({ from: '/_appLayout/details/' });
  const [selectedOption, setSelectedOption] = React.useState<'id' | 'name'>(
    searchParams.type || 'id'
  );
  const [searchValue, setSearchValue] = React.useState(searchParams.q || '');
  const [loading, setLoading] = React.useState(false);

  const [idResults, setIdResults] = React.useState<any[]>([]);
  const [nameResults, setNameResults] = React.useState<any[]>([]);

  const handleSearch = () => {
    setLoading(true);
    if (selectedOption === 'id') {
      axios
        .get(
          'https://robokop-name-resolver.apps.renci.org/synonyms?preferred_curies=' + searchValue
        )
        .then((response) => {
          setIdResults(response.data);
        })
        .catch((error) => {
          console.error('Error fetching ID results:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      axios
        .get(
          `https://robokop-name-resolver.apps.renci.org/lookup?string=${searchValue}&autocomplete=true&highlighting=true&offset=0&limit=10`
        )
        .then((response) => {
          setNameResults(response.data);
        })
        .catch((error) => {
          console.error('Error fetching name results:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    if (searchParams.q && searchParams.type) {
      handleSearch();
    }
  }, [searchParams]);
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1200,
        margin: '4rem auto',
        textAlign: 'center',
      }}
    >
      <h2 style={{ fontWeight: 500 }}>Details Search</h2>
      <p
        style={{
          color: '#5E5E5E',
          fontSize: '16px',
          margin: '0 auto',
        }}
      >
        Search by curie ID for exact match, or by name for suggestions
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <p
          className={selectedOption === 'id' ? 'button-default' : 'button-secondary'}
          onClick={() => {
            setSelectedOption('id');
            setSearchValue('');
          }}
        >
          Search by ID
        </p>
        <p
          className={selectedOption === 'name' ? 'button-default' : 'button-secondary'}
          onClick={() => {
            setSelectedOption('name');
            setSearchValue('');
          }}
        >
          Search by Name
        </p>
      </div>
      <div
        style={{
          display: 'flex',
          maxWidth: 600,
          margin: '1rem auto',
          gap: '0.75rem',
          marginTop: '1rem',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            background: '#F5F5F5',
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            borderRadius: '8px',
          }}
        >
          <SearchIcon color="action" sx={{ width: 20, paddingLeft: 1, paddingRight: 1 }} />
          <input
            type="text"
            placeholder={selectedOption === 'id' ? 'e.g. MONDO:0005732' : 'e.g. diabetes'}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              flex: 1,
              padding: '8px 0',
            }}
          />
        </div>
        {/* <button
          onClick={handleSearch}
          className="button-secondary"
          style={{
            height: 'fit-content',
          }}
        >
          Search
        </button> */}
        <Link
          className="button-secondary"
          to="/details"
          search={{
            q: searchValue,
            type: selectedOption,
          }}
        >
          Search
        </Link>
      </div>
      {selectedOption === 'id' && <IDResults idResults={idResults} />}
      {selectedOption === 'name' && <NameResults nameResults={nameResults} />}
    </div>
  );
}

export default DetailsPage;
