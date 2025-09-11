import React, { useState } from 'react';
import './Auth.css';
import { registerUser } from '../api/auth';

export default function Register({ onSwitch }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name || !email || !password || !confirm) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return false;
    }
    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp.');
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
      const res = await registerUser(name, email, password);

      if (res.success) {
        // Nếu đăng ký thành công, chuyển về login
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        onSwitch('login');
      } else if (res.error) {
        setError(res.error);
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
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
        Đăng ký
      </h2>

      {error && <div className="text-sm text-red-600 mb-3 animate-shake">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="animate-fadeIn delay-200">
          <label className="block text-sm text-gray-600 mb-1">Họ và tên</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field w-full"
            placeholder="Nguyen Van A"
            required
          />
        </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn delay-400">
          <div>
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

          <div>
            <label className="block text-sm text-gray-600 mb-1">Xác nhận</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="input-field w-full"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full btn-primary mt-2 transform transition-transform hover:scale-105 active:scale-95"
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : 'Đăng ký'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600 animate-fadeIn delay-500">
        Đã có tài khoản?{' '}
        <button
          type="button"
          onClick={() => onSwitch('login')}
          className="text-indigo-600 hover:underline"
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
}
