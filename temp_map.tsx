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
                  className={`bg-[#111827] border border-[#1F2937] rounded-xl shadow-sm hover:-translate-y-0.5 transition-all duration-base group flex flex-col md:flex-row p-5 sm:p-6 gap-6 mb-2 relative overflow-hidden ${
                    !app.opportunity ? 'opacity-60 grayscale-[50%]' : 'hover:border-[#3B82F6]/50 hover:shadow-[#3B82F6]/10'
                  }`}
                >
                  {/* Línia superior de status */}
                  <div
                    className={`absolute top-0 left-0 h-1.5 w-full
                    ${!app.opportunity ? 'bg-gray-600' : ''}
                    ${app.opportunity && app.status === "accepted" ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : ""}
                    ${app.opportunity && app.status === "rejected" ? "bg-red-500 shadow-sm shadow-red-500/50" : ""}
                    ${app.opportunity && app.status === "in_review" ? "bg-purple-500 shadow-sm shadow-purple-500/50" : ""}
                    ${app.opportunity && app.status === "submitted" ? "bg-blue-500 shadow-sm shadow-blue-500/50" : ""}
                  `}
                  />

                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#9CA3AF] text-xs font-bold uppercase tracking-wider">
                      {t('applications.appliedOn', { date: new Date(app.createdAt).toLocaleDateString("ca-ES") })}
                    </span>
                    <div className="block md:hidden">
                      <StatusBadge status={app.status} />
                    </div>
                  </div>

                  <h2 className="text-xl font-extrabold text-gray-100 mb-1.5 tracking-tight truncate group-hover:text-[#3B82F6] transition-colors">
                    {app.opportunity?.title || t('applications.opportunityClosed')}
                  </h2>
                  <p className="text-[#3B82F6] font-bold text-sm mb-4 tracking-wide">
                    {currentUserRole === "club"
                      ? (
                        <>
                          {t('applications.candidateLabel', { name: '' })}
                          <span 
                            className="hover:underline cursor-pointer transition-colors text-blue-400"
                            onClick={() => app.candidate && navigate(`/dashboard/profile/${app.candidate.uid}`)}
                          >
                            {app.candidate?.displayName || t('applications.unknownUser')}
                          </span>
                        </>
                      )
                      : (
                        <span 
                          className="hover:underline cursor-pointer transition-colors text-blue-400"
                          onClick={() => app.club?.uid && navigate(`/dashboard/profile/${app.club.uid}`)}
                        >
                          {app.club?.displayName || t('applications.unknownClub')}
                        </span>
                      )
                    }
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
                    {app.opportunity?.country && (
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
                        <span>{formatLocation(app.opportunity)}</span>
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
                      {app.opportunity ? (
                        <Link
                          to={`/dashboard/opportunities/${app.opportunityId}`}
                          state={{ from: 'applications' }}
                          className="w-full sm:w-auto px-4 py-2 bg-[#1F2937]/50 border border-[#374151] text-gray-100 hover:bg-[#374151] text-sm font-bold tracking-wide rounded-lg transition-all duration-fast active:scale-[0.98] text-center"
                        >
                          {t('applications.viewDetail')}
                        </Link>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto px-4 py-2 text-sm font-bold tracking-wide text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/10 transition-all duration-fast"
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
                          className="w-full sm:w-auto px-4 py-2 text-sm font-bold tracking-wide inline-flex items-center justify-center gap-1.5 shadow-md hover:shadow-[#3B82F6]/20 transition-all duration-base active:scale-[0.98]"
                          onClick={() => handleStartConversation(app.candidate!.uid)}
                        >
                          {isFree && (
                            <svg className="w-4 h-4 text-gray-100/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            <svg className="w-4 h-4 text-gray-100/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" />
                            </svg>
                          )}
                          {t('applications.startConversation')}
                        </Button>
                      )}
                  </div>

                  {/* Accions de gestió d'estat (només club) */}
                  {currentUserRole === "club" && app.opportunity && (
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
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#1F2937] text-[#9CA3AF] hover:text-gray-100 hover:bg-[#1F2937] transition-colors disabled:opacity-50"
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
