import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import DashboardPage from './DashboardPage';

// Import pages from features
import {
  UsersPage,
  PackagesPage,
  ContractRequestsPage,
  AdminSchedulesPage,
} from '../../features/admin';

import { TechnicianSchedulesPage } from '../../features/technician';

import {
  ServiceRegistrationPage,
  ContractsPage,
  BookSchedulePage,
  TechniciansPage,
} from '../../features/user';

import {
  DevicesPage,
  OrdersPage,
  SchedulesPage,
  RemindersPage,
} from '../../features/shared';

import { useAuth } from '../../contexts';

const AppLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile-first: closed by default
  const role = user?.role || 'user';

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
      />

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        role={role}
      />

      <Box
        component='main'
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          mt: { xs: 7, sm: 8 }, // Account for AppBar height
        }}
      >
        <Routes>
          {/* Admin routes */}
          {role === 'admin' && (
            <>
              <Route path='/users' element={<UsersPage />} />
              <Route path='/packages' element={<PackagesPage />} />
              <Route
                path='/contract-requests'
                element={<ContractRequestsPage user={user} />}
              />
              <Route path='/admin-schedules' element={<AdminSchedulesPage />} />
            </>
          )}

          {/* Technician routes */}
          {role === 'technician' && (
            <>
              <Route
                path='/technician-schedules'
                element={<TechnicianSchedulesPage />}
              />
            </>
          )}

          {/* User routes */}
          {role === 'user' && (
            <>
              <Route
                path='/register-service'
                element={<ServiceRegistrationPage />}
              />
              <Route path='/contracts' element={<ContractsPage />} />
              <Route path='/book-schedule' element={<BookSchedulePage />} />
              <Route path='/technicians' element={<TechniciansPage />} />
            </>
          )}

          {/* Shared routes */}
          <Route path='/devices' element={<DevicesPage />} />
          <Route path='/orders' element={<OrdersPage />} />
          <Route path='/schedules' element={<SchedulesPage />} />
          <Route path='/reminders' element={<RemindersPage />} />

          <Route path='/dashboard' element={<DashboardPage role={role} />} />
          <Route path='*' element={<Navigate to='/dashboard' />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default AppLayout;
