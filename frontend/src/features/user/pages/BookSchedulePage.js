import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  BookOnline as BookIcon,
  Event as EventIcon,
  Info as InfoIcon
} from '@mui/icons-material';

function BookSchedulePage() {
    const [devices, setDevices] = useState([]);
    const [formData, setFormData] = useState({
        device_id: '',
        preferred_date: '',
        note: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchDevices = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/book_schedule.php?user_id=${user.id}`);
            const data = await response.json();
            
            if (response.ok) {
                setDevices(data);
            } else {
                setMessage(data.error || 'Lỗi tải thiết bị');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Fetch devices error:', error);
            setMessage('Lỗi kết nối server');
            setMessageType('error');
        }
    }, [user.id]);

    useEffect(() => {
        if (user.id) {
            fetchDevices();
        }
    }, [user.id, fetchDevices]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('http://localhost:8000/api/book_schedule.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    user_id: user.id
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setMessageType('success');
                setFormData({
                    device_id: '',
                    preferred_date: '',
                    note: ''
                });
            } else {
                setMessage(data.error || 'Lỗi đặt lịch');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Book schedule error:', error);
            setMessage('Lỗi kết nối server');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const minDate = new Date().toISOString().split('T')[0];

    return (
        <Box maxWidth={800} mx="auto">
            <Box mb={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    <BookIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Đặt lịch bảo trì
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Đặt lịch bảo trì cho thiết bị của bạn
                </Typography>
            </Box>

            {message && (
                <Alert severity={messageType} sx={{ mb: 3 }}>
                    {message}
                </Alert>
            )}

            <Card>
                <CardContent>
                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            select
                            label="Chọn thiết bị cần bảo trì"
                            name="device_id"
                            value={formData.device_id}
                            onChange={handleInputChange}
                            required
                            margin="normal"
                            variant="outlined"
                        >
                            <MenuItem value="">
                                <em>-- Chọn thiết bị --</em>
                            </MenuItem>
                            {devices.map(device => (
                                <MenuItem key={device.id} value={device.id}>
                                    {device.name} - {device.serial_number} ({device.status})
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            type="date"
                            label="Ngày mong muốn"
                            name="preferred_date"
                            value={formData.preferred_date}
                            onChange={handleInputChange}
                            inputProps={{ min: minDate }}
                            required
                            margin="normal"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            variant="outlined"
                            helperText="Chúng tôi sẽ cố gắng sắp xếp theo ngày bạn mong muốn"
                        />

                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Ghi chú thêm"
                            name="note"
                            value={formData.note}
                            onChange={handleInputChange}
                            margin="normal"
                            placeholder="Mô tả tình trạng thiết bị, thời gian mong muốn, yêu cầu đặc biệt..."
                            variant="outlined"
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <EventIcon />}
                            sx={{ mt: 3 }}
                        >
                            {loading ? 'Đang đặt lịch...' : 'Đặt lịch bảo trì'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Paper 
                elevation={1} 
                sx={{ 
                    mt: 3, 
                    p: 3, 
                    bgcolor: 'info.light',
                    color: 'info.contrastText' 
                }}
            >
                <Box display="flex" alignItems="flex-start">
                    <InfoIcon sx={{ mr: 1, mt: 0.5 }} />
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Lưu ý quan trọng:
                        </Typography>
                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                            <Typography component="li" variant="body2" mb={0.5}>
                                Bạn cần có gói bảo trì còn hiệu lực để đặt lịch
                            </Typography>
                            <Typography component="li" variant="body2" mb={0.5}>
                                Chúng tôi sẽ phân công kỹ thuật viên và xác nhận lại với bạn
                            </Typography>
                            <Typography component="li" variant="body2" mb={0.5}>
                                Thời gian thực hiện có thể điều chỉnh tùy lịch kỹ thuật viên
                            </Typography>
                            <Typography component="li" variant="body2">
                                Bạn có thể theo dõi tiến độ trong mục "Lịch Bảo Trì"
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}

export default BookSchedulePage;