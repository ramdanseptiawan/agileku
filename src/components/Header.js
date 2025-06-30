import React from 'react';
import { Menu, X } from 'lucide-react';
import AnnouncementBell from './AnnouncementBell';

const Header = ({ isSidebarOpen, setIsSidebarOpen }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-xl font-bold text-gray-900">Modern LMS</h1>
        <div className="flex items-center gap-2">
          <AnnouncementBell />
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;