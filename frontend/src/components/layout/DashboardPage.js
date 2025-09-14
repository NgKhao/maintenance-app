import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip
} from '@mui/material';
import {
  Devices as DevicesIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon
} from '@mui/icons-material';

const DashboardPage = ({ role }) => {
  const stats = [
    {
      title: 'Thiết bị',
      value: '24',
      icon: <DevicesIcon sx={{ fontSize: 40 }} />,
      color: 'primary.main'
    },
    {
      title: 'Lịch bảo trì',
      value: '8',
      icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
      color: 'success.main'
    },
    {
      title: 'Nhắc nhở',
      value: '3',
      icon: <NotificationsIcon sx={{ fontSize: 40 }} />,
      color: 'warning.main'
    }
  ];

  if (role === 'admin') {
    stats.push({
      title: 'Người dùng',
      value: '156',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: 'secondary.main'
    });
  }

  const activities = [
    {
      title: 'Bảo trì máy giặt LG hoàn thành',
      time: '2 giờ trước',
      status: 'completed'
    },
    {
      title: 'Lịch bảo trì mới được tạo',
      time: '4 giờ trước',
      status: 'created'
    },
    {
      title: 'Nhắc nhở bảo trì điều hòa',
      time: '1 ngày trước',
      status: 'reminder'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'created':
        return 'info';
      case 'reminder':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tổng quan
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Chào mừng đến với hệ thống quản lý bảo trì thiết bị
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" component="div">
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Hoạt động gần đây
          </Typography>
          <List>
            {activities.map((activity, index) => (
              <ListItem key={index} divider={index < activities.length - 1}>
                <ListItemAvatar>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      bgcolor: `${getStatusColor(activity.status)}.main`,
                      borderRadius: '50%',
                      mr: 2
                    }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={activity.title}
                  secondary={activity.time}
                />
                <Chip
                  label={activity.status}
                  color={getStatusColor(activity.status)}
                  size="small"
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