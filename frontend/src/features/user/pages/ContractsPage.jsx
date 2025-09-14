import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Paper
} from '@mui/material';
import {
  Assignment as ContractIcon,
  Add as AddIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { getUserContracts, updatePaymentStatus } from '../api/orders';

export default function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Lấy thông tin user từ localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const data = await getUserContracts(user.id);
      setContracts(data);
      setError('');
    } catch (err) {
      console.error('Lỗi khi tải hợp đồng:', err);
      setError('Có lỗi xảy ra khi tải danh sách hợp đồng');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user.id) {
      fetchContracts();
    }
  }, [user.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePayment = async (orderId) => {
    try {
      const result = await updatePaymentStatus(orderId, 'paid');
      if (result.success) {
        setSuccess('Cập nhật trạng thái thanh toán thành công!');
        setError('');
        fetchContracts(); // Refresh danh sách
      } else {
        setError('Lỗi: ' + result.error);
        setSuccess('');
      }
    } catch (err) {
      console.error('Lỗi cập nhật thanh toán:', err);
      setError('Có lỗi xảy ra khi cập nhật thanh toán');
      setSuccess('');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: {
        color: 'warning',
        text: 'Chờ thanh toán',
      },
      paid: { 
        color: 'success', 
        text: 'Đã thanh toán' 
      },
      failed: { 
        color: 'error', 
        text: 'Thanh toán thất bại' 
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Chip
        label={config.text}
        color={config.color}
        size="small"
      />
    );
  };

  if (!user.id) {
    return (
      <Box maxWidth={600} mx="auto" textAlign="center">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Vui lòng đăng nhập
          </Typography>
          <Typography variant="body1">
            Bạn cần đăng nhập để xem danh sách hợp đồng.
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" ml={2}>
          Đang tải danh sách hợp đồng...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            <ContractIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Hợp đồng của tôi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý các hợp đồng dịch vụ bảo trì của bạn
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => (window.location.href = '/register-service')}
        >
          Đăng ký thêm dịch vụ
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {contracts.length === 0 ? (
        <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
          <ContractIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Chưa có hợp đồng nào
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Bạn chưa đăng ký dịch vụ bảo trì nào. Hãy đăng ký ngay để bảo vệ thiết bị của bạn!
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => (window.location.href = '/register-service')}
          >
            Đăng ký dịch vụ ngay
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {contracts.map((contract) => (
            <Grid item xs={12} key={contract.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Hợp đồng #{contract.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Đăng ký: {formatDate(contract.created_at)}
                      </Typography>
                    </Box>
                    {getStatusChip(contract.payment_status)}
                  </Box>

                  <Grid container spacing={3} mb={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Gói dịch vụ
                      </Typography>
                      <Typography variant="h6" gutterBottom>
                        {contract.package_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {contract.package_description}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Giá trị hợp đồng
                      </Typography>
                      <Typography variant="h6" color="primary.main" gutterBottom>
                        {formatPrice(contract.package_price)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {contract.duration_months} tháng
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Thời gian
                      </Typography>
                      <Typography variant="body2">
                        Từ: {formatDate(contract.start_date)}
                      </Typography>
                      <Typography variant="body2">
                        Đến: {formatDate(contract.end_date)}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Trạng thái
                      </Typography>
                      <Typography variant="body2" mb={1}>
                        {contract.payment_status === 'paid'
                          ? 'Đang hoạt động'
                          : 'Chờ kích hoạt'}
                      </Typography>
                      {contract.payment_status === 'pending' && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<PaymentIcon />}
                          onClick={() => handlePayment(contract.id)}
                        >
                          Thanh toán ngay
                        </Button>
                      )}
                    </Grid>
                  </Grid>

                  {contract.payment_status === 'paid' && (
                    <>
                      <Divider sx={{ mb: 2 }} />
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center">
                          <CheckIcon sx={{ color: 'success.main', mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Hợp đồng đang hoạt động - Dịch vụ bảo trì sẽ được thực hiện theo lịch
                          </Typography>
                        </Box>
                        <Button
                          variant="text"
                          endIcon={<ScheduleIcon />}
                          onClick={() => (window.location.href = '/schedules')}
                        >
                          Xem lịch bảo trì
                        </Button>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}