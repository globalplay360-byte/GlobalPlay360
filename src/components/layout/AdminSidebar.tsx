import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AdminSidebar() {
  const { t } = useTranslation();

  const navItems = [
    { to: '/admin', label: t('adminSidebar.dashboard', 'Tauler'), icon: '📊' },
    { to: '/admin/products', label: t('adminSidebar.products', 'Productes'), icon: '📦' },
    { to: '/admin/orders', label: t('adminSidebar.orders', 'Comandes'), icon: '🧾' },
    { to: '/admin/users', label: t('adminSidebar.users', 'Usuaris'), icon: '👥' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-gray-300 min-h-[calc(100svh-4rem)] p-4">
      <h2 className="text-white font-bold text-lg mb-6 px-3">{t('adminSidebar.panel', 'Panell d\'Administració')}</h2>
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
