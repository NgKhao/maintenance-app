import React from 'react';
import {
  Box,
  Pagination,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const TablePagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
  itemLabel = 'mục',
  showItemsPerPageSelector = true,
  itemsPerPageOptions = [5, 10, 25, 50, 100],
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        mt: 3,
        px: 2,
        py: 1,
      }}
    >
      {/* Items info and per page selector */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant='body2' color='text.secondary'>
          Hiển thị {startItem}-{endItem} trong tổng số {totalItems} {itemLabel}
        </Typography>

        {showItemsPerPageSelector && (
          <FormControl size='small' sx={{ minWidth: 100 }}>
            <InputLabel>Hiển thị</InputLabel>
            <Select
              value={itemsPerPage}
              label='Hiển thị'
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            >
              {itemsPerPageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(event, page) => onPageChange(page)}
          color='primary'
          showFirstButton
          showLastButton
          siblingCount={1}
          boundaryCount={1}
        />
      )}
    </Box>
  );
};

export default TablePagination;
