import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as PackagesIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { usePackagesManagement } from '../../../hooks';
import { authStorage } from '../../../utils/storage';

export default function PackagesPage() {
  // Sử dụng custom hook để quản lý packages
  const {
    packages: data,
    loading,
    error: dataError,
    submitLoading,
    submitError,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = usePackagesManagement();

  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_months: '12',
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState('');

  const role = authStorage.getRole() || '';
  const canEdit = role === 'admin';

  // Cập nhật error state từ hook
  useEffect(() => {
    if (dataError) {
      setError(dataError);
    } else if (submitError) {
      setError(submitError);
    }
  }, [dataError, submitError]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString('vi-VN') : '-';
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!canEdit) {
      setError('Bạn không có quyền thêm gói bảo trì');
      return;
    }

    setFormData({
      name: '',
      description: '',
      price: '',
      duration_months: '12',
    });
    setFormVisible(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await handleCreate({
      name: formData.name,
      description: formData.description || '',
      price: formData.price || '',
      duration_months: formData.duration_months || 12,
    });

    if (result.success) {
      setFormVisible(false);
      setError('');
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        duration_months: '12',
      });
    } else {
      setError(result.error);
    }
  };

  const handleEdit = (pkg) => {
    setEditingId(pkg.id);
    setEditData({
      name: pkg.name || '',
      description: pkg.description || '',
      price: pkg.price || '',
      duration_months: pkg.duration_months || '12',
    });
  };

  const handleSaveEdit = async (id) => {
    const result = await handleUpdate(id, editData);

    if (result.success) {
      setEditingId(null);
      setEditData({});
      setError('');
    } else {
      setError(result.error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDeletePackage = async (id) => {
    if (!canEdit) {
      setError('Bạn không có quyền xóa gói bảo trì');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn xóa gói bảo trì này?')) return;

    const result = await handleDelete(id);

    if (result.success) {
      setError('');
    } else {
      setError(result.error);
    }
  };

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
      <Box
        mb={4}
        display='flex'
        justifyContent='space-between'
        alignItems='center'
      >
        <Box>
          <Typography variant='h4' component='h1' gutterBottom>
            <PackagesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Quản lý gói bảo trì
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Tạo và quản lý các gói dịch vụ bảo trì
          </Typography>
        </Box>

        {canEdit && (
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Thêm gói bảo trì
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Tên gói</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell>Giá</TableCell>
                  <TableCell>Thời gian (tháng)</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell align='center'>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align='center'>
                      <Typography variant='body2' color='text.secondary'>
                        Không có gói bảo trì nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell>{pkg.id}</TableCell>
                      <TableCell>
                        {editingId === pkg.id ? (
                          <TextField
                            size='small'
                            name='name'
                            value={editData.name || ''}
                            onChange={handleEditInputChange}
                            variant='outlined'
                            fullWidth
                          />
                        ) : (
                          pkg.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === pkg.id ? (
                          <TextField
                            size='small'
                            name='description'
                            value={editData.description || ''}
                            onChange={handleEditInputChange}
                            variant='outlined'
                            fullWidth
                            multiline
                            rows={2}
                          />
                        ) : (
                          <Typography variant='body2' sx={{ maxWidth: 200 }}>
                            {pkg.description || '-'}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === pkg.id ? (
                          <TextField
                            size='small'
                            name='price'
                            type='number'
                            value={editData.price || ''}
                            onChange={handleEditInputChange}
                            variant='outlined'
                          />
                        ) : (
                          <Typography
                            variant='body2'
                            color='primary.main'
                            fontWeight='bold'
                          >
                            {formatPrice(pkg.price)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === pkg.id ? (
                          <TextField
                            size='small'
                            name='duration_months'
                            type='number'
                            value={editData.duration_months || ''}
                            onChange={handleEditInputChange}
                            variant='outlined'
                          />
                        ) : (
                          `${pkg.duration_months} tháng`
                        )}
                      </TableCell>
                      <TableCell>{formatDate(pkg.created_at)}</TableCell>
                      <TableCell align='center'>
                        {editingId === pkg.id ? (
                          <Box>
                            <IconButton
                              size='small'
                              onClick={() => handleSaveEdit(pkg.id)}
                              color='primary'
                              title='Lưu'
                            >
                              <SaveIcon />
                            </IconButton>
                            <IconButton
                              size='small'
                              onClick={handleCancelEdit}
                              color='secondary'
                              title='Hủy'
                            >
                              <CancelIcon />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box>
                            {canEdit && (
                              <>
                                <IconButton
                                  size='small'
                                  onClick={() => handleEdit(pkg)}
                                  color='primary'
                                  title='Chỉnh sửa'
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  size='small'
                                  onClick={() => handleDeletePackage(pkg.id)}
                                  color='error'
                                  title='Xóa'
                                  disabled={submitLoading}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </>
                            )}
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog Form */}
      <Dialog
        open={formVisible}
        onClose={() => setFormVisible(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Thêm gói bảo trì mới</DialogTitle>

        <Box component='form' onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Tên gói'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  variant='outlined'
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label='Mô tả'
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  variant='outlined'
                  placeholder='Mô tả chi tiết về gói bảo trì...'
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Giá (VND)'
                  name='price'
                  type='number'
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  variant='outlined'
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Thời gian (tháng)'
                  name='duration_months'
                  type='number'
                  value={formData.duration_months}
                  onChange={handleInputChange}
                  required
                  variant='outlined'
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setFormVisible(false)}>Hủy</Button>
            <Button type='submit' variant='contained' disabled={submitLoading}>
              {submitLoading ? 'Đang xử lý...' : 'Thêm gói bảo trì'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
