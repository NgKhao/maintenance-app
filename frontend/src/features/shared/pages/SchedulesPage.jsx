import React, { useState, useEffect, useCallback } from 'react';
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
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import {
  getSchedules,
  createSchedule,
  updateScheduleStatus,
  deleteSchedule,
} from '../../../api/schedules';
import { getOrders } from '../../../api/orders';
import { getDevices } from '../../../api/devices';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [orders, setOrders] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    order_id: '',
    technician_id: '',
    device_id: '',
    scheduled_date: '',
    note: '',
  });
  const [error, setError] = useState('');

  // Lấy thông tin user từ localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.role || 'user';
  const canEdit = role === 'admin';

  // Fetch data functions
  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const userId = role === 'user' ? user.id : null;
      const data = await getSchedules(userId);
      setSchedules(data);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tải danh sách lịch bảo trì');
    }
    setLoading(false);
  }, [role, user.id]);

  const fetchOptions = useCallback(async () => {
    if (!canEdit) return; // User thường không cần load options

    try {
      const [ordersData, devicesData] = await Promise.all([
        getOrders(),
        getDevices(),
      ]);
      setOrders(ordersData);
      setDevices(devicesData);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tải dữ liệu');
    }
  }, [canEdit]);

  useEffect(() => {
    fetchSchedules();
    fetchOptions();
  }, [fetchSchedules, fetchOptions]);

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'in_progress':
        return 'Đang thực hiện';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!canEdit) {
      setError('Bạn không có quyền thêm lịch bảo trì');
      return;
    }

    setFormData({
      order_id: '',
      technician_id: '',
      device_id: '',
      scheduled_date: '',
      note: '',
    });
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (!canEdit) {
      setError('Bạn không có quyền xóa lịch bảo trì');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn xóa lịch bảo trì này?')) return;

    try {
      await deleteSchedule(id);
      fetchSchedules();
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Lỗi khi xóa lịch bảo trì');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateScheduleStatus(id, status);
      fetchSchedules();
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSchedule(formData);
      setFormVisible(false);
      fetchSchedules();
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Lỗi khi tạo lịch bảo trì');
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
            <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Lịch bảo trì
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {role === 'user'
              ? 'Lịch bảo trì thiết bị của bạn'
              : 'Quản lý lịch bảo trì hệ thống'}
          </Typography>
        </Box>

        {canEdit && (
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Tạo lịch bảo trì
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
                  <TableCell>Thiết bị</TableCell>
                  <TableCell>Ngày bảo trì</TableCell>
                  <TableCell>Kỹ thuật viên</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ghi chú</TableCell>
                  <TableCell align='center'>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center'>
                      <Typography variant='body2' color='text.secondary'>
                        Không có lịch bảo trì nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <Typography variant='body2'>
                          {schedule.device_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(schedule.scheduled_date).toLocaleDateString(
                          'vi-VN'
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>
                          {schedule.technician_name || 'Chưa phân công'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(schedule.status)}
                          color={getStatusColor(schedule.status)}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>
                          {schedule.note || 'Không có ghi chú'}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Box>
                          {role === 'technician' &&
                            schedule.status === 'pending' && (
                              <IconButton
                                size='small'
                                onClick={() =>
                                  handleStatusUpdate(schedule.id, 'in_progress')
                                }
                                color='primary'
                                title='Bắt đầu thực hiện'
                              >
                                <CheckIcon />
                              </IconButton>
                            )}
                          {role === 'technician' &&
                            schedule.status === 'in_progress' && (
                              <IconButton
                                size='small'
                                onClick={() =>
                                  handleStatusUpdate(schedule.id, 'completed')
                                }
                                color='success'
                                title='Hoàn thành'
                              >
                                <CheckIcon />
                              </IconButton>
                            )}
                          {canEdit && (
                            <IconButton
                              size='small'
                              onClick={() => handleDelete(schedule.id)}
                              color='error'
                              title='Xóa'
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>
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
        <DialogTitle>Tạo lịch bảo trì mới</DialogTitle>

        <Box component='form' onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label='Đơn hàng'
                  name='order_id'
                  value={formData.order_id}
                  onChange={handleInputChange}
                  required
                  variant='outlined'
                >
                  {orders.map((order) => (
                    <MenuItem key={order.id} value={order.id}>
                      {order.package_name} - {order.user_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label='Thiết bị'
                  name='device_id'
                  value={formData.device_id}
                  onChange={handleInputChange}
                  required
                  variant='outlined'
                >
                  {devices.map((device) => (
                    <MenuItem key={device.id} value={device.id}>
                      {device.name} ({device.serial_number})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type='datetime-local'
                  label='Ngày giờ bảo trì'
                  name='scheduled_date'
                  value={formData.scheduled_date}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant='outlined'
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label='Ghi chú'
                  name='note'
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder='Ghi chú về lịch bảo trì...'
                  variant='outlined'
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setFormVisible(false)}>Hủy</Button>
            <Button type='submit' variant='contained'>
              Tạo lịch bảo trì
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
