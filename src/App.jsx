import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import './App.css';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StylesThemeProvider } from '@mui/styles';
import theme from './theme';

import QueryBuilder from './pages/queryBuilder/QueryBuilder';
import OAuthCallback from './pages/OAuthCallback';
import useBiolinkModel from './stores/useBiolinkModel';
import { useAlert } from './components/AlertProvider';
import BiolinkContext from './context/biolink.js';

import API from './API';
import Profile from './pages/Profile.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import About from './pages/About.jsx';
import Guide from './pages/Guide.jsx';
import Tutorial from './pages/Tutorial.jsx';
import TermsOfService from './pages/TermsOfService.jsx';
import ActivateUser from './pages/ActivateUser.jsx';
import Answer from './pages/answer/Answer.jsx';

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
              <Route path="/about" element={<About />} />
              <Route path="/guide" element={<Guide />} />
              <Route path="/tutorial" element={<Tutorial />} />
              <Route path="/termsofservice" element={<TermsOfService />} />
              <Route path="/activate-user" element={<ActivateUser />} />
              <Route path="/answer/:answer_id?" element={<Answer />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
          </div>
          <Footer />
        </StylesThemeProvider>
      </MuiThemeProvider>
    </BiolinkContext.Provider>
  );
}

export default App;
