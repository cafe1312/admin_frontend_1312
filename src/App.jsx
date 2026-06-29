import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import api from './utils/api';
import Sidebar from './components/Sidebar';
import Header from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Coupons from './pages/Coupons';
import Customers from './pages/Customers';
import Settings from './pages/Settings';

// Route Guard Component
function RequireAuth({ children }) {
  const token = api.getToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Layout wrapper for authenticated pages
function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Get active title based on path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Analytics Dashboard';
      case '/products':
        return 'Product Management';
      case '/categories':
        return 'Category Management';
      case '/orders':
        return 'Live Order Monitor';
      case '/coupons':
        return 'Promos & Coupons';
      case '/customers':
        return 'Customer Database';
      case '/settings':
        return 'Cafe Settings';
      default:
        return 'Cafe Administration';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9F6] flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        <Header toggleSidebar={toggleSidebar} title={getPageTitle()} />
        <main className="flex-grow p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/coupons" element={<Coupons />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}
