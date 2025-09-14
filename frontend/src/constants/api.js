// API configuration constants
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  ENDPOINTS: {
    AUTH: '/index.php?api=auth',
    USERS: '/api/users.php',
    DEVICES: '/index.php?api=devices',
    PACKAGES: '/index.php?api=packages',
    ORDERS: '/index.php?api=orders',
    SCHEDULES: '/index.php?api=schedules',
    REMINDERS: '/index.php?api=reminders',
    TECHNICIANS: '/index.php?api=technicians',
    CONTRACT_REQUESTS: '/index.php?api=contract_requests',
    ADMIN_SCHEDULES: '/index.php?api=admin_schedules',
    TECHNICIAN_APPROVE: '/index.php?api=technician_approve',
    BOOK_SCHEDULE: '/index.php?api=book_schedule'
  }
};

// Request timeout
export const REQUEST_TIMEOUT = 10000;

// Default headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json'
};