import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  getUserApplications,
  getClubApplications,
  updateApplicationStatus,
  deleteApplication,
} from "@/services/applications.service";
import { getOpportunityById } from "@/services/opportunities.service";
import { getUserDoc } from "@/services/auth.service";
import { getOrCreateConversation } from "@/services/messages.service";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { Application, Opportunity, User } from "@/types";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import { formatLocation } from '@/utils/location';
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowUturnLeftIcon
} from "@heroicons/react/24/outline";

interface ApplicationExtended extends Application {
  opportunity?: Opportunity;
  club?: User;
  candidate?: User;
}

export default function ApplicationsPage() {
  const { user, activePlan } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const currentUserRole = user?.role || "player";
  const isFree = activePlan === 'free';

  const [applications, setApplications] = useState<ApplicationExtended[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteOrphaned = async (appId: string) => {
    if (!window.confirm("Vols amagar i eliminar aquesta candidatura de l'historial? (L'oportunitat ja no està disponible)")) return;
    setDeletingId(appId);
    try {
      await deleteApplication(appId);
      setApplications(prev => prev.filter(a => a.id !== appId));
    } catch (err) {
      alert("Error eliminant la candidatura.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    // Check if we came back from pricing specifically to start a chat
    const startChatId = searchParams.get('startChat');
    if (startChatId && !isFree && user) {
      // Small timeout to ensure everything is mounted
      setTimeout(() => {
        handleStartConversation(startChatId);
        // Clean URL to prevent loops
        setSearchParams(new URLSearchParams());
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isFree, user]);

  const handleStartConversation = async (otherUserId: string) => {
    if (!user) return;
    if (isFree) {
      // Append startChat param when redirecting to pricing so we know what to do upon returning
      const returnPath = `${location.pathname}?startChat=${otherUserId}`;
      navigate(`/pricing?returnUrl=${encodeURIComponent(returnPath)}`);
      return;
    }
    try {
      const convId = await getOrCreateConversation(user.uid, otherUserId);
      navigate(`/dashboard/messages/${convId}`);
    } catch (err) {
      console.error("Error creant el xat:", err);
      alert(t('applications.errorChat'));
    }
  };

  const handleStatusChange = async (
    app: ApplicationExtended,
    newStatus: Application['status'],
  ) => {
    const previousStatus = app.status;
    setUpdatingId(app.id);
    // Actualització optimista: canviem l'estat local immediatament
    setApplications((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a)),
    );

    try {
      await updateApplicationStatus(app.id, newStatus);
    } catch (err) {
      // Rollback si falla
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: previousStatus } : a)),
      );
      alert(
        err instanceof Error
          ? err.message
          : t('applications.errorUpdateStatus'),
      );
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function fetch() {
      try {
        setIsLoading(true);
        setError(null);

        const apps =
          currentUserRole === "club"
            ? await getClubApplications(user!.uid)
            : await getUserApplications(user!.uid);

        // Enrich each application with opportunity + club/candidate data
        const enriched: ApplicationExtended[] = await Promise.all(
          apps.map(async (app) => {
            const [opportunity, externalUser] = await Promise.all([
              getOpportunityById(app.opportunityId),
              currentUserRole === "club"
                ? getUserDoc(app.userId)
                : app.clubId
                  ? getUserDoc(app.clubId)
                  : null,
            ]);
            return {
              ...app,
              opportunity: opportunity ?? undefined,
              ...(currentUserRole === "club"
                ? { candidate: externalUser ?? undefined }
                : { club: externalUser ?? undefined }),
            };
          }),
        );

        if (!cancelled) setApplications(enriched);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : t('applications.errorLoading'),
          );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetch();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // ── Error state ───────────────────────────────────────
  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto w-full">
        <EmptyState
          title={t('applications.errorConnection')}
          description={error}
          icon={
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          action={
            <Button variant="primary" onClick={() => window.location.reload()}>
              {t('applications.retry')}
            </Button>
          }
        />
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto w-full">
        <div className="h-8 w-48 bg-[#1F2937] rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-56 rounded-2xl bg-gradient-to-b from-[#1A2235] to-[#141C2E] border border-[#2A3447]/60 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <PageHeader
          title={
            currentUserRole === "club"
              ? t('applications.titleClub')
              : t('applications.titlePlayer')
          }
          description={
            currentUserRole === "club"
              ? t('applications.descClub')
              : t('applications.descPlayer')
          }
        />

        {applications.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {applications.map((app) => (
              <motion.article
                variants={itemVariants}
                key={app.id}
                className={`relative rounded-2xl border bg-gradient-to-b from-[#1A2235] to-[#141C2E] p-5 sm:p-6 shadow-[0_1px_0_0_rgba(243,244,246,0.04)_inset,0_10px_30px_-16px_rgba(0,0,0,0.7)] transition-all duration-base ease-out group flex flex-col ${
                  !app.opportunity
                    ? 'opacity-70 border-[#2A3447]/50'
                    : 'border-[#2A3447]/70 hover:border-[#3B82F6]/40 hover:-translate-y-0.5 hover:shadow-[0_1px_0_0_rgba(243,244,246,0.06)_inset,0_20px_50px_-20px_rgba(59,130,246,0.35)]'
                }`}
              >
                {/* Inner top highlight — premium depth trick */}
                <div className="pointer-events-none absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-100/10 to-transparent" />
                {/* Meta line: date + status */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                    {t('applications.appliedOn', { date: new Date(app.createdAt).toLocaleDateString("ca-ES") })}
                  </span>
                  <StatusBadge status={app.status} />
                </div>

                {/* Title */}
                <h2 className="text-[1.2rem] sm:text-[1.3rem] font-semibold text-gray-100/90 tracking-tight leading-snug mb-1 group-hover:text-gray-100 transition-colors duration-fast line-clamp-2">
                  {app.opportunity?.title || t('applications.opportunityClosed')}
                </h2>

                {/* Subject: candidate or club */}
                <p className="text-sm text-[#9CA3AF] mb-4">
                  {currentUserRole === "club" ? (
                    <>
                      <span className="text-[#6B7280]">{t('applications.candidateLabel', { name: '' })}</span>
                      <span
                        className="ml-1 text-gray-200 font-medium hover:text-[#3B82F6] cursor-pointer transition-colors duration-fast"
                        onClick={() => app.candidate && navigate(`/dashboard/profile/${app.candidate.uid}`)}
                      >
                        {app.candidate?.displayName || t('applications.unknownUser')}
                      </span>
                    </>
                  ) : (
                    <span
                      className="text-gray-200 font-medium hover:text-[#3B82F6] cursor-pointer transition-colors duration-fast"
                      onClick={() => app.club?.uid && navigate(`/dashboard/profile/${app.club.uid}`)}
                    >
                      {app.club?.displayName || t('applications.unknownClub')}
                    </span>
                  )}
                </p>

                {/* Meta pills */}
                {(app.opportunity?.sport || app.opportunity?.country) && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px] text-[#9CA3AF] mb-4">
                    {app.opportunity?.sport && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="capitalize">{app.opportunity.sport}</span>
                      </div>
                    )}
                    {app.opportunity?.sport && app.opportunity?.country && (
                      <span className="text-[#1F2937]">·</span>
                    )}
                    {app.opportunity?.country && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{formatLocation(app.opportunity)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Message as editorial quote */}
                {app.message && (
                  <blockquote className="border-l-2 border-[#2A3447]/80 pl-4 mb-5">
                    <p className="text-sm text-[#9CA3AF] italic leading-relaxed line-clamp-2">
                      "{app.message}"
                    </p>
                  </blockquote>
                )}

                {/* Spacer pushes footer to bottom for grid alignment */}
                <div className="flex-1" />

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-[#2A3447]/70 to-transparent mb-4" />

                {/* Actions footer */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Primary actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {app.opportunity ? (
                      <Link
                        to={`/dashboard/opportunities/${app.opportunityId}`}
                        state={{ from: 'applications' }}
                        className="inline-flex items-center px-3.5 py-2 text-[13px] font-medium tracking-wide text-gray-200 bg-[#1F2937]/40 border border-[#1F2937] hover:bg-[#1F2937]/80 hover:border-[#374151] rounded-lg transition-all duration-fast active:scale-[0.98]"
                      >
                        {t('applications.viewDetail')}
                      </Link>
                    ) : (
                      <Button
                        variant="outline"
                        className="px-3.5 py-2 text-[13px] font-medium tracking-wide text-[#EF4444]/90 border-[#EF4444]/25 hover:bg-[#EF4444]/10 hover:border-[#EF4444]/40 rounded-lg transition-all duration-fast"
                        onClick={() => handleDeleteOrphaned(app.id)}
                        disabled={deletingId === app.id}
                      >
                        {deletingId === app.id ? "Eliminant..." : t('applications.removeOrphaned', "Eliminar Registre")}
                      </Button>
                    )}

                    {currentUserRole === "club" &&
                      app.candidate &&
                      (app.status === "accepted" || app.status === "in_review") && (
                        <Button
                          variant="primary"
                          className="px-3.5 py-2 text-[13px] font-semibold tracking-wide inline-flex items-center justify-center gap-1.5 rounded-lg shadow-sm hover:shadow-[#3B82F6]/20 transition-all duration-base active:scale-[0.98]"
                          onClick={() => handleStartConversation(app.candidate!.uid)}
                        >
                          {isFree && (
                            <svg className="w-3.5 h-3.5 text-gray-100/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" />
                            </svg>
                          )}
                          {t('applications.contact')}
                        </Button>
                      )}

                    {currentUserRole !== "club" &&
                      app.status === "accepted" &&
                      app.club && (
                        <Button
                          variant="primary"
                          className="px-3.5 py-2 text-[13px] font-semibold tracking-wide inline-flex items-center justify-center gap-1.5 rounded-lg shadow-sm hover:shadow-[#3B82F6]/20 transition-all duration-base active:scale-[0.98]"
                          onClick={() => handleStartConversation(app.club!.uid)}
                        >
                          {isFree && (
                            <svg className="w-3.5 h-3.5 text-gray-100/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" />
                            </svg>
                          )}
                          {t('applications.startConversation')}
                        </Button>
                      )}
                  </div>

                  {/* Status management (club only) */}
                  {currentUserRole === "club" && app.opportunity && (
                    <div className="flex items-center gap-1.5 ml-auto bg-[#111827]/80 rounded-lg p-1 border border-[#2A3447]/60">
                      {app.status === "submitted" && (
                        <button
                          onClick={() => handleStatusChange(app, "in_review")}
                          disabled={updatingId === app.id}
                          title={t('applications.titleMarkInReview', 'Posar en revisió')}
                          className="group flex items-center justify-center p-2 rounded-md bg-transparent hover:bg-purple-500/10 text-gray-400 hover:text-purple-400 transition-all duration-fast disabled:opacity-50"
                        >
                          <EyeIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                      )}
                      {(app.status === "submitted" || app.status === "in_review") && (
                        <>
                          <div className={app.status === "submitted" ? "w-px h-6 bg-[#2A3447]" : "hidden"} />
                          <button
                            onClick={() => handleStatusChange(app, "accepted")}
                            disabled={updatingId === app.id}
                            title={t('applications.titleAccept', 'Acceptar candidatura')}
                            className="group flex items-center justify-center p-2 rounded-md bg-transparent hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-400 transition-all duration-fast disabled:opacity-50"
                          >
                            <CheckCircleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          </button>
                          <div className="w-px h-6 bg-[#2A3447]" />
                          <button
                            onClick={() => handleStatusChange(app, "rejected")}
                            disabled={updatingId === app.id}
                            title={t('applications.titleReject', 'Rebutjar candidatura')}
                            className="group flex items-center justify-center p-2 rounded-md bg-transparent hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all duration-fast disabled:opacity-50"
                          >
                            <XCircleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          </button>
                        </>
                      )}
                      {(app.status === "accepted" || app.status === "rejected") && (
                        <button
                          onClick={() => handleStatusChange(app, "in_review")}
                          disabled={updatingId === app.id}
                          title={t('applications.titleReopen', 'Tornar a obrir per revisió')}
                          className="group flex items-center justify-center p-2 rounded-md bg-transparent hover:bg-[#2A3447]/50 text-gray-400 hover:text-gray-200 transition-all duration-fast disabled:opacity-50"
                        >
                          <ArrowUturnLeftIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            title={t('applications.emptyTitle')}
            description={t('applications.emptyDesc')}
            icon={
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            }
            action={
              <Link
                to="/dashboard/opportunities"
                className="inline-flex items-center justify-center px-4 py-2 bg-[#3B82F6] text-gray-100 hover:bg-[#2563EB] text-sm font-medium rounded-lg transition-colors"
              >
                {t('common.searchOpportunities', 'Buscar Oportunitats')}
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}









