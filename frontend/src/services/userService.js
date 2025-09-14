import { apiService } from './api';
import { API_CONFIG } from '../constants';

export const userService = {
  async getUsers() {
    try {
      return await apiService.get(API_CONFIG.ENDPOINTS.USERS);
    } catch (error) {
      throw new Error(error.message || 'Không thể tải danh sách người dùng');
    }
  },

  async createUser(userData) {
    try {
      return await apiService.post(API_CONFIG.ENDPOINTS.USERS, userData);
    } catch (error) {
      throw new Error(error.message || 'Không thể tạo người dùng');
    }
  },

  async updateUser(id, userData) {
    try {
      return await apiService.put(
        `${API_CONFIG.ENDPOINTS.USERS}?id=${id}`,
        userData
      );
    } catch (error) {
      throw new Error(error.message || 'Không thể cập nhật người dùng');
    }
  },

  async deleteUser(id) {
    try {
      return await apiService.delete(`${API_CONFIG.ENDPOINTS.USERS}?id=${id}`);
    } catch (error) {
      throw new Error(error.message || 'Không thể xóa người dùng');
    }
  },

  async resetPassword(userId) {
    try {
      return await apiService.post(
        `${API_CONFIG.ENDPOINTS.USERS}?action=reset_password`,
        {
          user_id: userId,
        }
      );
    } catch (error) {
      throw new Error(error.message || 'Không thể reset mật khẩu');
    }
  },
};
