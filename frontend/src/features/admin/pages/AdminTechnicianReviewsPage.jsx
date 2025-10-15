import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Rating,
  Chip,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Star as StarIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { getTechnicianStats, getReviews } from '../../../api/reviews';
import { usePagination } from '../../../hooks';
import { TablePagination } from '../../../components/common';

export default function AdminTechnicianReviewsPage() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewDialog, setReviewDialog] = useState({
    open: false,
    technician: null,
    reviews: [],
    loading: false,
  });

  // Pagination for technicians list
  const {
    currentItems,
    totalItems,
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination(technicians, 10);

  useEffect(() => {
    fetchTechnicians();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await getTechnicianStats();

      // Backend trả về mảng trực tiếp, không có wrapper object
      if (Array.isArray(result)) {
        setTechnicians(result);
      } else if (result.success) {
        // Fallback cho trường hợp backend trả về {success, data}
        setTechnicians(result.data || []);
      } else {
        setError(
          result.message ||
            result.error ||
            'Lỗi khi tải danh sách kỹ thuật viên'
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Lỗi khi tải danh sách kỹ thuật viên'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewReviews = async (technician) => {
    setReviewDialog({
      open: true,
      technician,
      reviews: [],
      loading: true,
    });

    try {
      const result = await getReviews(technician.id);

      // Backend trả về mảng trực tiếp, không có wrapper object
      let reviews = [];
      if (Array.isArray(result)) {
        reviews = result;
      } else if (result.success) {
        // Fallback cho trường hợp backend trả về {success, data}
        reviews = result.data || [];
      }

      setReviewDialog((prev) => ({
        ...prev,
        reviews: reviews,
        loading: false,
      }));
    } catch (err) {
      console.error(err);
      setReviewDialog((prev) => ({
        ...prev,
        reviews: [],
        loading: false,
      }));
    }
  };

  const handleCloseReviewDialog = () => {
    setReviewDialog({
      open: false,
      technician: null,
      reviews: [],
      loading: false,
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='400px'
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Box display='flex' alignItems='center' gap={2}>
          <StarIcon color='primary' sx={{ fontSize: 40 }} />
          <Typography variant='h4' fontWeight='bold'>
            Quản lý đánh giá kỹ thuật viên
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Technicians List */}
      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Danh sách kỹ thuật viên ({totalItems})
          </Typography>

          {technicians.length === 0 ? (
            <Alert severity='info' sx={{ mt: 2 }}>
              Chưa có kỹ thuật viên nào
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>STT</TableCell>
                      <TableCell>Kỹ thuật viên</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell align='center'>Số lượng đánh giá</TableCell>
                      <TableCell align='center'>Đánh giá trung bình</TableCell>
                      <TableCell align='center'>Hành động</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentItems.map((technician, index) => (
                      <TableRow key={technician.id}>
                        <TableCell>
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </TableCell>
                        <TableCell>
                          <Box display='flex' alignItems='center' gap={1}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: 'primary.main',
                              }}
                            >
                              {technician.full_name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant='body2'>
                              {technician.full_name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' color='text.secondary'>
                            {technician.email}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Chip
                            label={technician.total_reviews || 0}
                            size='small'
                            color='primary'
                            variant='outlined'
                          />
                        </TableCell>
                        <TableCell align='center'>
                          {technician.total_reviews > 0 ? (
                            <Box
                              display='flex'
                              flexDirection='column'
                              alignItems='center'
                            >
                              <Rating
                                value={parseFloat(technician.average_rating)}
                                precision={0.1}
                                readOnly
                                size='small'
                              />
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                {parseFloat(technician.average_rating).toFixed(
                                  1
                                )}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant='body2' color='text.secondary'>
                              Chưa có đánh giá
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align='center'>
                          <IconButton
                            size='small'
                            onClick={() => handleViewReviews(technician)}
                            color='primary'
                            title='Xem đánh giá'
                            disabled={
                              !technician.total_reviews ||
                              technician.total_reviews === 0
                            }
                          >
                            <ViewIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalItems > 0 && (
                <TablePagination
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  itemLabel='kỹ thuật viên'
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Reviews Dialog */}
      <Dialog
        open={reviewDialog.open}
        onClose={handleCloseReviewDialog}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {reviewDialog.technician?.full_name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant='h6'>
                Đánh giá của {reviewDialog.technician?.full_name}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {reviewDialog.technician?.email}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {reviewDialog.loading ? (
            <Box display='flex' justifyContent='center' py={4}>
              <CircularProgress />
            </Box>
          ) : reviewDialog.reviews.length === 0 ? (
            <Alert severity='info'>Chưa có đánh giá nào</Alert>
          ) : (
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Khách hàng</TableCell>
                    <TableCell>Đánh giá</TableCell>
                    <TableCell>Nhận xét</TableCell>
                    <TableCell>Ngày</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reviewDialog.reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <Typography variant='body2'>
                          {review.user_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display='flex' alignItems='center' gap={1}>
                          <Rating
                            value={parseInt(review.rating)}
                            readOnly
                            size='small'
                          />
                          <Typography variant='caption'>
                            {review.rating}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' sx={{ maxWidth: 300 }}>
                          {review.comment}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='caption' color='text.secondary'>
                          {formatDate(review.created_at)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseReviewDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
