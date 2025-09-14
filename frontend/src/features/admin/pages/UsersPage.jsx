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
  Grid,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as UsersIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';

export default function UsersPage() {
  const [data, setData] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user'
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const role = localStorage.getItem('role');
  const canEdit = role === 'admin';

  const API_URL = 'http://localhost:8000/api/users.php';

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      // Lọc ra admin accounts - chỉ hiển thị user và technician
      const filteredData = res.data.filter((user) => user.role !== 'admin');
      setData(filteredData);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi tải dữ liệu người dùng');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper functions
  const getRoleColor = (role) => {
    switch (role) {
      case 'user':
        return 'primary';
      case 'technician':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'user':
        return 'Khách hàng';
      case 'technician':
        return 'Kỹ thuật viên';
      default:
        return role;
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!canEdit) {
      setError('Bạn không có quyền thêm người dùng');
      return;
    }

    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'user'
    });
    setFormVisible(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      Object.keys(formData).forEach(key => {
        form.append(key, formData[key] || '');
      });

      await axios.post(API_URL, form);
      setFormVisible(false);
      fetchData();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi thêm người dùng');
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'user'
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      const form = new FormData();
      form.append('id', id);
      Object.keys(editData).forEach(key => {
        form.append(key, editData[key] || '');
      });

      await axios.put(API_URL, form);
      setEditingId(null);
      setEditData({});
      fetchData();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi cập nhật người dùng');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (id) => {
    if (!canEdit) {
      setError('Bạn không có quyền xóa người dùng');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;

    try {
      await axios.delete(`${API_URL}?id=${id}`);
      fetchData();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi xóa người dùng');
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      const form = new FormData();
      form.append('id', id);
      form.append('active', currentActive ? '0' : '1');

      await axios.put(API_URL, form);
      fetchData();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi cập nhật trạng thái');
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
            <UsersIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Quản lý người dùng
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý khách hàng và kỹ thuật viên trong hệ thống
          </Typography>
        </Box>
        
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Thêm người dùng
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
                  <TableCell>Họ tên</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Số điện thoại</TableCell>
                  <TableCell>Vai trò</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Không có người dùng nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>
                        {editingId === user.id ? (
                          <TextField
                            size="small"
                            name="name"
                            value={editData.name || ''}
                            onChange={handleEditInputChange}
                            variant="outlined"
                          />
                        ) : (
                          user.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === user.id ? (
                          <TextField
                            size="small"
                            name="email"
                            type="email"
                            value={editData.email || ''}
                            onChange={handleEditInputChange}
                            variant="outlined"
                          />
                        ) : (
                          user.email
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === user.id ? (
                          <TextField
                            size="small"
                            name="phone"
                            value={editData.phone || ''}
                            onChange={handleEditInputChange}
                            variant="outlined"
                          />
                        ) : (
                          user.phone || '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === user.id ? (
                          <TextField
                            size="small"
                            select
                            name="role"
                            value={editData.role || 'user'}
                            onChange={handleEditInputChange}
                            variant="outlined"
                          >
                            <MenuItem value="user">Khách hàng</MenuItem>
                            <MenuItem value="technician">Kỹ thuật viên</MenuItem>
                          </TextField>
                        ) : (
                          <Chip
                            label={getRoleText(user.role)}
                            color={getRoleColor(user.role)}
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={user.active === '1' || user.active === 1}
                              onChange={() => handleToggleActive(user.id, user.active === '1' || user.active === 1)}
                              disabled={!canEdit}
                            />
                          }
                          label={user.active === '1' || user.active === 1 ? 'Hoạt động' : 'Tạm khóa'}
                        />
                      </TableCell>
                      <TableCell>
                        {user.created_at ? 
                          new Date(user.created_at).toLocaleDateString('vi-VN') : 
                          '-'
                        }
                      </TableCell>
                      <TableCell align="center">
                        {editingId === user.id ? (
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => handleSaveEdit(user.id)}
                              color="primary"
                              title="Lưu"
                            >
                              <SaveIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={handleCancelEdit}
                              color="secondary"
                              title="Hủy"
                            >
                              <CancelIcon />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box>
                            {canEdit && (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEdit(user)}
                                  color="primary"
                                  title="Chỉnh sửa"
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(user.id)}
                                  color="error"
                                  title="Xóa"
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
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Thêm người dùng mới
        </DialogTitle>
        
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Họ tên"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mật khẩu"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Vai trò"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                >
                  <MenuItem value="user">Khách hàng</MenuItem>
                  <MenuItem value="technician">Kỹ thuật viên</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setFormVisible(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="contained">
              Thêm người dùng
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}