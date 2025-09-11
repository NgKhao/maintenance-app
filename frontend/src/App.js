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
  <div className='w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-8'>
    <div className='hidden md:flex flex-col justify-center text-indigo-900 space-y-6'>
      <h1 className='text-6xl font-extrabold drop-shadow-lg'>
        🛠 Maintenance App
      </h1>
      <p className='text-xl opacity-90 drop-shadow-md'>
        Quản lý bảo trì — đăng nhập để tiếp tục.
      </p>
      <p className='text-base opacity-80 drop-shadow-sm'>
        Hỗ trợ admin & user quản lý thiết bị, đơn hàng, nhắc nhở bảo trì định
        kỳ.
      </p>
    </div>

    <div className='flex items-center justify-center'>
      <div className='w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 animate-fadeIn'>
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
    <div className='flex flex-col min-h-screen'>
      {/* Header */}
      <header className='w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-between px-6 py-4 shadow-lg'>
        <div className='flex items-center gap-3'>
          <button
            className='md:hidden text-2xl'
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <HiMenu />
          </button>
          <div className='text-3xl font-bold drop-shadow-md flex items-center gap-2'>
            🛠 Maintenance App
          </div>
        </div>
        {/* User info */}
        <div className='relative group'>
          <button className='flex items-center gap-3 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full font-semibold transition-all duration-300'>
            <div className='w-8 h-8 bg-white rounded-full flex items-center justify-center text-indigo-700 font-bold'>
              {role.charAt(0).toUpperCase()}
            </div>
            <div className='flex flex-col text-left'>
              <span className='text-sm font-medium'>{role.toUpperCase()}</span>
              <span className='text-xs opacity-80'>User Account</span>
            </div>
          </button>
          <div className='absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded-xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50'>
            <button
              onClick={onLogout}
              className='w-full text-left px-4 py-3 hover:bg-indigo-100 flex items-center gap-2'
            >
              <HiLogout /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className='flex flex-1 overflow-hidden'>
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className='w-64 bg-indigo-700/90 backdrop-blur-md rounded-tr-2xl rounded-br-2xl p-6 flex flex-col gap-4 shadow-xl overflow-auto transition-all duration-300'>
            {role === 'admin' ? (
              <>
                <SidebarButton label='Users' icon={<HiUsers />} path='/users' />
                <SidebarButton
                  label='Packages'
                  icon={<HiCube />}
                  path='/packages'
                />
                <SidebarButton
                  label='Devices'
                  icon={<HiDeviceTablet />}
                  path='/devices'
                />
                <SidebarButton
                  label='Orders'
                  icon={<HiClipboardList />}
                  path='/orders'
                />
                <SidebarButton
                  label='Schedules'
                  icon={<HiClock />}
                  path='/schedules'
                />
                <SidebarButton
                  label='Reminders'
                  icon={<HiBell />}
                  path='/reminders'
                />
                <SidebarButton
                  label='Contract Requests'
                  icon={<HiDocumentText />}
                  path='/contract-requests'
                />
                <SidebarButton
                  label='Quản lý lịch'
                  icon={<HiClock />}
                  path='/admin-schedules'
                />
              </>
            ) : role === 'technician' ? (
              <>
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
                  label='Thiết bị'
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
                <SidebarButton
                  label='Nhắc nhở'
                  icon={<HiBell />}
                  path='/reminders'
                />
              </>
            )}
          </aside>
        )}

        {/* Main content */}
        <main className='flex-1 bg-white rounded-tr-2xl rounded-br-2xl shadow-2xl p-8 md:p-10 overflow-auto animate-fadeIn'>
          <Routes>
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

            <Route path='*' element={<Navigate to='/devices' />} />
          </Routes>
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
      w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-lg transition-all duration-300
      ${
        isActive
          ? 'bg-white text-indigo-700 shadow-lg transform scale-105'
          : 'text-white/90 hover:bg-white/20 hover:text-white'
      }
    `}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);
export default App;
