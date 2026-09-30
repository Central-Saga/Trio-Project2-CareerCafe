"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";

type Summary = {
  total_mentors: number;
  active_mentors: number;
  total_mentees: number;
  active_mentees: number;
  total_sessions: number;
  pending_sessions: number;
  approved_sessions: number;
  completed_sessions: number;
  cancelled_sessions: number;
  total_applications: number;
  pending_applications: number;
  approved_applications: number;
  rejected_applications: number;
  total_feedback: number;
  average_rating: number;
  completion_rate: number;
  application_approval_rate: number;
};

type MonthlyTrend = {
  key: string;
  label: string;
  total: number;
  pending: number;
  approved: number;
  completed: number;
  cancelled: number;
};

type MentorActivity = {
  id: number;
  name: string;
  email: string;
  status: string;
  job_title?: string | null;
  company?: string | null;
  profile_photo?: string | null;
  avg_rating: number;
  total_reviews: number;
  sessions_count: number;
  completed_count: number;
  approved_count: number;
  pending_count: number;
};

type ReportData = {
  summary: Summary;
  session_status: Record<string, number>;
  application_status: Record<string, number>;
  monthly_trend: MonthlyTrend[];
  mentor_activity: MentorActivity[];
};

type ReportResponse = {
  success?: boolean;
  message?: string;
  data?: ReportData;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const EASE = [0.22, 1, 0.36, 1] as const;

function resolveImageUrl(value?: string | null): string {
  if (!value) {
    return "";
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return `http://127.0.0.1:8000${value}`;
  }

  if (value.startsWith("storage/")) {
    return `http://127.0.0.1:8000/${value}`;
  }

  return `http://127.0.0.1:8000/storage/${value}`;
}

function initials(name?: string | null): string {
  if (!name) {
    return "CC";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

function statusLabel(value: string): string {
  switch (value) {
    case "pending":
      return "Pending";
    case "approved":
      return "Approved";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "rejected":
      return "Rejected";
    case "expired":
      return "Expired";
    default:
      return value;
  }
}

function statusClass(value: string): string {
  switch (value) {
    case "pending":
      return "bg-[#FFF4DD] text-[#A76B1B] border-[#F0D39B]";

    case "approved":
      return "bg-[#EAF4EB] text-[#52745A] border-[#C9DFC8]";

    case "completed":
      return "bg-[#EEF4FC] text-[#52759E] border-[#D4E0F0]";

    case "cancelled":
    case "rejected":
      return "bg-[#FBEFEC] text-[#B05B53] border-[#EFD0CC]";

    case "expired":
      return "bg-[#F3F1EE] text-[#7F7770] border-[#E0DCD6]";

    default:
      return "bg-[#F4F0EC] text-[#756B63] border-[#E1DCD6]";
  }
}

export default function AdminReportsPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("user_role");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (role !== "admin") {
      router.replace("/");
    }
  }, [router]);

  const loadReport = useCallback(
    async (silent = false) => {
      const token = localStorage.getItem("auth_token");
      const role = localStorage.getItem("user_role");

      if (!token) {
        router.replace("/login");
        return;
      }

      if (role !== "admin") {
        router.replace("/");
        return;
      }

      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(`${API_URL}/admin/reports`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (response.status === 401) {
          localStorage.removeItem("auth_token");
          router.replace("/login");
          return;
        }

        const data = (await response.json().catch(() => null)) as
          | ReportResponse
          | null;

        if (!response.ok || !data?.success || !data.data) {
          throw new Error(
            data?.message || "Unable to load admin reports.",
          );
        }

        setReport(data.data);

        setLastUpdated(
          new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date()),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to connect to the Laravel backend.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router],
  );

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  const maxMonthlyTotal = useMemo(() => {
    if (!report?.monthly_trend.length) {
      return 1;
    }

    return Math.max(
      1,
      ...report.monthly_trend.map((item) => item.total),
    );
  }, [report]);

  const maxMentorSessions = useMemo(() => {
    if (!report?.mentor_activity.length) {
      return 1;
    }

    return Math.max(
      1,
      ...report.mentor_activity.map((item) => item.sessions_count),
    );
  }, [report]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!report) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[#FFFDFC] px-5 py-8 sm:px-7 lg:px-9 xl:px-10">
        <div className="mx-auto max-w-[1420px]">
          <div className="rounded-[28px] border border-[#E8E1DA] bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8ECE9] text-[#B35D54]">
              <AlertIcon />
            </div>

            <h1 className="mt-5 text-2xl font-black text-[#342C26]">
              Reports unavailable
            </h1>

            <p className="mx-auto mt-2 max-w-md text-xs font-medium leading-6 text-[#938980]">
              {error || "Unable to load report data."}
            </p>

            <button
              type="button"
              onClick={() => void loadReport()}
              className="mt-6 cursor-pointer rounded-xl bg-[#607E64] px-5 py-3 text-[10px] font-black text-white transition hover:-translate-y-0.5 hover:bg-[#55715A]"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const { summary } = report;

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#FFFDFC] px-5 pb-14 pt-7 text-[#302923] sm:px-7 lg:px-9 xl:px-10">
      <div className="mx-auto max-w-[1460px]">
        <motion.section
          initial={
            shouldReduceMotion
              ? false
              : { opacity: 0, y: 22 }
          }
          animate={
            shouldReduceMotion
              ? undefined
              : { opacity: 1, y: 0 }
          }
          transition={{ duration: 0.7, ease: EASE }}
          className="relative overflow-hidden rounded-[30px] border border-[#E7E0DA] bg-gradient-to-br from-[#F0F6F0] via-white to-[#F5F0FB] p-6 shadow-[0_18px_45px_rgba(71,58,48,0.05)] sm:p-8"
        >
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/60 blur-3xl" />
          <div className="absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-[#F0E7F8]/55 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#A19890]">
                Admin workspace
              </p>

              <h1 className="mt-2 text-[38px] font-black tracking-[-0.06em] text-[#302923] sm:text-[46px]">
                Reports
              </h1>

              <p className="mt-2 max-w-2xl text-xs font-medium leading-6 text-[#938980]">
                Monitor platform activity, session performance, mentor
                engagement, and application trends from one place.
              </p>

              {lastUpdated && (
                <p className="mt-3 text-[9px] font-bold text-[#AAA097]">
                  Last updated · {lastUpdated}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => void loadReport(true)}
              disabled={refreshing}
              className="group inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-[#DED8D2] bg-white px-4 py-3 text-[10px] font-black text-[#625950] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#CFC7BF] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshIcon
                className={
                  refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"
                }
              />
              {refreshing ? "Refreshing..." : "Refresh report"}
            </button>
          </div>
        </motion.section>

        {error && (
          <div className="mt-4 rounded-2xl border border-[#F0D0CC] bg-[#FDF3F1] px-4 py-3 text-xs font-bold text-[#B25A52]">
            {error}
          </div>
        )}

        {/* SUMMARY */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Active Mentors"
            value={summary.active_mentors}
            extra={`${summary.total_mentors} total mentors`}
            accent="green"
            icon={<MentorIcon />}
          />

          <MetricCard
            label="Active Mentees"
            value={summary.active_mentees}
            extra={`${summary.total_mentees} total mentees`}
            accent="lavender"
            icon={<UsersIcon />}
          />

          <MetricCard
            label="Total Sessions"
            value={summary.total_sessions}
            extra={`${summary.completed_sessions} completed`}
            accent="blue"
            icon={<CalendarIcon />}
          />

          <MetricCard
            label="Average Rating"
            value={summary.average_rating.toFixed(2)}
            extra={`${summary.total_feedback} feedback entries`}
            accent="amber"
            icon={<StarIcon />}
          />
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MiniMetric
            label="Pending sessions"
            value={summary.pending_sessions}
            accent="amber"
          />

          <MiniMetric
            label="Approved sessions"
            value={summary.approved_sessions}
            accent="blue"
          />

          <MiniMetric
            label="Completed sessions"
            value={summary.completed_sessions}
            accent="teal"
          />

          <MiniMetric
            label="Cancelled / rejected"
            value={summary.cancelled_sessions}
            accent="coral"
          />
        </section>

        {/* TREND + SESSION STATUS */}
        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)]">
          <section className="rounded-[26px] border border-[#E7E0DA] bg-white p-5 shadow-[0_15px_40px_rgba(55,43,34,0.04)] sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A29A92]">
                  Session trend
                </p>

                <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-[#342C26]">
                  Sessions over the last 6 months
                </h2>
              </div>

              <div className="rounded-full bg-[#F3EFEA] px-3 py-1.5 text-[9px] font-black text-[#7D746D]">
                Completion rate · {summary.completion_rate}%
              </div>
            </div>

            <div className="mt-8">
              <div className="flex h-[270px] items-end gap-3 overflow-x-auto pb-1">
                {report.monthly_trend.map((item) => {
                  const height =
                    item.total === 0
                      ? 6
                      : Math.max(
                          20,
                          (item.total / maxMonthlyTotal) * 215,
                        );

                  return (
                    <div
                      key={item.key}
                      className="flex min-w-[70px] flex-1 flex-col items-center justify-end gap-3"
                    >
                      <span className="text-[9px] font-black text-[#625950]">
                        {item.total}
                      </span>

                      <div
                        className="relative flex w-full max-w-[54px] items-end justify-center overflow-hidden rounded-t-2xl bg-[#EDF2ED]"
                        style={{
                          height: `${height}px`,
                        }}
                      >
                        <motion.div
                          initial={{
                            height: shouldReduceMotion ? height : 0,
                          }}
                          animate={{ height }}
                          transition={{
                            duration: 0.7,
                            ease: EASE,
                          }}
                          className="absolute bottom-0 w-full rounded-t-2xl bg-gradient-to-t from-[#607E64] to-[#96B19A]"
                        />
                      </div>

                      <span className="text-center text-[8px] font-black text-[#A0978F]">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <TrendLegend
                  label="Pending"
                  value={report.monthly_trend.reduce(
                    (sum, item) => sum + item.pending,
                    0,
                  )}
                  className="bg-[#FFF7E9] text-[#A8701E]"
                />

                <TrendLegend
                  label="Approved"
                  value={report.monthly_trend.reduce(
                    (sum, item) => sum + item.approved,
                    0,
                  )}
                  className="bg-[#EDF5EF] text-[#5A765F]"
                />

                <TrendLegend
                  label="Completed"
                  value={report.monthly_trend.reduce(
                    (sum, item) => sum + item.completed,
                    0,
                  )}
                  className="bg-[#EEF4FB] text-[#54749A]"
                />

                <TrendLegend
                  label="Cancelled"
                  value={report.monthly_trend.reduce(
                    (sum, item) => sum + item.cancelled,
                    0,
                  )}
                  className="bg-[#FCF0ED] text-[#B16258]"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[26px] border border-[#E7E0DA] bg-white p-5 shadow-[0_15px_40px_rgba(55,43,34,0.04)] sm:p-6">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A29A92]">
              Session distribution
            </p>

            <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-[#342C26]">
              Current status
            </h2>

            <div className="mt-6 space-y-4">
              {[
                "pending",
                "approved",
                "completed",
                "cancelled",
                "rejected",
                "expired",
              ].map((status) => {
                const value =
                  report.session_status[status] ?? 0;

                const percentage =
                  summary.total_sessions > 0
                    ? Math.round(
                        (value / summary.total_sessions) * 100,
                      )
                    : 0;

                return (
                  <div key={status}>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[10px] font-black text-[#6E645C]">
                        {statusLabel(status)}
                      </span>

                      <span className="text-[9px] font-black text-[#978D85]">
                        {formatNumber(value)} · {percentage}%
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F1ECE7]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${percentage}%`,
                        }}
                        transition={{
                          duration: 0.6,
                          ease: EASE,
                        }}
                        className={[
                          "h-full rounded-full",
                          status === "pending"
                            ? "bg-[#D9A14C]"
                            : status === "approved"
                              ? "bg-[#6D9274]"
                              : status === "completed"
                                ? "bg-[#6488AF]"
                                : status === "cancelled"
                                  ? "bg-[#CE8076]"
                                  : status === "rejected"
                                    ? "bg-[#D2948C]"
                                    : "bg-[#B1AAA4]",
                        ].join(" ")}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </section>

        {/* APPLICATION REPORT */}
        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[26px] border border-[#E7E0DA] bg-white p-5 shadow-[0_15px_40px_rgba(55,43,34,0.04)] sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A29A92]">
                  Mentor applications
                </p>

                <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-[#342C26]">
                  Application pipeline
                </h2>
              </div>

              <span className="rounded-full bg-[#EEF4EE] px-3 py-1.5 text-[9px] font-black text-[#5E7963]">
                Approval rate · {summary.application_approval_rate}%
              </span>
            </div>

            <div className="mt-7 space-y-5">
              {[
                {
                  key: "pending",
                  label: "Pending",
                  color: "bg-[#D9A14C]",
                },
                {
                  key: "approved",
                  label: "Approved",
                  color: "bg-[#6D9274]",
                },
                {
                  key: "rejected",
                  label: "Rejected",
                  color: "bg-[#CE8076]",
                },
              ].map((item) => {
                const value =
                  report.application_status[item.key] ?? 0;

                const percentage =
                  summary.total_applications > 0
                    ? Math.round(
                        (value / summary.total_applications) * 100,
                      )
                    : 0;

                return (
                  <div key={item.key}>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-black text-[#655B53]">
                        {item.label}
                      </span>

                      <span className="text-[10px] font-black text-[#978D85]">
                        {formatNumber(value)}
                      </span>
                    </div>

                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#F2EEE9]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${percentage}%`,
                        }}
                        transition={{
                          duration: 0.7,
                          ease: EASE,
                        }}
                        className={`h-full rounded-full ${item.color}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3">
              <ApplicationBox
                label="Total"
                value={summary.total_applications}
              />

              <ApplicationBox
                label="Pending"
                value={summary.pending_applications}
              />

              <ApplicationBox
                label="Approved"
                value={summary.approved_applications}
              />
            </div>
          </section>

          <section className="rounded-[26px] border border-[#E7E0DA] bg-gradient-to-br from-[#FFF8EC] via-white to-[#FCF2F0] p-5 shadow-[0_15px_40px_rgba(55,43,34,0.04)] sm:p-6">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A29A92]">
              Platform health
            </p>

            <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-[#342C26]">
              Key performance
            </h2>

            <div className="mt-7 space-y-4">
              <HealthMetric
                label="Session completion"
                value={summary.completion_rate}
                suffix="%"
                accent="green"
              />

              <HealthMetric
                label="Average mentor rating"
                value={summary.average_rating}
                suffix="/5"
                accent="amber"
              />

              <HealthMetric
                label="Mentor application approval"
                value={summary.application_approval_rate}
                suffix="%"
                accent="blue"
              />

              <HealthMetric
                label="Feedback coverage"
                value={
                  summary.completed_sessions > 0
                    ? Number(
                        (
                          (summary.total_feedback /
                            summary.completed_sessions) *
                          100
                        ).toFixed(1),
                      )
                    : 0
                }
                suffix="%"
                accent="coral"
              />
            </div>
          </section>
        </section>

        {/* TOP MENTORS */}
        <section className="mt-6 overflow-hidden rounded-[26px] border border-[#E7E0DA] bg-white shadow-[0_15px_40px_rgba(55,43,34,0.04)]">
          <div className="border-b border-[#ECE7E2] p-5 sm:p-6">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A29A92]">
              Mentor activity
            </p>

            <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-[#342C26]">
              Session activity by mentor
            </h2>

            <p className="mt-2 max-w-2xl text-xs font-medium leading-6 text-[#968C84]">
              Melihat jumlah sesi, sesi selesai, rating, dan aktivitas
              masing-masing mentor.
            </p>
          </div>

          {report.mentor_activity.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-black text-[#4B413A]">
                No mentor activity yet
              </p>

              <p className="mt-2 text-xs font-medium text-[#9A9189]">
                Data aktivitas mentor akan muncul ketika session mulai
                tercatat.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#EEE9E4]">
              {report.mentor_activity.map((mentor, index) => {
                const photo = mentor.profile_photo
                  ? resolveImageUrl(mentor.profile_photo)
                  : "";

                const progress =
                  mentor.sessions_count > 0
                    ? Math.max(
                        4,
                        (mentor.sessions_count /
                          maxMentorSessions) *
                          100,
                      )
                    : 4;

                return (
                  <motion.article
                    key={mentor.id}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.45,
                      delay: Math.min(index * 0.045, 0.35),
                      ease: EASE,
                    }}
                    className="px-5 py-5 transition duration-300 hover:bg-[#FCFBF9] sm:px-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                      <div className="flex min-w-0 flex-1 items-center gap-3.5">
                        <Avatar
                          src={photo}
                          fallback={initials(mentor.name)}
                        />

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-black text-[#3F352F]">
                              {mentor.name}
                            </h3>

                            <span className="rounded-full bg-[#F0F4EF] px-2.5 py-1 text-[8px] font-black text-[#5D765F]">
                              {mentor.status}
                            </span>
                          </div>

                          <p className="mt-1 truncate text-[9px] font-semibold text-[#958A82]">
                            {mentor.job_title || "Mentor"}
                            {mentor.company
                              ? ` · ${mentor.company}`
                              : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[8px] font-black uppercase tracking-[0.12em] text-[#ADA49C]">
                            Sessions
                          </span>

                          <span className="text-[10px] font-black text-[#554A42]">
                            {mentor.sessions_count}
                          </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F0ECE7]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${progress}%`,
                            }}
                            transition={{
                              duration: 0.65,
                              delay: Math.min(
                                index * 0.045,
                                0.35,
                              ),
                              ease: EASE,
                            }}
                            className="h-full rounded-full bg-[#718C76]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 lg:min-w-[330px]">
                        <MentorStat
                          label="Completed"
                          value={mentor.completed_count}
                        />

                        <MentorStat
                          label="Rating"
                          value={
                            mentor.avg_rating > 0
                              ? `★ ${mentor.avg_rating.toFixed(1)}`
                              : "—"
                          }
                        />

                        <MentorStat
                          label="Reviews"
                          value={mentor.total_reviews}
                        />
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  extra,
  accent,
  icon,
}: {
  label: string;
  value: number | string;
  extra: string;
  accent: "green" | "lavender" | "blue" | "amber";
  icon: React.ReactNode;
}) {
  const styles = {
    green: {
      box: "bg-[#EDF5EE] text-[#5D7A61]",
      gradient: "from-[#F2F8F2] to-white",
    },
    lavender: {
      box: "bg-[#F1ECF7] text-[#7E65A2]",
      gradient: "from-[#F7F3FB] to-white",
    },
    blue: {
      box: "bg-[#EBF3FA] text-[#587CA2]",
      gradient: "from-[#F2F7FC] to-white",
    },
    amber: {
      box: "bg-[#FFF3DF] text-[#AD741E]",
      gradient: "from-[#FFF9EE] to-white",
    },
  };

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: EASE }}
      className={`rounded-[22px] border border-[#E7E0DA] bg-gradient-to-br ${styles[accent].gradient} p-5 shadow-sm hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[accent].box}`}
        >
          {icon}
        </span>

        <span className="text-[8px] font-black uppercase tracking-[0.12em] text-[#B1A79F]">
          Report
        </span>
      </div>

      <p className="mt-5 text-[9px] font-black uppercase tracking-[0.14em] text-[#AAA097]">
        {label}
      </p>

      <p className="mt-1 text-3xl font-black tracking-[-0.05em] text-[#352D27]">
        {typeof value === "number"
          ? formatNumber(value)
          : value}
      </p>

      <p className="mt-1 text-[9px] font-bold text-[#938980]">
        {extra}
      </p>
    </motion.article>
  );
}

function MiniMetric({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "amber" | "blue" | "teal" | "coral";
}) {
  const styles = {
    amber:
      "border-[#F0DDBA] bg-[#FFFAF1] text-[#A7701F]",
    blue:
      "border-[#D6E2EF] bg-[#F7FAFD] text-[#5D7C9F]",
    teal:
      "border-[#D3E4DD] bg-[#F5FAF7] text-[#58816F]",
    coral:
      "border-[#F0D5D1] bg-[#FDF7F5] text-[#B7665C]",
  };

  return (
    <div
      className={`rounded-2xl border px-4 py-4 ${styles[accent]}`}
    >
      <p className="text-[8px] font-black uppercase tracking-[0.12em] opacity-70">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black tracking-[-0.04em]">
        {formatNumber(value)}
      </p>
    </div>
  );
}

function TrendLegend({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div
      className={`rounded-xl px-3 py-2.5 ${className}`}
    >
      <p className="text-[8px] font-black uppercase tracking-[0.11em] opacity-70">
        {label}
      </p>

      <p className="mt-1 text-sm font-black">
        {formatNumber(value)}
      </p>
    </div>
  );
}

function ApplicationBox({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-[#EBE5DE] bg-[#FBF9F7] px-4 py-3">
      <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[#A79D95]">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-[#4C423B]">
        {formatNumber(value)}
      </p>
    </div>
  );
}

function HealthMetric({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: number;
  suffix: string;
  accent: "green" | "amber" | "blue" | "coral";
}) {
  const colors = {
    green: {
      ring: "bg-[#EAF4EC]",
      text: "text-[#55745A]",
    },
    amber: {
      ring: "bg-[#FFF4DF]",
      text: "text-[#A9701B]",
    },
    blue: {
      ring: "bg-[#EBF3FB]",
      text: "text-[#55789F]",
    },
    coral: {
      ring: "bg-[#FCEDEA]",
      text: "text-[#B6635A]",
    },
  };

  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div className="flex items-center gap-4">
      <div
        className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${colors[accent].ring}`}
      >
        <svg
          className="absolute inset-0 h-16 w-16 -rotate-90"
          viewBox="0 0 36 36"
        >
          <path
            d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
            fill="none"
            stroke="rgba(120,110,100,.12)"
            strokeWidth="3.2"
          />

          <path
            d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
            fill="none"
            stroke="currentColor"
            className={colors[accent].text}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeDasharray={`${percentage}, 100`}
          />
        </svg>

        <span
          className={`relative text-[10px] font-black ${colors[accent].text}`}
        >
          {value}
          {suffix}
        </span>
      </div>

      <div>
        <p className="text-[10px] font-black text-[#554A42]">
          {label}
        </p>

        <p className="mt-1 text-[9px] font-semibold text-[#988E86]">
          Current platform indicator
        </p>
      </div>
    </div>
  );
}

function MentorStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-[#EDE7E1] bg-[#FBF9F7] px-3 py-2.5">
      <p className="text-[7px] font-black uppercase tracking-[0.11em] text-[#ACA29A]">
        {label}
      </p>

      <p className="mt-1 text-[11px] font-black text-[#5B5048]">
        {typeof value === "number"
          ? formatNumber(value)
          : value}
      </p>
    </div>
  );
}

function Avatar({
  src,
  fallback,
}: {
  src: string;
  fallback: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="h-12 w-12 shrink-0 rounded-2xl border-2 border-white object-cover shadow-sm"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-white bg-[#EDE8E2] text-[11px] font-black text-[#6B6159] shadow-sm">
      {fallback}
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#FFFDFC] px-6">
      <div className="flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF3ED]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D9E2D7] border-t-[#607E64]" />
        </div>

        <p className="mt-5 text-sm font-bold text-[#81766E]">
          Loading admin reports...
        </p>
      </div>
    </main>
  );
}

function RefreshIcon({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M20 11a8 8 0 10-2.34 5.66"
        strokeLinecap="round"
      />

      <path
        d="M20 5v6h-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MentorIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle
        cx="9"
        cy="8"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M3.5 19C4.3 15.7 6.1 14.2 9 14.2s4.7 1.5 5.5 4.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M16 7.5h4M18 5.5v4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle
        cx="9"
        cy="8"
        r="3.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M3.5 19c.7-3.1 2.5-4.6 5.5-4.6s4.8 1.5 5.5 4.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M16 8.5a2.7 2.7 0 10-2-4.6M16.5 14.7c2.1.4 3.4 1.8 4 4.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M7.5 3.5V7M16.5 3.5V7M3.5 9.5H20.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M8 13H11M13 13H16M8 16.5H11M13 16.5H16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3.8l2.55 5.17 5.7.83-4.12 4.02.97 5.68L12 16.82l-5.1 2.68.97-5.68-4.12-4.02 5.7-.83L12 3.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 4.5L20 19H4L12 4.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M12 9V13"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <circle
        cx="12"
        cy="16.3"
        r="0.8"
        fill="currentColor"
      />
    </svg>
  );
}
