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
  Switch,
  CircularProgress,
  Alert,
  InputAdornment,
  Grid,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { authStorage } from '../../../utils/storage';

export default function UsersPage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const role = authStorage.getRole() || '';
  const canEdit = role === 'admin';

  const API_URL = 'http://localhost:8000/api/users.php';

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const result = await response.json();

      if (response.ok) {
        setData(result);
        setFilteredData(result);
        setError('');
      } else {
        setError(result.error || 'Lỗi tải dữ liệu');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
    } else {
      const filtered = data.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [data, searchTerm]);

  // Keyboard shortcut for search (Ctrl+F)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.getElementById('user-search-input')?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Helper function to highlight search term
  const highlightText = (text, searchTerm) => {
    if (!searchTerm || !text) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <Box
          component='span'
          key={index}
          sx={{ backgroundColor: 'yellow', fontWeight: 'bold' }}
        >
          {part}
        </Box>
      ) : (
        part
      )
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setFormVisible(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          role: 'user',
        });
        fetchData();
        setError('');
      } else {
        setError(result.error || 'Lỗi tạo user');
      }
    } catch (error) {
      console.error('Create error:', error);
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
    });
  };

  const handleSave = async (id) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      const result = await response.json();

      if (response.ok) {
        setEditingId(null);
        setEditData({});
        fetchData();
        setError('');
      } else {
        setError(result.error || 'Lỗi cập nhật user');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa user này?')) {
      setLoading(true);

      try {
        const response = await fetch(`${API_URL}?id=${id}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (response.ok) {
          fetchData();
          setError('');
        } else {
          setError(result.error || 'Lỗi xóa user');
        }
      } catch (error) {
        console.error('Delete error:', error);
        setError('Lỗi kết nối server');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: currentStatus === 1 ? 0 : 1,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        fetchData();
        setError('');
      } else {
        setError(result.error || 'Lỗi cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Toggle active error:', error);
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  if (loading && data.length === 0) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='200px'
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        mb={4}
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        flexWrap='wrap'
        gap={2}
      >
        <Box>
          <Typography variant='h4' component='h1' gutterBottom>
            <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Quản lý người dùng
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Quản lý tài khoản và phân quyền người dùng
          </Typography>
        </Box>
        {canEdit && (
          <Button
            variant='contained'
            startIcon={<PersonAddIcon />}
            onClick={() => setFormVisible(true)}
          >
            Thêm người dùng
          </Button>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search and Stats */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={12} md={8}>
              <TextField
                id='user-search-input'
                fullWidth
                placeholder='Tìm kiếm theo tên, email, số điện thoại... (Ctrl+F)'
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
            </Grid>
            <Grid item xs={12} md={4}>
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
                  {filteredData.length} / {data.length}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  người dùng
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Tên</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Số điện thoại</TableCell>
                  <TableCell>Vai trò</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  {canEdit && <TableCell align='center'>Thao tác</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canEdit ? 7 : 6} align='center'>
                      <Typography variant='body2' color='text.secondary' py={4}>
                        {searchTerm
                          ? 'Không tìm thấy người dùng nào phù hợp'
                          : 'Không có dữ liệu'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((user, index) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {editingId === user.id ? (
                          <TextField
                            size='small'
                            value={editData.name || ''}
                            onChange={(e) =>
                              setEditData({ ...editData, name: e.target.value })
                            }
                          />
                        ) : (
                          highlightText(user.name, searchTerm)
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === user.id ? (
                          <TextField
                            size='small'
                            type='email'
                            value={editData.email || ''}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                email: e.target.value,
                              })
                            }
                          />
                        ) : (
                          highlightText(user.email, searchTerm)
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === user.id ? (
                          <TextField
                            size='small'
                            value={editData.phone || ''}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                phone: e.target.value,
                              })
                            }
                          />
                        ) : (
                          highlightText(user.phone, searchTerm)
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === user.id ? (
                          <TextField
                            select
                            size='small'
                            value={editData.role || 'user'}
                            onChange={(e) =>
                              setEditData({ ...editData, role: e.target.value })
                            }
                            sx={{ minWidth: 120 }}
                          >
                            <MenuItem value='user'>User</MenuItem>
                            <MenuItem value='technician'>Technician</MenuItem>
                            <MenuItem value='admin'>Admin</MenuItem>
                          </TextField>
                        ) : (
                          <Chip
                            label={user.role}
                            color={
                              user.role === 'admin'
                                ? 'error'
                                : user.role === 'technician'
                                ? 'warning'
                                : 'default'
                            }
                            size='small'
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {canEdit ? (
                          <Switch
                            checked={
                              editingId === user.id
                                ? editData.is_active === 1
                                : user.is_active === 1
                            }
                            onChange={() =>
                              editingId === user.id
                                ? setEditData({
                                    ...editData,
                                    is_active: editData.is_active === 1 ? 0 : 1,
                                  })
                                : handleToggleActive(user.id, user.is_active)
                            }
                            disabled={loading}
                          />
                        ) : (
                          <Chip
                            label={
                              user.is_active === 1 ? 'Hoạt động' : 'Vô hiệu'
                            }
                            color={user.is_active === 1 ? 'success' : 'default'}
                            size='small'
                          />
                        )}
                      </TableCell>
                      {canEdit && (
                        <TableCell align='center'>
                          <Box display='flex' gap={1} justifyContent='center'>
                            {editingId === user.id ? (
                              <>
                                <IconButton
                                  color='primary'
                                  onClick={() => handleSave(user.id)}
                                  disabled={loading}
                                >
                                  <SaveIcon />
                                </IconButton>
                                <IconButton
                                  color='secondary'
                                  onClick={handleCancel}
                                  disabled={loading}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </>
                            ) : (
                              <>
                                <IconButton
                                  color='primary'
                                  onClick={() => handleEdit(user)}
                                  disabled={loading}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  color='error'
                                  onClick={() => handleDelete(user.id)}
                                  disabled={loading}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </>
                            )}
                          </Box>
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

      {/* Create User Dialog */}
      <Dialog
        open={formVisible}
        onClose={() => setFormVisible(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Thêm người dùng mới</DialogTitle>
        <Box component='form' onSubmit={handleCreate}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Tên'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Email'
                  type='email'
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Số điện thoại'
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Mật khẩu'
                  type='password'
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label='Vai trò'
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <MenuItem value='user'>User</MenuItem>
                  <MenuItem value='technician'>Technician</MenuItem>
                  <MenuItem value='admin'>Admin</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormVisible(false)}>Hủy</Button>
            <Button
              type='submit'
              variant='contained'
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={16} /> : <PersonAddIcon />
              }
            >
              {loading ? 'Đang tạo...' : 'Tạo'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
