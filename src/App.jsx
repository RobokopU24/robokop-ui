import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import './App.css';
import Header from './components/header/Header';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StylesThemeProvider } from '@mui/styles';
import theme from './theme';

import QueryBuilder from './pages/queryBuilder/QueryBuilder';
import OAuthCallback from './pages/OAuthCallback';
import useBiolinkModel from './stores/useBiolinkModel';
import { useAlert } from './components/AlertProvider';
import BiolinkContext from './context/biolink.js';

import API from './API';

function App() {
  const biolink = useBiolinkModel();
  const { displayAlert } = useAlert();
  async function fetchBiolink() {
    const response = await API.biolink.getModelSpecification();
    if (response.status === 'error') {
      displayAlert(
        'error',
        'Failed to contact server to download biolink model. You will not be able to select general nodes or predicates. Please try again later.'
      );
      return;
    }
    biolink.setBiolinkModel(response);
  }
  useEffect(() => {
    fetchBiolink();
  }, []);
  return (
    <BiolinkContext.Provider value={biolink}>
      <MuiThemeProvider theme={theme}>
        <StylesThemeProvider theme={theme}>
          <Header />
          <div id="contentContainer">
            <Routes>
              <Route path="/" element={<QueryBuilder />} />
              <Route path="/oauth-callback" element={<OAuthCallback />} />
              <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
          </div>
        </StylesThemeProvider>
      </MuiThemeProvider>
    </BiolinkContext.Provider>
  );
}

export default App;
