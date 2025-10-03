import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress, Typography } from '@mui/material';

import { AuthProvider, useAuth } from './contexts';
import AppLayout from './components/layout/AppLayout.jsx';
import HomePage from './components/HomePage.jsx';
import PackagesViewPage from './components/PackagesViewPage.jsx';
import AuthLogin from './features/auth/components/AuthLogin.jsx';
import AuthRegister from './features/auth/components/AuthRegister.jsx';
import { theme } from './styles/theme';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #e0f2fe 0%, #e8eaf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box textAlign='center'>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant='body1' color='text.secondary'>
            Đang tải...
          </Typography>
        </Box>
      </Box>
    );
  }

  return !isAuthenticated ? <PublicRoutes /> : <AppLayout />;
};

// Public Routes Component (for unauthenticated users)
const PublicRoutes = () => (
  <Routes>
    {/* Homepage as main landing page - only for public users */}
    <Route path='/' element={<HomePage />} />

    {/* Public packages view page */}
    <Route path='/packages' element={<PackagesViewPage />} />

    {/* Auth pages with header and footer */}
    <Route path='/login' element={<AuthLogin />} />
    <Route path='/register' element={<AuthRegister />} />

    {/* Redirect protected routes to login */}
    <Route path='/dashboard' element={<Navigate to='/login' />} />
    <Route path='/devices' element={<Navigate to='/login' />} />
    <Route path='/schedules' element={<Navigate to='/login' />} />
    <Route path='/profile' element={<Navigate to='/login' />} />

    {/* Default redirect to homepage */}
    <Route path='*' element={<Navigate to='/' />} />
  </Routes>
);

export default App;
