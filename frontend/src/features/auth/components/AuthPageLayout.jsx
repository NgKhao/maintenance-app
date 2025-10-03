import React from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Avatar,
  Typography,
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import UniversalHeader from '../../../components/layout/UniversalHeader.jsx';
import Footer from '../../../components/layout/Footer.jsx';

const AuthPageLayout = ({ children, title, subtitle, maxWidth = 400 }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #e8eaf6 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Universal Header */}
      <UniversalHeader isPublic={true} />

      {/* Main Content */}
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 12, // Padding for fixed header and spacing
          px: 2,
        }}
      >
        <Container maxWidth='sm'>
          <Box sx={{ maxWidth, width: '100%', mx: 'auto' }}>
            {/* Logo and Title Section */}
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
                {subtitle}
              </Typography>
            </Box>

            {/* Form Card */}
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              }}
            >
              <CardContent sx={{ p: 4 }}>{children}</CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default AuthPageLayout;
