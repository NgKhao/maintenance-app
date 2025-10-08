import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { usePagination } from '../../hooks';
import { TablePagination } from '../common';

// Example component showing how to use pagination
const ExampleListWithPagination = ({ data, title = 'Danh sách' }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data based on search
  const filteredData = data.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Use pagination hook
  const {
    currentItems,
    totalItems,
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination,
  } = usePagination(filteredData, 10);

  // Reset pagination when search changes
  React.useEffect(() => {
    resetPagination();
  }, [searchTerm, resetPagination]);

  return (
    <Box>
      <Typography variant='h4' component='h1' gutterBottom>
        {title}
      </Typography>

      {/* Search Box */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <TextField
            fullWidth
            placeholder='Tìm kiếm...'
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
            }}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Tên</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align='center'>
                      <Typography variant='body2' color='text.secondary'>
                        {searchTerm
                          ? 'Không tìm thấy kết quả phù hợp'
                          : 'Không có dữ liệu'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Component */}
          <TablePagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemLabel='mục'
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default ExampleListWithPagination;
