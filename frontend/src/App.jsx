import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

import { AuthProvider, useAuth } from './contexts';
import { LoginForm, RegisterForm } from './features/auth';
import AppLayout from './components/layout/AppLayout.jsx';
import theme from './styles/theme';

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

  return !isAuthenticated ? <AuthRoutes /> : <AppLayout />;
};

// Auth Routes Component
const AuthRoutes = () => (
  <Box
    sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0f2fe 0%, #e8eaf6 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
    }}
  >
    <Box sx={{ maxWidth: 400, width: '100%' }}>
      <Box textAlign='center' mb={4}>
        <Box display='flex' justifyContent='center' mb={2}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'primary.main',
              borderRadius: 3,
            }}
          >
            <SettingsIcon sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>
        <Typography variant='h3' component='h1' gutterBottom>
          Maintenance Pro
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Hệ thống quản lý bảo trì thiết bị gia dụng
        </Typography>
      </Box>

      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Routes>
            <Route
              path='/login'
              element={
                <LoginForm
                  onSwitch={() => (window.location.href = '/register')}
                />
              }
            />
            <Route
              path='/register'
              element={
                <RegisterForm
                  onSwitch={() => (window.location.href = '/login')}
                />
              }
            />
            <Route path='*' element={<Navigate to='/login' />} />
          </Routes>
        </CardContent>
      </Card>
    </Box>
  </Box>
);

export default App;
