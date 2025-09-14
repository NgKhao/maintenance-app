import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
} from '@mui/material';
import {
  Home,
  People,
  Inventory,
  Devices,
  Assignment,
  Schedule,
  Notifications,
  Description,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const DRAWER_WIDTH = 240;

const Sidebar = ({ sidebarOpen, setSidebarOpen, role }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = React.useMemo(() => {
    if (role === 'admin') {
      return [
        { label: 'Tổng quan', icon: <Home />, path: '/dashboard' },
        { label: 'Người dùng', icon: <People />, path: '/users' },
        { label: 'Gói bảo trì', icon: <Inventory />, path: '/packages' },
        {
          label: 'Yêu cầu hợp đồng',
          icon: <Description />,
          path: '/contract-requests',
        },
        { label: 'Quản lý lịch', icon: <Schedule />, path: '/admin-schedules' },
        { label: 'Thiết bị', icon: <Devices />, path: '/devices' },
        { label: 'Đơn hàng', icon: <Assignment />, path: '/orders' },
        { label: 'Lịch bảo trì', icon: <Schedule />, path: '/schedules' },
        { label: 'Nhắc nhở', icon: <Notifications />, path: '/reminders' },
      ];
    } else if (role === 'technician') {
      return [
        { label: 'Tổng quan', icon: <Home />, path: '/dashboard' },
        { label: 'Thiết bị', icon: <Devices />, path: '/devices' },
        {
          label: 'Lịch của tôi',
          icon: <Schedule />,
          path: '/technician-schedules',
        },
        { label: 'Đơn hàng', icon: <Assignment />, path: '/orders' },
        { label: 'Lịch bảo trì', icon: <Schedule />, path: '/schedules' },
        { label: 'Nhắc nhở', icon: <Notifications />, path: '/reminders' },
      ];
    } else {
      return [
        { label: 'Tổng quan', icon: <Home />, path: '/dashboard' },
        { label: 'Đăng ký dịch vụ', icon: <Add />, path: '/register-service' },
        {
          label: 'Hợp đồng của tôi',
          icon: <Description />,
          path: '/contracts',
        },
        {
          label: 'Đặt lịch bảo trì',
          icon: <Schedule />,
          path: '/book-schedule',
        },
        { label: 'Chọn kỹ thuật viên', icon: <People />, path: '/technicians' },
        { label: 'Thiết bị', icon: <Devices />, path: '/devices' },
        { label: 'Đơn hàng', icon: <Assignment />, path: '/orders' },
        { label: 'Lịch bảo trì', icon: <Schedule />, path: '/schedules' },
        { label: 'Nhắc nhở', icon: <Notifications />, path: '/reminders' },
      ];
    }
  }, [role]);

  const handleItemClick = (path) => {
    navigate(path);
    setSidebarOpen(false); // Close mobile drawer
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant='h6' noWrap component='div'>
          Maintenance Pro
        </Typography>
      </Toolbar>

      <List>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => handleItemClick(item.path)}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{ color: isActive ? 'inherit' : 'text.secondary' }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box
      component='nav'
      sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      aria-label='mailbox folders'
    >
      {/* Mobile drawer */}
      <Drawer
        variant='temporary'
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant='permanent'
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
