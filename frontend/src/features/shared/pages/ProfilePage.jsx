import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Tab,
  Tabs,
  Grid,
  Chip,
  Avatar,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  BarChart as BarChartIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

import { useAuth } from '../../../contexts';
import { profileService } from '../../../services/profileService';
import { useForm } from '../../../hooks';
import { validateForm } from '../../../utils';
import {
  getRoleDisplay,
  getRoleColor,
  formatDate,
} from '../../../utils/formatters';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ProfilePage = () => {
  const { user, login } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success',
  });

  // Form for profile info
  const {
    formData: profileForm,
    errors: profileErrors,
    handleInputChange: handleProfileChange,
    validate: validateProfile,
    setData: setProfileForm,
    setErrors: setProfileErrors,
  } = useForm(
    {},
    {
      name: { required: true, label: 'Tên' },
      email: { required: true, type: 'email', label: 'Email' },
      phone: { required: false, type: 'phone', label: 'Số điện thoại' },
      address: { required: false, label: 'Địa chỉ' },
    }
  );

  // Form for password change
  const {
    formData: passwordForm,
    errors: passwordErrors,
    handleInputChange: handlePasswordChange,
    reset: resetPasswordForm,
    setErrors: setPasswordErrors,
  } = useForm(
    {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
    {
      current_password: { required: true, label: 'Mật khẩu hiện tại' },
      new_password: { required: true, type: 'password', label: 'Mật khẩu mới' },
      confirm_password: { required: true, label: 'Xác nhận mật khẩu' },
    }
  );

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ open: true, message, type });
  }, []);

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile(user.id);
      setProfileData(data);
      setProfileForm(data);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!validateProfile()) {
      showNotification('Vui lòng kiểm tra lại thông tin', 'error');
      return;
    }

    try {
      setUpdating(true);
      const response = await profileService.updateProfile(user.id, profileForm);

      if (response.success) {
        setProfileData(response.user);
        setProfileForm(response.user);
        setEditMode(false);

        // Update user context if email changed
        if (response.user.email !== user.email) {
          login({ ...user, ...response.user });
        }

        showNotification(response.message);
      } else {
        showNotification(response.error || 'Cập nhật thất bại', 'error');
      }
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    // Custom validation for password
    const errors = validateForm(passwordForm, {
      current_password: { required: true, label: 'Mật khẩu hiện tại' },
      new_password: { required: true, type: 'password', label: 'Mật khẩu mới' },
      confirm_password: { required: true, label: 'Xác nhận mật khẩu' },
    });

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      errors.confirm_password = 'Mật khẩu xác nhận không khớp';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      showNotification('Vui lòng kiểm tra lại thông tin', 'error');
      return;
    }

    try {
      setChangingPassword(true);
      const response = await profileService.changePassword(user.id, {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        confirm_password: passwordForm.confirm_password,
      });

      if (response.success) {
        showNotification(response.message);
        resetPasswordForm();
      } else {
        showNotification(response.error || 'Đổi mật khẩu thất bại', 'error');
      }
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setProfileForm(profileData);
    setProfileErrors({});
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]); // Only load when user.id changes

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
      <Typography variant='h4' gutterBottom>
        Thông tin cá nhân
      </Typography>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant='scrollable'
            scrollButtons='auto'
          >
            <Tab icon={<PersonIcon />} label='Thông tin cá nhân' />
            <Tab icon={<LockIcon />} label='Đổi mật khẩu' />
          </Tabs>
        </Box>

        {/* Profile Info Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            mb={3}
          >
            <Box display='flex' alignItems='center'>
              <Avatar
                sx={{ width: 64, height: 64, mr: 2, bgcolor: 'primary.main' }}
              >
                {profileData?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant='h6'>{profileData?.name}</Typography>
                <Chip
                  label={getRoleDisplay(profileData?.role)}
                  size='small'
                  className={getRoleColor(profileData?.role)}
                />
              </Box>
            </Box>
            {!editMode && (
              <Button
                variant='outlined'
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
              >
                Chỉnh sửa
              </Button>
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Tên đầy đủ'
                name='name'
                value={profileForm.name || ''}
                onChange={handleProfileChange}
                disabled={!editMode}
                error={!!profileErrors.name}
                helperText={profileErrors.name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Email'
                name='email'
                type='email'
                value={profileForm.email || ''}
                onChange={handleProfileChange}
                disabled={!editMode}
                error={!!profileErrors.email}
                helperText={profileErrors.email}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Số điện thoại'
                name='phone'
                value={profileForm.phone || ''}
                onChange={handleProfileChange}
                disabled={!editMode}
                error={!!profileErrors.phone}
                helperText={profileErrors.phone}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Ngày tạo tài khoản'
                value={formatDate(profileData?.created_at)}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Địa chỉ'
                name='address'
                multiline
                rows={3}
                value={profileForm.address || ''}
                onChange={handleProfileChange}
                disabled={!editMode}
                error={!!profileErrors.address}
                helperText={profileErrors.address}
              />
            </Grid>
          </Grid>

          {editMode && (
            <Box display='flex' justifyContent='flex-end' gap={2} mt={3}>
              <Button
                variant='outlined'
                startIcon={<CancelIcon />}
                onClick={handleCancelEdit}
                disabled={updating}
              >
                Hủy
              </Button>
              <Button
                variant='contained'
                startIcon={<SaveIcon />}
                onClick={handleUpdateProfile}
                disabled={updating}
              >
                {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </Box>
          )}
        </TabPanel>

        {/* Change Password Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant='h6' gutterBottom>
            Đổi mật khẩu
          </Typography>
          <Typography variant='body2' color='text.secondary' paragraph>
            Để bảo mật tài khoản, vui lòng sử dụng mật khẩu mạnh có ít nhất 6 ký
            tự.
          </Typography>

          <Grid container spacing={3} maxWidth={400}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Mật khẩu hiện tại'
                name='current_password'
                type='password'
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
                error={!!passwordErrors.current_password}
                helperText={passwordErrors.current_password}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Mật khẩu mới'
                name='new_password'
                type='password'
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                error={!!passwordErrors.new_password}
                helperText={passwordErrors.new_password}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Xác nhận mật khẩu mới'
                name='confirm_password'
                type='password'
                value={passwordForm.confirm_password}
                onChange={handlePasswordChange}
                error={!!passwordErrors.confirm_password}
                helperText={passwordErrors.confirm_password}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant='contained'
                onClick={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.type}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
