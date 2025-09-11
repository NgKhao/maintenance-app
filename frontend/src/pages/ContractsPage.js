import React, { useState, useEffect } from 'react';
import { getUserContracts, updatePaymentStatus } from '../api/orders';

export default function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy thông tin user từ localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const data = await getUserContracts(user.id);
      setContracts(data);
    } catch (err) {
      console.error('Lỗi khi tải hợp đồng:', err);
      alert('Có lỗi xảy ra khi tải danh sách hợp đồng');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user.id) {
      fetchContracts();
    }
  }, [user.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePayment = async (orderId) => {
    try {
      const result = await updatePaymentStatus(orderId, 'paid');
      if (result.success) {
        alert('Cập nhật trạng thái thanh toán thành công!');
        fetchContracts(); // Refresh danh sách
      } else {
        alert('Lỗi: ' + result.error);
      }
    } catch (err) {
      console.error('Lỗi cập nhật thanh toán:', err);
      alert('Có lỗi xảy ra khi cập nhật thanh toán');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800',
        text: 'Chờ thanh toán',
      },
      paid: { color: 'bg-green-100 text-green-800', text: 'Đã thanh toán' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Thanh toán thất bại' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  if (!user.id) {
    return (
      <div className='max-w-4xl mx-auto p-6 text-center'>
        <h1 className='text-2xl font-bold mb-4'>Vui lòng đăng nhập</h1>
        <p>Bạn cần đăng nhập để xem danh sách hợp đồng.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='max-w-4xl mx-auto p-6 text-center'>
        <p>Đang tải danh sách hợp đồng...</p>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Hợp đồng của tôi</h1>
        <button
          onClick={() => (window.location.href = '/register-service')}
          className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'
        >
          Đăng ký thêm dịch vụ
        </button>
      </div>

      {contracts.length === 0 ? (
        <div className='text-center py-12'>
          <div className='text-gray-400 text-6xl mb-4'>📋</div>
          <h2 className='text-xl font-semibold text-gray-600 mb-2'>
            Chưa có hợp đồng nào
          </h2>
          <p className='text-gray-500 mb-6'>
            Bạn chưa đăng ký dịch vụ bảo trì nào. Hãy đăng ký ngay để bảo vệ
            thiết bị của bạn!
          </p>
          <button
            onClick={() => (window.location.href = '/register-service')}
            className='bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600'
          >
            Đăng ký dịch vụ ngay
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-6'>
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className='bg-white border rounded-lg p-6 shadow-sm'
            >
              <div className='flex justify-between items-start mb-4'>
                <div>
                  <h3 className='text-xl font-semibold mb-2'>
                    Hợp đồng #{contract.id}
                  </h3>
                  <p className='text-gray-600'>
                    Đăng ký: {formatDate(contract.created_at)}
                  </p>
                </div>
                <div className='text-right'>
                  {getStatusBadge(contract.payment_status)}
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
                <div>
                  <h4 className='font-medium text-gray-700'>Gói dịch vụ</h4>
                  <p className='text-lg font-semibold'>
                    {contract.package_name}
                  </p>
                  <p className='text-sm text-gray-600'>
                    {contract.package_description}
                  </p>
                </div>

                <div>
                  <h4 className='font-medium text-gray-700'>
                    Giá trị hợp đồng
                  </h4>
                  <p className='text-lg font-semibold text-blue-600'>
                    {formatPrice(contract.package_price)}
                  </p>
                  <p className='text-sm text-gray-600'>
                    {contract.duration_months} tháng
                  </p>
                </div>

                <div>
                  <h4 className='font-medium text-gray-700'>Thời gian</h4>
                  <p className='text-sm'>
                    Từ: {formatDate(contract.start_date)}
                  </p>
                  <p className='text-sm'>
                    Đến: {formatDate(contract.end_date)}
                  </p>
                </div>

                <div>
                  <h4 className='font-medium text-gray-700'>Trạng thái</h4>
                  <p className='text-sm mb-2'>
                    {contract.payment_status === 'paid'
                      ? 'Đang hoạt động'
                      : 'Chờ kích hoạt'}
                  </p>
                  {contract.payment_status === 'pending' && (
                    <button
                      onClick={() => handlePayment(contract.id)}
                      className='bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600'
                    >
                      Thanh toán ngay
                    </button>
                  )}
                </div>
              </div>

              {contract.payment_status === 'paid' && (
                <div className='border-t pt-4 mt-4'>
                  <div className='flex justify-between items-center'>
                    <div className='text-sm text-gray-600'>
                      ✅ Hợp đồng đang hoạt động - Dịch vụ bảo trì sẽ được thực
                      hiện theo lịch
                    </div>
                    <button
                      onClick={() => (window.location.href = '/schedules')}
                      className='text-blue-500 hover:text-blue-700 text-sm font-medium'
                    >
                      Xem lịch bảo trì →
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
