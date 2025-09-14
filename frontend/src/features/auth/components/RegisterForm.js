import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { useForm } from '../../../hooks';
import { authService } from '../../../services';

const validationRules = {
  name: {
    required: true,
    label: 'Họ tên'
  },
  email: {
    required: true,
    type: 'email',
    label: 'Email'
  },
  password: {
    required: true,
    type: 'password',
    label: 'Mật khẩu'
  },
  confirmPassword: {
    required: true,
    label: 'Xác nhận mật khẩu'
  }
};

const RegisterForm = ({ onSwitch }) => {
  const {
    formData,
    errors,
    handleInputChange,
    handleBlur,
    validate,
    setErrors
  } = useForm({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  }, validationRules);

  const [loading, setLoading] = React.useState(false);

  const validateForm = () => {
    const isValid = validate();
    
    // Additional validation for password confirmation
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: 'Mật khẩu xác nhận không khớp'
      }));
      return false;
    }
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authService.register(
        formData.name,
        formData.email,
        formData.password
      );
      
      if (response.success) {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        onSwitch('login');
      } else {
        setErrors(prev => ({
          ...prev,
          general: response.error || 'Đăng ký thất bại. Vui lòng thử lại.'
        }));
      }
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        general: 'Lỗi server. Thử lại sau.'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h2" textAlign="center" mb={3}>
        Đăng ký
      </Typography>

      {errors.general && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.general}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="Họ tên"
          name="name"
          autoComplete="name"
          autoFocus
          value={formData.name}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={!!errors.name}
          helperText={errors.name}
          disabled={loading}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={!!errors.email}
          helperText={errors.email}
          disabled={loading}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Mật khẩu"
          type="password"
          id="password"
          value={formData.password}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={!!errors.password}
          helperText={errors.password}
          disabled={loading}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          type="password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          disabled={loading}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Đang xử lý...' : 'Đăng ký'}
        </Button>
      </Box>

      <Box textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Đã có tài khoản?{' '}
          <Button
            variant="text"
            onClick={() => onSwitch('login')}
            sx={{ p: 0, textTransform: 'none' }}
          >
            Đăng nhập
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterForm;