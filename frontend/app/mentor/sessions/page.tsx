"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Session = {
  id: number;
  topic: string;
  message?: string | null;
  duration?: number | null;
  meeting_type?: string | null;
  meeting_link?: string | null;
  status: string;
  created_at?: string;
  mentee?: {
    id: number;
    name: string;
    email?: string;
    profile?: {
      profile_photo?: string | null;
      job_title?: string | null;
      company?: string | null;
    } | null;
  } | null;
  booked_slot?: {
    date?: string;
    start_time?: string;
    end_time?: string;
  } | null;
  bookedSlot?: {
    date?: string;
    start_time?: string;
    end_time?: string;
  } | null;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const filters = [
  { key: "all", label: "All Sessions" },
  { key: "approved", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function getSlot(session: Session) {
  return session.booked_slot ?? session.bookedSlot ?? null;
}

function parseDate(session: Session) {
  const slot = getSlot(session);

  if (!slot?.date || !slot.start_time) {
    return null;
  }

  const date = new Date(`${slot.date}T${slot.start_time}`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(session: Session) {
  const date = parseDate(session);

  if (!date) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value?: string) {
  return value ? value.slice(0, 5) : "--:--";
}

function resolveImageUrl(value?: string | null) {
  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/")) {
    return `http://127.0.0.1:8000${value}`;
  }

  return `http://127.0.0.1:8000/storage/${value.replace(/^storage\//, "")}`;
}

export default function MentorSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSessions = useCallback(async () => {
    const token = localStorage.getItem("auth_token") || "";

    if (!token) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/sessions?per_page=50`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.message || "Unable to load mentoring sessions.");
        return;
      }

      setSessions(data?.data ?? []);
    } catch {
      setError("Unable to connect to the Laravel backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...sessions]
      .filter((session) => {
        if (filter === "cancelled") {
          return ["cancelled", "rejected", "expired"].includes(session.status);
        }

        if (filter !== "all" && session.status !== filter) {
          return false;
        }

        if (!query) {
          return true;
        }

        return [session.topic, session.mentee?.name, session.mentee?.email]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort(
        (a, b) =>
          (parseDate(a)?.getTime() ?? 0) - (parseDate(b)?.getTime() ?? 0),
      );
  }, [filter, search, sessions]);

  const completeSession = async (session: Session) => {
    if (
      !window.confirm(
        `Mark the session with ${
          session.mentee?.name || "this mentee"
        } as completed?`,
      )
    ) {
      return;
    }

    const token = localStorage.getItem("auth_token") || "";

    if (!token) {
      return;
    }

    setActionLoading(session.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/sessions/${session.id}/complete`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.message || "Unable to complete session.");
        return;
      }

      setSuccess(data?.message || "Session marked as completed.");

      await loadSessions();
    } catch {
      setError("Unable to connect to the Laravel backend.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-7 xl:px-10">
      <section className="mentor-reveal rounded-[30px] border border-[#DCEAE7] bg-gradient-to-br from-[#EEF8F7] via-white to-[#F7F4EC] p-6 shadow-[0_15px_40px_rgba(62,141,139,0.05)] sm:p-8">
        <span className="inline-flex rounded-full bg-[#E6F4F3] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#377E7D]">
          Sessions
        </span>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#2C1E16]">
          Mentoring sessions
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500">
          Browse your mentoring history, upcoming appointments, and completed
          sessions.
        </p>
      </section>

      {success && (
        <div className="mentor-reveal mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">
          {success}
        </div>
      )}

      {error && (
        <div className="mentor-reveal mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <section
        className="mentor-reveal mt-6 rounded-[28px] border border-[#E2E1DD] bg-white p-3 shadow-[0_10px_30px_rgba(44,30,22,0.03)]"
        style={{ animationDelay: "100ms" }}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto">
            {filters.map((item) => {
              const active = filter === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={[
                    "flex-shrink-0 cursor-pointer rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all duration-300",
                    active
                      ? "bg-[#1E3F20] text-white shadow-md"
                      : "text-gray-500 hover:bg-[#F7F5EF]",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search mentee or topic..."
              className="w-full rounded-xl border border-[#E2DED5] bg-[#FCFBF8] px-4 py-2.5 text-xs font-semibold text-gray-700 outline-none transition focus:border-[#3E8D8B] focus:ring-4 focus:ring-[#3E8D8B]/10 lg:w-[280px]"
            />
          </div>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[28px] border border-[#E2E1DD] bg-white shadow-[0_10px_30px_rgba(44,30,22,0.035)]">
        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#DCEAE7] border-t-[#3E8D8B]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#377E7D]">
              <SessionIcon />
            </div>

            <h2 className="mt-5 text-xl font-extrabold text-[#2C1E16]">
              No sessions found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              There are no sessions matching your current filter or search.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0EEE8]">
            {filtered.map((session, index) => (
              <div
                key={session.id}
                className="mentor-reveal p-5 sm:p-6"
                style={{
                  animationDelay: `${150 + index * 60}ms`,
                }}
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#3E8D8B] text-sm font-extrabold text-white">
                      {session.mentee?.profile?.profile_photo ? (
                        <img
                          src={resolveImageUrl(
                            session.mentee.profile.profile_photo,
                          )}
                          alt={session.mentee.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        session.mentee?.name?.charAt(0).toUpperCase() || "M"
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-extrabold text-[#2C1E16]">
                          {session.mentee?.name || "Unknown mentee"}
                        </h2>

                        <StatusBadge status={session.status} />
                      </div>

                      <p className="mt-1 text-sm font-extrabold text-[#1E3F20]">
                        {session.topic}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-gray-400">
                        <span>{formatDate(session)}</span>

                        <span>
                          {formatTime(getSlot(session)?.start_time)} -{" "}
                          {formatTime(getSlot(session)?.end_time)} WITA
                        </span>

                        {session.duration && (
                          <span>{session.duration} min</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {session.status === "approved" && session.meeting_link && (
                      <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-[#D7E8E6] bg-[#EDF8F7] px-4 py-2.5 text-xs font-extrabold text-[#377E7D] transition hover:-translate-y-0.5 hover:bg-[#E1F3F1]"
                      >
                        Join Meeting
                      </a>
                    )}

                    {session.status === "approved" && (
                      <button
                        type="button"
                        onClick={() => completeSession(session)}
                        disabled={actionLoading === session.id}
                        className="cursor-pointer rounded-xl bg-[#1E3F20] px-4 py-2.5 text-xs font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#152E17] disabled:opacity-50"
                      >
                        {actionLoading === session.id
                          ? "Processing..."
                          : "Complete"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-[#FFF2D9] text-[#A76815]",
    approved: "bg-[#E5F4EB] text-[#2A8254]",
    completed: "bg-[#E8F0E8] text-[#1E3F20]",
    rejected: "bg-[#FBECE8] text-[#B95349]",
    cancelled: "bg-[#F2F1EE] text-gray-500",
    expired: "bg-[#F2F1EE] text-gray-500",
  };

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function SessionIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 21H16M12 19V21"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
