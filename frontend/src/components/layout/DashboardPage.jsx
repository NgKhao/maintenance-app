import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Devices as DevicesIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Assignment as ContractIcon,
  Inventory as PackageIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Work as MyScheduleIcon,
} from '@mui/icons-material';
import axios from 'axios';

const DashboardPage = ({ role }) => {
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch dashboard data based on role
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        if (role === 'admin') {
          await fetchAdminStats();
        } else if (role === 'technician') {
          await fetchTechnicianStats();
        } else if (role === 'user') {
          await fetchUserStats();
        }
        setError('');
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Lỗi tải dữ liệu dashboard');
      }
      setLoading(false);
    };

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, user.id]);

  const fetchAdminStats = async () => {
    try {
      const [usersRes, devicesRes, packagesRes, schedulesRes] =
        await Promise.all([
          axios.get('http://localhost:8000/api/users.php'),
          axios.get('http://localhost:8000/api/devices.php'),
          axios.get('http://localhost:8000/api/packages.php'),
          axios.get('http://localhost:8000/api/schedules.php'),
        ]);

      const totalUsers = usersRes.data.length || 0;
      const totalDevices = devicesRes.data.length || 0;
      const totalPackages = packagesRes.data.length || 0;
      const totalSchedules = schedulesRes.data.length || 0;
      const pendingSchedules =
        schedulesRes.data.filter((s) => s.status === 'pending').length || 0;

      setStats([
        {
          title: 'Người dùng',
          value: totalUsers.toString(),
          icon: <PeopleIcon sx={{ fontSize: 40 }} />,
          color: 'primary.main',
        },
        {
          title: 'Thiết bị',
          value: totalDevices.toString(),
          icon: <DevicesIcon sx={{ fontSize: 40 }} />,
          color: 'success.main',
        },
        {
          title: 'Gói bảo trì',
          value: totalPackages.toString(),
          icon: <PackageIcon sx={{ fontSize: 40 }} />,
          color: 'info.main',
        },
        {
          title: 'Lịch chờ xử lý',
          value: pendingSchedules.toString(),
          icon: <PendingIcon sx={{ fontSize: 40 }} />,
          color: 'warning.main',
        },
      ]);

      // Recent activities for admin
      setActivities([
        {
          title: `${totalSchedules} lịch bảo trì trong hệ thống`,
          time: 'Hiện tại',
          status: 'info',
        },
        {
          title: `${pendingSchedules} lịch chờ phân công`,
          time: 'Cần xử lý',
          status: 'warning',
        },
        {
          title: `${totalUsers} người dùng đang hoạt động`,
          time: 'Tổng quan',
          status: 'success',
        },
      ]);
    } catch (err) {
      throw err;
    }
  };

  const fetchTechnicianStats = async () => {
    try {
      const email = user.email;
      const [schedulesRes, devicesRes] = await Promise.all([
        axios.get(
          `http://localhost:8000/api/technician_approve.php?email=${email}`
        ),
        axios.get('http://localhost:8000/api/devices.php'),
      ]);

      const mySchedules = schedulesRes.data || [];
      const needConfirm = mySchedules.filter((s) =>
        ['pending', 'assigned'].includes(s.status)
      ).length;
      const inProgress = mySchedules.filter(
        (s) => s.status === 'in_progress'
      ).length;
      const completed = mySchedules.filter(
        (s) => s.status === 'completed'
      ).length;
      const totalDevices = devicesRes.data.length || 0;

      setStats([
        {
          title: 'Lịch cần xác nhận',
          value: needConfirm.toString(),
          icon: <PendingIcon sx={{ fontSize: 40 }} />,
          color: 'warning.main',
        },
        {
          title: 'Đang thực hiện',
          value: inProgress.toString(),
          icon: <MyScheduleIcon sx={{ fontSize: 40 }} />,
          color: 'primary.main',
        },
        {
          title: 'Đã hoàn thành',
          value: completed.toString(),
          icon: <CompletedIcon sx={{ fontSize: 40 }} />,
          color: 'success.main',
        },
        {
          title: 'Thiết bị',
          value: totalDevices.toString(),
          icon: <DevicesIcon sx={{ fontSize: 40 }} />,
          color: 'info.main',
        },
      ]);

      // Recent activities for technician
      setActivities([
        {
          title: `${needConfirm} lịch cần xác nhận`,
          time: needConfirm > 0 ? 'Cần xử lý' : 'Không có',
          status: needConfirm > 0 ? 'warning' : 'success',
        },
        {
          title: `${inProgress} lịch đang thực hiện`,
          time: 'Đang làm việc',
          status: 'info',
        },
        {
          title: `${completed} lịch đã hoàn thành`,
          time: 'Tổng kết',
          status: 'success',
        },
      ]);
    } catch (err) {
      throw err;
    }
  };

  const fetchUserStats = async () => {
    try {
      const userId = user.id;
      const [contractsRes, devicesRes, schedulesRes] = await Promise.all([
        axios.get(
          `http://localhost:8000/index.php?api=orders&action=contracts&user_id=${userId}`
        ),
        axios.get(`http://localhost:8000/api/devices.php?user_id=${userId}`),
        axios.get(`http://localhost:8000/api/schedules.php?user_id=${userId}`),
      ]);

      const totalContracts = contractsRes.data.length || 0;
      const activeContracts =
        contractsRes.data.filter((c) => c.payment_status === 'paid').length ||
        0;
      const totalDevices = devicesRes.data.length || 0;
      const totalSchedules = schedulesRes.data.length || 0;

      setStats([
        {
          title: 'Hợp đồng',
          value: totalContracts.toString(),
          icon: <ContractIcon sx={{ fontSize: 40 }} />,
          color: 'primary.main',
        },
        {
          title: 'Đang hoạt động',
          value: activeContracts.toString(),
          icon: <CompletedIcon sx={{ fontSize: 40 }} />,
          color: 'success.main',
        },
        {
          title: 'Thiết bị',
          value: totalDevices.toString(),
          icon: <DevicesIcon sx={{ fontSize: 40 }} />,
          color: 'info.main',
        },
        {
          title: 'Lịch bảo trì',
          value: totalSchedules.toString(),
          icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
          color: 'warning.main',
        },
      ]);

      // Recent activities for user
      setActivities([
        {
          title: `${activeContracts} hợp đồng đang hoạt động`,
          time: 'Hiện tại',
          status: activeContracts > 0 ? 'success' : 'warning',
        },
        {
          title: `${totalDevices} thiết bị được quản lý`,
          time: 'Tổng quan',
          status: 'info',
        },
        {
          title: `${totalSchedules} lịch bảo trì`,
          time: 'Lịch sử',
          status: 'info',
        },
      ]);
    } catch (err) {
      throw err;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
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
      <Box mb={4}>
        <Typography variant='h4' component='h1' gutterBottom>
          Tổng quan{' '}
          {role === 'admin'
            ? 'Admin'
            : role === 'technician'
            ? 'Kỹ thuật viên'
            : 'Khách hàng'}
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          {role === 'admin'
            ? 'Quản lý toàn bộ hệ thống bảo trì thiết bị'
            : role === 'technician'
            ? 'Theo dõi công việc và lịch bảo trì được phân công'
            : 'Theo dõi hợp đồng và thiết bị của bạn'}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards using Box Layout */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          mb: 4,
        }}
      >
        {stats.map((stat, index) => (
          <Box
            key={index}
            sx={{
              flex: {
                xs: '1 1 100%', // Mobile: full width
                sm: '1 1 calc(50% - 12px)', // Tablet: 2 per row
                md: '1 1 calc(50% - 12px)', // Split-screen: keep 2 per row
                lg: '1 1 calc(25% - 18px)', // Desktop rộng: 4 per row
              },
              minWidth: 0,
            }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display='flex' alignItems='center'>
                  <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      {stat.title}
                    </Typography>
                    <Typography variant='h5' component='div' fontWeight='bold'>
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Recent Activities */}
      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Thông tin quan trọng
          </Typography>
          <List>
            {activities.map((activity, index) => (
              <ListItem key={index} divider={index < activities.length - 1}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    bgcolor: `${getStatusColor(activity.status)}.main`,
                    borderRadius: '50%',
                    mr: 2,
                    flexShrink: 0,
                  }}
                />
                <ListItemText
                  primary={activity.title}
                  secondary={activity.time}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;
