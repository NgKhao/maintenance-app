# Pagination Components

Hệ thống phân trang frontend đơn giản và reusable cho ứng dụng maintenance-app.

## Components

### 1. TablePagination

Component UI hiển thị phân trang với Material-UI v7.

**Props:**

- `totalItems` (number): Tổng số items
- `itemsPerPage` (number): Số items mỗi trang
- `currentPage` (number): Trang hiện tại
- `onPageChange` (function): Callback khi thay đổi trang
- `onItemsPerPageChange` (function): Callback khi thay đổi số items/trang
- `itemLabel` (string, optional): Label cho items (default: "mục")
- `showItemsPerPageSelector` (boolean, optional): Hiển thị selector số items/trang (default: true)
- `itemsPerPageOptions` (array, optional): Options cho số items/trang (default: [5,10,25,50,100])

### 2. usePagination Hook

Custom hook quản lý logic phân trang.

**Parameters:**

- `data` (array): Dữ liệu cần phân trang
- `initialItemsPerPage` (number, optional): Số items ban đầu mỗi trang (default: 10)

**Returns:**

- `currentItems` (array): Items của trang hiện tại
- `totalItems` (number): Tổng số items
- `totalPages` (number): Tổng số trang
- `currentPage` (number): Trang hiện tại
- `itemsPerPage` (number): Số items mỗi trang
- `hasNextPage` (boolean): Có trang tiếp theo
- `hasPrevPage` (boolean): Có trang trước
- `handlePageChange` (function): Thay đổi trang
- `handleItemsPerPageChange` (function): Thay đổi số items/trang
- `resetPagination` (function): Reset về trang đầu

## Cách sử dụng

### Cơ bản:

```jsx
import React, { useState } from 'react';
import { usePagination } from '../../hooks';
import { TablePagination } from '../common';

const MyListPage = () => {
  const [data, setData] = useState([
    /* your data */
  ]);

  // Use pagination hook
  const {
    currentItems,
    totalItems,
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination(data, 10);

  return (
    <div>
      {/* Render your table with currentItems */}
      <Table>
        <TableBody>
          {currentItems.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell>
                {(currentPage - 1) * itemsPerPage + index + 1}
              </TableCell>
              <TableCell>{item.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add pagination */}
      <TablePagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
};
```

### Với Search/Filter:

```jsx
const MyListPage = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data
  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Use pagination on filtered data
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
  useEffect(() => {
    resetPagination();
  }, [searchTerm, resetPagination]);

  return (
    <div>
      <TextField
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder='Tìm kiếm...'
      />

      {/* Table với currentItems */}
      {/* TablePagination component */}
    </div>
  );
};
```

## Features

- ✅ Phân trang frontend đơn giản
- ✅ Tương thích Material-UI v7
- ✅ Responsive design
- ✅ Customizable items per page
- ✅ Tích hợp với search/filter
- ✅ TypeScript ready
- ✅ Accessible
- ✅ Performance optimized với useMemo

## Integration vào các pages hiện có

Để tích hợp vào PackagesPage, SchedulesPage, DevicesPage, etc:

1. Import components:

```jsx
import { usePagination } from '../../../hooks';
import { TablePagination } from '../../../components/common';
```

2. Thay thế data mapping:

```jsx
// Trước
{filteredData.map((item) => (...))}

// Sau
{currentItems.map((item, index) => (
  <TableRow key={item.id}>
    <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
    {/* other cells */}
  </TableRow>
))}
```

3. Thêm TablePagination component cuối CardContent:

```jsx
<TablePagination
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  currentPage={currentPage}
  onPageChange={handlePageChange}
  onItemsPerPageChange={handleItemsPerPageChange}
  itemLabel='packages' // hoặc "lịch bảo trì", "thiết bị", etc
/>
```
