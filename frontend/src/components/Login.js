import React, { useState } from 'react';
import './Auth.css';
import { loginUser } from '../api/auth';

export default function Login({ onSwitch, onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email || !password) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  setLoading(true);
  try {
    const res = await loginUser(email, password);

    if (res.success && res.user) {
      const user = res.user;
      
      // Lưu role và email vào localStorage
      localStorage.setItem('role', user.role);
      localStorage.setItem('email', user.email);
      localStorage.setItem('user_id', user.id);
      if (onAuthSuccess) onAuthSuccess(user); // Truyền user lên App
    } else if (res.error) {
      setError(res.error);
    } else {
      setError('Đăng nhập thất bại. Vui lòng thử lại.');
    }
  } catch (err) {
    console.error(err);
    if (err.response?.data?.error) {
      setError(err.response.data.error);
    } else {
      setError('Lỗi server. Thử lại sau.');
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="auth-outer p-6 sm:p-8 w-full max-w-md bg-white rounded-lg shadow-md animate-fadeInUp">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center animate-fadeIn delay-100">
        Đăng nhập
      </h2>

      {error && <div className="text-sm text-red-600 mb-3 animate-shake">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="animate-fadeIn delay-300">
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field w-full"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="animate-fadeIn delay-400">
          <label className="block text-sm text-gray-600 mb-1">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field w-full"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full btn-primary mt-2 transform transition-transform hover:scale-105 active:scale-95"
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600 animate-fadeIn delay-500">
        Chưa có tài khoản?{' '}
        <button
          type="button"
          onClick={() => onSwitch('register')}
          className="text-indigo-600 hover:underline"
        >
          Đăng ký
        </button>
      </div>
    </div>
  );
}
