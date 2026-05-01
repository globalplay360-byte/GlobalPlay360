const fs = require('fs');
let file = fs.readFileSync('src/pages/dashboard/ApplicationsPage.tsx', 'utf8');

if (!file.includes('@heroicons')) {
  file = file.replace(
    'import { formatLocation } from \'@/utils/location\';',
    'import { formatLocation } from \'@/utils/location\';\nimport {\n  CheckCircleIcon,\n  XCircleIcon,\n  EyeIcon,\n  ArrowUturnLeftIcon\n} from "@heroicons/react/24/outline";'
  );
}

const oldActionJsx =                   {/* Status management (club only) */}
                  {currentUserRole === "club" && app.opportunity && (
                    <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                      {app.status === "submitted" && (
                        <button
                          onClick={() => handleStatusChange(app, "in_review")}
                          disabled={updatingId === app.id}
                          title={t('applications.titleMarkInReview')}
                          className="px-2.5 py-1.5 text-[11.5px] font-medium tracking-wide rounded-md border border-purple-500/20 text-purple-300/90 hover:bg-purple-500/10 hover:border-purple-500/40 transition-all duration-fast disabled:opacity-50"
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
                            className="px-2.5 py-1.5 text-[11.5px] font-medium tracking-wide rounded-md border border-emerald-500/20 text-emerald-300/90 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all duration-fast disabled:opacity-50"
                          >
                            {updatingId === app.id ? "..." : t('applications.accept')}
                          </button>
                          <button
                            onClick={() => handleStatusChange(app, "rejected")}
                            disabled={updatingId === app.id}
                            title={t('applications.titleReject')}
                            className="px-2.5 py-1.5 text-[11.5px] font-medium tracking-wide rounded-md border border-red-500/20 text-red-300/90 hover:bg-red-500/10 hover:border-red-500/40 transition-all duration-fast disabled:opacity-50"
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
                          className="px-2.5 py-1.5 text-[11.5px] font-medium tracking-wide rounded-md border border-[#1F2937] text-[#9CA3AF] hover:text-gray-100 hover:bg-[#1F2937]/60 transition-all duration-fast disabled:opacity-50"
                        >
                          {updatingId === app.id ? "..." : t('applications.reopen')}
                        </button>
                      )}
                    </div>
                  )};

const newActionJsx =                   {/* Status management (club only) */}
                  {currentUserRole === "club" && app.opportunity && (
                    <div className="flex items-center gap-2 ml-auto bg-[#111827]/80 rounded-lg p-1 border border-[#2A3447]/60">
                      {app.status === "submitted" && (
                        <button
                          onClick={() => handleStatusChange(app, "in_review")}
                          disabled={updatingId === app.id}
                          title={t('applications.titleMarkInReview', 'Posar en revisió')}
                          className="group flex items-center justify-center px-3 py-1.5 rounded-md bg-transparent hover:bg-purple-500/10 text-gray-400 hover:text-purple-400 transition-all duration-fast disabled:opacity-50"
                        >
                          <EyeIcon className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" />
                          <span className="text-[12px] font-medium tracking-wide">{t('applications.markInReview', 'En revisió')}</span>
                        </button>
                      )}

                      {(app.status === "submitted" || app.status === "in_review") && (
                        <>
                          <div className={app.status === "submitted" ? "w-px h-4 bg-[#2A3447]" : "hidden"} />
                          <button
                            onClick={() => handleStatusChange(app, "accepted")}
                            disabled={updatingId === app.id}
                            title={t('applications.titleAccept', 'Acceptar candidatura')}
                            className="group flex items-center justify-center px-3 py-1.5 rounded-md bg-transparent hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-400 transition-all duration-fast disabled:opacity-50"
                          >
                            <CheckCircleIcon className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" />
                            <span className="text-[12px] font-medium tracking-wide">{t('applications.accept', 'Acceptar')}</span>
                          </button>
                          
                          <div className="w-px h-4 bg-[#2A3447]" />
                          
                          <button
                            onClick={() => handleStatusChange(app, "rejected")}
                            disabled={updatingId === app.id}
                            title={t('applications.titleReject', 'Rebutjar candidatura')}
                            className="group flex items-center justify-center px-3 py-1.5 rounded-md bg-transparent hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all duration-fast disabled:opacity-50"
                          >
                            <XCircleIcon className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" />
                            <span className="text-[12px] font-medium tracking-wide">{t('applications.reject', 'Rebutjar')}</span>
                          </button>
                        </>
                      )}

                      {(app.status === "accepted" || app.status === "rejected") && (
                        <button
                          onClick={() => handleStatusChange(app, "in_review")}
                          disabled={updatingId === app.id}
                          title={t('applications.titleReopen', 'Tornar a obrir per revisió')}
                          className="group flex items-center justify-center px-3 py-1.5 rounded-md bg-transparent hover:bg-[#2A3447]/50 text-gray-400 hover:text-gray-200 transition-all duration-fast disabled:opacity-50"
                        >
                          <ArrowUturnLeftIcon className="w-4 h-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
                          <span className="text-[12px] font-medium tracking-wide">{t('applications.reopen', 'Reobrir')}</span>
                        </button>
                      )}
                    </div>
                  )};

file = file.replace(oldActionJsx, newActionJsx);
fs.writeFileSync('src/pages/dashboard/ApplicationsPage.tsx', file);
