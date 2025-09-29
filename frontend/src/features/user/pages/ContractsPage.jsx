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
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from '@mui/material';
import {
  Assignment as ContractIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  CreditCard as CreditCardIcon,
  Extension as ExtendIcon,
  Stop as TerminateIcon,
} from '@mui/icons-material';
import { getUserContracts } from '../../../api/orders';
import {
  createContractRequest,
  getContractRequests,
} from '../../../api/contract-requests';

export default function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestDialog, setRequestDialog] = useState({
    open: false,
    contract: null,
  });
  const [requestForm, setRequestForm] = useState({
    type: 'extend',
    extend_months: 12,
    requested_end_date: '',
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [userRequests, setUserRequests] = useState([]);

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

  const fetchUserRequests = async () => {
    try {
      const requests = await getContractRequests({ user_id: user.id });
      setUserRequests(requests);
    } catch (err) {
      console.error('Lỗi khi tải yêu cầu:', err);
    }
  };

  // Handle contract request submission
  const handleRequestSubmit = async () => {
    if (!requestDialog.contract) return;

    try {
      setSubmitting(true);

      const requestData = {
        order_id: requestDialog.contract.id,
        request_type: requestForm.type,
        note: requestForm.note,
      };

      if (requestForm.type === 'extend') {
        requestData.extend_months = parseInt(requestForm.extend_months);
      } else if (requestForm.type === 'terminate') {
        requestData.requested_end_date = requestForm.requested_end_date;
      }

      await createContractRequest(requestData);

      // Refresh requests
      await fetchUserRequests();

      // Close dialog and reset form
      setRequestDialog({ open: false, contract: null });
      setRequestForm({
        type: 'extend',
        extend_months: 12,
        requested_end_date: '',
        note: '',
      });

      // Show success message
      setError('');
    } catch (err) {
      console.error('Lỗi khi tạo yêu cầu:', err);
      setError('Không thể tạo yêu cầu: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Check if contract has pending request
  const hasPendingRequest = (contractId) => {
    return userRequests.some(
      (req) => req.order_id === contractId && req.status === 'pending'
    );
  };

  useEffect(() => {
    if (user.id) {
      fetchContracts();
      fetchUserRequests();
    }
  }, [user.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const getPaymentMethodChip = () => {
    // Tất cả đơn hàng mới đều dùng ZaloPay
    return (
      <Chip
        label='ZaloPay'
        color='primary'
        size='small'
        icon={<CreditCardIcon />}
      />
    );
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
        text: 'Đã thanh toán',
      },
      failed: {
        color: 'error',
        text: 'Thanh toán thất bại',
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return <Chip label={config.text} color={config.color} size='small' />;
  };

  if (!user.id) {
    return (
      <Box maxWidth={600} mx='auto' textAlign='center'>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant='h4' gutterBottom>
            Vui lòng đăng nhập
          </Typography>
          <Typography variant='body1'>
            Bạn cần đăng nhập để xem danh sách hợp đồng.
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='400px'
      >
        <CircularProgress />
        <Typography variant='body1' ml={2}>
          Đang tải danh sách hợp đồng...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        mb={4}
        display='flex'
        justifyContent='space-between'
        alignItems='center'
      >
        <Box>
          <Typography variant='h4' component='h1' gutterBottom>
            <ContractIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Hợp đồng của tôi
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Quản lý các hợp đồng dịch vụ bảo trì của bạn
          </Typography>
        </Box>

        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={() => (window.location.href = '/register-service')}
        >
          Đăng ký thêm dịch vụ
        </Button>
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {contracts.length === 0 ? (
        <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
          <ContractIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant='h5' color='text.secondary' gutterBottom>
            Chưa có hợp đồng nào
          </Typography>
          <Typography variant='body1' color='text.secondary' mb={3}>
            Bạn chưa đăng ký dịch vụ bảo trì nào. Hãy đăng ký ngay để bảo vệ
            thiết bị của bạn!
          </Typography>
          <Button
            variant='contained'
            size='large'
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
                  <Box
                    display='flex'
                    justifyContent='space-between'
                    alignItems='flex-start'
                    mb={3}
                  >
                    <Box>
                      <Typography variant='h6' gutterBottom>
                        Hợp đồng #{contract.id}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Đăng ký: {formatDate(contract.created_at)}
                      </Typography>
                    </Box>
                    {getStatusChip(contract.payment_status)}
                  </Box>

                  <Grid container spacing={3} mb={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography
                        variant='subtitle2'
                        color='text.secondary'
                        gutterBottom
                      >
                        Gói dịch vụ
                      </Typography>
                      <Typography variant='h6' gutterBottom>
                        {contract.package_name}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {contract.package_description}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Typography
                        variant='subtitle2'
                        color='text.secondary'
                        gutterBottom
                      >
                        Giá trị hợp đồng
                      </Typography>
                      <Typography
                        variant='h6'
                        color='primary.main'
                        gutterBottom
                      >
                        {formatPrice(contract.package_price)}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {contract.duration_months} tháng
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Typography
                        variant='subtitle2'
                        color='text.secondary'
                        gutterBottom
                      >
                        Thời gian
                      </Typography>
                      <Typography variant='body2'>
                        Từ: {formatDate(contract.start_date)}
                      </Typography>
                      <Typography variant='body2'>
                        Đến: {formatDate(contract.end_date)}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Typography
                        variant='subtitle2'
                        color='text.secondary'
                        gutterBottom
                      >
                        Trạng thái & Thanh toán
                      </Typography>
                      <Typography variant='body2' mb={1}>
                        {contract.payment_status === 'paid'
                          ? 'Đang hoạt động'
                          : 'Chờ kích hoạt'}
                      </Typography>
                      <Box mb={1}>{getPaymentMethodChip()}</Box>
                      {contract.payment_status === 'pending' && (
                        <Typography
                          variant='body2'
                          color='warning.main'
                          sx={{ fontStyle: 'italic' }}
                        >
                          Đang chờ xác nhận thanh toán từ ZaloPay
                        </Typography>
                      )}
                    </Grid>
                  </Grid>

                  {contract.payment_status === 'paid' && (
                    <>
                      <Divider sx={{ mb: 2 }} />
                      <Box
                        display='flex'
                        justifyContent='space-between'
                        alignItems='center'
                      >
                        <Box display='flex' alignItems='center'>
                          <CheckIcon sx={{ color: 'success.main', mr: 1 }} />
                          <Typography variant='body2' color='text.secondary'>
                            Hợp đồng đang hoạt động - Dịch vụ bảo trì sẽ được
                            thực hiện theo lịch
                          </Typography>
                        </Box>
                        <Button
                          variant='text'
                          endIcon={<ScheduleIcon />}
                          onClick={() => (window.location.href = '/schedules')}
                        >
                          Xem lịch bảo trì
                        </Button>
                      </Box>

                      {/* Contract Actions */}
                      <Divider sx={{ my: 2 }} />
                      <Box display='flex' gap={1} flexWrap='wrap'>
                        <Button
                          variant='outlined'
                          size='small'
                          startIcon={<ExtendIcon />}
                          onClick={() => {
                            setRequestDialog({ open: true, contract });
                            setRequestForm({
                              type: 'extend',
                              extend_months: 12,
                              requested_end_date: '',
                              note: '',
                            });
                          }}
                          disabled={hasPendingRequest(contract.id)}
                        >
                          Yêu cầu gia hạn
                        </Button>
                        <Button
                          variant='outlined'
                          size='small'
                          color='warning'
                          startIcon={<TerminateIcon />}
                          onClick={() => {
                            setRequestDialog({ open: true, contract });
                            setRequestForm({
                              type: 'terminate',
                              extend_months: 12,
                              requested_end_date: new Date(
                                Date.now() + 30 * 24 * 60 * 60 * 1000
                              )
                                .toISOString()
                                .split('T')[0],
                              note: '',
                            });
                          }}
                          disabled={hasPendingRequest(contract.id)}
                        >
                          Yêu cầu kết thúc
                        </Button>
                      </Box>

                      {/* Show pending request status */}
                      {hasPendingRequest(contract.id) && (
                        <Alert severity='info' sx={{ mt: 2 }}>
                          Có yêu cầu đang chờ xử lý cho hợp đồng này
                        </Alert>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Contract Request Dialog */}
      <Dialog
        open={requestDialog.open}
        onClose={() => setRequestDialog({ open: false, contract: null })}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          {requestForm.type === 'extend'
            ? 'Yêu cầu gia hạn hợp đồng'
            : 'Yêu cầu kết thúc hợp đồng'}
        </DialogTitle>
        <DialogContent>
          {requestDialog.contract && (
            <Box sx={{ mt: 2 }}>
              <Typography variant='body2' gutterBottom>
                <strong>Hợp đồng:</strong> {requestDialog.contract.package_name}
              </Typography>
              <Typography variant='body2' gutterBottom sx={{ mb: 3 }}>
                <strong>Thời hạn hiện tại:</strong>{' '}
                {formatDate(requestDialog.contract.start_date)} -{' '}
                {formatDate(requestDialog.contract.end_date)}
              </Typography>

              <FormControl component='fieldset' sx={{ mb: 3 }}>
                <FormLabel component='legend'>Loại yêu cầu</FormLabel>
                <RadioGroup
                  value={requestForm.type}
                  onChange={(e) =>
                    setRequestForm({ ...requestForm, type: e.target.value })
                  }
                >
                  <FormControlLabel
                    value='extend'
                    control={<Radio />}
                    label='Gia hạn hợp đồng'
                  />
                  <FormControlLabel
                    value='terminate'
                    control={<Radio />}
                    label='Kết thúc hợp đồng sớm'
                  />
                </RadioGroup>
              </FormControl>

              {requestForm.type === 'extend' && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Thời gian gia hạn</InputLabel>
                  <Select
                    value={requestForm.extend_months}
                    label='Thời gian gia hạn'
                    onChange={(e) =>
                      setRequestForm({
                        ...requestForm,
                        extend_months: e.target.value,
                      })
                    }
                  >
                    <MenuItem value={3}>3 tháng</MenuItem>
                    <MenuItem value={6}>6 tháng</MenuItem>
                    <MenuItem value={12}>12 tháng</MenuItem>
                    <MenuItem value={24}>24 tháng</MenuItem>
                  </Select>
                </FormControl>
              )}

              {requestForm.type === 'terminate' && (
                <TextField
                  fullWidth
                  type='date'
                  label='Ngày kết thúc mong muốn'
                  value={requestForm.requested_end_date}
                  onChange={(e) =>
                    setRequestForm({
                      ...requestForm,
                      requested_end_date: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 3 }}
                  helperText='Ngày kết thúc phải sau ngày hiện tại ít nhất 7 ngày'
                />
              )}

              <TextField
                fullWidth
                multiline
                rows={3}
                label='Ghi chú / Lý do'
                value={requestForm.note}
                onChange={(e) =>
                  setRequestForm({ ...requestForm, note: e.target.value })
                }
                placeholder='Nhập lý do hoặc ghi chú cho yêu cầu...'
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRequestDialog({ open: false, contract: null })}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleRequestSubmit}
            variant='contained'
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Gửi yêu cầu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
