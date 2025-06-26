import React, { useEffect } from 'react';
import useBiolinkModel from '../stores/useBiolinkModel';
import API from '../API';
import { useAlert } from './AlertProvider';
import theme from '../theme';
import BiolinkContext from '../context/biolink';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StylesThemeProvider } from '@mui/styles';
import { AuthProvider } from '../context/AuthContext';
import Header from './header/Header';
import Footer from './footer/Footer';

interface RootComponentWrapperProps {
  children: React.ReactNode;
}

function RootComponentWrapper({ children }: RootComponentWrapperProps) {
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
    <AuthProvider>
      <BiolinkContext.Provider value={biolink}>
        <MuiThemeProvider theme={theme}>
          <StylesThemeProvider theme={theme}>
            <div id="pageContainer">
              <Header />
              <div id="contentContainer">{children}</div>
              <Footer />
            </div>
          </StylesThemeProvider>
        </MuiThemeProvider>
      </BiolinkContext.Provider>
    </AuthProvider>
  );
}

export default RootComponentWrapper;
