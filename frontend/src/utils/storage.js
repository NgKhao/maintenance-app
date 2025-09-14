// Local storage utilities
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting from localStorage:', error);
      return null;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting to localStorage:', error);
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// Auth storage helpers
export const authStorage = {
  getUser: () => storage.get('user'),
  setUser: (user) => storage.set('user', user),
  removeUser: () => storage.remove('user'),
  getRole: () => storage.get('role'),
  setRole: (role) => storage.set('role', role),
  removeRole: () => storage.remove('role'),
  getUserId: () => storage.get('userId'),
  setUserId: (userId) => storage.set('userId', userId),
  removeUserId: () => storage.remove('userId'),
  clearAuth: () => {
    storage.remove('user');
    storage.remove('role');
    storage.remove('userId');
  },
};
