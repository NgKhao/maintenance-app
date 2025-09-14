import React, { useState, useEffect, useCallback } from 'react';

function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const fetchSchedules = useCallback(async () => {
    try {
      const url =
        filter === 'all'
          ? 'http://localhost:8000/api/admin_schedules.php'
          : `http://localhost:8000/api/admin_schedules.php?status=${filter}`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setSchedules(data);
      } else {
        setMessage(data.error || 'Lỗi tải lịch');
      }
    } catch (error) {
      console.error('Fetch schedules error:', error);
      setMessage('Lỗi kết nối server');
    }
  }, [filter]);

  useEffect(() => {
    fetchSchedules();
    fetchTechnicians();
  }, [filter, fetchSchedules]);

  const fetchTechnicians = async () => {
    try {
      const response = await fetch(
        'http://localhost:8000/api/admin_schedules.php',
        {
          method: 'PUT',
        }
      );
      const data = await response.json();

      if (response.ok) {
        setTechnicians(data);
      }
    } catch (error) {
      console.error('Fetch technicians error:', error);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData(e.target);
    const assignData = {
      schedule_id: selectedSchedule.id,
      technician_id: formData.get('technician_id'),
      scheduled_date: formData.get('scheduled_date'),
    };

    try {
      const response = await fetch(
        'http://localhost:8000/api/admin_schedules.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(assignData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setShowAssignModal(false);
        setSelectedSchedule(null);
        fetchSchedules();
      } else {
        setMessage(data.error || 'Lỗi phân công');
      }
    } catch (error) {
      console.error('Assign error:', error);
      setMessage('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Chờ phân công',
      },
      assigned: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Đã phân công',
      },
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Đã xác nhận',
      },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã từ chối' },
      in_progress: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        label: 'Đang thực hiện',
      },
      completed: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Hoàn thành',
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Quản Lý Lịch Bảo Trì</h1>

        <div className='flex gap-4'>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-lg'
          >
            <option value='all'>Tất cả</option>
            <option value='pending'>Chờ phân công</option>
            <option value='assigned'>Đã phân công</option>
            <option value='confirmed'>Đã xác nhận</option>
            <option value='in_progress'>Đang thực hiện</option>
            <option value='completed'>Hoàn thành</option>
          </select>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded mb-4 ${
            message.includes('thành công')
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}
        >
          {message}
        </div>
      )}

      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Khách hàng
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Thiết bị
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Ngày mong muốn
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Kỹ thuật viên
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Trạng thái
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {schedules.map((schedule) => (
              <tr key={schedule.id}>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div>
                    <div className='text-sm font-medium text-gray-900'>
                      {schedule.customer_name}
                    </div>
                    <div className='text-sm text-gray-500'>
                      {schedule.customer_phone}
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div>
                    <div className='text-sm font-medium text-gray-900'>
                      {schedule.device_name}
                    </div>
                    <div className='text-sm text-gray-500'>
                      {schedule.serial_number}
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {new Date(schedule.scheduled_date).toLocaleDateString(
                    'vi-VN'
                  )}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {schedule.technician_name || 'Chưa phân công'}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  {getStatusBadge(schedule.status)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                  {(schedule.status === 'pending' ||
                    !schedule.technician_name) && (
                    <button
                      onClick={() => {
                        setSelectedSchedule(schedule);
                        setShowAssignModal(true);
                      }}
                      className='text-blue-600 hover:text-blue-900'
                    >
                      {schedule.technician_name ? 'Thay đổi KTV' : 'Phân công'}
                    </button>
                  )}
                  {schedule.customer_note && (
                    <button
                      className='text-gray-600 hover:text-gray-900 ml-3'
                      title={schedule.customer_note}
                    >
                      Xem ghi chú
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {schedules.length === 0 && (
          <div className='text-center py-8 text-gray-500'>
            Không có lịch bảo trì nào
          </div>
        )}
      </div>

      {/* Modal phân công kỹ thuật viên */}
      {showAssignModal && selectedSchedule && (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md'>
            <h3 className='text-lg font-semibold mb-4'>
              Phân công kỹ thuật viên
            </h3>

            <form onSubmit={handleAssign} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Khách hàng: {selectedSchedule.customer_name}
                </label>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Thiết bị: {selectedSchedule.device_name}
                </label>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Chọn kỹ thuật viên *
                </label>
                <select
                  name='technician_id'
                  className='w-full p-3 border border-gray-300 rounded-lg'
                  required
                >
                  <option value=''>-- Chọn kỹ thuật viên --</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name} - {tech.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Ngày hẹn *
                </label>
                <input
                  type='date'
                  name='scheduled_date'
                  defaultValue={selectedSchedule.scheduled_date}
                  min={new Date().toISOString().split('T')[0]}
                  className='w-full p-3 border border-gray-300 rounded-lg'
                  required
                />
              </div>

              <div className='flex gap-3'>
                <button
                  type='submit'
                  disabled={loading}
                  className='flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50'
                >
                  {loading ? 'Đang phân công...' : 'Phân công'}
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedSchedule(null);
                  }}
                  className='flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400'
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSchedulesPage;
