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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ShoppingCart as OrdersIcon
} from '@mui/icons-material';
import axios from 'axios';

export default function OrdersPage() {
  const [data, setData] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    package_id: '',
    payment_status: 'pending',
    start_date: '',
    end_date: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('user_id');
  const canEdit = role === 'admin';

  const API_URL = 'http://localhost:8000/index.php?api=orders';

  // Lấy dữ liệu
  const fetchData = async () => {
    setLoading(true);
    try {
      let url = API_URL;
      if (role !== 'admin' && userId) {
        url += `&user_id=${userId}`;
      }
      const res = await axios.get(url);
      setData(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi tải dữ liệu');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper functions
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chờ thanh toán';
      case 'failed':
        return 'Thất bại';
      default:
        return status;
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!canEdit) {
      setError('Bạn không có quyền thêm đơn hàng');
      return;
    }

    setFormData({
      user_id: '',
      package_id: '',
      payment_status: 'pending',
      start_date: '',
      end_date: ''
    });
    setFormVisible(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, formData);
      setFormVisible(false);
      fetchData();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi thêm đơn hàng');
    }
  };

  const handleDelete = async (id) => {
    if (!canEdit) {
      setError('Bạn không có quyền xóa đơn hàng');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn xóa đơn hàng này?')) return;

    try {
      await axios.delete(`${API_URL}&id=${id}`);
      fetchData();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi xóa đơn hàng');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            <OrdersIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Quản lý đơn hàng
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {role === 'admin' 
              ? 'Quản lý tất cả đơn hàng trong hệ thống'
              : 'Danh sách đơn hàng của bạn'
            }
          </Typography>
        </Box>
        
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Thêm đơn hàng
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
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
                  <TableCell>User ID</TableCell>
                  <TableCell>Gói bảo trì</TableCell>
                  <TableCell>Trạng thái thanh toán</TableCell>
                  <TableCell>Ngày bắt đầu</TableCell>
                  <TableCell>Ngày kết thúc</TableCell>
                  {canEdit && <TableCell align="center">Hành động</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canEdit ? 7 : 6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Không có đơn hàng nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.user_id}</TableCell>
                      <TableCell>{order.package_id}</TableCell>
                      <TableCell>
                        <Chip
                          label={getPaymentStatusText(order.payment_status)}
                          color={getPaymentStatusColor(order.payment_status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {order.start_date ? new Date(order.start_date).toLocaleDateString('vi-VN') : ''}
                      </TableCell>
                      <TableCell>
                        {order.end_date ? new Date(order.end_date).toLocaleDateString('vi-VN') : ''}
                      </TableCell>
                      {canEdit && (
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(order.id)}
                            color="error"
                            title="Xóa"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      )}
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
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Thêm đơn hàng mới
        </DialogTitle>
        
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="User ID"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Gói bảo trì ID"
                  name="package_id"
                  value={formData.package_id}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Trạng thái thanh toán"
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleInputChange}
                  variant="outlined"
                >
                  <MenuItem value="pending">Chờ thanh toán</MenuItem>
                  <MenuItem value="completed">Đã thanh toán</MenuItem>
                  <MenuItem value="failed">Thất bại</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Ngày bắt đầu"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Ngày kết thúc"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setFormVisible(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="contained">
              Thêm đơn hàng
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}