// Validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateRequired = (value) => {
  return value && value.trim() !== '';
};

// Form validation helper
export const validateForm = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const value = data[field];
    const fieldRules = rules[field];

    if (fieldRules.required && !validateRequired(value)) {
      errors[field] = `${fieldRules.label || field} là bắt buộc`;
      return;
    }

    if (value) {
      if (fieldRules.type === 'email' && !validateEmail(value)) {
        errors[field] = 'Email không hợp lệ';
      } else if (fieldRules.type === 'phone' && !validatePhone(value)) {
        errors[field] = 'Số điện thoại không hợp lệ';
      } else if (fieldRules.type === 'password' && !validatePassword(value)) {
        errors[field] = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
    }
  });

  return errors;
};
