import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/products', label: 'Products', icon: '📦' },
  { to: '/admin/orders', label: 'Orders', icon: '🧾' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-gray-300 min-h-[calc(100svh-4rem)] p-4">
      <h2 className="text-white font-bold text-lg mb-6 px-3">Admin Panel</h2>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
