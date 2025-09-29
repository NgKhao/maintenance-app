import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Autocomplete,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Fab,
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import {
  createContractByAdmin,
  getPackages,
  getUsers,
  getContractRequests,
  processContractRequest,
} from '../../../api/contract-requests';
import { getOrders } from '../../../api/orders';
import { formatDate, formatDateTime } from '../../../utils/formatters';
import { useForm } from '../../../hooks/useForm';

export default function ContractManagementPage({ user }) {
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Tab management
  const [tabValue, setTabValue] = useState(0);

  // Contract creation dialog
  const [openDialog, setOpenDialog] = useState(false);

  // Contract requests management
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processNote, setProcessNote] = useState('');

  // Contracts management
  const [contracts, setContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form validation rules
  const validationRules = {
    user_id: { required: true, label: 'Khách hàng' },
    package_id: { required: true, label: 'Gói bảo trì' },
    payment_status: { required: true, label: 'Trạng thái thanh toán' },
    start_date: { required: true, label: 'Ngày bắt đầu' },
  };

  const {
    formData,
    errors,
    touched,
    handleInputChange,
    handleBlur,
    validate,
    reset,
  } = useForm(
    {
      user_id: '',
      package_id: '',
      payment_status: 'pending',
      start_date: new Date().toISOString().split('T')[0],
      custom_price: '',
      admin_note: '',
    },
    validationRules
  );

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [packagesData, usersData] = await Promise.all([
          getPackages(),
          getUsers(),
        ]);
        setPackages(packagesData);
        setUsers(usersData.filter((u) => u.role === 'user')); // Chỉ lấy user role
      } catch (err) {
        console.error('Error fetching data:', err);
        setMessage({ type: 'error', text: 'Không thể tải dữ liệu ban đầu' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch contracts
  const fetchContracts = async () => {
    try {
      setLoadingContracts(true);
      const contractsData = await getOrders();
      setContracts(contractsData);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setMessage({ type: 'error', text: 'Không thể tải danh sách hợp đồng' });
    } finally {
      setLoadingContracts(false);
    }
  };

  // Fetch contract requests
  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const requestsData = await getContractRequests();
      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setMessage({ type: 'error', text: 'Không thể tải danh sách yêu cầu' });
    } finally {
      setLoadingRequests(false);
    }
  };

  // Load data when switching tabs
  useEffect(() => {
    if (tabValue === 0) {
      fetchContracts();
    } else if (tabValue === 1) {
      fetchRequests();
    }
  }, [tabValue]);

  // Load contracts on component mount
  useEffect(() => {
    fetchContracts();
  }, []);

  // Filter contracts based on search term and status
  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      searchTerm === '' ||
      contract.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.package_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.app_trans_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || contract.payment_status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Handle request processing
  const handleProcessRequest = async (action) => {
    if (!selectedRequest) return;

    try {
      setSubmitting(true);
      await processContractRequest(selectedRequest.id, action, processNote);

      setMessage({
        type: 'success',
        text: `${
          action === 'approved' ? 'Duyệt' : 'Từ chối'
        } yêu cầu thành công`,
      });

      // Reset form và refresh data
      setSelectedRequest(null);
      setProcessNote('');
      fetchRequests();
    } catch (error) {
      console.error('Error processing request:', error);
      setMessage({
        type: 'error',
        text: `Không thể ${
          action === 'approved' ? 'duyệt' : 'từ chối'
        } yêu cầu`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      setMessage({ type: 'error', text: 'Vui lòng kiểm tra lại thông tin' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ type: '', text: '' });

      // Prepare data for API
      const contractData = {
        user_id: formData.user_id,
        package_id: formData.package_id,
        payment_status: formData.payment_status,
        start_date: formData.start_date,
        admin_note: formData.admin_note || '',
      };

      // Add custom price if provided
      if (formData.custom_price) {
        contractData.custom_price = parseFloat(formData.custom_price);
      }

      const result = await createContractByAdmin(contractData);

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Tạo hợp đồng thành công! ID: ${result.order_id}`,
        });
        reset(); // Reset form
        setOpenDialog(false); // Close dialog
        fetchContracts(); // Refresh contracts list
      }
    } catch (err) {
      console.error('Error creating contract:', err);
      setMessage({
        type: 'error',
        text: err.message || 'Không thể tạo hợp đồng',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Get selected package info
  const selectedPackage = packages.find(
    (pkg) => pkg.id === formData.package_id
  );

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='400px'
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            mb={2}
          >
            <Typography variant='h5' component='h1'>
              Quản lý hợp đồng
            </Typography>
            <Fab
              color='primary'
              size='small'
              onClick={() => setOpenDialog(true)}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              <AddIcon />
            </Fab>
          </Box>

          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label='Danh sách hợp đồng' />
            <Tab label='Quản lý yêu cầu' />
          </Tabs>

          {message.text && (
            <Alert
              severity={message.type}
              sx={{ mb: 3 }}
              onClose={() => setMessage({ type: '', text: '' })}
            >
              {message.text}
            </Alert>
          )}

          {/* Tab Content */}
          {tabValue === 0 && (
            <>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                Danh sách tất cả hợp đồng trong hệ thống
              </Typography>

              {/* Search and Filter Bar */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder='Tìm kiếm khách hàng, gói dịch vụ, mã giao dịch...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <ViewIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Trạng thái thanh toán</InputLabel>
                    <Select
                      value={filterStatus}
                      label='Trạng thái thanh toán'
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <MenuItem value='all'>Tất cả</MenuItem>
                      <MenuItem value='pending'>Chờ thanh toán</MenuItem>
                      <MenuItem value='paid'>Đã thanh toán</MenuItem>
                      <MenuItem value='failed'>Thanh toán thất bại</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box display='flex' justifyContent='flex-end'>
                    <Button
                      variant='contained'
                      startIcon={<AddIcon />}
                      onClick={() => setOpenDialog(true)}
                      fullWidth
                    >
                      Thêm hợp đồng
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              {/* Contracts Table */}
              {loadingContracts ? (
                <Box display='flex' justifyContent='center' py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Khách hàng</TableCell>
                        <TableCell>Gói dịch vụ</TableCell>
                        <TableCell>Giá trị</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Thời gian</TableCell>
                        <TableCell>Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredContracts.map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell>{contract.id}</TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant='body2' fontWeight='medium'>
                                {contract.user_name}
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                {contract.user_email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{contract.package_name}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(contract.amount)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                contract.payment_status === 'pending'
                                  ? 'Chờ thanh toán'
                                  : contract.payment_status === 'paid'
                                  ? 'Đã thanh toán'
                                  : contract.payment_status === 'failed'
                                  ? 'Thất bại'
                                  : contract.payment_status
                              }
                              color={
                                contract.payment_status === 'pending'
                                  ? 'warning'
                                  : contract.payment_status === 'paid'
                                  ? 'success'
                                  : 'error'
                              }
                              size='small'
                            />
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant='caption' display='block'>
                                Bắt đầu: {formatDate(contract.start_date)}
                              </Typography>
                              <Typography variant='caption' display='block'>
                                Kết thúc: {formatDate(contract.end_date)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Tooltip title='Xem chi tiết'>
                              <IconButton size='small'>
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {filteredContracts.length === 0 && !loadingContracts && (
                <Box textAlign='center' py={4}>
                  <Typography color='text.secondary'>
                    {contracts.length === 0
                      ? 'Chưa có hợp đồng nào'
                      : 'Không tìm thấy hợp đồng phù hợp'}
                  </Typography>
                </Box>
              )}
            </>
          )}

          {/* Tab 2: Contract Requests Management */}
          {tabValue === 1 && (
            <>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                Quản lý yêu cầu gia hạn và hủy hợp đồng từ khách hàng
              </Typography>

              {loadingRequests ? (
                <Box display='flex' justifyContent='center' py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Khách hàng</TableCell>
                        <TableCell>Loại yêu cầu</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Ngày yêu cầu</TableCell>
                        <TableCell>Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.id}</TableCell>
                          <TableCell>{request.user_name}</TableCell>
                          <TableCell>
                            <Chip
                              label={
                                request.type === 'extend'
                                  ? 'Gia hạn'
                                  : 'Hủy hợp đồng'
                              }
                              color={
                                request.type === 'extend'
                                  ? 'primary'
                                  : 'secondary'
                              }
                              size='small'
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                request.status === 'pending'
                                  ? 'Chờ duyệt'
                                  : request.status === 'approved'
                                  ? 'Đã duyệt'
                                  : 'Đã từ chối'
                              }
                              color={
                                request.status === 'pending'
                                  ? 'warning'
                                  : request.status === 'approved'
                                  ? 'success'
                                  : 'error'
                              }
                              size='small'
                            />
                          </TableCell>
                          <TableCell>
                            {formatDateTime(request.created_at)}
                          </TableCell>
                          <TableCell>
                            {request.status === 'pending' && (
                              <>
                                <Tooltip title='Xem chi tiết'>
                                  <IconButton
                                    size='small'
                                    onClick={() => setSelectedRequest(request)}
                                  >
                                    <ViewIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title='Duyệt'>
                                  <IconButton
                                    size='small'
                                    color='success'
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      handleProcessRequest('approved');
                                    }}
                                  >
                                    <ApproveIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title='Từ chối'>
                                  <IconButton
                                    size='small'
                                    color='error'
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      handleProcessRequest('rejected');
                                    }}
                                  >
                                    <RejectIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {requests.length === 0 && !loadingRequests && (
                <Box textAlign='center' py={4}>
                  <Typography color='text.secondary'>
                    Không có yêu cầu nào
                  </Typography>
                </Box>
              )}
            </>
          )}

          {/* Contract Creation Dialog */}
          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            maxWidth='md'
            fullWidth
          >
            <DialogTitle>Tạo hợp đồng mới</DialogTitle>
            <DialogContent>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                Admin có thể tạo hợp đồng trực tiếp cho khách hàng
              </Typography>

              <Box component='form' onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Khách hàng */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={users}
                      getOptionLabel={(option) =>
                        `${option.name} (${option.email})`
                      }
                      value={
                        users.find((u) => u.id === formData.user_id) || null
                      }
                      onChange={(event, newValue) => {
                        handleInputChange({
                          target: {
                            name: 'user_id',
                            value: newValue?.id || '',
                          },
                        });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label='Khách hàng *'
                          error={touched.user_id && !!errors.user_id}
                          helperText={touched.user_id && errors.user_id}
                          onBlur={() =>
                            handleBlur({ target: { name: 'user_id' } })
                          }
                        />
                      )}
                    />
                  </Grid>

                  {/* Gói bảo trì */}
                  <Grid item xs={12} md={6}>
                    <FormControl
                      fullWidth
                      error={touched.package_id && !!errors.package_id}
                    >
                      <InputLabel>Gói bảo trì *</InputLabel>
                      <Select
                        name='package_id'
                        value={formData.package_id}
                        label='Gói bảo trì *'
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                      >
                        {packages.map((pkg) => (
                          <MenuItem key={pkg.id} value={pkg.id}>
                            {pkg.name} - {pkg.price?.toLocaleString()} VND (
                            {pkg.duration_months} tháng)
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.package_id && errors.package_id && (
                        <Typography
                          variant='caption'
                          color='error'
                          sx={{ ml: 2, mt: 0.5 }}
                        >
                          {errors.package_id}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Trạng thái thanh toán */}
                  <Grid item xs={12} md={6}>
                    <FormControl
                      fullWidth
                      error={touched.payment_status && !!errors.payment_status}
                    >
                      <InputLabel>Trạng thái thanh toán *</InputLabel>
                      <Select
                        name='payment_status'
                        value={formData.payment_status}
                        label='Trạng thái thanh toán *'
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                      >
                        <MenuItem value='pending'>Chờ thanh toán</MenuItem>
                        <MenuItem value='paid'>Đã thanh toán</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Ngày bắt đầu */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type='date'
                      name='start_date'
                      label='Ngày bắt đầu *'
                      value={formData.start_date}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      error={touched.start_date && !!errors.start_date}
                      helperText={touched.start_date && errors.start_date}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  {/* Giá tùy chỉnh */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type='number'
                      name='custom_price'
                      label='Giá tùy chỉnh (tùy chọn)'
                      value={formData.custom_price}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>VND</InputAdornment>
                        ),
                      }}
                      helperText='Để trống nếu sử dụng giá gói mặc định'
                    />
                  </Grid>

                  {/* Ghi chú admin */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      name='admin_note'
                      label='Ghi chú của admin'
                      value={formData.admin_note}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder='Nhập ghi chú, lý do tạo hợp đồng...'
                    />
                  </Grid>

                  {/* Thông tin tóm tắt */}
                  {selectedPackage && (
                    <Grid item xs={12}>
                      <Card variant='outlined' sx={{ bgcolor: 'grey.50' }}>
                        <CardContent>
                          <Typography variant='h6' gutterBottom>
                            Thông tin hợp đồng
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant='body2'>
                                <strong>Gói:</strong> {selectedPackage.name}
                              </Typography>
                              <Typography variant='body2'>
                                <strong>Thời hạn:</strong>{' '}
                                {selectedPackage.duration_months} tháng
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant='body2'>
                                <strong>Giá gốc:</strong>{' '}
                                {selectedPackage.price?.toLocaleString()} VND
                              </Typography>
                              <Typography variant='body2'>
                                <strong>Giá áp dụng:</strong>{' '}
                                {formData.custom_price
                                  ? parseFloat(
                                      formData.custom_price
                                    ).toLocaleString()
                                  : selectedPackage.price?.toLocaleString()}{' '}
                                VND
                              </Typography>
                            </Grid>
                            {formData.start_date && (
                              <Grid item xs={12}>
                                <Typography variant='body2'>
                                  <strong>Thời gian:</strong>{' '}
                                  {formatDate(formData.start_date)} -{' '}
                                  {formatDate(
                                    new Date(
                                      new Date(formData.start_date).getTime() +
                                        selectedPackage.duration_months *
                                          30 *
                                          24 *
                                          60 *
                                          60 *
                                          1000
                                    )
                                      .toISOString()
                                      .split('T')[0]
                                  )}
                                </Typography>
                              </Grid>
                            )}
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setOpenDialog(false)}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button
                variant='contained'
                startIcon={
                  submitting ? <CircularProgress size={20} /> : <SaveIcon />
                }
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? 'Đang tạo...' : 'Tạo hợp đồng'}
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>

      {/* Mobile FAB */}
      <Fab
        color='primary'
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' },
        }}
        onClick={() => setOpenDialog(true)}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
