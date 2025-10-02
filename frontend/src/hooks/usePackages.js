import { useState, useEffect } from 'react';
import { getPackages } from '../api/packages';

// Custom hook để quản lý packages data
export const usePackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPackages = async () => {
    setLoading(true);
    setError('');
    try {
      const packagesData = await getPackages();
      setPackages(packagesData);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách gói bảo trì');
      console.error('Error fetching packages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const refetch = () => {
    fetchPackages();
  };

  return {
    packages,
    loading,
    error,
    refetch,
  };
};
