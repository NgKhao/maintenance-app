import axios from 'axios';
import { API_CONFIG, DEFAULT_HEADERS, REQUEST_TIMEOUT } from '../constants';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: DEFAULT_HEADERS,
      withCredentials: true,
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add any auth headers here if needed
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        console.error('API Error:', error);

        if (error.response) {
          // Server responded with error status
          throw new Error(
            error.response.data?.error || error.response.statusText
          );
        } else if (error.request) {
          // Request was made but no response received
          throw new Error('Không thể kết nối đến server');
        } else {
          // Something else happened
          throw new Error(error.message || 'Có lỗi xảy ra');
        }
      }
    );
  }

  get(path, config = {}) {
    return this.client.get(path, config);
  }

  post(path, data = {}, config = {}) {
    return this.client.post(path, data, config);
  }

  put(path, data = {}, config = {}) {
    return this.client.put(path, data, config);
  }

  delete(path, config = {}) {
    return this.client.delete(path, config);
  }
}

// Create singleton instance
export const apiService = new ApiService();
export default apiService;
