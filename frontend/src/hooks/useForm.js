import { useState } from 'react';
import { validateForm } from '../utils';

// Custom hook for form handling
export const useForm = (initialData = {}, validationRules = {}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate single field on blur
    if (validationRules[name]) {
      const fieldErrors = validateForm(formData, {
        [name]: validationRules[name],
      });
      setErrors((prev) => ({
        ...prev,
        [name]: fieldErrors[name] || '',
      }));
    }
  };

  const validate = () => {
    const newErrors = validateForm(formData, validationRules);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = (newData = initialData) => {
    setFormData(newData);
    setErrors({});
    setTouched({});
  };

  const setData = (newData) => {
    setFormData(newData);
  };

  return {
    formData,
    errors,
    touched,
    handleInputChange,
    handleBlur,
    validate,
    reset,
    setData,
    setErrors,
  };
};
