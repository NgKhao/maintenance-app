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
import { useAuth } from '../../../contexts';

const validationRules = {
  email: {
    required: true,
    type: 'email',
    label: 'Email'
  },
  password: {
    required: true,
    label: 'Mật khẩu'
  }
};

const LoginForm = ({ onSwitch }) => {
  const { login, setError, error } = useAuth();
  const {
    formData,
    errors,
    handleInputChange,
    handleBlur,
    validate
  } = useForm({ email: '', password: '' }, validationRules);

  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await authService.login(formData.email, formData.password);
      
      if (response.success && response.user) {
        login(response.user);
      } else {
        setError(response.error || 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Lỗi server. Thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h2" textAlign="center" mb={3}>
        Đăng nhập
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email"
          name="email"
          autoComplete="email"
          autoFocus
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
          autoComplete="current-password"
          value={formData.password}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={!!errors.password}
          helperText={errors.password}
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
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </Button>
      </Box>

      <Box textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Chưa có tài khoản?{' '}
          <Button
            variant="text"
            onClick={() => onSwitch('register')}
            sx={{ p: 0, textTransform: 'none' }}
          >
            Đăng ký
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginForm;