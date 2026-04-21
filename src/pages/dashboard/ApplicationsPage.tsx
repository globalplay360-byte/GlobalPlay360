import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  getUserApplications,
  getClubApplications,
  updateApplicationStatus,
} from "@/services/applications.service";
import { getOpportunityById } from "@/services/opportunities.service";
import { getUserDoc } from "@/services/auth.service";
import { getOrCreateConversation } from "@/services/messages.service";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { Application, Opportunity, User } from "@/types";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";

interface ApplicationExtended extends Application {
  opportunity?: Opportunity;
  club?: User;
  candidate?: User;
}

export default function ApplicationsPage() {
  const { user, activePlan } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentUserRole = user?.role || "player";
  const isFree = activePlan === 'free';

  const [applications, setApplications] = useState<ApplicationExtended[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStartConversation = async (otherUserId: string) => {
    if (!user) return;
    if (isFree) {
      navigate('/pricing');
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
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-40 rounded-xl bg-[#111827] border border-[#1F2937] animate-pulse"
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
      <div className="flex flex-col gap-4 sm:p-6">
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
            className="flex flex-col gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {applications.map((app) => (
              <motion.div
                variants={itemVariants}
                key={app.id}
                className="bg-[#111827] border border-[#1F2937] rounded-xl hover:border-[#3B82F6]/50 shadow-sm hover:shadow-[#3B82F6]/10 hover:-translate-y-0.5 transition-all duration-base group flex flex-col md:flex-row p-5 sm:p-6 gap-6 mb-2 relative overflow-hidden"
              >
                {/* Línia superior de status */}
                <div
                  className={`absolute top-0 left-0 h-1.5 w-full
                  ${app.status === "accepted" ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : ""}
                  ${app.status === "rejected" ? "bg-red-500 shadow-sm shadow-red-500/50" : ""}
                  ${app.status === "in_review" ? "bg-purple-500 shadow-sm shadow-purple-500/50" : ""}
                  ${app.status === "submitted" ? "bg-blue-500 shadow-sm shadow-blue-500/50" : ""}
                `}
                />

                {/* Info Principal */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#9CA3AF] text-xs font-bold uppercase tracking-wider">
                      {t('applications.appliedOn', { date: new Date(app.createdAt).toLocaleDateString("ca-ES") })}
                    </span>
                    <div className="block md:hidden">
                      <StatusBadge status={app.status} />
                    </div>
                  </div>

                  <h2 className="text-xl font-extrabold text-white mb-1.5 tracking-tight truncate group-hover:text-[#3B82F6] transition-colors">
                    {app.opportunity?.title || t('applications.opportunityClosed')}
                  </h2>
                  <p className="text-[#3B82F6] font-bold text-sm mb-4 tracking-wide">
                    {currentUserRole === "club"
                      ? t('applications.candidateLabel', { name: app.candidate?.displayName || t('applications.unknownUser') })
                      : app.club?.displayName || t('applications.unknownClub')}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#9CA3AF]">
                    {app.opportunity?.sport && (
                      <div className="flex items-center gap-1.5">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>{app.opportunity.sport}</span>
                      </div>
                    )}
                    {app.opportunity?.location && (
                      <div className="flex items-center gap-1.5">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>{app.opportunity.location}</span>
                      </div>
                    )}
                  </div>

                  {app.message && (
                    <div className="mt-4 p-3 bg-[#0F172A] border border-[#1F2937] rounded-lg shadow-inner">
                      <p className="text-sm text-[#9CA3AF] italic leading-relaxed line-clamp-2">
                        "{app.message}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Accions i Estat */}
                <div className="flex flex-col justify-between items-start md:items-end gap-5 min-w-[160px] border-t border-[#1F2937] md:border-t-0 pt-4 md:pt-0">
                  <div className="hidden md:block mt-1">
                    <StatusBadge
                      status={app.status}
                      className="text-xs px-3 py-1 font-bold uppercase tracking-wider"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row w-full gap-2.5">
                    <Link
                      to={`/dashboard/opportunities/${app.opportunityId}`}
                      state={{ from: 'applications' }}
                      className="w-full sm:w-auto px-4 py-2 bg-[#1F2937]/50 border border-[#374151] text-white hover:bg-[#374151] text-sm font-bold tracking-wide rounded-lg transition-all duration-fast active:scale-[0.98] text-center"
                    >
                      {t('applications.viewDetail')}
                    </Link>

                    {currentUserRole === "club" &&
                      app.candidate &&
                      (app.status === "accepted" || app.status === "in_review") && (
                        <Button
                          variant="primary"
                          className="w-full sm:w-auto px-4 py-2 text-sm font-bold tracking-wide inline-flex items-center justify-center gap-1.5 shadow-md hover:shadow-[#3B82F6]/20 transition-all duration-base active:scale-[0.98]"
                          onClick={() => handleStartConversation(app.candidate!.uid)}
                        >
                          {isFree && (
                            <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          className="w-full sm:w-auto px-4 py-2 text-sm font-bold tracking-wide inline-flex items-center justify-center gap-1.5 shadow-md hover:shadow-[#3B82F6]/20 transition-all duration-base active:scale-[0.98]"
                          onClick={() => handleStartConversation(app.club!.uid)}
                        >
                          {isFree && (
                            <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" />
                            </svg>
                          )}
                          {t('applications.startConversation')}
                        </Button>
                      )}
                  </div>

                  {/* Accions de gestió d'estat (només club) */}
                  {currentUserRole === "club" && (
                    <div className="flex flex-wrap gap-2 w-full justify-end">
                      {app.status === "submitted" && (
                        <button
                          onClick={() => handleStatusChange(app, "in_review")}
                          disabled={updatingId === app.id}
                          title={t('applications.titleMarkInReview')}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-colors disabled:opacity-50"
                        >
                          {updatingId === app.id ? "..." : t('applications.markInReview')}
                        </button>
                      )}
                      {(app.status === "submitted" || app.status === "in_review") && (
                        <>
                          <button
                            onClick={() => handleStatusChange(app, "accepted")}
                            disabled={updatingId === app.id}
                            title={t('applications.titleAccept')}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                          >
                            {updatingId === app.id ? "..." : t('applications.accept')}
                          </button>
                          <button
                            onClick={() => handleStatusChange(app, "rejected")}
                            disabled={updatingId === app.id}
                            title={t('applications.titleReject')}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          >
                            {updatingId === app.id ? "..." : t('applications.reject')}
                          </button>
                        </>
                      )}
                      {(app.status === "accepted" || app.status === "rejected") && (
                        <button
                          onClick={() => handleStatusChange(app, "in_review")}
                          disabled={updatingId === app.id}
                          title={t('applications.titleReopen')}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#1F2937] text-[#9CA3AF] hover:text-white hover:bg-[#1F2937] transition-colors disabled:opacity-50"
                        >
                          {updatingId === app.id ? "..." : t('applications.reopen')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
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
                className="inline-flex items-center justify-center px-4 py-2 bg-[#3B82F6] text-white hover:bg-[#2563EB] text-sm font-medium rounded-lg transition-colors"
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



