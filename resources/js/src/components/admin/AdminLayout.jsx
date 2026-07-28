import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

const AdminLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR - fixed width on the left */}
      <AdminSidebar />
      
      {/* MAIN CONTENT - takes ALL remaining space on the right */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;