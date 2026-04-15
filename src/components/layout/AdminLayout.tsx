import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  return (
    <>
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </>
  );
}
