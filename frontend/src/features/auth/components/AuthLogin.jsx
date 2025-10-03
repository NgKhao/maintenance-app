import React from 'react';
import { Typography, Link as MuiLink, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import AuthPageLayout from './AuthPageLayout.jsx';
import LoginForm from './LoginForm.jsx';

const AuthLogin = () => {
  return (
    <AuthPageLayout
      title='Đăng nhập'
      subtitle='Đăng nhập vào tài khoản của bạn để quản lý thiết bị và dịch vụ bảo trì'
    >
      <Typography variant='h4' component='h2' gutterBottom textAlign='center'>
        Đăng nhập
      </Typography>

      <LoginForm />

      <Box mt={3} textAlign='center'>
        <Typography variant='body2'>
          Chưa có tài khoản?{' '}
          <MuiLink component={Link} to='/register' color='primary'>
            Đăng ký ngay
          </MuiLink>
        </Typography>
      </Box>
    </AuthPageLayout>
  );
};

export default AuthLogin;
