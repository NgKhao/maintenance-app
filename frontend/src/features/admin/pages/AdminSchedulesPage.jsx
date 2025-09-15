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
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Paper,
  Grid,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
  Build as BuildIcon,
  Schedule as ScheduleIcon,
  Engineering as EngineeringIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const fetchSchedules = useCallback(async () => {
    try {
      const url =
        filter === 'all'
          ? 'http://localhost:8000/api/admin_schedules.php'
          : `http://localhost:8000/api/admin_schedules.php?status=${filter}`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setSchedules(data);
        setFilteredSchedules(data);
      } else {
        setMessage(data.error || 'Lỗi tải lịch');
      }
    } catch (error) {
      console.error('Fetch schedules error:', error);
      setMessage('Lỗi kết nối server');
    }
  }, [filter]);

  // Filter schedules based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSchedules(schedules);
    } else {
      const filtered = schedules.filter(
        (schedule) =>
          schedule.customer_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          schedule.device_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          schedule.technician_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          new Date(schedule.scheduled_date)
            .toLocaleDateString('vi-VN')
            .includes(searchTerm)
      );
      setFilteredSchedules(filtered);
    }
  }, [schedules, searchTerm]);

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
    fetchSchedules();
    fetchTechnicians();
  }, [filter, fetchSchedules]);

  const fetchTechnicians = async () => {
    try {
      const response = await fetch(
        'http://localhost:8000/api/admin_schedules.php',
        {
          method: 'PUT',
        }
      );
      const data = await response.json();

      if (response.ok) {
        setTechnicians(data);
      }
    } catch (error) {
      console.error('Fetch technicians error:', error);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData(e.target);
    const assignData = {
      schedule_id: selectedSchedule.id,
      technician_id: formData.get('technician_id'),
      scheduled_date: formData.get('scheduled_date'),
    };

    try {
      const response = await fetch(
        'http://localhost:8000/api/admin_schedules.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(assignData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setShowAssignModal(false);
        setSelectedSchedule(null);
        fetchSchedules();
      } else {
        setMessage(data.error || 'Lỗi phân công');
      }
    } catch (error) {
      console.error('Assign error:', error);
      setMessage('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: 'warning',
        label: 'Chờ phân công',
      },
      assigned: {
        color: 'info',
        label: 'Đã phân công',
      },
      confirmed: {
        color: 'success',
        label: 'Đã xác nhận',
      },
      rejected: {
        color: 'error',
        label: 'Đã từ chối',
      },
      in_progress: {
        color: 'secondary',
        label: 'Đang thực hiện',
      },
      completed: {
        color: 'default',
        label: 'Hoàn thành',
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Chip
        label={config.label}
        color={config.color}
        size='small'
        variant='filled'
      />
    );
  };

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
            <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Quản lý lịch bảo trì
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Phân công và theo dõi lịch bảo trì thiết bị
          </Typography>
        </Box>
      </Box>

      {/* Message Alert */}
      {message && (
        <Alert
          severity={message.includes('thành công') ? 'success' : 'error'}
          sx={{ mb: 3 }}
          onClose={() => setMessage('')}
        >
          {message}
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
                placeholder='Tìm kiếm theo khách hàng, thiết bị, kỹ thuật viên...'
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
                  value={filter}
                  label='Trạng thái'
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <MenuItem value='all'>Tất cả</MenuItem>
                  <MenuItem value='pending'>Chờ phân công</MenuItem>
                  <MenuItem value='assigned'>Đã phân công</MenuItem>
                  <MenuItem value='confirmed'>Đã xác nhận</MenuItem>
                  <MenuItem value='in_progress'>Đang thực hiện</MenuItem>
                  <MenuItem value='completed'>Hoàn thành</MenuItem>
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
                  {filteredSchedules.length} / {schedules.length}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  lịch bảo trì
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
                  <TableCell>
                    <Box display='flex' alignItems='center'>
                      <PersonIcon sx={{ mr: 1, fontSize: 16 }} />
                      Khách hàng
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display='flex' alignItems='center'>
                      <BuildIcon sx={{ mr: 1, fontSize: 16 }} />
                      Thiết bị
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display='flex' alignItems='center'>
                      <ScheduleIcon sx={{ mr: 1, fontSize: 16 }} />
                      Ngày mong muốn
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display='flex' alignItems='center'>
                      <EngineeringIcon sx={{ mr: 1, fontSize: 16 }} />
                      Kỹ thuật viên
                    </Box>
                  </TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align='center'>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center'>
                      <Typography variant='body2' color='text.secondary' py={4}>
                        {searchTerm
                          ? 'Không tìm thấy lịch bảo trì nào phù hợp'
                          : 'Không có lịch bảo trì nào'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchedules.map((schedule) => (
                    <TableRow key={schedule.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant='body2' fontWeight='medium'>
                            {highlightText(schedule.customer_name, searchTerm)}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {schedule.customer_phone}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant='body2' fontWeight='medium'>
                            {highlightText(schedule.device_name, searchTerm)}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {schedule.serial_number}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>
                          {highlightText(
                            new Date(
                              schedule.scheduled_date
                            ).toLocaleDateString('vi-VN'),
                            searchTerm
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>
                          {schedule.technician_name ? (
                            highlightText(schedule.technician_name, searchTerm)
                          ) : (
                            <em style={{ color: '#666' }}>Chưa phân công</em>
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                      <TableCell align='center'>
                        <Box display='flex' gap={1} justifyContent='center'>
                          {(schedule.status === 'pending' ||
                            !schedule.technician_name) && (
                            <Button
                              size='small'
                              variant='outlined'
                              onClick={() => {
                                setSelectedSchedule(schedule);
                                setShowAssignModal(true);
                              }}
                            >
                              {schedule.technician_name
                                ? 'Thay đổi KTV'
                                : 'Phân công'}
                            </Button>
                          )}
                          {schedule.customer_note && (
                            <IconButton
                              size='small'
                              title={schedule.customer_note}
                              color='info'
                            >
                              <VisibilityIcon fontSize='small' />
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

      {/* Assignment Modal */}
      {showAssignModal && selectedSchedule && (
        <Dialog
          open={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedSchedule(null);
          }}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>
            <Box display='flex' alignItems='center'>
              <EngineeringIcon sx={{ mr: 1 }} />
              Phân công kỹ thuật viên
            </Box>
          </DialogTitle>

          <Box component='form' onSubmit={handleAssign}>
            <DialogContent>
              <Grid container spacing={2}>
                {/* Schedule Info */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant='body2' gutterBottom>
                      <strong>Khách hàng:</strong>{' '}
                      {selectedSchedule.customer_name}
                    </Typography>
                    <Typography variant='body2'>
                      <strong>Thiết bị:</strong> {selectedSchedule.device_name}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Technician Selection */}
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Chọn kỹ thuật viên</InputLabel>
                    <Select
                      name='technician_id'
                      label='Chọn kỹ thuật viên'
                      defaultValue=''
                    >
                      {technicians.map((tech) => (
                        <MenuItem key={tech.id} value={tech.id}>
                          {tech.name} - {tech.phone}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Date Selection */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Ngày hẹn'
                    name='scheduled_date'
                    type='date'
                    defaultValue={selectedSchedule.scheduled_date}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      min: new Date().toISOString().split('T')[0],
                    }}
                    required
                  />
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedSchedule(null);
                }}
              >
                Hủy
              </Button>
              <Button
                type='submit'
                variant='contained'
                disabled={loading}
                startIcon={
                  loading ? <CircularProgress size={16} /> : <AssignmentIcon />
                }
              >
                {loading ? 'Đang phân công...' : 'Phân công'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      )}
    </Box>
  );
}

export default AdminSchedulesPage;
