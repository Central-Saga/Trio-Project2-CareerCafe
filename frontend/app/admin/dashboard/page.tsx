"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

type ApplicationStatus = "pending" | "approved" | "rejected";

type MentorApplication = {
  id: number;
  full_name: string;
  job_title: string;
  company?: string | null;
  location?: string | null;
  experience_years?: number | null;
  status: ApplicationStatus;
  created_at: string;
  user?: {
    id?: number;
    name?: string;
    email?: string;
    role?: string;
    status?: string;
  } | null;
  industry?: {
    id?: number;
    name?: string;
  } | null;
};

type Mentor = {
  id: number;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  profile?: {
    job_title?: string | null;
    company?: string | null;
    profile_photo?: string | null;
    avg_rating?: number | null;
    total_reviews?: number | null;
  } | null;
};

type BookedSlot = {
  id?: number;
  mentor_id?: number;
  date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  status?: string | null;
};

type SessionItem = {
  id: number;
  mentor_id?: number;
  mentee_id?: number;
  booked_slot_id?: number;

  status?: string | null;

  topic?: string | null;
  title?: string | null;
  message?: string | null;

  duration?: number | null;
  meeting_type?: string | null;
  meeting_link?: string | null;
  meeting_location?: string | null;

  scheduled_at?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  date?: string | null;
  created_at?: string | null;

  rejection_reason?: string | null;

  mentor?: {
    id?: number;
    name?: string | null;
    email?: string | null;
  } | null;

  mentee?: {
    id?: number;
    name?: string | null;
    email?: string | null;
  } | null;

  booked_slot?: BookedSlot | null;
  bookedSlot?: BookedSlot | null;

  feedback?: {
    id?: number;
    rating?: number | null;
    comment?: string | null;
    created_at?: string | null;
  } | null;
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T | { data?: T };
};

type DashboardStatProps = {
  label: string;
  value: number | string;
  helper: string;
  accent: string;
  icon: React.ReactNode;
};

function IconUsers({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M16 21V19C16 16.7909 14.2091 15 12 15H6C3.79086 15 2 16.7909 2 19V21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M22 21V19C22 17.2 20.82 15.68 19.18 15.15M16 3.13C17.73 3.57 19 5.14 19 7C19 8.86 17.73 10.43 16 10.87"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClock({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8.75"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 7.5V12L15 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCalendar({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="4.5"
        width="18"
        height="16"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7 2.75V6.25M17 2.75V6.25M3 9H21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M7.5 13H10M14 13H16.5M7.5 16.5H10M14 16.5H16.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCheck({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5 12.5L9.5 17L19 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconArrowUpRight({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7 17L17 7M9 7H17V15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconDocument({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7 3.75H14.5L19 8.25V19.25C19 20.35 18.1 21.25 17 21.25H7C5.9 21.25 5 20.35 5 19.25V5.75C5 4.65 5.9 3.75 7 3.75Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M14 4V8.5H18.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8 12H16M8 15.5H14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTrend({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 18L9 13L13 16L20 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 8H20V13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconRefresh({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20 11C19.5 6.5 15.7 3 11 3C6.03 3 2 7.03 2 12C2 16.97 6.03 21 11 21C14.33 21 17.24 19.19 18.5 16.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M20 4V11H13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;

  if (Array.isArray(record.data)) {
    return record.data as T[];
  }

  if (
    record.data &&
    typeof record.data === "object" &&
    Array.isArray((record.data as Record<string, unknown>).data)
  ) {
    return (record.data as Record<string, unknown>).data as T[];
  }

  return [];
}

function StatusBadge({ status }: { status?: string | null }) {
  const normalized = String(status || "").toLowerCase();

  const config: Record<
    string,
    {
      label: string;
      className: string;
    }
  > = {
    pending: {
      label: "Pending",
      className: "bg-amber-50 text-amber-700",
    },
    approved: {
      label: "Approved",
      className: "bg-emerald-50 text-emerald-700",
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-50 text-red-700",
    },
    completed: {
      label: "Completed",
      className: "bg-[#E8F0E8] text-[#1E3F20]",
    },
    scheduled: {
      label: "Scheduled",
      className: "bg-blue-50 text-blue-700",
    },
    upcoming: {
      label: "Upcoming",
      className: "bg-blue-50 text-blue-700",
    },
    ongoing: {
      label: "Ongoing",
      className: "bg-cyan-50 text-cyan-700",
    },
    confirmed: {
      label: "Confirmed",
      className: "bg-indigo-50 text-indigo-700",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-gray-100 text-gray-600",
    },
    canceled: {
      label: "Cancelled",
      className: "bg-gray-100 text-gray-600",
    },
    expired: {
      label: "Expired",
      className: "bg-gray-100 text-gray-600",
    },
  };

  const current = config[normalized] || {
    label: status || "Unknown",
    className: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold ${current.className}`}
    >
      {current.label}
    </span>
  );
}

function DashboardStat({
  label,
  value,
  helper,
  accent,
  icon,
}: DashboardStatProps) {
  return (
    <div
      className={[
        "group relative overflow-hidden rounded-3xl border border-[#E7E0D5] bg-white p-5",
        "shadow-sm transition-all duration-500",
        "hover:z-20 hover:-translate-y-1.5 hover:scale-[1.015] hover:shadow-xl",
      ].join(" ")}
    >
      <div className={`absolute left-0 top-0 h-full w-1 ${accent}`} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-gray-400">
            {label}
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-[#2C1E16] transition-transform duration-300 group-hover:scale-[1.03]">
            {value}
          </p>

          <p className="mt-2 text-xs font-semibold leading-5 text-gray-400">
            {helper}
          </p>
        </div>

        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#F8F6F1] text-[#1E3F20] transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110">
          {icon}
        </div>
      </div>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#F3EFE6]">
        <div
          className={`h-full w-2/3 rounded-full transition-all duration-700 group-hover:w-full ${accent}`}
        />
      </div>
    </div>
  );
}

function getBookedSlot(session: SessionItem) {
  return session.booked_slot ?? session.bookedSlot ?? null;
}

function getSessionDate(session: SessionItem): Date | null {
  const slot = getBookedSlot(session);

  if (slot?.date) {
    const time = slot.start_time || "00:00";
    const date = new Date(`${slot.date}T${time}`);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  const fallback =
    session.scheduled_at ||
    session.start_at ||
    session.date ||
    session.created_at ||
    null;

  if (!fallback) {
    return null;
  }

  const date = new Date(fallback);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getSessionDateKey(session: SessionItem) {
  const date = getBookedSlot(session)?.date;

  if (date) {
    return date;
  }

  const parsed = getSessionDate(session);

  if (!parsed) {
    return null;
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(session: SessionItem) {
  const date = getSessionDate(session);

  if (!date) {
    return "—";
  }

  const formattedDate = date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });

  const formattedTime = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${formattedDate} • ${formattedTime}`;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<MentorApplication[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(
    async (manual = false) => {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const role = localStorage.getItem("user_role");

      if (role && role !== "admin") {
        router.replace("/");
        return;
      }

      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const headers = {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [mentorsResponse, applicationsResponse, sessionsResponse] =
          await Promise.all([
            fetch(`${API_URL}/mentors?per_page=100`, {
              headers,
              cache: "no-store",
            }),

            fetch(`${API_URL}/admin/mentor-applications?per_page=100`, {
              headers,
              cache: "no-store",
            }),

            fetch(`${API_URL}/admin/sessions?per_page=100`, {
              headers,
              cache: "no-store",
            }),
          ]);

        if (
          mentorsResponse.status === 401 ||
          applicationsResponse.status === 401 ||
          sessionsResponse.status === 401
        ) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_name");
          localStorage.removeItem("user_role");

          router.replace("/login");
          return;
        }

        const mentorsData = (await mentorsResponse
          .json()
          .catch(() => null)) as ApiResponse<Mentor[]> | null;

        const applicationsData = (await applicationsResponse
          .json()
          .catch(() => null)) as ApiResponse<MentorApplication[]> | null;

        const sessionsData = (await sessionsResponse
          .json()
          .catch(() => null)) as ApiResponse<SessionItem[]> | null;

        if (mentorsResponse.ok) {
          setMentors(
            normalizeArray<Mentor>(mentorsData?.data ?? mentorsData ?? []),
          );
        } else {
          setMentors([]);
        }

        if (applicationsResponse.ok) {
          setApplications(
            normalizeArray<MentorApplication>(
              applicationsData?.data ?? applicationsData ?? [],
            ),
          );
        } else {
          setApplications([]);
        }

        if (sessionsResponse.ok) {
          setSessions(
            normalizeArray<SessionItem>(
              sessionsData?.data ?? sessionsData ?? [],
            ),
          );
        } else {
          setSessions([]);
        }

        const failedRequests = [
          !mentorsResponse.ok,
          !applicationsResponse.ok,
          !sessionsResponse.ok,
        ].filter(Boolean).length;

        if (failedRequests > 0) {
          setError(
            "Sebagian data dashboard belum dapat dimuat. Periksa koneksi backend Laravel.",
          );
        }
      } catch {
        setError(
          "Tidak dapat terhubung ke server. Pastikan backend Laravel sedang berjalan.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router],
  );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const activeMentors = useMemo(
    () =>
      mentors.filter(
        (mentor) => String(mentor.status || "").toLowerCase() === "active",
      ),
    [mentors],
  );

  const pendingApplications = useMemo(
    () =>
      applications.filter(
        (application) => String(application.status).toLowerCase() === "pending",
      ),
    [applications],
  );

  const approvedApplications = useMemo(
    () =>
      applications.filter(
        (application) =>
          String(application.status).toLowerCase() === "approved",
      ),
    [applications],
  );

  const rejectedApplications = useMemo(
    () =>
      applications.filter(
        (application) =>
          String(application.status).toLowerCase() === "rejected",
      ),
    [applications],
  );

  const completedSessions = useMemo(
    () =>
      sessions.filter((session) =>
        ["completed", "finished", "done"].includes(
          String(session.status || "").toLowerCase(),
        ),
      ),
    [sessions],
  );

  const activeSessions = useMemo(
    () =>
      sessions.filter((session) =>
        ["approved", "scheduled", "upcoming", "confirmed", "ongoing"].includes(
          String(session.status || "").toLowerCase(),
        ),
      ),
    [sessions],
  );

  const upcomingSessions = useMemo(() => {
    const now = new Date();

    return sessions
      .filter((session) => {
        const normalizedStatus = String(session.status || "").toLowerCase();

        if (
          ![
            "approved",
            "scheduled",
            "upcoming",
            "confirmed",
            "ongoing",
          ].includes(normalizedStatus)
        ) {
          return false;
        }

        const date = getSessionDate(session);

        if (!date) {
          return false;
        }

        return date.getTime() >= now.getTime();
      })
      .sort((a, b) => {
        const aTime = getSessionDate(a)?.getTime() ?? 0;
        const bTime = getSessionDate(b)?.getTime() ?? 0;

        return aTime - bTime;
      });
  }, [sessions]);

  const recentApplications = useMemo(
    () =>
      [...applications]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 5),
    [applications],
  );

  const recentSessions = useMemo(
    () =>
      [...sessions]
        .sort(
          (a, b) =>
            (getSessionDate(b)?.getTime() ?? 0) -
            (getSessionDate(a)?.getTime() ?? 0),
        )
        .slice(0, 5),
    [sessions],
  );

  const activityData = useMemo(() => {
    const days: {
      label: string;
      dateKey: string;
      value: number;
    }[] = [];

    const today = new Date();

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(today);

      date.setHours(0, 0, 0, 0);
      date.setDate(today.getDate() - i);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      const dateKey = `${year}-${month}-${day}`;

      const count = sessions.filter((session) => {
        const sessionDateKey = getSessionDateKey(session);

        return sessionDateKey === dateKey;
      }).length;

      days.push({
        label: date.toLocaleDateString("id-ID", {
          weekday: "short",
        }),
        dateKey,
        value: count,
      });
    }

    return days;
  }, [sessions]);

  const activityMax = Math.max(1, ...activityData.map((item) => item.value));

  const mentorCount = activeMentors.length;
  const pendingCount = pendingApplications.length;
  const activeSessionCount = activeSessions.length;
  const completedCount = completedSessions.length;

  return (
    <>
      <style jsx global>{`
        @keyframes adminDashboardFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes adminDashboardFadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes adminDashboardFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-4px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <main className="min-h-screen bg-[#FCFBF8] px-5 py-8 sm:px-7 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {/* PAGE HEADER */}

          <section
            className="overflow-hidden rounded-[30px] bg-[#1E3F20] px-6 py-7 text-white shadow-xl sm:px-8 sm:py-9 lg:px-10"
            style={{
              animation:
                "adminDashboardFadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            <div className="relative">
              <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-[#D8E4D8]/10 blur-3xl" />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/75 backdrop-blur-sm">
                    Admin Overview
                  </span>

                  <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                    Welcome to Career Cafe
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                    Pantau aktivitas platform, kelola pengajuan mentor, dan
                    lihat perkembangan sesi konsultasi dari satu dashboard.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void loadDashboard(true)}
                  disabled={refreshing}
                  className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-extrabold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className={refreshing ? "animate-spin" : ""}>
                    <IconRefresh />
                  </span>

                  {refreshing ? "Refreshing..." : "Refresh data"}
                </button>
              </div>
            </div>
          </section>

          {/* ERROR */}

          {error && (
            <div
              className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold leading-6 text-amber-800"
              style={{
                animation:
                  "adminDashboardFadeIn 450ms cubic-bezier(0.22, 1, 0.36, 1) both",
              }}
            >
              {error}
            </div>
          )}

          {/* STATS */}

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardStat
              label="Active Mentors"
              value={loading ? "—" : mentorCount}
              helper="Mentor aktif yang tersedia di platform"
              accent="bg-[#1E3F20]"
              icon={<IconUsers />}
            />

            <DashboardStat
              label="Pending Applications"
              value={loading ? "—" : pendingCount}
              helper="Pengajuan mentor yang perlu direview"
              accent="bg-[#D9A441]"
              icon={<IconDocument />}
            />

            <DashboardStat
              label="Active Sessions"
              value={loading ? "—" : activeSessionCount}
              helper="Sesi yang sudah disetujui atau sedang berjalan"
              accent="bg-[#4B8D84]"
              icon={<IconCalendar />}
            />

            <DashboardStat
              label="Completed Sessions"
              value={loading ? "—" : completedCount}
              helper="Sesi yang sudah selesai"
              accent="bg-[#6C5AA8]"
              icon={<IconCheck />}
            />
          </section>

          {/* ANALYTICS + PIPELINE */}

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.9fr)]">
            {/* ACTIVITY CHART */}

            <div
              className="rounded-3xl border border-[#E7E0D5] bg-white p-6 shadow-sm sm:p-7"
              style={{
                animation:
                  "adminDashboardFadeUp 650ms 100ms cubic-bezier(0.22, 1, 0.36, 1) both",
              }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#1E3F20]">
                    Platform Activity
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold text-[#2C1E16]">
                    Session activity
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Aktivitas sesi konsultasi dalam 7 hari terakhir.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full bg-[#F8F6F1] px-3 py-2 text-xs font-bold text-gray-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#1E3F20]" />
                  Sessions
                </div>
              </div>

              <div className="mt-8">
                {loading ? (
                  <div className="flex h-60 items-center justify-center">
                    <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#E7E0D3] border-t-[#1E3F20]" />
                  </div>
                ) : (
                  <div className="flex h-64 items-end gap-3 sm:gap-5">
                    {activityData.map((item, index) => {
                      const percentage =
                        item.value === 0
                          ? 6
                          : Math.max(12, (item.value / activityMax) * 100);

                      return (
                        <div
                          key={item.dateKey}
                          className="flex h-full flex-1 flex-col items-center justify-end"
                        >
                          <div className="mb-2 text-xs font-extrabold text-gray-400">
                            {item.value}
                          </div>

                          <div className="flex h-52 w-full items-end justify-center">
                            <div
                              className={[
                                "w-full max-w-[42px] rounded-t-2xl",
                                "bg-[#1E3F20] transition-all duration-700",
                                "hover:-translate-y-1 hover:scale-105",
                              ].join(" ")}
                              style={{
                                height: `${percentage}%`,
                                animation: `adminDashboardFadeUp 500ms ${
                                  index * 70
                                }ms cubic-bezier(0.22, 1, 0.36, 1) both`,
                                opacity: item.value === 0 ? 0.12 : 1,
                              }}
                              title={`${item.value} session`}
                            />
                          </div>

                          <div className="mt-3 text-[11px] font-bold text-gray-400">
                            {item.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* MENTOR PIPELINE */}

            <div
              className="rounded-3xl border border-[#E7E0D5] bg-white p-6 shadow-sm sm:p-7"
              style={{
                animation:
                  "adminDashboardFadeUp 650ms 180ms cubic-bezier(0.22, 1, 0.36, 1) both",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#8A5B08]">
                    Mentor Pipeline
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold text-[#2C1E16]">
                    Application status
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF4DD] text-[#8A5B08]">
                  <IconTrend />
                </div>
              </div>

              <div className="mt-7 space-y-5">
                <PipelineRow
                  label="Pending"
                  value={pendingApplications.length}
                  total={applications.length}
                  barClass="bg-[#D9A441]"
                />

                <PipelineRow
                  label="Approved"
                  value={approvedApplications.length}
                  total={applications.length}
                  barClass="bg-[#4D8E5B]"
                />

                <PipelineRow
                  label="Rejected"
                  value={rejectedApplications.length}
                  total={applications.length}
                  barClass="bg-[#C9645A]"
                />
              </div>

              <Link
                href="/admin/mentor-applications"
                className="mt-7 flex items-center justify-between rounded-2xl bg-[#F8F6F1] px-4 py-3.5 text-sm font-extrabold text-[#1E3F20] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F2EEE6]"
              >
                <span>Open application center</span>
                <IconArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {/* RECENT APPLICATIONS + UPCOMING SESSIONS */}

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.85fr)]">
            {/* APPLICATIONS */}

            <div
              className="overflow-hidden rounded-3xl border border-[#E7E0D5] bg-white shadow-sm"
              style={{
                animation:
                  "adminDashboardFadeUp 650ms 240ms cubic-bezier(0.22, 1, 0.36, 1) both",
              }}
            >
              <div className="flex flex-col gap-4 border-b border-[#F0ECE4] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#1E3F20]">
                    Mentor Review
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold text-[#2C1E16]">
                    Recent applications
                  </h2>
                </div>

                <Link
                  href="/admin/mentor-applications"
                  className="inline-flex items-center gap-1 text-sm font-extrabold text-[#1E3F20] transition-all duration-300 hover:translate-x-0.5"
                >
                  View all
                  <IconArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              {loading ? (
                <div className="flex min-h-[280px] items-center justify-center">
                  <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#E7E0D3] border-t-[#1E3F20]" />
                </div>
              ) : recentApplications.length === 0 ? (
                <EmptyState
                  title="No applications yet"
                  text="Belum ada pengajuan mentor yang masuk."
                />
              ) : (
                <div className="divide-y divide-[#F1EEE8]">
                  {recentApplications.map((application, index) => (
                    <Link
                      key={application.id}
                      href="/admin/mentor-applications"
                      className="group block px-6 py-5 transition-all duration-300 hover:bg-[#FCFBF8] sm:px-7"
                      style={{
                        animation: `adminDashboardFadeUp 450ms ${
                          300 + index * 70
                        }ms cubic-bezier(0.22, 1, 0.36, 1) both`,
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#E8F0E8] text-sm font-black text-[#1E3F20] transition-all duration-300 group-hover:scale-110">
                          {(
                            application.full_name ||
                            application.user?.name ||
                            "U"
                          )
                            .trim()
                            .charAt(0)
                            .toUpperCase() || "U"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-extrabold text-[#2C1E16]">
                              {application.full_name ||
                                application.user?.name ||
                                "Unknown user"}
                            </h3>

                            <StatusBadge status={application.status} />
                          </div>

                          <p className="mt-1 truncate text-xs font-bold text-[#1E3F20]">
                            {application.job_title || "Mentor applicant"}
                          </p>

                          <p className="mt-1 truncate text-xs text-gray-400">
                            {application.company || "Independent"}
                            {application.industry?.name
                              ? ` • ${application.industry.name}`
                              : ""}
                          </p>
                        </div>

                        <div className="hidden flex-shrink-0 text-right sm:block">
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-gray-300">
                            Submitted
                          </p>

                          <p className="mt-1 text-xs font-bold text-gray-500">
                            {formatDate(application.created_at)}
                          </p>
                        </div>

                        <IconArrowUpRight className="h-4 w-4 flex-shrink-0 text-gray-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#1E3F20]" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* UPCOMING SESSIONS */}

            <div
              className="overflow-hidden rounded-3xl border border-[#E7E0D5] bg-white shadow-sm"
              style={{
                animation:
                  "adminDashboardFadeUp 650ms 320ms cubic-bezier(0.22, 1, 0.36, 1) both",
              }}
            >
              <div className="border-b border-[#F0ECE4] px-6 py-5 sm:px-7">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#24766D]">
                  Schedule
                </p>

                <h2 className="mt-1 text-xl font-extrabold text-[#2C1E16]">
                  Upcoming sessions
                </h2>
              </div>

              {loading ? (
                <div className="flex min-h-[280px] items-center justify-center">
                  <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#E7E0D3] border-t-[#24766D]" />
                </div>
              ) : upcomingSessions.length === 0 ? (
                <EmptyState
                  title="No upcoming sessions"
                  text="Belum ada sesi yang terjadwal."
                />
              ) : (
                <div className="divide-y divide-[#F1EEE8]">
                  {upcomingSessions.slice(0, 5).map((session, index) => (
                    <div
                      key={session.id}
                      className="px-6 py-5 sm:px-7"
                      style={{
                        animation: `adminDashboardFadeUp 450ms ${
                          350 + index * 70
                        }ms cubic-bezier(0.22, 1, 0.36, 1) both`,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#E7F6F3] text-[#24766D]">
                          <IconCalendar className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="truncate text-sm font-extrabold text-[#2C1E16]">
                              {session.title ||
                                session.topic ||
                                "Consultation Session"}
                            </p>

                            <StatusBadge status={session.status} />
                          </div>

                          <p className="mt-1 truncate text-xs font-bold text-gray-400">
                            {session.mentor?.name || "Mentor"}
                            {" • "}
                            {session.mentee?.name || "Mentee"}
                          </p>

                          <p className="mt-2 text-xs font-bold text-[#24766D]">
                            {formatDateTime(session)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* PLATFORM RECENT SESSIONS */}

          <section
            className="mt-6 overflow-hidden rounded-3xl border border-[#E7E0D5] bg-white shadow-sm"
            style={{
              animation:
                "adminDashboardFadeUp 650ms 360ms cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            <div className="flex flex-col gap-4 border-b border-[#F0ECE4] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#4B8D84]">
                  Platform Sessions
                </p>

                <h2 className="mt-1 text-xl font-extrabold text-[#2C1E16]">
                  Recent session activity
                </h2>
              </div>

              <Link
                href="/admin/sessions"
                className="inline-flex items-center gap-1 text-sm font-extrabold text-[#24766D] transition-all duration-300 hover:translate-x-0.5"
              >
                View all
                <IconArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div className="flex min-h-[180px] items-center justify-center">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#E7E0D3] border-t-[#24766D]" />
              </div>
            ) : recentSessions.length === 0 ? (
              <EmptyState
                title="No sessions yet"
                text="Belum ada aktivitas sesi pada platform."
              />
            ) : (
              <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5">
                {recentSessions.map((session, index) => (
                  <Link
                    key={session.id}
                    href="/admin/sessions"
                    className="group rounded-2xl border border-[#ECE7DE] bg-[#FCFBF8] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#D6CEC2] hover:bg-white hover:shadow-md"
                    style={{
                      animation: `adminDashboardFadeUp 400ms ${
                        400 + index * 60
                      }ms cubic-bezier(0.22, 1, 0.36, 1) both`,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E7F6F3] text-[#24766D]">
                        <IconClock className="h-4 w-4" />
                      </span>

                      <StatusBadge status={session.status} />
                    </div>

                    <p className="mt-4 line-clamp-2 text-sm font-extrabold text-[#2C1E16]">
                      {session.title || session.topic || "Consultation Session"}
                    </p>

                    <p className="mt-2 truncate text-xs font-bold text-[#24766D]">
                      {session.mentor?.name || "Mentor"}
                    </p>

                    <p className="mt-1 truncate text-[10px] font-semibold text-gray-400">
                      {session.mentee?.name || "Mentee"}
                    </p>

                    <p className="mt-3 text-[10px] font-bold text-gray-400">
                      {formatDateTime(session)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* SUMMARY */}

          <section
            className="mt-6 grid gap-6 lg:grid-cols-3"
            style={{
              animation:
                "adminDashboardFadeUp 650ms 420ms cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            <SummaryCard
              eyebrow="Mentors"
              title="Mentor ecosystem"
              value={mentorCount}
              description="Jumlah mentor aktif yang tersedia di platform."
              icon={<IconUsers />}
              tone="green"
            />

            <SummaryCard
              eyebrow="Applications"
              title="Review queue"
              value={pendingCount}
              description="Pengajuan yang masih menunggu tindakan dari admin."
              icon={<IconDocument />}
              tone="amber"
            />

            <SummaryCard
              eyebrow="Sessions"
              title="Completed"
              value={completedCount}
              description="Total sesi yang terdeteksi berstatus completed."
              icon={<IconCheck />}
              tone="purple"
            />
          </section>

          {/* QUICK ACTIONS */}

          <section
            className="mt-6 rounded-3xl border border-[#E7E0D5] bg-white p-6 shadow-sm sm:p-7"
            style={{
              animation:
                "adminDashboardFadeUp 650ms 480ms cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-gray-400">
                Quick Actions
              </p>

              <h2 className="mt-1 text-xl font-extrabold text-[#2C1E16]">
                Common admin tasks
              </h2>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <QuickAction
                href="/admin/mentor-applications"
                title="Review Applications"
                description="Approve atau reject pengajuan mentor."
                icon={<IconDocument />}
                tone="amber"
              />

              <QuickAction
                href="/admin/mentors"
                title="Manage Mentors"
                description="Lihat dan kelola data mentor."
                icon={<IconUsers />}
                tone="blue"
              />

              <QuickAction
                href="/admin/sessions"
                title="Monitor Sessions"
                description="Pantau aktivitas seluruh sesi konsultasi."
                icon={<IconCalendar />}
                tone="teal"
              />

              <QuickAction
                href="/admin/reports"
                title="View Reports"
                description="Lihat ringkasan dan laporan platform."
                icon={<IconTrend />}
                tone="purple"
              />
            </div>
          </section>

          {/* FOOTER NOTE */}

          <div className="pb-8 pt-6 text-center">
            <p className="text-xs font-semibold text-gray-400">
              Career Cafe Admin Workspace
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

function PipelineRow({
  label,
  value,
  total,
  barClass,
}: {
  label: string;
  value: number;
  total: number;
  barClass: string;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold text-[#2C1E16]">{label}</p>

        <p className="text-sm font-black text-[#2C1E16]">{value}</p>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F1EEE8]">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barClass}`}
          style={{
            width: `${Math.max(percentage, value > 0 ? 8 : 0)}%`,
          }}
        />
      </div>

      <p className="mt-1 text-[11px] font-semibold text-gray-400">
        {percentage}% dari total applications
      </p>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F2EEE6] text-[#1E3F20]">
        <IconDocument className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-base font-extrabold text-[#2C1E16]">{title}</h3>

      <p className="mt-2 max-w-xs text-xs leading-5 text-gray-400">{text}</p>
    </div>
  );
}

function SummaryCard({
  eyebrow,
  title,
  value,
  description,
  icon,
  tone,
}: {
  eyebrow: string;
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  tone: "green" | "amber" | "purple";
}) {
  const toneMap = {
    green: {
      box: "bg-[#E8F0E8]",
      text: "text-[#1E3F20]",
    },
    amber: {
      box: "bg-[#FFF4DD]",
      text: "text-[#8A5B08]",
    },
    purple: {
      box: "bg-[#F1ECFF]",
      text: "text-[#6646A8]",
    },
  };

  const currentTone = toneMap[tone];

  return (
    <div className="group rounded-3xl border border-[#E7E0D5] bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-gray-400">
            {eyebrow}
          </p>

          <h3 className="mt-1 text-lg font-extrabold text-[#2C1E16]">
            {title}
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${currentTone.box} ${currentTone.text} transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-6 text-4xl font-black tracking-tight text-[#2C1E16]">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-gray-400">{description}</p>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
  icon,
  tone,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tone: "amber" | "blue" | "teal" | "purple";
}) {
  const toneMap = {
    amber: {
      icon: "bg-[#FFF4DD] text-[#8A5B08]",
    },
    blue: {
      icon: "bg-[#E9F2FF] text-[#25589B]",
    },
    teal: {
      icon: "bg-[#E7F6F3] text-[#24766D]",
    },
    purple: {
      icon: "bg-[#F1ECFF] text-[#6646A8]",
    },
  };

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-[#ECE7DE] bg-[#FCFBF8] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#D9D1C3] hover:bg-white hover:shadow-md"
    >
      <div
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${toneMap[tone].icon}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-[#2C1E16]">
          {title}
        </p>

        <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-400">
          {description}
        </p>
      </div>

      <IconArrowUpRight className="h-4 w-4 flex-shrink-0 text-gray-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#1E3F20]" />
    </Link>
  );
}
