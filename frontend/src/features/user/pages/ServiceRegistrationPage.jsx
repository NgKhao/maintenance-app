import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Assignment as ServiceIcon,
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
} from '@mui/icons-material';
import { registerService } from '../../../api/orders';
import axios from 'axios';

export default function ServiceRegistrationPage() {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: chọn gói, 1: xác nhận, 2: hoàn thành
  const [error, setError] = useState('');

  // Lấy thông tin user từ localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const steps = ['Chọn gói bảo trì', 'Xác nhận thông tin', 'Hoàn thành'];

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await axios.get(
        'http://localhost:8000/index.php?api=packages'
      );
      setPackages(res.data);
    } catch (err) {
      console.error('Lỗi khi tải gói bảo trì:', err);
      setError('Lỗi khi tải danh sách gói bảo trì');
    }
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setStep(1);
    setError('');
  };

  const handleConfirmRegistration = async () => {
    if (!selectedPackage || !user.id) {
      setError('Vui lòng đăng nhập và chọn gói bảo trì');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        user_id: user.id,
        package_id: selectedPackage.id,
        payment_status: 'pending',
        start_date: new Date().toISOString().split('T')[0],
      };

      const result = await registerService(orderData);
      if (result.success) {
        setStep(2);
        setError('');
      } else {
        setError('Lỗi: ' + result.error);
      }
    } catch (err) {
      console.error('Lỗi đăng ký dịch vụ:', err);
      setError('Có lỗi xảy ra khi đăng ký dịch vụ');
    }
    setLoading(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Step 3: Hoàn thành
  if (step === 2) {
    return (
      <Box maxWidth={600} mx='auto'>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant='h4' color='success.main' gutterBottom>
            Đăng ký dịch vụ thành công!
          </Typography>
          <Typography variant='body1' color='text.secondary' mb={3}>
            Chúng tôi sẽ liên hệ với bạn trong vòng 24h để xác nhận lịch bảo
            trì.
          </Typography>

          <Card variant='outlined' sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Thông tin gói đã đăng ký:
              </Typography>
              <Box textAlign='left'>
                <Typography variant='body2' mb={1}>
                  <strong>Gói:</strong> {selectedPackage?.name}
                </Typography>
                <Typography variant='body2' mb={1}>
                  <strong>Giá:</strong> {formatPrice(selectedPackage?.price)}
                </Typography>
                <Typography variant='body2'>
                  <strong>Thời gian:</strong> {selectedPackage?.duration_months}{' '}
                  tháng
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Button
            variant='contained'
            onClick={() => (window.location.href = '/contracts')}
            size='large'
          >
            Xem hợp đồng của tôi
          </Button>
        </Paper>
      </Box>
    );
  }

  // Step 2: Xác nhận
  if (step === 1) {
    return (
      <Box maxWidth={800} mx='auto'>
        <Stepper activeStep={step} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Typography variant='h4' gutterBottom>
          Xác nhận đăng ký dịch vụ
        </Typography>

        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Thông tin gói đã chọn
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant='body2' mb={1}>
                  <strong>Tên gói:</strong> {selectedPackage?.name}
                </Typography>
                <Typography variant='body2' mb={1}>
                  <strong>Mô tả:</strong> {selectedPackage?.description}
                </Typography>
                <Typography variant='body2' mb={1}>
                  <strong>Giá:</strong> {formatPrice(selectedPackage?.price)}
                </Typography>
                <Typography variant='body2'>
                  <strong>Thời gian:</strong> {selectedPackage?.duration_months}{' '}
                  tháng
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Thông tin khách hàng
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant='body2' mb={1}>
                  <strong>Họ tên:</strong> {user?.name}
                </Typography>
                <Typography variant='body2'>
                  <strong>Email:</strong> {user?.email}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box display='flex' gap={2} mt={4}>
          <Button
            variant='outlined'
            startIcon={<BackIcon />}
            onClick={() => setStep(0)}
          >
            Quay lại
          </Button>
          <Button
            variant='contained'
            endIcon={loading ? <CircularProgress size={20} /> : <ForwardIcon />}
            onClick={handleConfirmRegistration}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận đăng ký'}
          </Button>
        </Box>
      </Box>
    );
  }

  // Step 1: Chọn gói
  return (
    <Box maxWidth={1200} mx='auto'>
      <Stepper activeStep={step} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box textAlign='center' mb={4}>
        <Typography variant='h3' component='h1' gutterBottom>
          <ServiceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Đăng ký dịch vụ bảo trì
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Chọn gói bảo trì phù hợp với nhu cầu của bạn
        </Typography>
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {packages.length === 0 ? (
        <Box textAlign='center' py={8}>
          <CircularProgress />
          <Typography variant='body2' color='text.secondary' mt={2}>
            Đang tải danh sách gói bảo trì...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {packages.map((pkg) => (
            <Grid item xs={12} md={4} key={pkg.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Typography variant='h5' component='h3' gutterBottom>
                    {pkg.name}
                  </Typography>
                  <Typography
                    variant='h4'
                    color='primary.main'
                    fontWeight='bold'
                    mb={2}
                  >
                    {formatPrice(pkg.price)}
                  </Typography>
                  <Typography variant='body1' color='text.secondary' mb={2}>
                    {pkg.description}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' mb={3}>
                    Thời gian: {pkg.duration_months} tháng
                  </Typography>
                  <Button
                    variant='contained'
                    fullWidth
                    size='large'
                    onClick={() => handleSelectPackage(pkg)}
                  >
                    Chọn gói này
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
