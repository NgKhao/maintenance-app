import React from 'react';
import { Typography, Link as MuiLink, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import AuthPageLayout from './AuthPageLayout.jsx';
import RegisterForm from './RegisterForm.jsx';

const AuthRegister = () => {
  return (
    <AuthPageLayout
      title='Đăng ký'
      subtitle='Tạo tài khoản mới để truy cập các dịch vụ bảo trì thiết bị chuyên nghiệp'
      maxWidth={480}
    >
      <Typography variant='h4' component='h2' gutterBottom textAlign='center'>
        Đăng ký tài khoản
      </Typography>

      <RegisterForm />

      <Box mt={3} textAlign='center'>
        <Typography variant='body2'>
          Đã có tài khoản?{' '}
          <MuiLink component={Link} to='/login' color='primary'>
            Đăng nhập ngay
          </MuiLink>
        </Typography>
      </Box>
    </AuthPageLayout>
  );
};

export default AuthRegister;
