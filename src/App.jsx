import React from 'react';
import { Routes, Route } from 'react-router-dom';

import './App.css';
import Header from './components/header/Header';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

import QueryBuilder from './pages/queryBuilder/QueryBuilder';
import OAuthCallback from './pages/OAuthCallback';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Header />
      <div id="contentContainer">
        <Routes>
          <Route path="/" element={<QueryBuilder />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
