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
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import {
  createContractByAdmin,
  getPackages,
  getUsers,
} from '../../../api/contract-requests';
import { formatDate } from '../../../utils/formatters';
import { useForm } from '../../../hooks/useForm';

export default function ContractManagementPage({ user }) {
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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
          <Typography variant='h5' component='h1' gutterBottom>
            Tạo hợp đồng mới
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            Admin có thể tạo hợp đồng trực tiếp cho khách hàng
          </Typography>

          {message.text && (
            <Alert
              severity={message.type}
              sx={{ mb: 3 }}
              onClose={() => setMessage({ type: '', text: '' })}
            >
              {message.text}
            </Alert>
          )}

          <Box component='form' onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Khách hàng */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={users}
                  getOptionLabel={(option) =>
                    `${option.name} (${option.email})`
                  }
                  value={users.find((u) => u.id === formData.user_id) || null}
                  onChange={(event, newValue) => {
                    handleInputChange({
                      target: { name: 'user_id', value: newValue?.id || '' },
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Khách hàng *'
                      error={touched.user_id && !!errors.user_id}
                      helperText={touched.user_id && errors.user_id}
                      onBlur={() => handleBlur({ target: { name: 'user_id' } })}
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

              {/* Buttons */}
              <Grid item xs={12}>
                <Box display='flex' gap={2} justifyContent='flex-end'>
                  <Button
                    type='button'
                    variant='outlined'
                    onClick={() => reset()}
                    disabled={submitting}
                  >
                    Làm mới
                  </Button>
                  <Button
                    type='submit'
                    variant='contained'
                    startIcon={
                      submitting ? <CircularProgress size={20} /> : <SaveIcon />
                    }
                    disabled={submitting}
                  >
                    {submitting ? 'Đang tạo...' : 'Tạo hợp đồng'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
