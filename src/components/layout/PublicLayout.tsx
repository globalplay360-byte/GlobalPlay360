import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { PRELAUNCH_MODE } from '@/config/site';

export default function PublicLayout() {
  const location = useLocation();

  if (PRELAUNCH_MODE) {
    return (
      <main className="flex-1">
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      <Footer />
    </>
  );
}
