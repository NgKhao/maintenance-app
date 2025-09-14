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
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Devices as DevicesIcon
} from '@mui/icons-material';
import {
  getDevices,
  addDevice,
  updateDevice,
  deleteDevice,
} from '../api/devices';

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    serial_number: '',
    status: 'normal',
  });
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  // Lấy thông tin user từ localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.role || 'user';

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      // Nếu là user thường, chỉ lấy thiết bị của mình
      const userId = role === 'user' ? user.id : null;
      const data = await getDevices(userId);
      setDevices(data);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tải danh sách thiết bị');
    }
    setLoading(false);
  }, [role, user.id]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return 'success';
      case 'issue':
        return 'error';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'normal':
        return 'Bình thường';
      case 'issue':
        return 'Có vấn đề';
      case 'maintenance':
        return 'Đang bảo trì';
      default:
        return status;
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    // Chỉ khách hàng (user) mới được thêm thiết bị
    if (role !== 'user') {
      setError('Chỉ khách hàng mới có thể thêm thiết bị');
      return;
    }

    setFormData({
      id: null,
      name: '',
      serial_number: '',
      status: 'normal',
      user_id: user.id,
      technician_note: '',
    });
    setEditing(false);
    setFormVisible(true);
  };

  const handleEdit = (device) => {
    setFormData({
      id: device.id,
      name: device.name || '',
      serial_number: device.serial_number || '',
      status: device.status || 'normal',
      user_id: device.user_id || user.id,
      technician_note: device.technician_note || '',
    });
    setEditing(true);
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    // Chỉ khách hàng (user) mới được xóa thiết bị của mình
    if (role !== 'user') {
      setError('Chỉ khách hàng mới có thể xóa thiết bị');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn xóa thiết bị này?')) return;
    try {
      await deleteDevice(id);
      fetchDevices();
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Lỗi khi xóa thiết bị');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload = { ...formData };

      // Xử lý payload theo role
      if (role === 'user') {
        // Khách hàng chỉ có thể sửa tên và thêm thiết bị mới
        payload.user_id = user.id;
      } else if (role === 'technician') {
        // Kỹ thuật viên chỉ có thể cập nhật trạng thái và ghi chú
        if (editing) {
          payload = {
            id: formData.id,
            status: formData.status,
            technician_note: formData.technician_note,
          };
        } else {
          setError('Kỹ thuật viên không thể thêm thiết bị mới');
          return;
        }
      }

      if (editing) {
        await updateDevice(payload);
      } else {
        await addDevice(payload);
      }

      setFormVisible(false);
      fetchDevices();
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Lỗi khi lưu thiết bị');
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
            <DevicesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Quản lý thiết bị
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {role === 'user' 
              ? 'Danh sách thiết bị của bạn' 
              : role === 'technician'
              ? 'Danh sách thiết bị cần bảo trì'
              : 'Danh sách tất cả thiết bị trong hệ thống'
            }
          </Typography>
        </Box>
        
        {role === 'user' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Thêm thiết bị
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
                  <TableCell>Tên thiết bị</TableCell>
                  <TableCell>Số serial</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  {role === 'admin' && <TableCell>Chủ sở hữu</TableCell>}
                  {(role === 'technician' || role === 'admin') && (
                    <TableCell>Ghi chú kỹ thuật</TableCell>
                  )}
                  <TableCell align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {devices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={role === 'admin' ? 6 : 5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Không có thiết bị nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>{device.name}</TableCell>
                      <TableCell>{device.serial_number}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(device.status)}
                          color={getStatusColor(device.status)}
                          size="small"
                        />
                      </TableCell>
                      {role === 'admin' && (
                        <TableCell>
                          <Typography variant="body2">
                            {device.user_name} ({device.user_email})
                          </Typography>
                        </TableCell>
                      )}
                      {(role === 'technician' || role === 'admin') && (
                        <TableCell>
                          <Typography variant="body2">
                            {device.technician_note || 'Chưa có ghi chú'}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell align="center">
                        <Box>
                          {(role === 'user' || role === 'technician') && (
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(device)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                          )}
                          {role === 'user' && (
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(device.id)}
                              color="error"
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
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editing ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}
        </DialogTitle>
        
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              {/* Tên thiết bị */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên thiết bị"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={role === 'user'}
                  disabled={role !== 'user'}
                  variant="outlined"
                />
              </Grid>

              {/* Số serial */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Số serial"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={handleInputChange}
                  required={role === 'user' && !editing}
                  disabled={role !== 'user' || editing}
                  variant="outlined"
                />
              </Grid>

              {/* Trạng thái */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Trạng thái"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={role === 'admin'}
                  variant="outlined"
                >
                  <MenuItem value="normal">Bình thường</MenuItem>
                  <MenuItem value="issue">Có vấn đề</MenuItem>
                  <MenuItem value="maintenance">Đang bảo trì</MenuItem>
                </TextField>
              </Grid>

              {/* Ghi chú kỹ thuật */}
              {(role === 'technician' || (role === 'admin' && editing)) && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Ghi chú kỹ thuật"
                    name="technician_note"
                    value={formData.technician_note}
                    onChange={handleInputChange}
                    disabled={role === 'admin'}
                    placeholder="Ghi chú về tình trạng thiết bị sau bảo trì..."
                    variant="outlined"
                  />
                </Grid>
              )}

              {/* Thông tin chủ sở hữu */}
              {role === 'admin' && editing && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Thông tin chủ sở hữu
                      </Typography>
                      <Typography variant="body2">
                        <strong>Tên:</strong>{' '}
                        {devices.find((d) => d.id === formData.id)?.user_name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong>{' '}
                        {devices.find((d) => d.id === formData.id)?.user_email}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setFormVisible(false)}>
              {role === 'admin' ? 'Đóng' : 'Hủy'}
            </Button>
            {role !== 'admin' && (
              <Button type="submit" variant="contained">
                {role === 'technician'
                  ? 'Cập nhật'
                  : editing
                  ? 'Lưu thay đổi'
                  : 'Thêm thiết bị'}
              </Button>
            )}
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}