import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';
import { createReview } from '../../../api/reviews';

export default function ReviewDialog({ open, onClose, schedule, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!rating || rating < 1 || rating > 5) {
      setError('Vui lòng chọn số sao từ 1 đến 5');
      return;
    }

    if (!comment.trim()) {
      setError('Vui lòng nhập nhận xét của bạn');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const reviewData = {
        schedule_id: schedule.id,
        technician_id: schedule.technician_id,
        user_id: user.id,
        rating: rating,
        comment: comment.trim(),
      };

      const result = await createReview(reviewData);

      // Backend trả về {success: true} hoặc {error: "..."}
      if (result.success) {
        onSuccess && onSuccess();
        handleClose();
      } else {
        setError(
          result.message || result.error || 'Có lỗi xảy ra khi gửi đánh giá'
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Có lỗi xảy ra khi gửi đánh giá'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(5);
    setComment('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' gap={1}>
          <StarIcon color='primary' />
          <Typography variant='h6'>Đánh giá kỹ thuật viên</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle2' gutterBottom>
            Kỹ thuật viên: <strong>{schedule?.technician_name}</strong>
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Thiết bị: {schedule?.device_name}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography component='legend' sx={{ mb: 1 }}>
            Đánh giá của bạn *
          </Typography>
          <Rating
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue);
              setError('');
            }}
            size='large'
            precision={1}
          />
        </Box>

        <TextField
          fullWidth
          multiline
          rows={4}
          label='Nhận xét *'
          placeholder='Chia sẻ trải nghiệm của bạn về dịch vụ bảo trì...'
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setError('');
          }}
          disabled={loading}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={loading}
          startIcon={loading ? <></> : <StarIcon />}
        >
          {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
