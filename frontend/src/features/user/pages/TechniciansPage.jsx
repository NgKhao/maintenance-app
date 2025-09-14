import React, { useState, useEffect } from 'react';
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
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip
} from '@mui/material';
import {
  Engineering as TechniciansIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import axios from 'axios';

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const userId = localStorage.getItem('userId');
  const deviceId = localStorage.getItem('deviceId');
  const API_URL = 'http://localhost:8000/index.php?api=technicians';

  useEffect(() => {
    const fetchTechs = async () => {
      setLoading(true);
      try {
        const res = await axios.get(API_URL);
        setTechnicians(res.data);
        setError('');
      } catch (err) {
        setError('Lỗi tải danh sách kỹ thuật viên');
      }
      setLoading(false);
    };
    fetchTechs();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'có sẵn':
        return 'success';
      case 'busy':
      case 'bận':
        return 'warning';
      case 'offline':
      case 'không có sẵn':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'Có sẵn';
      case 'busy':
        return 'Bận';
      case 'offline':
        return 'Không có sẵn';
      default:
        return status || 'Không rõ';
    }
  };

  const handleBooking = async () => {
    if (!selectedTech || !scheduledDate) {
      setError('Vui lòng chọn kỹ thuật viên và ngày giờ');
      return;
    }

    const form = new FormData();
    form.append('user_id', userId);
    form.append('technician_id', selectedTech);
    form.append('device_id', deviceId);
    form.append('scheduled_date', scheduledDate);
    form.append('note', note);

    try {
      const res = await axios.post(API_URL, form);
      setSuccess(res.data.message || 'Đặt lịch thành công');
      setSelectedTech('');
      setScheduledDate('');
      setNote('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi đặt lịch');
      setSuccess('');
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
          <TechniciansIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Danh sách kỹ thuật viên
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Chọn kỹ thuật viên và đặt lịch bảo trì thiết bị
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Danh sách kỹ thuật viên */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Danh sách kỹ thuật viên
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Tên kỹ thuật viên</TableCell>
                      <TableCell>Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {technicians.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography variant="body2" color="text.secondary">
                            Không có kỹ thuật viên nào
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      technicians.map((tech) => (
                        <TableRow key={tech.id} hover>
                          <TableCell>{tech.id}</TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {tech.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusText(tech.status)}
                              color={getStatusColor(tech.status)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Form đặt lịch */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Đặt lịch bảo trì
              </Typography>
              
              <Box component="form" sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  select
                  label="Chọn kỹ thuật viên"
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                  margin="normal"
                  variant="outlined"
                >
                  <MenuItem value="">
                    <em>Chọn kỹ thuật viên</em>
                  </MenuItem>
                  {technicians
                    .filter(tech => tech.status?.toLowerCase() === 'available' || tech.status?.toLowerCase() === 'có sẵn')
                    .map((tech) => (
                      <MenuItem key={tech.id} value={tech.id}>
                        {tech.name}
                      </MenuItem>
                    ))
                  }
                </TextField>

                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Ngày giờ bảo trì"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Ghi chú"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  margin="normal"
                  placeholder="Mô tả vấn đề thiết bị hoặc yêu cầu đặc biệt..."
                  variant="outlined"
                />

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleBooking}
                  sx={{ mt: 3 }}
                  startIcon={<ScheduleIcon />}
                >
                  Đặt lịch bảo trì
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}