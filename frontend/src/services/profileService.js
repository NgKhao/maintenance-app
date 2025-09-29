import { apiService } from './api';
import { API_CONFIG } from '../constants';

export const profileService = {
  async getProfile(userId) {
    try {
      return await apiService.get(
        `${API_CONFIG.ENDPOINTS.PROFILE}&user_id=${userId}`
      );
    } catch (error) {
      throw new Error(error.message || 'Không thể tải thông tin cá nhân');
    }
  },

  async updateProfile(userId, profileData) {
    try {
      return await apiService.put(
        `${API_CONFIG.ENDPOINTS.PROFILE}&user_id=${userId}`,
        profileData
      );
    } catch (error) {
      throw new Error(error.message || 'Không thể cập nhật thông tin');
    }
  },

  async changePassword(userId, passwordData) {
    try {
      return await apiService.put(
        `${API_CONFIG.ENDPOINTS.PROFILE}&user_id=${userId}`,
        {
          action: 'change_password',
          ...passwordData,
        }
      );
    } catch (error) {
      throw new Error(error.message || 'Không thể đổi mật khẩu');
    }
  },
};
