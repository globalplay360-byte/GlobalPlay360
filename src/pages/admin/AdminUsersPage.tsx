import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { adminUpdateUserRole, listAllUsers } from '@/services/admin.service';
import type { User, UserRole, PlanType } from '@/types';

type RoleFilter = 'all' | UserRole;
type PlanFilter = 'all' | PlanType;

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all');
  const [search, setSearch] = useState('');
  const [draftRoles, setDraftRoles] = useState<Record<string, UserRole>>({});
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listAllUsers()
      .then((u) => {
        if (!cancelled) {
          setUsers(u);
          setDraftRoles(Object.fromEntries(u.map((item) => [item.uid, item.role])));
          setError(null);
        }
      })
      .catch((err) => {
        console.error('[admin] failed to load users:', err);
        if (!cancelled) setError(t('admin.users.loadError', 'No s\'han pogut carregar els usuaris.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [t]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (planFilter !== 'all' && u.plan !== planFilter) return false;
      if (q && !u.displayName?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [users, roleFilter, planFilter, search]);

  const handleRoleSave = async (targetUser: User) => {
    const nextRole = draftRoles[targetUser.uid] ?? targetUser.role;
    if (!currentUser?.uid || nextRole === targetUser.role) {
      return;
    }

    if (
      targetUser.uid === currentUser.uid
      && targetUser.role === 'admin'
      && nextRole !== 'admin'
      && !window.confirm(t('admin.users.confirmSelfRoleChange', 'Si et treus el rol admin, perdràs accés al panell. Vols continuar?'))
    ) {
      return;
    }

    try {
      setSavingUserId(targetUser.uid);
      await adminUpdateUserRole(targetUser.uid, nextRole, currentUser.uid);
      setUsers((prev) => prev.map((item) => item.uid === targetUser.uid ? { ...item, role: nextRole } : item));
      setError(null);
    } catch (err) {
      console.error('[admin] failed to update user role:', err);
      setError(t('admin.users.roleUpdateError', 'No s\'ha pogut actualitzar el rol.'));
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.users.title', 'Usuaris')}
        description={t('admin.users.description', 'Gestiona la comunitat de la plataforma.')}
      />

      <div className="bg-gradient-to-b from-[#1A2235] to-[#141C2E] border border-[#2A3447]/70 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('admin.users.searchPlaceholder', 'Cercar per nom...')}
          className="bg-[#0F172A] border border-[#1F2937] text-gray-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] placeholder:text-[#4B5563]"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
          className="bg-[#0F172A] border border-[#1F2937] text-gray-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
        >
          <option value="all">{t('admin.users.filter.allRoles', 'Tots els rols')}</option>
          <option value="player">{t('admin.role.player', 'Jugadors')}</option>
          <option value="coach">{t('admin.role.coach', 'Entrenadors')}</option>
          <option value="club">{t('admin.role.club', 'Clubs')}</option>
          <option value="admin">{t('admin.role.admin', 'Administradors')}</option>
        </select>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value as PlanFilter)}
          className="bg-[#0F172A] border border-[#1F2937] text-gray-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
        >
          <option value="all">{t('admin.users.filter.allPlans', 'Tots els plans')}</option>
          <option value="free">Free</option>
          <option value="trial">Trial</option>
          <option value="premium">Premium</option>
          <option value="pro">Pro</option>
        </select>
      </div>

      {error && (
        <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg text-sm text-[#EF4444]">{error}</div>
      )}

      <div className="bg-gradient-to-b from-[#1A2235] to-[#141C2E] border border-[#2A3447]/70 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Spinner className="h-8 w-8 text-[#3B82F6]" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#6B7280]">{t('admin.users.empty', 'Cap usuari coincideix amb els filtres.')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0F172A]/60 border-b border-[#2A3447]/70">
                <tr>
                  <Th>{t('admin.users.col.name', 'Nom')}</Th>
                  <Th>{t('admin.users.col.role', 'Rol')}</Th>
                  <Th>{t('admin.users.col.plan', 'Pla')}</Th>
                  <Th>{t('admin.users.col.created', 'Registre')}</Th>
                  <Th align="right">{t('admin.users.col.actions', 'Accions')}</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3447]/50">
                {filtered.map((u) => (
                  <tr key={u.uid} className="hover:bg-[#1F2937]/30">
                    <Td>
                      <div className="flex items-center gap-3">
                        {u.photoURL ? (
                          <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#2A3447] flex items-center justify-center text-xs font-semibold text-[#9CA3AF]">
                            {u.displayName?.charAt(0).toUpperCase() ?? '?'}
                          </div>
                        )}
                        <span className="font-medium text-gray-100">{u.displayName ?? '—'}</span>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-3 justify-between">
                        <Badge variant="default">{t(`admin.role.${u.role}`, u.role)}</Badge>
                        <select
                          value={draftRoles[u.uid] ?? u.role}
                          onChange={(e) => setDraftRoles((prev) => ({ ...prev, [u.uid]: e.target.value as UserRole }))}
                          className="bg-[#0F172A] border border-[#1F2937] text-gray-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                          disabled={savingUserId === u.uid}
                        >
                          <option value="player">{t('admin.role.player', 'Jugadors')}</option>
                          <option value="coach">{t('admin.role.coach', 'Entrenadors')}</option>
                          <option value="club">{t('admin.role.club', 'Clubs')}</option>
                          <option value="admin">{t('admin.role.admin', 'Administradors')}</option>
                        </select>
                      </div>
                    </Td>
                    <Td>
                      <PlanBadge plan={u.plan} />
                    </Td>
                    <Td>
                      <span className="text-[#9CA3AF] tabular-nums">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </span>
                    </Td>
                    <Td align="right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          to={`/dashboard/profile/${u.uid}`}
                          className="text-[12px] font-semibold text-[#60A5FA] hover:text-[#93C5FD] transition-colors"
                        >
                          {t('admin.users.viewProfile', 'Veure perfil')}
                        </Link>
                        <button
                          type="button"
                          onClick={() => void handleRoleSave(u)}
                          disabled={savingUserId === u.uid || (draftRoles[u.uid] ?? u.role) === u.role}
                          className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-[12px] font-semibold text-gray-100 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {savingUserId === u.uid ? t('admin.users.savingRole', 'Guardant...') : t('admin.users.saveRole', 'Guardar rol')}
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-[#6B7280] text-center">
        {t('admin.users.showing', 'Mostrant {{shown}} de {{total}} usuaris', { shown: filtered.length, total: users.length })}
      </p>
    </div>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  const alignCls = align === 'right' ? 'text-right' : 'text-left';
  return (
    <th className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] ${alignCls}`}>
      {children}
    </th>
  );
}

function Td({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  const alignCls = align === 'right' ? 'text-right' : 'text-left';
  return <td className={`px-5 py-3 ${alignCls}`}>{children}</td>;
}

function PlanBadge({ plan }: { plan: PlanType }) {
  if (plan === 'premium' || plan === 'pro') return <Badge variant="primary">{plan}</Badge>;
  if (plan === 'trial') return <Badge variant="warning">trial</Badge>;
  return <Badge variant="default">free</Badge>;
}
