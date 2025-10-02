import { useState } from 'react';
import { createPackage, updatePackage, deletePackage } from '../api/packages';
import { usePackages } from './usePackages';

// Custom hook cho admin quản lý packages với CRUD operations
export const usePackagesManagement = () => {
  const { packages, loading, error, refetch } = usePackages();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleCreate = async (packageData) => {
    setSubmitLoading(true);
    setSubmitError('');
    try {
      await createPackage(packageData);
      await refetch(); // Reload data sau khi tạo
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Lỗi khi tạo gói bảo trì';
      setSubmitError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdate = async (packageId, packageData) => {
    setSubmitLoading(true);
    setSubmitError('');
    try {
      await updatePackage(packageId, packageData);
      await refetch(); // Reload data sau khi cập nhật
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Lỗi khi cập nhật gói bảo trì';
      setSubmitError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (packageId) => {
    setSubmitLoading(true);
    setSubmitError('');
    try {
      await deletePackage(packageId);
      await refetch(); // Reload data sau khi xóa
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Lỗi khi xóa gói bảo trì';
      setSubmitError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSubmitLoading(false);
    }
  };

  return {
    packages,
    loading,
    error,
    submitLoading,
    submitError,
    refetch,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
};
