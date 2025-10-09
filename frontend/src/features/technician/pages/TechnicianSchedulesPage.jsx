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
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as ConfirmIcon,
  Cancel as RejectIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { usePagination } from '../../../hooks';
import { TablePagination } from '../../../components/common';

export default function TechnicianSchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter schedules based on search term and status (only show schedules that need technician action)
  const filteredSchedules = schedules.filter((schedule) => {
    // Only show schedules that need technician approval (pending or assigned)
    const needsAction = ['pending', 'assigned'].includes(schedule.status);
    if (!needsAction) return false;

    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      schedule.user_name?.toLowerCase().includes(searchLower) ||
      schedule.device_name?.toLowerCase().includes(searchLower) ||
      schedule.note?.toLowerCase().includes(searchLower)
    );
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

  // Keep track of previous search term to avoid unnecessary resets
  const prevSearchTerm = useRef(searchTerm);

  // Reset pagination when search changes
  useEffect(() => {
    if (prevSearchTerm.current !== searchTerm) {
      resetPagination();
      prevSearchTerm.current = searchTerm;
    }
  }, [searchTerm, resetPagination]);

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const email = user.email;
  const API_URL = 'http://localhost:8000/api/technician_approve.php';

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

  const handleUpdateStatus = async (id, status) => {
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

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: {
        color: 'warning',
        text: 'Chờ xử lý',
      },
      assigned: {
        color: 'info',
        text: 'Đã phân công',
      },
      confirmed: {
        color: 'success',
        text: 'Đã xác nhận',
      },
      rejected: {
        color: 'error',
        text: 'Từ chối',
      },
      in_progress: {
        color: 'primary',
        text: 'Đang thực hiện',
      },
      completed: {
        color: 'success',
        text: 'Hoàn thành',
      },
      cancelled: {
        color: 'default',
        text: 'Đã hủy',
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Chip label={config.text} color={config.color} size='small' />;
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
          Lịch cần xác nhận
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Danh sách lịch bảo trì được phân công cho bạn - Vui lòng xác nhận hoặc
          từ chối
        </Typography>
      </Box>

      {/* Search Box */}
      <Box mb={3}>
        <TextField
          placeholder='Tìm kiếm theo khách hàng, thiết bị, ghi chú...'
          variant='outlined'
          size='small'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: { xs: '100%', md: '400px' } }}
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
      </Box>

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
                  <TableCell align='center'>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align='center'>
                      <Typography variant='body2' color='text.secondary'>
                        {schedules.length === 0
                          ? 'Không có lịch nào cần xác nhận'
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
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>
                          {schedule.device_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {schedule.scheduled_date
                          ? new Date(schedule.scheduled_date).toLocaleString(
                              'vi-VN'
                            )
                          : ''}
                      </TableCell>
                      <TableCell>{getStatusChip(schedule.status)}</TableCell>
                      <TableCell>
                        <Typography variant='body2'>
                          {schedule.note || 'Không có ghi chú'}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        {schedule.status === 'pending' ||
                        schedule.status === 'assigned' ? (
                          <Box display='flex' gap={1} justifyContent='center'>
                            <Button
                              variant='contained'
                              color='success'
                              size='small'
                              startIcon={<ConfirmIcon />}
                              onClick={() =>
                                handleUpdateStatus(schedule.id, 'confirmed')
                              }
                            >
                              Xác nhận
                            </Button>
                            <Button
                              variant='contained'
                              color='error'
                              size='small'
                              startIcon={<RejectIcon />}
                              onClick={() =>
                                handleUpdateStatus(schedule.id, 'rejected')
                              }
                            >
                              Từ chối
                            </Button>
                          </Box>
                        ) : (
                          <Typography variant='body2' color='text.secondary'>
                            Đã xử lý
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
    </Box>
  );
}
