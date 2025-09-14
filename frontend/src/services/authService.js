import { apiService } from './api';
import { API_CONFIG } from '../constants';

export const authService = {
  async login(email, password) {
    try {
      const response = await apiService.post(
        `${API_CONFIG.ENDPOINTS.AUTH}&action=login`,
        {
          email,
          password,
        }
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Đăng nhập thất bại',
      };
    }
  },

  async register(name, email, password) {
    try {
      const response = await apiService.post(
        `${API_CONFIG.ENDPOINTS.AUTH}&action=register`,
        {
          name,
          email,
          password,
        }
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Đăng ký thất bại',
      };
    }
  },
};
