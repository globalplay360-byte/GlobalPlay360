import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AdminSidebar() {
  const { t } = useTranslation();

  const navItems = [
    {
      to: '/admin',
      label: t('adminSidebar.dashboard', 'Tauler'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      to: '/admin/users',
      label: t('adminSidebar.users', 'Usuaris'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 014-4h0m12-4a4 4 0 11-8 0 4 4 0 018 0zm-9 4a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      to: '/admin/opportunities',
      label: t('adminSidebar.opportunities', 'Oportunitats'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-[#0B1120] border-r border-[#1F2937] flex-shrink-0 flex-col">
      <h2 className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-[0.18em] mb-2 px-6 pt-6">
        {t('adminSidebar.panel', 'Administració')}
      </h2>
      <nav className="flex-1 px-3 space-y-1 mt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-fast ${
                isActive
                  ? 'bg-[#3B82F6]/10 text-[#3B82F6] shadow-sm'
                  : 'text-[#9CA3AF] hover:text-gray-100 hover:bg-[#1F2937] hover:translate-x-1'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={isActive ? 'text-[#3B82F6]' : 'text-[#6B7280]'}>{item.icon}</div>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
