import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';

const DRAWER_WIDTH = 240;

const UniversalHeader = ({ isPublic = false, sidebarOpen, setSidebarOpen }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  // Public Header (for HomePage, PackagesViewPage, etc.)
  if (isPublic || !isAuthenticated) {
    return (
      <AppBar
        position='fixed'
        sx={{
          bgcolor: 'white',
          boxShadow: 1,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                mr: 2,
                width: 40,
                height: 40,
              }}
            >
              <BuildIcon />
            </Avatar>
            <Typography
              variant='h6'
              component='div'
              sx={{
                color: 'text.primary',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            >
              Maintenance Pro
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              color='primary'
              onClick={() => navigate('/packages')}
              sx={{ fontWeight: 600 }}
            >
              Gói dịch vụ
            </Button>
            <Button
              color='primary'
              onClick={() => navigate('/login')}
              sx={{ fontWeight: 600 }}
            >
              Đăng nhập
            </Button>
            <Button
              variant='contained'
              onClick={() => navigate('/register')}
              sx={{ fontWeight: 600 }}
            >
              Đăng ký
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  // Authenticated Header (for dashboard pages with sidebar)
  return (
    <AppBar
      position='fixed'
      sx={{
        width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { sm: `${DRAWER_WIDTH}px` },
      }}
    >
      <Toolbar>
        <IconButton
          color='inherit'
          aria-label='open drawer'
          edge='start'
          onClick={() => setSidebarOpen(!sidebarOpen)}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant='h6' noWrap component='div' sx={{ flexGrow: 1 }}>
          Maintenance Pro
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant='body2'
            sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}
          >
            Xin chào, {user?.name}
          </Typography>

          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfile}>
              <PersonIcon fontSize='small' sx={{ mr: 1 }} />
              Thông tin cá nhân
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize='small' sx={{ mr: 1 }} />
              Đăng xuất
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default UniversalHeader;
