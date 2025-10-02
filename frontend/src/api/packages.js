import axios from 'axios';

const API_URL = 'http://localhost:8000/index.php?api=packages';

// Lấy danh sách gói bảo trì
export const getPackages = async () => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (error) {
    console.error('Error fetching packages:', error);
    throw new Error('Không thể tải danh sách gói bảo trì');
  }
};

// Lấy chi tiết một gói bảo trì
export const getPackageById = async (packageId) => {
  try {
    const res = await axios.get(`${API_URL}&id=${packageId}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching package details:', error);
    throw new Error('Không thể tải thông tin gói bảo trì');
  }
};

// Tạo gói bảo trì mới (admin only)
export const createPackage = async (packageData) => {
  try {
    const res = await axios.post(API_URL, packageData, {
      headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
  } catch (error) {
    console.error('Error creating package:', error);
    throw new Error('Không thể tạo gói bảo trì');
  }
};

// Cập nhật gói bảo trì (admin only)
export const updatePackage = async (packageId, packageData) => {
  try {
    const res = await axios.put(
      API_URL,
      {
        id: packageId,
        ...packageData,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return res.data;
  } catch (error) {
    console.error('Error updating package:', error);
    throw new Error('Không thể cập nhật gói bảo trì');
  }
};

// Xóa gói bảo trì (admin only)
export const deletePackage = async (packageId) => {
  try {
    const res = await axios.delete(`${API_URL}&id=${packageId}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting package:', error);
    throw new Error('Không thể xóa gói bảo trì');
  }
};
