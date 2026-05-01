import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AdminSidebar() {
  const { t } = useTranslation();

  const navItems = [
    { to: '/admin', label: t('adminSidebar.dashboard', 'Tauler'), icon: '📊' },
    { to: '/admin/users', label: t('adminSidebar.users', 'Usuaris'), icon: '👥' },
    { to: '/admin/opportunities', label: t('adminSidebar.opportunities', 'Oportunitats'), icon: '🎯' },
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-[#0B1120] border-r border-[#1F2937] flex-shrink-0 flex-col">
      <h2 className="text-gray-100 font-bold text-sm uppercase tracking-[0.18em] mb-6 px-6 pt-6 text-[#FFC107]/80">
        {t('adminSidebar.panel', 'Administració')}
      </h2>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-fast ${
                isActive
                  ? 'bg-[#FFC107]/10 text-[#FFC107] shadow-sm'
                  : 'text-[#9CA3AF] hover:text-gray-100 hover:bg-[#1F2937]'
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
