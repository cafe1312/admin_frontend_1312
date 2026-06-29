import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import {
  LayoutDashboard,
  ShoppingBag,
  Coffee,
  List,
  Tag,
  Users,
  Settings as SettingsIcon,
  LogOut,
  ChevronRight
} from 'lucide-react';
import api from '../utils/api';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Live Orders', path: '/orders', icon: ShoppingBag },
    { name: 'Products', path: '/products', icon: Coffee },
    { name: 'Categories', path: '/categories', icon: List },
    { name: 'Coupons', path: '/coupons', icon: Tag },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const handleLogout = () => {
    api.clearToken();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-20 bg-adminDark/20 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-30 w-64 bg-adminDark text-background p-6 flex flex-col justify-between transition-transform duration-300 border-r border-primary/5 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 border-b border-background/10 pb-6">
            <img src={logoImg} alt="1312 Cafe Logo" className="h-9 w-9 rounded-full object-cover" />
            <span className="font-serif text-lg font-bold tracking-wider">1312 <span className="text-primary">Admin</span></span>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => toggleSidebar(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between p-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-primary text-cafeDark shadow-md shadow-primary/10'
                        : 'text-background/60 hover:bg-background/5 hover:text-background'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4.5 w-4.5 stroke-[1.8]" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="h-3 w-3 opacity-30" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="border-t border-background/10 pt-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
