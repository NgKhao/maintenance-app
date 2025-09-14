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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Notifications as RemindersIcon
} from '@mui/icons-material';
import axios from 'axios';

export default function RemindersPage() {
  const [data, setData] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    schedule_id: '',
    reminder_date: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const role = localStorage.getItem('role');
  const canAdd = role === 'user';
  const canDelete = role === 'admin';

  const API_URL = 'http://localhost:8000/index.php?api=reminders';

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setData(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi tải dữ liệu');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!canAdd) {
      setError('Bạn không có quyền thêm nhắc nhở');
      return;
    }

    setFormData({
      schedule_id: '',
      reminder_date: ''
    });
    setFormVisible(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append('schedule_id', formData.schedule_id || '');
      form.append('reminder_date', formData.reminder_date || '');

      await axios.post(API_URL, form);
      setFormData({});
      setFormVisible(false);
      fetchData();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi thêm nhắc lịch');
    }
  };

  const handleDelete = async (id) => {
    if (!canDelete) {
      setError('Bạn không có quyền xóa nhắc nhở');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn xóa nhắc nhở này?')) return;

    try {
      await axios.delete(`${API_URL}&id=${id}`);
      fetchData();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi xóa nhắc nhở');
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
            <RemindersIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Nhắc nhở bảo trì
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {role === 'user' 
              ? 'Thiết lập nhắc nhở cho lịch bảo trì của bạn'
              : 'Quản lý các nhắc nhở bảo trì trong hệ thống'
            }
          </Typography>
        </Box>
        
        {canAdd && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Thêm nhắc nhở
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
                  <TableCell>Lịch ID</TableCell>
                  <TableCell>Ngày nhắc</TableCell>
                  {canDelete && <TableCell align="center">Hành động</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canDelete ? 4 : 3} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Không có nhắc nhở nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((reminder) => (
                    <TableRow key={reminder.id}>
                      <TableCell>{reminder.id}</TableCell>
                      <TableCell>{reminder.schedule_id}</TableCell>
                      <TableCell>
                        {reminder.reminder_date ? 
                          new Date(reminder.reminder_date).toLocaleString('vi-VN') : 
                          ''
                        }
                      </TableCell>
                      {canDelete && (
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(reminder.id)}
                            color="error"
                            title="Xóa"
                          >
                            <DeleteIcon />
                          </IconButton>
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

      {/* Dialog Form */}
      <Dialog
        open={formVisible}
        onClose={() => setFormVisible(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Thêm nhắc nhở mới
        </DialogTitle>
        
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Lịch ID"
                  name="schedule_id"
                  value={formData.schedule_id}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  helperText="ID của lịch bảo trì cần nhắc nhở"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Ngày giờ nhắc"
                  name="reminder_date"
                  value={formData.reminder_date}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="outlined"
                  helperText="Thời gian muốn được nhắc nhở"
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setFormVisible(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="contained">
              Thêm nhắc nhở
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}