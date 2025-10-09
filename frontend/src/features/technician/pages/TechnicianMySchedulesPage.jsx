import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { usePagination } from '../../../hooks';
import { TablePagination } from '../../../components/common';

export default function TechnicianMySchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deviceUpdateDialog, setDeviceUpdateDialog] = useState({
    open: false,
    schedule: null,
  });
  const [deviceUpdateForm, setDeviceUpdateForm] = useState({
    device_status: 'normal',
    technician_note: '',
  });

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const email = user.email;
  const API_URL = 'http://localhost:8000/api/technician_approve.php';

  // Filter schedules based on search term and status (only show confirmed and in-progress schedules)
  const filteredSchedules = schedules.filter((schedule) => {
    // Only show schedules that technician is working on
    const isWorkingOn = ['confirmed', 'in_progress', 'completed'].includes(
      schedule.status
    );
    if (!isWorkingOn) return false;

    const matchesSearch =
      searchTerm === '' ||
      schedule.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.device_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.note?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || schedule.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const {
    currentItems,
    totalItems,
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination,
  } = usePagination(filteredSchedules, 5);

  // Keep track of previous search/filter terms to avoid unnecessary resets
  const prevSearchTerm = useRef(searchTerm);
  const prevStatusFilter = useRef(statusFilter);

  // Reset pagination when search or filter changes
  useEffect(() => {
    if (
      prevSearchTerm.current !== searchTerm ||
      prevStatusFilter.current !== statusFilter
    ) {
      prevSearchTerm.current = searchTerm;
      prevStatusFilter.current = statusFilter;
      resetPagination();
    }
  }, [searchTerm, statusFilter, resetPagination]);

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const fetchSchedules = useCallback(async () => {
    if (!email) {
      setError('Không tìm thấy email của kỹ thuật viên');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}?email=${email}`);
      setSchedules(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError(err.response?.data?.error || 'Lỗi tải lịch bảo trì');
    }
    setLoading(false);
  }, [email, API_URL]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleUpdateScheduleStatus = async (id, status) => {
    try {
      const response = await axios.post(API_URL, {
        schedule_id: id,
        status: status,
      });
      fetchSchedules();
      setError('');
      setSuccessMessage(
        response.data.message || 'Cập nhật trạng thái thành công'
      );
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi cập nhật trạng thái');
      setSuccessMessage('');
    }
  };

  const handleDeviceUpdate = async () => {
    if (!deviceUpdateDialog.schedule) return;

    try {
      // Update device status
      await axios.put('http://localhost:8000/api/devices.php', {
        id: deviceUpdateDialog.schedule.device_id,
        status: deviceUpdateForm.device_status,
        technician_note: deviceUpdateForm.technician_note,
      });

      // Update schedule status to completed
      await handleUpdateScheduleStatus(
        deviceUpdateDialog.schedule.id,
        'completed'
      );

      setDeviceUpdateDialog({ open: false, schedule: null });
      setDeviceUpdateForm({ device_status: 'normal', technician_note: '' });
      setSuccessMessage(
        'Cập nhật thiết bị và hoàn thành lịch bảo trì thành công'
      );
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi cập nhật thiết bị');
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      confirmed: {
        color: 'success',
        text: 'Đã xác nhận',
      },
      in_progress: {
        color: 'primary',
        text: 'Đang thực hiện',
      },
      completed: {
        color: 'success',
        text: 'Hoàn thành',
      },
    };

    const config = statusConfig[status] || statusConfig.confirmed;
    return <Chip label={config.text} color={config.color} size='small' />;
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString('vi-VN') : '';
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
      <Box mb={4}>
        <Typography variant='h4' component='h1' gutterBottom>
          <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Lịch của tôi
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Quản lý và theo dõi tiến độ thực hiện lịch bảo trì được phân công
        </Typography>
      </Box>

      {/* Search and Filter */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '2fr 1fr 1fr',
              },
              gap: 2,
              alignItems: 'center',
            }}
          >
            <TextField
              placeholder='Tìm kiếm theo khách hàng, thiết bị, ghi chú...'
              variant='outlined'
              size='small'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position='end'>
                    <ClearIcon
                      sx={{ cursor: 'pointer' }}
                      onClick={handleClearSearch}
                    />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size='small'>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label='Trạng thái'
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value='all'>Tất cả</MenuItem>
                <MenuItem value='confirmed'>Đã xác nhận</MenuItem>
                <MenuItem value='in_progress'>Đang thực hiện</MenuItem>
                <MenuItem value='completed'>Hoàn thành</MenuItem>
              </Select>
            </FormControl>

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
                {totalItems} / {schedules.length}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                lịch bảo trì
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Success/Error Messages */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity='success' sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Schedules Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Thiết bị</TableCell>
                  <TableCell>Ngày thực hiện</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ghi chú</TableCell>
                  <TableCell align='center'>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align='center'>
                      <Typography variant='body2' color='text.secondary'>
                        {schedules.length === 0
                          ? 'Không có lịch nào được phân công'
                          : 'Không tìm thấy kết quả phù hợp'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((schedule, index) => (
                    <TableRow key={schedule.id} hover>
                      <TableCell>
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>
                          {schedule.user_name}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {schedule.user_phone}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>
                          {schedule.device_name}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          SN: {schedule.serial_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {formatDate(schedule.scheduled_date)}
                      </TableCell>
                      <TableCell>{getStatusChip(schedule.status)}</TableCell>
                      <TableCell>
                        <Typography variant='body2'>
                          {schedule.note || 'Không có ghi chú'}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        {schedule.status === 'confirmed' ? (
                          <Button
                            variant='contained'
                            color='primary'
                            size='small'
                            startIcon={<StartIcon />}
                            onClick={() =>
                              handleUpdateScheduleStatus(
                                schedule.id,
                                'in_progress'
                              )
                            }
                          >
                            Bắt đầu
                          </Button>
                        ) : schedule.status === 'in_progress' ? (
                          <Box display='flex' gap={1}>
                            <Button
                              variant='outlined'
                              color='primary'
                              size='small'
                              startIcon={<SettingsIcon />}
                              onClick={() => {
                                setDeviceUpdateDialog({ open: true, schedule });
                                setDeviceUpdateForm({
                                  device_status:
                                    schedule.device_status || 'normal',
                                  technician_note: '',
                                });
                              }}
                            >
                              Cập nhật thiết bị
                            </Button>
                          </Box>
                        ) : (
                          <Typography variant='body2' color='text.secondary'>
                            Đã hoàn thành
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalItems > 0 && (
            <TablePagination
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemLabel='lịch bảo trì'
            />
          )}
        </CardContent>
      </Card>

      {/* Device Update Dialog */}
      <Dialog
        open={deviceUpdateDialog.open}
        onClose={() => setDeviceUpdateDialog({ open: false, schedule: null })}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Cập nhật trạng thái thiết bị</DialogTitle>
        <DialogContent>
          {deviceUpdateDialog.schedule && (
            <Box sx={{ mt: 2 }}>
              <Typography variant='body2' gutterBottom>
                <strong>Thiết bị:</strong>{' '}
                {deviceUpdateDialog.schedule.device_name}
              </Typography>
              <Typography variant='body2' gutterBottom sx={{ mb: 3 }}>
                <strong>Khách hàng:</strong>{' '}
                {deviceUpdateDialog.schedule.user_name}
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Trạng thái thiết bị</InputLabel>
                <Select
                  value={deviceUpdateForm.device_status}
                  label='Trạng thái thiết bị'
                  onChange={(e) =>
                    setDeviceUpdateForm({
                      ...deviceUpdateForm,
                      device_status: e.target.value,
                    })
                  }
                >
                  <MenuItem value='normal'>Bình thường</MenuItem>
                  <MenuItem value='issue'>Có vấn đề</MenuItem>
                  <MenuItem value='maintenance'>Cần bảo trì thêm</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={4}
                label='Ghi chú kỹ thuật'
                value={deviceUpdateForm.technician_note}
                onChange={(e) =>
                  setDeviceUpdateForm({
                    ...deviceUpdateForm,
                    technician_note: e.target.value,
                  })
                }
                placeholder='Nhập ghi chú về tình trạng thiết bị, công việc đã thực hiện...'
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDeviceUpdateDialog({ open: false, schedule: null })
            }
          >
            Hủy
          </Button>
          <Button
            onClick={handleDeviceUpdate}
            variant='contained'
            startIcon={<CompleteIcon />}
          >
            Hoàn thành bảo trì
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
