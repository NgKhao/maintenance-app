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
} from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';
import { getReviews } from '../../../api/reviews';
import { usePagination } from '../../../hooks';
import { TablePagination } from '../../../components/common';

export default function TechnicianReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const technicianId = user.id;

  // Pagination
  const {
    currentItems,
    totalItems,
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination(reviews, 10);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await getReviews(technicianId);

      // Backend trả về mảng trực tiếp, không có wrapper object
      if (Array.isArray(result)) {
        setReviews(result);
        calculateStats(result);
      } else if (result.success) {
        // Fallback cho trường hợp backend trả về {success, data}
        setReviews(result.data || []);
        calculateStats(result.data || []);
      } else {
        setError(result.message || result.error || 'Lỗi khi tải đánh giá');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Lỗi khi tải đánh giá'
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData) => {
    if (!reviewsData || reviewsData.length === 0) {
      setStats({
        total: 0,
        average: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });
      return;
    }

    const total = reviewsData.length;
    const sum = reviewsData.reduce(
      (acc, review) => acc + parseInt(review.rating),
      0
    );
    const average = (sum / total).toFixed(1);

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsData.forEach((review) => {
      const rating = parseInt(review.rating);
      breakdown[rating] = (breakdown[rating] || 0) + 1;
    });

    setStats({ total, average, breakdown });
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
            Đánh giá của tôi
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Thống kê đánh giá
          </Typography>

          <Box display='flex' gap={4} flexWrap='wrap' mt={2}>
            <Box textAlign='center'>
              <Typography variant='h3' fontWeight='bold' color='primary'>
                {stats.average}
              </Typography>
              <Rating
                value={parseFloat(stats.average)}
                precision={0.1}
                readOnly
                size='large'
              />
              <Typography variant='body2' color='text.secondary' mt={1}>
                Trung bình từ {stats.total} đánh giá
              </Typography>
            </Box>

            <Box flex={1}>
              <Typography variant='subtitle2' gutterBottom>
                Phân bổ đánh giá
              </Typography>
              {[5, 4, 3, 2, 1].map((star) => (
                <Box
                  key={star}
                  display='flex'
                  alignItems='center'
                  gap={1}
                  mb={0.5}
                >
                  <Typography variant='body2' sx={{ minWidth: 20 }}>
                    {star}
                  </Typography>
                  <StarIcon sx={{ fontSize: 16, color: '#FFD700' }} />
                  <Box
                    sx={{
                      flex: 1,
                      height: 8,
                      bgcolor: 'grey.200',
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${
                          stats.total > 0
                            ? (stats.breakdown[star] / stats.total) * 100
                            : 0
                        }%`,
                        height: '100%',
                        bgcolor: 'primary.main',
                      }}
                    />
                  </Box>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ minWidth: 30 }}
                  >
                    {stats.breakdown[star]}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Danh sách đánh giá ({totalItems})
          </Typography>

          {reviews.length === 0 ? (
            <Alert severity='info' sx={{ mt: 2 }}>
              Chưa có đánh giá nào
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>STT</TableCell>
                      <TableCell>Khách hàng</TableCell>
                      <TableCell>Đánh giá</TableCell>
                      <TableCell>Nhận xét</TableCell>
                      <TableCell>Ngày đánh giá</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentItems.map((review, index) => (
                      <TableRow key={review.id}>
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
                              {review.user_name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant='body2'>
                              {review.user_name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display='flex' alignItems='center' gap={1}>
                            <Rating
                              value={parseInt(review.rating)}
                              readOnly
                              size='small'
                            />
                            <Chip
                              label={review.rating}
                              size='small'
                              color={
                                review.rating >= 4
                                  ? 'success'
                                  : review.rating >= 3
                                  ? 'primary'
                                  : 'error'
                              }
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' sx={{ maxWidth: 400 }}>
                            {review.comment}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' color='text.secondary'>
                            {formatDate(review.created_at)}
                          </Typography>
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
                  itemLabel='đánh giá'
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
