import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
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
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Assignment as ContractIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  CreditCard as CreditCardIcon,
  Extension as ExtendIcon,
  Stop as TerminateIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { getUserContracts } from '../../../api/orders';
import {
  createContractRequest,
  getContractRequests,
} from '../../../api/contract-requests';
import usePagination from '../../../hooks/usePagination';
import TablePagination from '../../../components/common/TablePagination';

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
  const [searchTerm, setSearchTerm] = useState('');

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

      const response = await createContractRequest(requestData);

      // **NẾU LÀ GIA HẠN → Chuyển đến trang thanh toán ZaloPay**
      if (requestForm.type === 'extend' && response.payment_url) {
        // Chuyển thẳng đến ZaloPay không dùng alert
        window.location.href = response.payment_url;
        return; // Không close dialog vì đang redirect
      }

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
      (req) =>
        req.order_id === contractId &&
        (req.status === 'pending' || req.status === 'pending_payment')
    );
  };

  // Check if contract has been terminated (approved terminate request)
  const isContractTerminated = (contractId) => {
    return userRequests.some(
      (req) =>
        req.order_id === contractId &&
        req.request_type === 'terminate' &&
        req.status === 'approved'
    );
  };

  // Filter contracts based on search term
  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      searchTerm === '' ||
      contract.package_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.package_description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      contract.id?.toString().includes(searchTerm);

    return matchesSearch;
  });

  // Pagination
  const {
    currentItems,
    totalItems,
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination,
  } = usePagination(filteredContracts, 5);

  // Keep track of previous search term to avoid unnecessary resets
  const prevSearchTerm = useRef(searchTerm);

  // Reset pagination when search changes
  useEffect(() => {
    if (prevSearchTerm.current !== searchTerm) {
      prevSearchTerm.current = searchTerm;
      resetPagination();
    }
  }, [searchTerm, resetPagination]);

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

      {/* Search Bar */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '3fr 1fr',
              },
              gap: 2,
              alignItems: 'center',
            }}
          >
            <Box>
              <TextField
                fullWidth
                placeholder='Tìm kiếm theo tên gói, mô tả, ID hợp đồng...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant='outlined'
                size='small'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon color='action' />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position='end'>
                      <IconButton
                        onClick={() => setSearchTerm('')}
                        size='small'
                        edge='end'
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ fontWeight: 'bold' }}
              >
                {totalItems} / {contracts.length}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                hợp đồng
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {filteredContracts.length === 0 ? (
        <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
          <ContractIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant='h5' color='text.secondary' gutterBottom>
            {searchTerm
              ? 'Không tìm thấy hợp đồng phù hợp'
              : 'Chưa có hợp đồng nào'}
          </Typography>
          <Typography variant='body1' color='text.secondary' mb={3}>
            {searchTerm
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc xóa bộ lọc để xem tất cả hợp đồng'
              : 'Bạn chưa đăng ký dịch vụ bảo trì nào. Hãy đăng ký ngay để bảo vệ thiết bị của bạn!'}
          </Typography>
          {!searchTerm && (
            <Button
              variant='contained'
              size='large'
              startIcon={<AddIcon />}
              onClick={() => (window.location.href = '/register-service')}
            >
              Đăng ký dịch vụ ngay
            </Button>
          )}
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 3,
          }}
        >
          {currentItems.map((contract) => (
            <Box key={contract.id}>
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

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: '1fr 1fr',
                        md: 'repeat(4, 1fr)',
                      },
                      gap: 3,
                      mb: 3,
                    }}
                  >
                    <Box>
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
                    </Box>

                    <Box>
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
                        {formatPrice(
                          parseFloat(contract.package_price) +
                            parseFloat(contract.total_extension_paid || 0)
                        )}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {contract.duration_months +
                          parseInt(contract.total_extension_months || 0)}{' '}
                        tháng
                      </Typography>
                      {contract.total_extension_paid > 0 && (
                        <Typography
                          variant='caption'
                          color='success.main'
                          sx={{ fontStyle: 'italic', display: 'block', mt: 1 }}
                        >
                          (Đã gia hạn:{' '}
                          {formatPrice(contract.total_extension_paid)} -{' '}
                          {contract.total_extension_months} tháng)
                        </Typography>
                      )}
                    </Box>

                    <Box>
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
                    </Box>

                    <Box>
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
                    </Box>
                  </Box>

                  {contract.payment_status === 'paid' && (
                    <>
                      <Divider sx={{ mb: 2 }} />
                      <Box
                        display='flex'
                        justifyContent='space-between'
                        alignItems='center'
                      >
                        <Box display='flex' alignItems='center'>
                          {isContractTerminated(contract.id) ? (
                            <>
                              <TerminateIcon
                                sx={{ color: 'error.main', mr: 1 }}
                              />
                              <Typography
                                variant='body2'
                                color='error.main'
                                sx={{ fontWeight: 500 }}
                              >
                                Hợp đồng đã được kết thúc - Dịch vụ bảo trì đã
                                ngừng
                              </Typography>
                            </>
                          ) : (
                            <>
                              <CheckIcon
                                sx={{ color: 'success.main', mr: 1 }}
                              />
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                Hợp đồng đang hoạt động - Dịch vụ bảo trì sẽ
                                được thực hiện theo lịch
                              </Typography>
                            </>
                          )}
                        </Box>
                        {!isContractTerminated(contract.id) && (
                          <Button
                            variant='text'
                            endIcon={<ScheduleIcon />}
                            onClick={() =>
                              (window.location.href = '/schedules')
                            }
                          >
                            Xem lịch bảo trì
                          </Button>
                        )}
                      </Box>

                      {/* Contract Actions - Only show if not terminated */}
                      {!isContractTerminated(contract.id) && (
                        <>
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
                              {userRequests.find(
                                (req) =>
                                  req.order_id === contract.id &&
                                  req.status === 'pending_payment'
                              )
                                ? 'Có yêu cầu gia hạn đang chờ thanh toán. Vui lòng hoàn tất thanh toán trước khi tạo yêu cầu mới.'
                                : 'Có yêu cầu đang chờ xử lý cho hợp đồng này'}
                            </Alert>
                          )}
                        </>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* Pagination */}
      {filteredContracts.length > 0 && (
        <TablePagination
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          itemLabel='hợp đồng'
        />
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
