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
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Devices as DevicesIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Build as BuildIcon,
  QrCode as SerialIcon,
  CheckCircle as StatusIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import {
  getDevices,
  addDevice,
  updateDevice,
  deleteDevice,
} from '../../../api/devices';

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    serial_number: '',
    status: 'normal',
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
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

  // Filter devices based on search term and status
  useEffect(() => {
    let filtered = devices;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (device) =>
          device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          device.serial_number
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (role === 'admin' &&
            device.user_name?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((device) => device.status === statusFilter);
    }

    setFilteredDevices(filtered);
  }, [devices, searchTerm, statusFilter, role]);

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
    setFormVisible(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload = { ...formData };

      // Xử lý payload theo role - chỉ cho phép thêm mới
      if (role === 'user') {
        payload.user_id = user.id;
        await addDevice(payload);
      } else {
        setError('Chỉ khách hàng mới có thể thêm thiết bị mới');
        return;
      }

      setFormVisible(false);
      fetchDevices();
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Lỗi khi lưu thiết bị');
    }
  };

  const handleEdit = (device) => {
    setEditingId(device.id);
    setEditData({
      name: device.name,
      serial_number: device.serial_number,
      status: device.status,
      technician_note: device.technician_note || '',
    });
  };

  const handleSave = async (id) => {
    try {
      await updateDevice({ id, ...editData });
      setEditingId(null);
      setEditData({});
      fetchDevices();
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Lỗi khi cập nhật thiết bị');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) {
      try {
        await deleteDevice(id);
        fetchDevices();
        setError('');
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'Lỗi khi xóa thiết bị');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingId) {
      setEditData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
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
      {/* Header */}
      <Box
        mb={4}
        display='flex'
        justifyContent='space-between'
        alignItems='center'
      >
        <Box>
          <Typography variant='h4' component='h1' gutterBottom>
            <DevicesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Quản lý thiết bị
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {role === 'user'
              ? 'Danh sách thiết bị của bạn'
              : role === 'technician'
              ? 'Danh sách thiết bị cần bảo trì'
              : 'Danh sách tất cả thiết bị trong hệ thống'}
          </Typography>
        </Box>

        {role === 'user' && (
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Thêm thiết bị
          </Button>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search and Filter Bar */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Grid container spacing={2} alignItems='center'>
            {/* Search Field */}
            <Grid item xs={12} sm={12} md={7}>
              <TextField
                fullWidth
                placeholder={`Tìm kiếm theo tên thiết bị, số serial${
                  role === 'admin' ? ', chủ sở hữu' : ''
                }...`}
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

            {/* Status Filter */}
            <Grid item xs={12} sm={8} md={3}>
              <FormControl fullWidth size='small'>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  label='Trạng thái'
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value='all'>Tất cả</MenuItem>
                  <MenuItem value='normal'>Bình thường</MenuItem>
                  <MenuItem value='issue'>Có vấn đề</MenuItem>
                  <MenuItem value='maintenance'>Đang bảo trì</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Results Counter */}
            <Grid item xs={12} sm={4} md={2}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '40px',
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ fontWeight: 'bold' }}
                >
                  {filteredDevices.length} / {devices.length}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  thiết bị
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
                  <TableCell>
                    <Box display='flex' alignItems='center'>
                      <BuildIcon sx={{ mr: 1, fontSize: 16 }} />
                      Tên thiết bị
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display='flex' alignItems='center'>
                      <SerialIcon sx={{ mr: 1, fontSize: 16 }} />
                      Số serial
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display='flex' alignItems='center'>
                      <StatusIcon sx={{ mr: 1, fontSize: 16 }} />
                      Trạng thái
                    </Box>
                  </TableCell>
                  {role === 'admin' && <TableCell>Chủ sở hữu</TableCell>}
                  {(role === 'technician' || role === 'admin') && (
                    <TableCell>Ghi chú kỹ thuật</TableCell>
                  )}
                  <TableCell width='120'>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDevices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={role === 'admin' ? 7 : 6}
                      align='center'
                    >
                      <Typography variant='body2' color='text.secondary' py={4}>
                        {searchTerm || statusFilter !== 'all'
                          ? 'Không tìm thấy thiết bị nào phù hợp'
                          : 'Không có thiết bị nào'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDevices.map((device, index) => (
                    <TableRow key={device.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {editingId === device.id ? (
                          <TextField
                            fullWidth
                            size='small'
                            name='name'
                            value={editData.name || ''}
                            onChange={handleInputChange}
                          />
                        ) : (
                          <Typography variant='body2' fontWeight='medium'>
                            {highlightText(device.name, searchTerm)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === device.id ? (
                          <TextField
                            fullWidth
                            size='small'
                            name='serial_number'
                            value={editData.serial_number || ''}
                            onChange={handleInputChange}
                          />
                        ) : (
                          <Typography variant='body2'>
                            {highlightText(device.serial_number, searchTerm)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === device.id ? (
                          <TextField
                            fullWidth
                            size='small'
                            select
                            name='status'
                            value={editData.status || 'normal'}
                            onChange={handleInputChange}
                          >
                            <MenuItem value='normal'>Bình thường</MenuItem>
                            <MenuItem value='issue'>Có vấn đề</MenuItem>
                            <MenuItem value='maintenance'>
                              Đang bảo trì
                            </MenuItem>
                          </TextField>
                        ) : (
                          <Chip
                            label={getStatusText(device.status)}
                            color={getStatusColor(device.status)}
                            size='small'
                            variant='filled'
                          />
                        )}
                      </TableCell>
                      {role === 'admin' && (
                        <TableCell>
                          <Box>
                            <Typography variant='body2' fontWeight='medium'>
                              {highlightText(device.user_name, searchTerm)}
                            </Typography>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              {device.user_email}
                            </Typography>
                          </Box>
                        </TableCell>
                      )}
                      {(role === 'technician' || role === 'admin') && (
                        <TableCell>
                          {editingId === device.id ? (
                            <TextField
                              fullWidth
                              size='small'
                              multiline
                              rows={2}
                              name='technician_note'
                              value={editData.technician_note || ''}
                              onChange={handleInputChange}
                              placeholder='Ghi chú kỹ thuật...'
                            />
                          ) : (
                            <Typography variant='body2'>
                              {device.technician_note || (
                                <em style={{ color: '#666' }}>
                                  Chưa có ghi chú
                                </em>
                              )}
                            </Typography>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        {editingId === device.id ? (
                          <Box display='flex'>
                            <IconButton
                              color='primary'
                              onClick={() => handleSave(device.id)}
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
                          </Box>
                        ) : (
                          <Box display='flex'>
                            {((role === 'user' && device.user_id === user.id) ||
                              role === 'technician' ||
                              role === 'admin') && (
                              <IconButton
                                color='primary'
                                onClick={() => handleEdit(device)}
                                disabled={loading}
                                title='Chỉnh sửa'
                              >
                                <EditIcon />
                              </IconButton>
                            )}
                            {((role === 'user' && device.user_id === user.id) ||
                              role === 'admin') && (
                              <IconButton
                                color='error'
                                onClick={() => handleDelete(device.id)}
                                disabled={loading}
                                title='Xóa'
                              >
                                <DeleteIcon />
                              </IconButton>
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
        <DialogTitle>Thêm thiết bị mới</DialogTitle>

        <Box component='form' onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              {/* Tên thiết bị */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Tên thiết bị'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  variant='outlined'
                />
              </Grid>

              {/* Số serial */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Số serial'
                  name='serial_number'
                  value={formData.serial_number}
                  onChange={handleInputChange}
                  required
                  variant='outlined'
                />
              </Grid>

              {/* Trạng thái */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label='Trạng thái'
                  name='status'
                  value={formData.status}
                  onChange={handleInputChange}
                  variant='outlined'
                >
                  <MenuItem value='normal'>Bình thường</MenuItem>
                  <MenuItem value='issue'>Có vấn đề</MenuItem>
                  <MenuItem value='maintenance'>Đang bảo trì</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setFormVisible(false)}>Hủy</Button>
            <Button type='submit' variant='contained'>
              Thêm thiết bị
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
