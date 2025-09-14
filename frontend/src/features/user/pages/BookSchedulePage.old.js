import React, { useState, useEffect, useCallback } from 'react';

function BookSchedulePage() {
    const [devices, setDevices] = useState([]);
    const [formData, setFormData] = useState({
        device_id: '',
        preferred_date: '',
        note: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchDevices = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/book_schedule.php?user_id=${user.id}`);
            const data = await response.json();
            
            if (response.ok) {
                setDevices(data);
            } else {
                setMessage(data.error || 'Lỗi tải thiết bị');
            }
        } catch (error) {
            console.error('Fetch devices error:', error);
            setMessage('Lỗi kết nối server');
        }
    }, [user.id]);

    useEffect(() => {
        if (user.id) {
            fetchDevices();
        }
    }, [user.id, fetchDevices]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('http://localhost:8000/api/book_schedule.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    user_id: user.id
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setFormData({
                    device_id: '',
                    preferred_date: '',
                    note: ''
                });
            } else {
                setMessage(data.error || 'Lỗi đặt lịch');
            }
        } catch (error) {
            console.error('Book schedule error:', error);
            setMessage('Lỗi kết nối server');
        } finally {
            setLoading(false);
        }
    };

    const minDate = new Date().toISOString().split('T')[0];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Đặt Lịch Bảo Trì</h1>

            {message && (
                <div className={`p-4 rounded mb-4 ${
                    message.includes('thành công') 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-red-100 text-red-700 border border-red-300'
                }`}>
                    {message}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chọn thiết bị cần bảo trì *
                        </label>
                        <select
                            value={formData.device_id}
                            onChange={(e) => setFormData({...formData, device_id: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">-- Chọn thiết bị --</option>
                            {devices.map(device => (
                                <option key={device.id} value={device.id}>
                                    {device.name} - {device.serial_number} ({device.status})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày mong muốn *
                        </label>
                        <input
                            type="date"
                            min={minDate}
                            value={formData.preferred_date}
                            onChange={(e) => setFormData({...formData, preferred_date: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Chúng tôi sẽ cố gắng sắp xếp theo ngày bạn mong muốn
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ghi chú thêm
                        </label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => setFormData({...formData, note: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            placeholder="Mô tả tình trạng thiết bị, thời gian mong muốn, yêu cầu đặc biệt..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Đang đặt lịch...' : 'Đặt Lịch Bảo Trì'}
                    </button>
                </form>
            </div>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Lưu ý:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Bạn cần có gói bảo trì còn hiệu lực để đặt lịch</li>
                    <li>• Chúng tôi sẽ phân công kỹ thuật viên và xác nhận lại với bạn</li>
                    <li>• Thời gian thực hiện có thể điều chỉnh tùy lịch kỹ thuật viên</li>
                    <li>• Bạn có thể theo dõi tiến độ trong mục "Lịch Bảo Trì"</li>
                </ul>
            </div>
        </div>
    );
}

export default BookSchedulePage;
