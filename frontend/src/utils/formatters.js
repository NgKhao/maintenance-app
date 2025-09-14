import { DEVICE_STATUS, USER_ROLES } from '../constants';

// Format date functions
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN');
};

// Status display functions
export const getDeviceStatusDisplay = (status) => {
  switch (status) {
    case DEVICE_STATUS.NORMAL:
      return 'Bình thường';
    case DEVICE_STATUS.ISSUE:
      return 'Có vấn đề';
    case DEVICE_STATUS.MAINTENANCE:
      return 'Đang bảo trì';
    default:
      return status;
  }
};

export const getDeviceStatusColor = (status) => {
  switch (status) {
    case DEVICE_STATUS.NORMAL:
      return 'bg-green-100 text-green-800';
    case DEVICE_STATUS.ISSUE:
      return 'bg-red-100 text-red-800';
    case DEVICE_STATUS.MAINTENANCE:
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getRoleDisplay = (role) => {
  switch (role) {
    case USER_ROLES.USER:
      return 'Khách hàng';
    case USER_ROLES.TECHNICIAN:
      return 'Kỹ thuật viên';
    case USER_ROLES.ADMIN:
      return 'Quản trị viên';
    default:
      return role;
  }
};

export const getRoleColor = (role) => {
  switch (role) {
    case USER_ROLES.USER:
      return 'bg-blue-100 text-blue-800';
    case USER_ROLES.TECHNICIAN:
      return 'bg-green-100 text-green-800';
    case USER_ROLES.ADMIN:
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getActiveDisplay = (active) => {
  return active ? 'Hoạt động' : 'Vô hiệu hóa';
};

export const getActiveColor = (active) => {
  return active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
};
