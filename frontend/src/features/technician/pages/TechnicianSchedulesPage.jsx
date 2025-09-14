import React, { useState, useEffect, useCallback } from 'react';
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
  Alert
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Check as CheckIcon,
  Schedule as BusyIcon
} from '@mui/icons-material';
import axios from 'axios';

export default function TechnicianSchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      await axios.post(API_URL, {
        schedule_id: id,
        status: status,
      });
      fetchSchedules();
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
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Lịch chờ duyệt
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Danh sách lịch bảo trì được phân công cho bạn
        </Typography>
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
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Thiết bị</TableCell>
                  <TableCell>Ngày thực hiện</TableCell>
                  <TableCell>Ghi chú</TableCell>
                  <TableCell align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Không có lịch nào chờ duyệt
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  schedules.map((schedule) => (
                    <TableRow key={schedule.id} hover>
                      <TableCell>{schedule.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {schedule.user_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {schedule.device_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {schedule.scheduled_date ? 
                          new Date(schedule.scheduled_date).toLocaleString('vi-VN') : 
                          ''
                        }
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {schedule.note || 'Không có ghi chú'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckIcon />}
                            onClick={() => handleUpdateStatus(schedule.id, 'completed')}
                          >
                            Hoàn thành
                          </Button>
                          <Button
                            variant="contained"
                            color="warning"
                            size="small"
                            startIcon={<BusyIcon />}
                            onClick={() => handleUpdateStatus(schedule.id, 'busy')}
                          >
                            Bận
                          </Button>
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
    </Box>
  );
}