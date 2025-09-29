import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Grid,
  InputAdornment,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Assignment as RequestIcon,
} from '@mui/icons-material';
import {
  getContractRequests,
  processContractRequest,
} from '../../../api/contract-requests';
import { formatDate, formatDateTime } from '../../../utils/formatters';

export default function ContractRequestsPage({ user }) {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processDialog, setProcessDialog] = useState({
    open: false,
    request: null,
  });
  const [processData, setProcessData] = useState({
    status: '',
    admin_note: '',
  });
  const [processing, setProcessing] = useState(false);

  const role = user?.role || 'user';
  const isAdmin = role === 'admin';

  // Filter requests based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRequests(requests);
    } else {
      const filtered = requests.filter(
        (request) =>
          request.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.package_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          getRequestTypeDisplay(request.request_type)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.note?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRequests(filtered);
    }
  }, [requests, searchTerm]);

  // Fetch contract requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const data = await getContractRequests({ admin_view: isAdmin });
        setRequests(data);
        setFilteredRequests(data);
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError('Không thể tải danh sách yêu cầu');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [isAdmin]);

  // Handle process request (approve/reject)
  const handleProcessRequest = async () => {
    if (!processDialog.request || !processData.status) return;

    try {
      setProcessing(true);
      await processContractRequest({
        request_id: processDialog.request.id,
        status: processData.status,
        admin_id: user?.id,
        admin_note: processData.admin_note,
      });

      // Refresh data
      const updatedData = await getContractRequests({ admin_view: isAdmin });
      setRequests(updatedData);
      setFilteredRequests(updatedData);

      // Close dialog
      setProcessDialog({ open: false, request: null });
      setProcessData({ status: '', admin_note: '' });
    } catch (err) {
      console.error('Error processing request:', err);
      setError('Không thể xử lý yêu cầu');
    } finally {
      setProcessing(false);
    }
  };

  // Get status chip color
  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip label='Đang chờ' color='warning' size='small' />;
      case 'approved':
        return <Chip label='Đã duyệt' color='success' size='small' />;
      case 'rejected':
        return <Chip label='Từ chối' color='error' size='small' />;
      default:
        return <Chip label={status} size='small' />;
    }
  };

  // Get request type display
  const getRequestTypeDisplay = (type) => {
    switch (type) {
      case 'extend':
        return 'Gia hạn';
      case 'terminate':
        return 'Kết thúc';
      default:
        return type;
    }
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
      {/* Header */}
      <Box
        mb={4}
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        flexWrap='wrap'
        gap={2}
      >
        <Box>
          <Typography variant='h4' component='h1' gutterBottom>
            <RequestIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Quản lý yêu cầu hợp đồng
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Quản lý yêu cầu gia hạn và hủy hợp đồng từ khách hàng
          </Typography>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search and Stats */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder='Tìm kiếm theo khách hàng, gói dịch vụ, loại yêu cầu, ghi chú...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant='outlined'
                size='small'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon color='action' />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position='end'>
                      <IconButton
                        onClick={() => setSearchTerm('')}
                        size='small'
                        edge='end'
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ fontWeight: 'bold' }}
                >
                  {filteredRequests.length} / {requests.length}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  yêu cầu
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Loại yêu cầu</TableCell>
                  <TableCell>Gói hiện tại</TableCell>
                  <TableCell>Chi tiết</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  {isAdmin && <TableCell>Hành động</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 8 : 7} align='center'>
                      <Typography variant='body2' color='text.secondary' py={4}>
                        {searchTerm
                          ? 'Không tìm thấy yêu cầu nào phù hợp'
                          : 'Không có yêu cầu nào'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.id}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant='body2' fontWeight='bold'>
                            {request.user_name}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {request.user_email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getRequestTypeDisplay(request.request_type)}
                          color={
                            request.request_type === 'extend'
                              ? 'primary'
                              : 'secondary'
                          }
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant='body2'>
                            {request.package_name}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {request.start_date} - {request.end_date}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          {request.request_type === 'extend' && (
                            <Typography variant='caption'>
                              Gia hạn: {request.extend_months} tháng
                            </Typography>
                          )}
                          {request.request_type === 'terminate' &&
                            request.requested_end_date && (
                              <Typography variant='caption'>
                                Kết thúc:{' '}
                                {formatDate(request.requested_end_date)}
                              </Typography>
                            )}
                          {request.note && (
                            <Typography variant='body2' sx={{ mt: 0.5 }}>
                              {request.note}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant='caption'>
                          {formatDateTime(request.request_date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(request.status)}
                        {request.admin_name && (
                          <Typography
                            variant='caption'
                            display='block'
                            sx={{ mt: 0.5 }}
                          >
                            Bởi: {request.admin_name}
                          </Typography>
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          {request.status === 'pending' ? (
                            <Box>
                              <Tooltip title='Duyệt'>
                                <IconButton
                                  color='success'
                                  onClick={() => {
                                    setProcessDialog({ open: true, request });
                                    setProcessData({
                                      status: 'approved',
                                      admin_note: '',
                                    });
                                  }}
                                >
                                  <ApproveIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title='Từ chối'>
                                <IconButton
                                  color='error'
                                  onClick={() => {
                                    setProcessDialog({ open: true, request });
                                    setProcessData({
                                      status: 'rejected',
                                      admin_note: '',
                                    });
                                  }}
                                >
                                  <RejectIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : (
                            <Tooltip title='Đã xử lý'>
                              <IconButton disabled>
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Process Request Dialog */}
      <Dialog
        open={processDialog.open}
        onClose={() => setProcessDialog({ open: false, request: null })}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          {processData.status === 'approved'
            ? 'Duyệt yêu cầu'
            : 'Từ chối yêu cầu'}
        </DialogTitle>
        <DialogContent>
          {processDialog.request && (
            <Box sx={{ mt: 2 }}>
              <Typography variant='body2' gutterBottom>
                <strong>Khách hàng:</strong> {processDialog.request.user_name}
              </Typography>
              <Typography variant='body2' gutterBottom>
                <strong>Loại yêu cầu:</strong>{' '}
                {getRequestTypeDisplay(processDialog.request.request_type)}
              </Typography>
              <Typography variant='body2' gutterBottom sx={{ mb: 2 }}>
                <strong>Ghi chú từ khách hàng:</strong>{' '}
                {processDialog.request.note || 'Không có'}
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={processData.status}
                  label='Trạng thái'
                  onChange={(e) =>
                    setProcessData({ ...processData, status: e.target.value })
                  }
                >
                  <MenuItem value='approved'>Duyệt</MenuItem>
                  <MenuItem value='rejected'>Từ chối</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={3}
                label='Ghi chú của admin'
                value={processData.admin_note}
                onChange={(e) =>
                  setProcessData({ ...processData, admin_note: e.target.value })
                }
                placeholder='Nhập lý do hoặc ghi chú...'
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setProcessDialog({ open: false, request: null })}
            disabled={processing}
          >
            Hủy
          </Button>
          <Button
            onClick={handleProcessRequest}
            variant='contained'
            disabled={processing || !processData.status}
          >
            {processing ? <CircularProgress size={20} /> : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
