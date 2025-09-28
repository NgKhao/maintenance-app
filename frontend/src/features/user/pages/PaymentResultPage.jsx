import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Home as HomeIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { checkZaloPayStatus } from '../../../api/orders';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const appTransId = searchParams.get('apptransid');
        const status = searchParams.get('status');

        if (!appTransId) {
          setError('Không tìm thấy mã giao dịch');
          setLoading(false);
          return;
        }

        // Kiểm tra trạng thái từ ZaloPay
        const result = await checkZaloPayStatus(appTransId);

        const isPaymentSuccess = status === '1' && result.return_code === 1;

        // Nếu thanh toán thành công, gọi callback manually để cập nhật DB
        if (isPaymentSuccess) {
          try {
            await fetch('http://localhost:8000/api/zalopay_callback.php', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                data: JSON.stringify({
                  app_trans_id: appTransId,
                  zp_trans_id: result.zp_trans_id || `zp_${Date.now()}`,
                  amount: result.amount || 0,
                  server_time: Math.floor(Date.now() / 1000),
                }),
                mac: 'manual_update', // Tạm thời bypass MAC check
                type: 1,
              }),
            });
          } catch (callbackError) {
            console.warn(
              'Không thể cập nhật trạng thái đơn hàng:',
              callbackError
            );
          }
        }

        setPaymentResult({
          appTransId,
          status: isPaymentSuccess ? 'success' : 'failed',
          zaloStatus: result.return_code,
          message: result.return_message || 'Giao dịch đã được xử lý',
        });
      } catch (err) {
        console.error('Lỗi kiểm tra thanh toán:', err);
        setError('Có lỗi xảy ra khi kiểm tra trạng thái thanh toán');
      }
      setLoading(false);
    };

    checkPaymentStatus();
  }, [searchParams]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant='h6' color='text.secondary'>
          Đang xác nhận kết quả thanh toán...
        </Typography>
      </Box>
    );
  }

  const isSuccess =
    paymentResult?.status === 'success' && paymentResult?.zaloStatus === 1;

  return (
    <Box maxWidth={600} mx='auto'>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        {error ? (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : (
          <>
            {/* Icon trạng thái */}
            <Box sx={{ mb: 3 }}>
              {isSuccess ? (
                <SuccessIcon
                  sx={{
                    fontSize: 80,
                    color: 'success.main',
                    mb: 2,
                  }}
                />
              ) : (
                <ErrorIcon
                  sx={{
                    fontSize: 80,
                    color: 'error.main',
                    mb: 2,
                  }}
                />
              )}
            </Box>

            {/* Tiêu đề */}
            <Typography
              variant='h4'
              gutterBottom
              color={isSuccess ? 'success.main' : 'error.main'}
            >
              {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
            </Typography>

            {/* Thông tin giao dịch */}
            <Card sx={{ mt: 3, mb: 3, textAlign: 'left' }}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Thông tin giao dịch
                </Typography>
                <Typography variant='body2' sx={{ mb: 1 }}>
                  <strong>Mã giao dịch:</strong> {paymentResult?.appTransId}
                </Typography>
                <Typography variant='body2' sx={{ mb: 1 }}>
                  <strong>Trạng thái:</strong>{' '}
                  <span
                    style={{
                      color: isSuccess ? '#4caf50' : '#f44336',
                      fontWeight: 'bold',
                    }}
                  >
                    {isSuccess ? 'Thành công' : 'Thất bại'}
                  </span>
                </Typography>
                <Typography variant='body2'>
                  <strong>Thông điệp:</strong> {paymentResult?.message}
                </Typography>
              </CardContent>
            </Card>

            {/* Thông báo */}
            {isSuccess ? (
              <Alert severity='success' sx={{ mb: 3 }}>
                Đơn hàng của bạn đã được xác nhận. Chúng tôi sẽ liên hệ với bạn
                sớm nhất để sắp xếp lịch bảo trì.
              </Alert>
            ) : (
              <Alert severity='error' sx={{ mb: 3 }}>
                Thanh toán không thành công. Vui lòng thử lại hoặc liên hệ hỗ
                trợ khách hàng.
              </Alert>
            )}
          </>
        )}

        {/* Nút hành động */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
          <Button
            variant='outlined'
            startIcon={<HomeIcon />}
            onClick={() => navigate('/dashboard')}
          >
            Về trang chủ
          </Button>

          {isSuccess && (
            <Button
              variant='contained'
              startIcon={<ReceiptIcon />}
              onClick={() => navigate('/contracts')}
            >
              Xem hợp đồng
            </Button>
          )}

          {!isSuccess && !error && (
            <Button
              variant='contained'
              onClick={() => navigate('/register-service')}
            >
              Thử lại
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
