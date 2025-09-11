import React, { useState, useEffect } from 'react';
import { registerService } from '../api/orders';
import axios from 'axios';

export default function ServiceRegistrationPage() {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: chọn gói, 2: xác nhận, 3: hoàn thành

  // Lấy thông tin user từ localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await axios.get(
        'http://localhost:8000/index.php?api=packages'
      );
      setPackages(res.data);
    } catch (err) {
      console.error('Lỗi khi tải gói bảo trì:', err);
    }
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setStep(2);
  };

  const handleConfirmRegistration = async () => {
    if (!selectedPackage || !user.id) {
      alert('Vui lòng đăng nhập và chọn gói bảo trì');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        user_id: user.id,
        package_id: selectedPackage.id,
        payment_status: 'pending',
        start_date: new Date().toISOString().split('T')[0], // ngày hiện tại
      };

      const result = await registerService(orderData);
      if (result.success) {
        setStep(3);
      } else {
        alert('Lỗi: ' + result.error);
      }
    } catch (err) {
      console.error('Lỗi đăng ký dịch vụ:', err);
      alert('Có lỗi xảy ra khi đăng ký dịch vụ');
    }
    setLoading(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (step === 3) {
    return (
      <div className='max-w-2xl mx-auto p-6'>
        <div className='bg-green-50 border border-green-200 rounded-lg p-6 text-center'>
          <div className='text-green-600 text-6xl mb-4'>✅</div>
          <h2 className='text-2xl font-bold text-green-800 mb-2'>
            Đăng ký dịch vụ thành công!
          </h2>
          <p className='text-green-700 mb-4'>
            Chúng tôi sẽ liên hệ với bạn trong vòng 24h để xác nhận lịch bảo
            trì.
          </p>
          <div className='bg-white rounded-lg p-4 mb-4'>
            <h3 className='font-semibold mb-2'>Thông tin gói đã đăng ký:</h3>
            <p>
              <strong>Gói:</strong> {selectedPackage?.name}
            </p>
            <p>
              <strong>Giá:</strong> {formatPrice(selectedPackage?.price)}
            </p>
            <p>
              <strong>Thời gian:</strong> {selectedPackage?.duration_months}{' '}
              tháng
            </p>
          </div>
          <button
            onClick={() => (window.location.href = '/contracts')}
            className='bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600'
          >
            Xem hợp đồng của tôi
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className='max-w-2xl mx-auto p-6'>
        <h1 className='text-2xl font-bold mb-6'>Xác nhận đăng ký dịch vụ</h1>

        <div className='bg-white border rounded-lg p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Thông tin gói đã chọn</h2>
          <div className='grid grid-cols-1 gap-4'>
            <div>
              <strong>Tên gói:</strong> {selectedPackage?.name}
            </div>
            <div>
              <strong>Mô tả:</strong> {selectedPackage?.description}
            </div>
            <div>
              <strong>Giá:</strong> {formatPrice(selectedPackage?.price)}
            </div>
            <div>
              <strong>Thời gian:</strong> {selectedPackage?.duration_months}{' '}
              tháng
            </div>
          </div>
        </div>

        <div className='bg-gray-50 border rounded-lg p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Thông tin khách hàng</h2>
          <div className='grid grid-cols-1 gap-4'>
            <div>
              <strong>Họ tên:</strong> {user?.name}
            </div>
            <div>
              <strong>Email:</strong> {user?.email}
            </div>
          </div>
        </div>

        <div className='flex gap-4'>
          <button
            onClick={() => setStep(1)}
            className='px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50'
          >
            Quay lại
          </button>
          <button
            onClick={handleConfirmRegistration}
            disabled={loading}
            className='px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50'
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận đăng ký'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <h1 className='text-3xl font-bold mb-6 text-center'>
        Đăng ký dịch vụ bảo trì
      </h1>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className='bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow'
          >
            <div className='text-center'>
              <h3 className='text-xl font-bold mb-2'>{pkg.name}</h3>
              <div className='text-3xl font-bold text-blue-600 mb-4'>
                {formatPrice(pkg.price)}
              </div>
              <p className='text-gray-600 mb-4'>{pkg.description}</p>
              <p className='text-sm text-gray-500 mb-6'>
                Thời gian: {pkg.duration_months} tháng
              </p>
              <button
                onClick={() => handleSelectPackage(pkg)}
                className='w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors'
              >
                Chọn gói này
              </button>
            </div>
          </div>
        ))}
      </div>

      {packages.length === 0 && (
        <div className='text-center py-8'>
          <p className='text-gray-500'>Đang tải danh sách gói bảo trì...</p>
        </div>
      )}
    </div>
  );
}
