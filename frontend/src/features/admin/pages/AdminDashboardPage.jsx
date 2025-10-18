import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  Description as ContractIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { getAdminStats } from '../../../api/admin-stats';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getAdminStats();
      if (response.success) {
        setStats(response.data);
      } else {
        setError('Không thể tải thống kê');
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Lỗi khi tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  // Format tiền tệ VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity='error'>{error}</Alert>
      </Box>
    );
  }

  if (!stats) return null;

  return (
    <Box>
      <Typography variant='h4' gutterBottom fontWeight='bold'>
        Thống Kê Tổng Quan
      </Typography>

      {/* Cards thống kê - Sử dụng Box với display grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
          mt: 3,
        }}
      >
        {/* Card 1: Doanh thu */}
        <Card
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MoneyIcon sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant='h6'>Doanh Thu</Typography>
            </Box>
            <Typography variant='h4' fontWeight='bold' gutterBottom>
              {formatCurrency(stats.revenue.total)}
            </Typography>
            <Typography variant='body2' sx={{ opacity: 0.9 }}>
              Tháng này: {formatCurrency(stats.revenue.this_month)}
            </Typography>
            <Typography variant='caption' sx={{ opacity: 0.8 }}>
              Tổng {stats.revenue.orders_count} đơn hàng
            </Typography>
          </CardContent>
        </Card>

        {/* Card 2: Hợp đồng */}
        <Card
          sx={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ContractIcon sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant='h6'>Hợp Đồng</Typography>
            </Box>
            <Typography variant='h4' fontWeight='bold' gutterBottom>
              {stats.contracts.total}
            </Typography>
            <Typography variant='body2' sx={{ opacity: 0.9 }}>
              Đang hoạt động: {stats.contracts.active}
            </Typography>
            <Typography variant='caption' sx={{ opacity: 0.8 }}>
              Chờ xử lý: {stats.contracts.pending}
            </Typography>
          </CardContent>
        </Card>

        {/* Card 3: Kỹ thuật viên */}
        <Card
          sx={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PeopleIcon sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant='h6'>Kỹ Thuật Viên</Typography>
            </Box>
            <Typography variant='h4' fontWeight='bold' gutterBottom>
              {stats.technicians.length}
            </Typography>
            <Typography variant='body2' sx={{ opacity: 0.9 }}>
              Top performers
            </Typography>
            <Typography variant='caption' sx={{ opacity: 0.8 }}>
              Hiệu suất cao nhất
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Bảng Top Kỹ Thuật Viên */}
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant='h6' fontWeight='bold'>
                Top 5 Kỹ Thuật Viên Xuất Sắc
              </Typography>
            </Box>

            <TableContainer component={Paper} variant='outlined'>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell>
                      <strong>#</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Tên</strong>
                    </TableCell>
                    <TableCell align='center'>
                      <strong>Lịch hoàn thành</strong>
                    </TableCell>
                    <TableCell align='center'>
                      <strong>Tổng lịch</strong>
                    </TableCell>
                    <TableCell align='center'>
                      <strong>Tỷ lệ</strong>
                    </TableCell>
                    <TableCell align='center'>
                      <strong>Đánh giá</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.technicians.map((tech, index) => {
                    const completionRate =
                      tech.total_schedules > 0
                        ? Math.round(
                            (tech.completed_schedules / tech.total_schedules) *
                              100
                          )
                        : 0;

                    return (
                      <TableRow
                        key={tech.id}
                        sx={{
                          '&:hover': { bgcolor: 'grey.50' },
                          bgcolor: index === 0 ? 'success.50' : 'inherit',
                        }}
                      >
                        <TableCell>
                          {index === 0
                            ? '🥇'
                            : index === 1
                            ? '🥈'
                            : index === 2
                            ? '🥉'
                            : index + 1}
                        </TableCell>
                        <TableCell>
                          <Typography
                            fontWeight={index === 0 ? 'bold' : 'normal'}
                          >
                            {tech.name}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Chip
                            label={tech.completed_schedules}
                            color='success'
                            size='small'
                          />
                        </TableCell>
                        <TableCell align='center'>
                          {tech.total_schedules}
                        </TableCell>
                        <TableCell align='center'>
                          <Chip
                            label={`${completionRate}%`}
                            color={
                              completionRate >= 80
                                ? 'success'
                                : completionRate >= 50
                                ? 'warning'
                                : 'error'
                            }
                            size='small'
                          />
                        </TableCell>
                        <TableCell align='center'>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography
                              variant='body2'
                              sx={{
                                color:
                                  tech.rating >= 4.5
                                    ? 'success.main'
                                    : tech.rating >= 3.5
                                    ? 'warning.main'
                                    : 'error.main',
                                fontWeight: 'bold',
                              }}
                            >
                              ⭐ {tech.rating.toFixed(1)}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {stats.technicians.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align='center'>
                        <Typography color='text.secondary'>
                          Chưa có dữ liệu kỹ thuật viên
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
