import React from 'react';
import { Menu, User, Bell } from 'lucide-react';

export default function Navbar({ toggleSidebar, title = "Dashboard" }) {
  const user = JSON.parse(localStorage.getItem('1312_admin_user') || '{"username":"Admin"}');

  return (
    <header className="sticky top-0 z-10 bg-background border-b border-primary/10 px-6 py-4 flex items-center justify-between">
      {/* Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-lg hover:bg-cafeDark/5 text-cafeDark lg:hidden"
          aria-label="Open Sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-cafeDark font-title">{title}</h1>
      </div>

      {/* Top Bar Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 text-cafeDark/60 hover:text-primary transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background"></span>
        </button>

        {/* Profile Card Info */}
        <div className="flex items-center gap-2 border-l border-primary/10 pl-4">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-cafeDark leading-none">{user.username}</p>
            <p className="text-[10px] font-semibold text-cafeDark/40 uppercase tracking-widest mt-0.5">{user.role || 'Staff'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
