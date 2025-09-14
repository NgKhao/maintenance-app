import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import {
  HiUsers,
  HiCube,
  HiDeviceTablet,
  HiClipboardList,
  HiClock,
  HiBell,
  HiDocumentText,
  HiLogout,
  HiMenu,
  HiPlus,
  HiEye,
  HiHome,
  HiCog,
} from 'react-icons/hi';
import Login from './components/Login';
import Register from './components/Register';
import UsersPage from './pages/UsersPage';
import PackagesPage from './pages/PackagesPage';
import DevicesPage from './pages/DevicesPage';
import OrdersPage from './pages/OrdersPage';
import SchedulesPage from './pages/SchedulesPage';
import RemindersPage from './pages/RemindersPage';
import ContractRequestsPage from './pages/ContractRequestsPage';
import ServiceRegistrationPage from './pages/ServiceRegistrationPage';
import ContractsPage from './pages/ContractsPage';
import './App.css';
import { NavLink } from 'react-router-dom';
import TechnicianSchedulesPage from './pages/TechnicianSchedulesPage';
import BookSchedulePage from './pages/BookSchedulePage';
import AdminSchedulesPage from './pages/AdminSchedulesPage';

function App() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check localStorage khi App load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setAuthed(true);
    }
  }, []);

  const handleLogout = () => {
    setAuthed(false);
    setUser(null);
    localStorage.removeItem('user');
  };

  const handleAuthSuccess = (u) => {
    setUser(u);
    setAuthed(true);
    localStorage.setItem('user', JSON.stringify(u));
  };

  return (
    <Router>
      {!authed ? (
        <AuthRoutes onAuthSuccess={handleAuthSuccess} />
      ) : (
        <AppLayout
          user={user}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onLogout={handleLogout}
        />
      )}
    </Router>
  );
}

// ------------------- Auth Routes -------------------
const AuthRoutes = ({ onAuthSuccess }) => (
  <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
    <div className='max-w-md w-full'>
      <div className='text-center mb-8'>
        <div className='flex justify-center mb-4'>
          <div className='w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center'>
            <HiCog className='w-8 h-8 text-white' />
          </div>
        </div>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Maintenance Pro
        </h1>
        <p className='text-gray-600'>
          Hệ thống quản lý bảo trì thiết bị gia dụng
        </p>
      </div>

      <div className='bg-white rounded-xl shadow-xl p-8'>
        <Routes>
          <Route
            path='/login'
            element={
              <Login
                onAuthSuccess={onAuthSuccess}
                onSwitch={(v) => (window.location.href = `/register`)}
              />
            }
          />
          <Route
            path='/register'
            element={
              <Register onSwitch={(v) => (window.location.href = `/login`)} />
            }
          />
          <Route path='*' element={<Navigate to='/login' />} />
        </Routes>
      </div>
    </div>
  </div>
);

// ------------------- App Layout -------------------
const AppLayout = ({ user, sidebarOpen, setSidebarOpen, onLogout }) => {
  const role = user?.role || 'user';

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200 px-4 lg:px-6'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex items-center space-x-4'>
            <button
              className='lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500'
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <HiMenu className='h-6 w-6' />
            </button>

            <div className='flex items-center space-x-3'>
              <div className='w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center'>
                <HiCog className='w-5 h-5 text-white' />
              </div>
              <div>
                <h1 className='text-xl font-semibold text-gray-900'>
                  Maintenance Pro
                </h1>
              </div>
            </div>
          </div>

          {/* User dropdown */}
          <div className='relative group'>
            <button className='flex items-center space-x-3 p-2 rounded-lg text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500'>
              <div className='w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center'>
                <span className='text-sm font-medium text-indigo-700'>
                  {user?.name?.charAt(0).toUpperCase() ||
                    role.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className='hidden md:block text-left'>
                <p className='text-sm font-medium text-gray-900'>
                  {user?.name || 'User'}
                </p>
                <p className='text-xs text-gray-500 capitalize'>{role}</p>
              </div>
            </button>

            <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50'>
              <div className='py-1'>
                <button
                  onClick={onLogout}
                  className='flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                >
                  <HiLogout className='mr-3 h-4 w-4' />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className='flex'>
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
        >
          <div className='flex flex-col h-full pt-16 lg:pt-0'>
            {/* Mobile close button */}
            <div className='flex items-center justify-between p-4 lg:hidden'>
              <span className='text-lg font-semibold text-gray-900'>Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className='p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              >
                <HiMenu className='h-6 w-6' />
              </button>
            </div>

            <nav className='flex-1 px-4 pb-4 space-y-1'>
              {role === 'admin' ? (
                <>
                  <SidebarButton
                    label='Tổng quan'
                    icon={<HiHome />}
                    path='/dashboard'
                  />
                  <SidebarButton
                    label='Người dùng'
                    icon={<HiUsers />}
                    path='/users'
                  />
                  <SidebarButton
                    label='Gói dịch vụ'
                    icon={<HiCube />}
                    path='/packages'
                  />
                  <SidebarButton
                    label='Thiết bị'
                    icon={<HiDeviceTablet />}
                    path='/devices'
                  />
                  {/* <SidebarButton
                    label='Đơn hàng'
                    icon={<HiClipboardList />}
                    path='/orders'
                  /> */}
                  <SidebarButton
                    label='Lịch bảo trì'
                    icon={<HiClock />}
                    path='/schedules'
                  />
                  {/* <SidebarButton
                    label='Nhắc nhở'
                    icon={<HiBell />}
                    path='/reminders'
                  /> */}
                  {/* <SidebarButton
                    label='Yêu cầu hợp đồng'
                    icon={<HiDocumentText />}
                    path='/contract-requests'
                  /> */}
                  <SidebarButton
                    label='Quản lý lịch'
                    icon={<HiClock />}
                    path='/admin-schedules'
                  />
                </>
              ) : role === 'technician' ? (
                <>
                  <SidebarButton
                    label='Tổng quan'
                    icon={<HiHome />}
                    path='/dashboard'
                  />
                  <SidebarButton
                    label='Cập nhật thiết bị'
                    icon={<HiDeviceTablet />}
                    path='/devices'
                  />
                  <SidebarButton
                    label='Lịch bảo trì'
                    icon={<HiClock />}
                    path='/technician-schedules'
                  />
                </>
              ) : (
                <>
                  <SidebarButton
                    label='Tổng quan'
                    icon={<HiHome />}
                    path='/dashboard'
                  />
                  <SidebarButton
                    label='Thiết bị của tôi'
                    icon={<HiDeviceTablet />}
                    path='/devices'
                  />
                  <SidebarButton
                    label='Đăng ký dịch vụ'
                    icon={<HiPlus />}
                    path='/register-service'
                  />
                  <SidebarButton
                    label='Hợp đồng'
                    icon={<HiEye />}
                    path='/contracts'
                  />
                  <SidebarButton
                    label='Lịch bảo trì'
                    icon={<HiClock />}
                    path='/schedules'
                  />
                  <SidebarButton
                    label='Đặt lịch bảo trì'
                    icon={<HiBell />}
                    path='/book-schedule'
                  />
                  {/* <SidebarButton
                    label='Nhắc nhở'
                    icon={<HiBell />}
                    path='/reminders'
                  /> */}
                </>
              )}
            </nav>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className='fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden'
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main content */}
        <main className='flex-1 lg:ml-0'>
          <div className='p-4 lg:p-8'>
            <Routes>
              {role === 'admin' && (
                <>
                  <Route path='/users' element={<UsersPage />} />
                  <Route path='/packages' element={<PackagesPage />} />
                  <Route
                    path='/contract-requests'
                    element={<ContractRequestsPage user={user} />}
                  />
                  <Route
                    path='/admin-schedules'
                    element={<AdminSchedulesPage />}
                  />
                </>
              )}
              {role === 'technician' && (
                <>
                  <Route path='/devices' element={<DevicesPage />} />
                  <Route
                    path='/technician-schedules'
                    element={<TechnicianSchedulesPage />}
                  />
                </>
              )}

              {/* Routes chung cho tất cả user */}
              <Route path='/devices' element={<DevicesPage />} />
              <Route path='/orders' element={<OrdersPage />} />
              <Route path='/schedules' element={<SchedulesPage />} />
              <Route path='/reminders' element={<RemindersPage />} />

              {/* Routes cho user thường */}
              {role === 'user' && (
                <>
                  <Route
                    path='/register-service'
                    element={<ServiceRegistrationPage />}
                  />
                  <Route path='/contracts' element={<ContractsPage />} />
                  <Route path='/book-schedule' element={<BookSchedulePage />} />
                </>
              )}

              <Route
                path='/dashboard'
                element={<DashboardPage role={role} />}
              />
              <Route path='*' element={<Navigate to='/dashboard' />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

// Sidebar button component
const SidebarButton = ({ label, icon, path }) => (
  <NavLink
    to={path}
    className={({ isActive }) => `
      flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150
      ${
        isActive
          ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-500'
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
      }
    `}
  >
    <span className='mr-3 flex-shrink-0 h-5 w-5'>{icon}</span>
    <span>{label}</span>
  </NavLink>
);

// Simple Dashboard Component
const DashboardPage = ({ role }) => (
  <div className='space-y-6'>
    <div>
      <h1 className='text-2xl font-bold text-gray-900'>Tổng quan</h1>
      <p className='text-gray-600'>
        Chào mừng đến với hệ thống quản lý bảo trì thiết bị
      </p>
    </div>

    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      <div className='bg-white p-6 rounded-lg shadow border'>
        <div className='flex items-center'>
          <div className='flex-shrink-0'>
            <HiDeviceTablet className='h-8 w-8 text-blue-600' />
          </div>
          <div className='ml-4'>
            <p className='text-sm font-medium text-gray-600'>Thiết bị</p>
            <p className='text-2xl font-semibold text-gray-900'>24</p>
          </div>
        </div>
      </div>

      <div className='bg-white p-6 rounded-lg shadow border'>
        <div className='flex items-center'>
          <div className='flex-shrink-0'>
            <HiClock className='h-8 w-8 text-green-600' />
          </div>
          <div className='ml-4'>
            <p className='text-sm font-medium text-gray-600'>Lịch bảo trì</p>
            <p className='text-2xl font-semibold text-gray-900'>8</p>
          </div>
        </div>
      </div>

      <div className='bg-white p-6 rounded-lg shadow border'>
        <div className='flex items-center'>
          <div className='flex-shrink-0'>
            <HiBell className='h-8 w-8 text-yellow-600' />
          </div>
          <div className='ml-4'>
            <p className='text-sm font-medium text-gray-600'>Nhắc nhở</p>
            <p className='text-2xl font-semibold text-gray-900'>3</p>
          </div>
        </div>
      </div>

      {role === 'admin' && (
        <div className='bg-white p-6 rounded-lg shadow border'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <HiUsers className='h-8 w-8 text-purple-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Người dùng</p>
              <p className='text-2xl font-semibold text-gray-900'>156</p>
            </div>
          </div>
        </div>
      )}
    </div>

    <div className='bg-white rounded-lg shadow border p-6'>
      <h2 className='text-lg font-medium text-gray-900 mb-4'>
        Hoạt động gần đây
      </h2>
      <div className='space-y-3'>
        <div className='flex items-center justify-between py-2'>
          <div className='flex items-center'>
            <div className='w-2 h-2 bg-green-500 rounded-full mr-3'></div>
            <span className='text-sm text-gray-900'>
              Bảo trì máy giặt LG hoàn thành
            </span>
          </div>
          <span className='text-sm text-gray-500'>2 giờ trước</span>
        </div>
        <div className='flex items-center justify-between py-2'>
          <div className='flex items-center'>
            <div className='w-2 h-2 bg-blue-500 rounded-full mr-3'></div>
            <span className='text-sm text-gray-900'>
              Lịch bảo trì mới được tạo
            </span>
          </div>
          <span className='text-sm text-gray-500'>4 giờ trước</span>
        </div>
        <div className='flex items-center justify-between py-2'>
          <div className='flex items-center'>
            <div className='w-2 h-2 bg-yellow-500 rounded-full mr-3'></div>
            <span className='text-sm text-gray-900'>
              Nhắc nhở bảo trì điều hòa
            </span>
          </div>
          <span className='text-sm text-gray-500'>1 ngày trước</span>
        </div>
      </div>
    </div>
  </div>
);

export default App;
