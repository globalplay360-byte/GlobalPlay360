import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col h-screen bg-[#0B1120] font-sans">
      <Navbar />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-[#0F172A] p-4 md:p-6 lg:p-8 custom-scrollbar">
          <div key={location.pathname} className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
