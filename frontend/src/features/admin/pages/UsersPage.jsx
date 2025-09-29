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
  Key as KeyIcon,
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
  const [resetPasswordDialog, setResetPasswordDialog] = useState({
    open: false,
    user: null,
    newPassword: '',
    processing: false,
  });

  const role = authStorage.getRole() || '';
  const canEdit = role === 'admin';

  const API_URL = 'http://localhost:8000/api/users.php';

  // Role mapping for Vietnamese display
  const getRoleLabel = (roleValue) => {
    const roleLabels = {
      user: 'Người dùng',
      technician: 'Kỹ thuật viên',
      admin: 'Quản trị viên',
    };
    return roleLabels[roleValue] || roleValue;
  };

  // Role color mapping
  const getRoleColor = (roleValue) => {
    const roleColors = {
      user: 'default',
      technician: 'warning',
      admin: 'error',
    };
    return roleColors[roleValue] || 'default';
  };

  // Get available role options (admin can only create user & technician)
  const getRoleOptions = () => {
    return [
      { value: 'user', label: 'Người dùng' },
      { value: 'technician', label: 'Kỹ thuật viên' },
    ];
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const result = await response.json();

      if (response.ok) {
        // Filter out admin users if current user is admin
        const filteredResult =
          role === 'admin'
            ? result.filter((user) => user.role !== 'admin')
            : result;

        setData(filteredResult);
        setFilteredData(filteredResult);
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
  }, [role]);

  // Filter data based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
    } else {
      const filtered = data.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getRoleLabel(user.role)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
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
  }, [role, fetchData]); // Re-fetch when role changes

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
        setError(result.error || 'Lỗi tạo người dùng');
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
        setError(result.error || 'Lỗi cập nhật người dùng');
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
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
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
          setError(result.error || 'Lỗi xóa người dùng');
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

  const handleResetPassword = async (user) => {
    setResetPasswordDialog({
      open: true,
      user,
      newPassword: '',
      processing: false,
    });
  };

  const executeResetPassword = async () => {
    if (!resetPasswordDialog.user) return;

    setResetPasswordDialog((prev) => ({ ...prev, processing: true }));

    try {
      const response = await fetch(
        `${API_URL}?id=${resetPasswordDialog.user.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'reset_password',
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setResetPasswordDialog((prev) => ({
          ...prev,
          newPassword: result.new_password,
        }));
        setError('');
      } else {
        setError(result.error || 'Lỗi reset mật khẩu');
        setResetPasswordDialog((prev) => ({ ...prev, open: false }));
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Lỗi kết nối server');
      setResetPasswordDialog((prev) => ({ ...prev, open: false }));
    } finally {
      setResetPasswordDialog((prev) => ({ ...prev, processing: false }));
    }
  };

  const closeResetDialog = () => {
    setResetPasswordDialog({
      open: false,
      user: null,
      newPassword: '',
      processing: false,
    });
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
            Quản lý tài khoản người dùng và kỹ thuật viên
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
                placeholder='Tìm kiếm theo tên, email, số điện thoại, vai trò... (Ctrl+F)'
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
                            sx={{ minWidth: 140 }}
                          >
                            {getRoleOptions().map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        ) : (
                          <Chip
                            label={getRoleLabel(user.role)}
                            color={getRoleColor(user.role)}
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
                                  title='Chỉnh sửa'
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  color='warning'
                                  onClick={() => handleResetPassword(user)}
                                  disabled={loading}
                                  title='Reset mật khẩu'
                                >
                                  <KeyIcon />
                                </IconButton>
                                <IconButton
                                  color='error'
                                  onClick={() => handleDelete(user.id)}
                                  disabled={loading}
                                  title='Xóa'
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
                  {getRoleOptions().map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
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

      {/* Reset Password Dialog */}
      <Dialog
        open={resetPasswordDialog.open}
        onClose={closeResetDialog}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={1}>
            <KeyIcon />
            Reset mật khẩu
          </Box>
        </DialogTitle>
        <DialogContent>
          {resetPasswordDialog.user && (
            <Box sx={{ mt: 2 }}>
              <Typography variant='body1' gutterBottom>
                <strong>Người dùng:</strong> {resetPasswordDialog.user.name}
              </Typography>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                <strong>Email:</strong> {resetPasswordDialog.user.email}
              </Typography>

              {resetPasswordDialog.newPassword ? (
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: 'success.light',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant='h6' color='success.dark' gutterBottom>
                    ✅ Reset mật khẩu thành công!
                  </Typography>
                  <Typography variant='body2' sx={{ mb: 2 }}>
                    Mật khẩu mới của người dùng:
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'success.main',
                      textAlign: 'center',
                    }}
                  >
                    <Typography
                      variant='h5'
                      component='code'
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        color: 'primary.main',
                        letterSpacing: 2,
                      }}
                    >
                      {resetPasswordDialog.newPassword}
                    </Typography>
                  </Box>
                  <Alert severity='warning' sx={{ mt: 2 }}>
                    Vui lòng lưu lại mật khẩu này và thông báo cho người dùng.
                    Người dùng nên đổi mật khẩu sau khi đăng nhập lần đầu.
                  </Alert>
                </Box>
              ) : (
                <Box sx={{ mt: 3 }}>
                  <Alert severity='info' sx={{ mb: 2 }}>
                    Hệ thống sẽ tự động tạo mật khẩu mới (8 ký tự) cho người
                    dùng này. Mật khẩu cũ sẽ không còn hiệu lực.
                  </Alert>
                  <Typography variant='body2' color='text.secondary'>
                    Bạn có chắc chắn muốn reset mật khẩu cho người dùng này?
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeResetDialog}>
            {resetPasswordDialog.newPassword ? 'Đóng' : 'Hủy'}
          </Button>
          {!resetPasswordDialog.newPassword && (
            <Button
              variant='contained'
              color='warning'
              onClick={executeResetPassword}
              disabled={resetPasswordDialog.processing}
              startIcon={
                resetPasswordDialog.processing ? (
                  <CircularProgress size={16} />
                ) : (
                  <KeyIcon />
                )
              }
            >
              {resetPasswordDialog.processing
                ? 'Đang reset...'
                : 'Reset mật khẩu'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
