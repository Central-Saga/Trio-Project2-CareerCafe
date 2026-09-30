"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";

type Profile = {
  profile_photo?: string | null;
  job_title?: string | null;
  company?: string | null;
  location?: string | null;
  timezone?: string | null;
};

type Person = {
  id: number;
  name: string;
  email: string;
  profile?: Profile | null;
};

type BookedSlot = {
  id?: number;
  date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  status?: string | null;
};

type Feedback = {
  id?: number;
  rating?: number | null;
  comment?: string | null;
  created_at?: string | null;
};

type Session = {
  id: number;
  mentor_id: number;
  mentee_id: number;
  booked_slot_id?: number | null;
  topic: string;
  message?: string | null;
  duration?: number | null;
  meeting_type?: string | null;
  meeting_link?: string | null;
  meeting_location?: string | null;
  status: string;
  rejection_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  mentor?: Person | null;
  mentee?: Person | null;
  booked_slot?: BookedSlot | null;
  bookedSlot?: BookedSlot | null;
  feedback?: Feedback | null;
};

type Stats = {
  total: number;
  pending: number;
  approved: number;
  completed: number;
  cancelled: number;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  data?: Session[] | Session;
  stats?: Stats;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const EASE = [0.22, 1, 0.36, 1] as const;

const STATUS_TABS = [
  {
    key: "all",
    label: "All Sessions",
  },
  {
    key: "pending",
    label: "Pending",
  },
  {
    key: "approved",
    label: "Approved",
  },
  {
    key: "completed",
    label: "Completed",
  },
  {
    key: "cancelled",
    label: "Cancelled",
  },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]["key"];

function getSlot(session: Session): BookedSlot | null {
  return session.booked_slot ?? session.bookedSlot ?? null;
}

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

function getInitial(name?: string | null): string {
  return name?.trim().charAt(0).toUpperCase() || "U";
}

function formatStatus(status: string): string {
  switch (status.toLowerCase()) {
    case "pending":
      return "Pending";

    case "approved":
      return "Approved";

    case "completed":
      return "Completed";

    case "rejected":
      return "Rejected";

    case "cancelled":
      return "Cancelled";

    case "expired":
      return "Expired";

    default:
      return status
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : "Unknown";
  }
}

function isCancelledStatus(status: string): boolean {
  return ["cancelled", "rejected", "expired"].includes(
    status.toLowerCase(),
  );
}

function statusClass(status: string): string {
  switch (status.toLowerCase()) {
    case "pending":
      return "border-[#F1DCA8] bg-[#FFF6E4] text-[#AA6C1C]";

    case "approved":
      return "border-[#CDE4D1] bg-[#EDF7EF] text-[#4E7B56]";

    case "completed":
      return "border-[#CFE0F4] bg-[#EEF5FC] text-[#4E75A4]";

    case "rejected":
      return "border-[#F0D0CC] bg-[#FDF0EE] text-[#B35850]";

    case "cancelled":
    case "expired":
      return "border-[#E4E0DB] bg-[#F6F3EF] text-[#81776F]";

    default:
      return "border-[#E4E0DB] bg-[#F6F3EF] text-[#81776F]";
  }
}

function formatDate(date?: string | null): string {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatTime(time?: string | null): string {
  if (!time) {
    return "—";
  }

  return time.slice(0, 5);
}

function formatDateTime(date?: string | null): string {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function formatMeetingType(value?: string | null): string {
  if (!value) {
    return "—";
  }

  if (value.toLowerCase() === "online") {
    return "Online";
  }

  if (value.toLowerCase() === "offline") {
    return "Offline";
  }

  return value;
}

function getTimestamp(session: Session): number {
  const slot = getSlot(session);

  if (!slot?.date || !slot.start_time) {
    return 0;
  }

  const parsed = new Date(`${slot.date}T${slot.start_time}`);

  if (Number.isNaN(parsed.getTime())) {
    return 0;
  }

  return parsed.getTime();
}

export default function AdminSessionsPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    cancelled: 0,
  });

  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedSession, setSelectedSession] = useState<Session | null>(
    null,
  );
  const [detailLoading, setDetailLoading] = useState(false);

  const [completeTarget, setCompleteTarget] = useState<Session | null>(null);
  const [completing, setCompleting] = useState(false);

  const [success, setSuccess] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("user_role");
    const token = localStorage.getItem("auth_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (role !== "admin") {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const loadSessions = useCallback(
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

        const params = new URLSearchParams();

        params.set("per_page", "100");

        if (search) {
          params.set("search", search);
        }

        if (activeTab !== "all") {
          params.set(
            "status",
            activeTab === "cancelled" ? "cancelled" : activeTab,
          );
        }

        const response = await fetch(
          `${API_URL}/admin/sessions?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        if (response.status === 401) {
          localStorage.removeItem("auth_token");
          router.replace("/login");
          return;
        }

        const data = (await response.json().catch(() => null)) as
          | ApiResponse
          | null;

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.message || "Unable to load admin sessions.",
          );
        }

        const raw = data.data;

        setSessions(Array.isArray(raw) ? raw : []);
        setStats(
          data.stats ?? {
            total: 0,
            pending: 0,
            approved: 0,
            completed: 0,
            cancelled: 0,
          },
        );
      } catch (err) {
        setSessions([]);

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
    [activeTab, router, search],
  );

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const filteredSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const dateB = getTimestamp(b);
      const dateA = getTimestamp(a);

      if (dateB !== dateA) {
        return dateB - dateA;
      }

      return b.id - a.id;
    });
  }, [sessions]);

  const openDetails = async (session: Session) => {
    setSelectedSession(session);
    setDetailLoading(true);
    setError("");

    const token = localStorage.getItem("auth_token");

    if (!token) {
      setDetailLoading(false);
      router.replace("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/admin/sessions/${session.id}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        },
      );

      const data = (await response.json().catch(() => null)) as
        | ApiResponse
        | null;

      if (!response.ok || !data?.success || !data.data) {
        throw new Error(data?.message || "Unable to load session details.");
      }

      if (!Array.isArray(data.data)) {
        setSelectedSession(data.data);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load session details.",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!completeTarget) {
      return;
    }

    const token = localStorage.getItem("auth_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setCompleting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/admin/sessions/${completeTarget.id}/complete`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = (await response.json().catch(() => null)) as
        | ApiResponse
        | null;

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to complete the session.",
        );
      }

      setSuccess("Session berhasil ditandai sebagai selesai.");
      setCompleteTarget(null);

      if (selectedSession?.id === completeTarget.id) {
        setSelectedSession(
          Array.isArray(data.data) ? selectedSession : data.data ?? null,
        );
      }

      await loadSessions(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the Laravel backend.",
      );
    } finally {
      setCompleting(false);
    }
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (search) {
      count += 1;
    }

    if (activeTab !== "all") {
      count += 1;
    }

    return count;
  }, [activeTab, search]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#FFFDFC] px-5 pb-14 pt-7 text-[#302923] sm:px-7 lg:px-9 xl:px-10">
      <div className="mx-auto max-w-[1460px]">
        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
          animate={
            shouldReduceMotion ? undefined : { opacity: 1, y: 0 }
          }
          transition={{ duration: 0.7, ease: EASE }}
          className="relative overflow-hidden rounded-[30px] border border-[#E7E0DA] bg-gradient-to-br from-[#EDF5EF] via-white to-[#F5F0FB] p-6 shadow-[0_18px_45px_rgba(71,58,48,0.05)] sm:p-8"
        >
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/55 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 h-44 w-44 rounded-full bg-[#F0E7F8]/60 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#A19890]">
                Admin workspace
              </p>

              <h1 className="mt-2 text-[38px] font-black tracking-[-0.06em] text-[#302923] sm:text-[46px]">
                Sessions
              </h1>

              <p className="mt-2 max-w-2xl text-xs font-medium leading-6 text-[#938980]">
                Monitor mentoring sessions, review participants, check
                schedules, and keep track of session progress.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadSessions(true)}
              disabled={refreshing}
              className="group inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-[#DED8D2] bg-white px-4 py-3 text-[10px] font-black text-[#625950] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#CFC7BF] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshIcon
                className={
                  refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"
                }
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </motion.section>

        {success && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
            animate={
              shouldReduceMotion ? undefined : { opacity: 1, y: 0 }
            }
            transition={{ duration: 0.4, ease: EASE }}
            className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-[#CFE2D2] bg-[#F2F8F3] px-4 py-3 text-xs font-bold text-[#527359]"
          >
            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="cursor-pointer text-[#7C9A81] transition hover:text-[#3E6246]"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
            animate={
              shouldReduceMotion ? undefined : { opacity: 1, y: 0 }
            }
            transition={{ duration: 0.4, ease: EASE }}
            className="mt-4 rounded-2xl border border-[#F0D0CC] bg-[#FDF3F1] px-4 py-3 text-xs font-bold text-[#B25A52]"
          >
            {error}
          </motion.div>
        )}

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            icon={<GridIcon />}
            label="Total Sessions"
            value={stats.total}
            accent="green"
          />

          <StatCard
            icon={<ClockIcon />}
            label="Pending"
            value={stats.pending}
            accent="amber"
          />

          <StatCard
            icon={<CalendarIcon />}
            label="Approved"
            value={stats.approved}
            accent="blue"
          />

          <StatCard
            icon={<CheckIcon />}
            label="Completed"
            value={stats.completed}
            accent="teal"
          />

          <StatCard
            icon={<AlertIcon />}
            label="Cancelled / Rejected"
            value={stats.cancelled}
            accent="coral"
          />
        </section>

        <section className="mt-6 overflow-hidden rounded-[26px] border border-[#E7E0DA] bg-[#FBFAF8] shadow-[0_15px_40px_rgba(55,43,34,0.04)]">
          <div className="border-b border-[#ECE7E2] p-5 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A29A92]">
                  Session management
                </p>

                <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-[#342C26]">
                  All mentoring sessions
                </h2>
              </div>

              <div className="relative w-full max-w-md">
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A69C93]" />

                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search mentor, mentee, or topic..."
                  className="w-full rounded-xl border border-[#DED8D2] bg-white py-3 pl-10 pr-4 text-xs font-semibold text-[#3D332C] outline-none transition placeholder:text-[#B0A7A0] focus:border-[#B8C5B9] focus:ring-4 focus:ring-[#E9F0EA]"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1">
                {STATUS_TABS.map((tab) => {
                  const active = activeTab === tab.key;

                  const count =
                    tab.key === "all"
                      ? stats.total
                      : tab.key === "pending"
                        ? stats.pending
                        : tab.key === "approved"
                          ? stats.approved
                          : tab.key === "completed"
                            ? stats.completed
                            : stats.cancelled;

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={[
                        "flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2.5 text-[10px] font-black transition-all duration-300",
                        active
                          ? "bg-[#607E64] text-white shadow-[0_8px_20px_rgba(96,126,100,.16)]"
                          : "text-[#837971] hover:bg-white hover:text-[#55765B]",
                      ].join(" ")}
                    >
                      <span>{tab.label}</span>

                      <span
                        className={[
                          "rounded-full px-1.5 py-0.5 text-[8px]",
                          active
                            ? "bg-white/20 text-white"
                            : "bg-[#F1ECE6] text-[#958B83]",
                        ].join(" ")}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-[#F0ECE7] px-3 py-1.5 text-[9px] font-black text-[#827870]">
                    {activeFilterCount} filter
                    {activeFilterCount > 1 ? "s" : ""}
                  </span>
                )}

                <span className="text-[9px] font-bold text-[#AAA097]">
                  {filteredSessions.length} displayed
                </span>
              </div>
            </div>
          </div>

          {filteredSessions.length === 0 ? (
            <EmptySessions activeTab={activeTab} />
          ) : (
            <div className="divide-y divide-[#EEE9E4]">
              {filteredSessions.map((session, index) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  index={index}
                  onDetails={() => void openDetails(session)}
                  onComplete={() => setCompleteTarget(session)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          loading={detailLoading}
          onClose={() => setSelectedSession(null)}
          onComplete={() => {
            if (selectedSession.status === "approved") {
              setCompleteTarget(selectedSession);
            }
          }}
        />
      )}

      {completeTarget && (
        <CompleteModal
          session={completeTarget}
          submitting={completing}
          onClose={() => {
            if (!completing) {
              setCompleteTarget(null);
            }
          }}
          onConfirm={() => void handleComplete()}
        />
      )}
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: "green" | "amber" | "blue" | "teal" | "coral";
}) {
  const accents = {
    green: {
      icon: "bg-[#EAF2E8] text-[#55765B]",
      glow: "from-[#EFF7F0] to-white",
    },
    amber: {
      icon: "bg-[#FFF3DF] text-[#AD741F]",
      glow: "from-[#FFF9EE] to-white",
    },
    blue: {
      icon: "bg-[#EAF3FB] text-[#4F78A3]",
      glow: "from-[#F1F7FC] to-white",
    },
    teal: {
      icon: "bg-[#E8F5F1] text-[#4C8177]",
      glow: "from-[#F0FAF7] to-white",
    },
    coral: {
      icon: "bg-[#FBECE8] text-[#B85E55]",
      glow: "from-[#FDF4F2] to-white",
    },
  };

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: EASE }}
      className={[
        "rounded-[22px] border border-[#E7E0DA] bg-gradient-to-br p-4 shadow-sm transition-shadow duration-300 hover:shadow-md",
        accents[accent].glow,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={[
            "flex h-10 w-10 items-center justify-center rounded-xl",
            accents[accent].icon,
          ].join(" ")}
        >
          {icon}
        </span>

        <span className="text-[8px] font-black uppercase tracking-[0.12em] text-[#B0A69D]">
          Admin
        </span>
      </div>

      <p className="mt-4 text-[9px] font-black uppercase tracking-[0.14em] text-[#AAA097]">
        {label}
      </p>

      <p className="mt-1 text-3xl font-black tracking-[-0.05em] text-[#342C26]">
        {value}
      </p>
    </motion.article>
  );
}

function SessionRow({
  session,
  index,
  onDetails,
  onComplete,
}: {
  session: Session;
  index: number;
  onDetails: () => void;
  onComplete: () => void;
}) {
  const slot = getSlot(session);

  const mentorPhoto = session.mentor?.profile?.profile_photo
    ? resolveImageUrl(session.mentor.profile.profile_photo)
    : "";

  const menteePhoto = session.mentee?.profile?.profile_photo
    ? resolveImageUrl(session.mentee.profile.profile_photo)
    : "";

  const isApproved = session.status === "approved";

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.42,
        delay: Math.min(index * 0.035, 0.3),
        ease: EASE,
      }}
      className="group px-5 py-5 transition duration-300 hover:bg-white sm:px-6"
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex -space-x-3">
            <Avatar
              src={mentorPhoto}
              initial={getInitial(session.mentor?.name)}
              size="md"
            />

            <Avatar
              src={menteePhoto}
              initial={getInitial(session.mentee?.name)}
              size="md"
            />
          </div>

          <button
            type="button"
            onClick={onDetails}
            className="min-w-0 flex-1 cursor-pointer text-left"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[8px] font-black uppercase tracking-[0.16em] text-[#A49B93]">
                Session #{session.id}
              </span>

              <span
                className={[
                  "inline-flex rounded-full border px-2.5 py-1 text-[8px] font-black",
                  statusClass(session.status),
                ].join(" ")}
              >
                {formatStatus(session.status)}
              </span>
            </div>

            <h3 className="mt-2 line-clamp-1 text-base font-black tracking-[-0.025em] text-[#342C26] transition group-hover:text-[#55765B]">
              {session.topic || "Untitled session"}
            </h3>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[9px] font-semibold text-[#91877F]">
              <span>
                Mentor:{" "}
                <strong className="font-black text-[#665C54]">
                  {session.mentor?.name || "—"}
                </strong>
              </span>

              <span>
                Mentee:{" "}
                <strong className="font-black text-[#665C54]">
                  {session.mentee?.name || "—"}
                </strong>
              </span>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[9px] sm:grid-cols-4 xl:min-w-[470px]">
          <InfoMini
            label="Date"
            value={formatDate(slot?.date)}
          />

          <InfoMini
            label="Time"
            value={
              slot?.start_time
                ? `${formatTime(slot.start_time)} – ${formatTime(
                    slot.end_time,
                  )}`
                : "—"
            }
          />

          <InfoMini
            label="Duration"
            value={`${session.duration || 0} min`}
          />

          <InfoMini
            label="Type"
            value={formatMeetingType(session.meeting_type)}
          />
        </div>

        <div className="flex shrink-0 items-center gap-2 xl:justify-end">
          {isApproved && (
            <button
              type="button"
              onClick={onComplete}
              className="cursor-pointer rounded-xl bg-[#EAF4EC] px-3.5 py-2.5 text-[9px] font-black text-[#4E7755] transition duration-300 hover:-translate-y-0.5 hover:bg-[#DFF0E2]"
            >
              Mark completed
            </button>
          )}

          <button
            type="button"
            onClick={onDetails}
            className="cursor-pointer rounded-xl bg-[#F4F0EB] px-3.5 py-2.5 text-[9px] font-black text-[#746A62] transition duration-300 hover:bg-[#ECE7E1] hover:text-[#4F6F55]"
          >
            Details
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function InfoMini({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#EEE8E2] bg-[#FBF9F7] px-3 py-2.5">
      <p className="text-[7px] font-black uppercase tracking-[0.12em] text-[#B0A79E]">
        {label}
      </p>

      <p className="mt-1 line-clamp-1 text-[10px] font-black text-[#5B5149]">
        {value}
      </p>
    </div>
  );
}

function EmptySessions({
  activeTab,
}: {
  activeTab: StatusTab;
}) {
  const description =
    activeTab === "all"
      ? "Belum ada session yang tercatat."
      : `Belum ada session dengan status ${activeTab}.`;

  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#F0ECE7] text-[#68806B]">
        <CalendarIcon />
      </div>

      <h3 className="mt-4 text-xl font-black tracking-[-0.03em] text-[#382F29]">
        No sessions found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-xs font-medium leading-6 text-[#9A9189]">
        {description}
      </p>
    </div>
  );
}

function SessionDetailModal({
  session,
  loading,
  onClose,
  onComplete,
}: {
  session: Session;
  loading: boolean;
  onClose: () => void;
  onComplete: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  const slot = getSlot(session);

  const mentorPhoto = session.mentor?.profile?.profile_photo
    ? resolveImageUrl(session.mentor.profile.profile_photo)
    : "";

  const menteePhoto = session.mentee?.profile?.profile_photo
    ? resolveImageUrl(session.mentee.profile.profile_photo)
    : "";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-[#2C251F]/45 p-4 backdrop-blur-sm sm:p-6">
      <motion.div
        initial={
          shouldReduceMotion
            ? false
            : { opacity: 0, y: 18, scale: 0.98 }
        }
        animate={
          shouldReduceMotion
            ? undefined
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={{ duration: 0.45, ease: EASE }}
        className="my-auto w-full max-w-4xl overflow-hidden rounded-[30px] border border-[#E7E0DA] bg-[#FFFDFC] shadow-[0_30px_90px_rgba(44,37,31,0.18)]"
      >
        <div className="relative overflow-hidden border-b border-[#EAE4DE] bg-gradient-to-br from-[#EFF6F0] via-white to-[#F5EFFA] px-6 py-6 sm:px-8">
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/65 blur-2xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#A39A92]">
                Session detail
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#342C26]">
                {session.topic || "Untitled session"}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-[9px] font-bold text-[#A0978F]">
                  Session #{session.id}
                </span>

                <span
                  className={[
                    "inline-flex rounded-full border px-2.5 py-1 text-[8px] font-black",
                    statusClass(session.status),
                  ].join(" ")}
                >
                  {formatStatus(session.status)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#DED8D1] bg-white text-[#736961] transition hover:bg-[#F6F2EE]"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="max-h-[72vh] overflow-y-auto p-6 sm:p-8">
          {loading && (
            <div className="mb-5 rounded-2xl border border-[#EAE4DE] bg-[#FBF9F7] px-4 py-3 text-xs font-bold text-[#8E847C]">
              Loading latest session information...
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <PersonCard
              label="Mentor"
              person={session.mentor}
              photo={mentorPhoto}
            />

            <PersonCard
              label="Mentee"
              person={session.mentee}
              photo={menteePhoto}
            />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <DetailBox
              icon={<CalendarIcon />}
              label="Date"
              value={formatDate(slot?.date)}
            />

            <DetailBox
              icon={<ClockIcon />}
              label="Time"
              value={
                slot?.start_time
                  ? `${formatTime(slot.start_time)} – ${formatTime(
                      slot.end_time,
                    )}`
                  : "—"
              }
            />

            <DetailBox
              icon={<DurationIcon />}
              label="Duration"
              value={`${session.duration || 0} minutes`}
            />

            <DetailBox
              icon={<MonitorIcon />}
              label="Meeting type"
              value={formatMeetingType(session.meeting_type)}
            />

            {session.meeting_location && (
              <DetailBox
                icon={<MapPinIcon />}
                label="Location"
                value={session.meeting_location}
              />
            )}

            {session.meeting_link && (
              <DetailBox
                icon={<LinkIcon />}
                label="Meeting link"
                value={session.meeting_link}
              />
            )}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-[#E8E1DA] bg-white p-5">
              <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#A69B93]">
                Mentee message
              </p>

              <p className="mt-3 whitespace-pre-wrap text-xs font-medium leading-6 text-[#6F655D]">
                {session.message || "No message provided."}
              </p>
            </section>

            <section className="rounded-2xl border border-[#E8E1DA] bg-white p-5">
              <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#A69B93]">
                Rejection reason
              </p>

              <p className="mt-3 whitespace-pre-wrap text-xs font-medium leading-6 text-[#6F655D]">
                {session.rejection_reason ||
                  "No rejection reason recorded."}
              </p>
            </section>
          </div>

          <section className="mt-5 rounded-2xl border border-[#E8E1DA] bg-[#FBF9F7] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#A69B93]">
                  Feedback
                </p>

                <h3 className="mt-1 text-sm font-black text-[#40362F]">
                  Mentee feedback
                </h3>
              </div>

              {session.feedback?.rating ? (
                <span className="rounded-full bg-[#FFF4D9] px-3 py-1.5 text-[10px] font-black text-[#A87118]">
                  ★ {session.feedback.rating}/5
                </span>
              ) : (
                <span className="rounded-full bg-[#F0ECE7] px-3 py-1.5 text-[9px] font-black text-[#91867D]">
                  No rating
                </span>
              )}
            </div>

            <p className="mt-3 whitespace-pre-wrap text-xs font-medium leading-6 text-[#6F655D]">
              {session.feedback?.comment ||
                "Mentee belum memberikan feedback."}
            </p>
          </section>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <DetailBox
              icon={<ActivityIcon />}
              label="Created"
              value={formatDateTime(session.created_at)}
            />

            <DetailBox
              icon={<ActivityIcon />}
              label="Updated"
              value={formatDateTime(session.updated_at)}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#EAE4DE] bg-[#FBF9F7] px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-[#DDD6CF] bg-white px-4 py-2.5 text-[10px] font-black text-[#736960] transition hover:bg-[#F6F2EE]"
          >
            Close
          </button>

          {session.status === "approved" && (
            <button
              type="button"
              onClick={onComplete}
              className="cursor-pointer rounded-xl bg-[#607E64] px-5 py-2.5 text-[10px] font-black text-white shadow-[0_8px_20px_rgba(96,126,100,.14)] transition hover:-translate-y-0.5 hover:bg-[#557159]"
            >
              Mark as completed
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function PersonCard({
  label,
  person,
  photo,
}: {
  label: string;
  person?: Person | null;
  photo: string;
}) {
  return (
    <section className="rounded-2xl border border-[#E8E1DA] bg-white p-4">
      <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#A69B93]">
        {label}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <Avatar
          src={photo}
          initial={getInitial(person?.name)}
          size="lg"
        />

        <div className="min-w-0">
          <h3 className="truncate text-sm font-black text-[#3E352E]">
            {person?.name || "—"}
          </h3>

          <p className="mt-0.5 truncate text-[10px] font-semibold text-[#8F857D]">
            {person?.email || "—"}
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {person?.profile?.job_title && (
              <span className="rounded-full bg-[#F2EEE9] px-2 py-1 text-[8px] font-black text-[#7B7068]">
                {person.profile.job_title}
              </span>
            )}

            {person?.profile?.company && (
              <span className="rounded-full bg-[#EFF4F0] px-2 py-1 text-[8px] font-black text-[#59745F]">
                {person.profile.company}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E8E1DA] bg-white p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F1ECE7] text-[#677B6A]">
          {icon}
        </span>

        <div className="min-w-0">
          <p className="text-[8px] font-black uppercase tracking-[0.13em] text-[#A79D94]">
            {label}
          </p>

          <p className="mt-1 break-words text-xs font-black text-[#51473F]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function CompleteModal({
  session,
  submitting,
  onClose,
  onConfirm,
}: {
  session: Session;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#2C251F]/45 p-4 backdrop-blur-sm">
      <motion.div
        initial={
          shouldReduceMotion
            ? false
            : { opacity: 0, y: 16, scale: 0.98 }
        }
        animate={
          shouldReduceMotion
            ? undefined
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={{ duration: 0.35, ease: EASE }}
        className="w-full max-w-md rounded-[26px] border border-[#E6DFD9] bg-[#FFFDFC] p-6 shadow-[0_30px_70px_rgba(44,37,31,0.18)]"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF3EC] text-[#57765D]">
          <CheckIcon />
        </div>

        <h2 className="mt-5 text-xl font-black tracking-[-0.03em] text-[#342C26]">
          Mark session as completed?
        </h2>

        <p className="mt-2 text-xs font-medium leading-6 text-[#8F857D]">
          Session <strong className="font-black">#{session.id}</strong> with{" "}
          <strong className="font-black text-[#5B5149]">
            {session.mentee?.name || "this mentee"}
          </strong>{" "}
          will be marked as completed.
        </p>

        <div className="mt-4 rounded-2xl border border-[#ECE5DF] bg-[#FBF8F5] px-4 py-3">
          <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[#A39A92]">
            Topic
          </p>

          <p className="mt-1 text-xs font-black text-[#5D534B]">
            {session.topic || "Untitled session"}
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="cursor-pointer rounded-xl border border-[#DED7D0] bg-white px-4 py-2.5 text-[10px] font-black text-[#766C64] transition hover:bg-[#F7F3EF] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="cursor-pointer rounded-xl bg-[#607E64] px-5 py-2.5 text-[10px] font-black text-white shadow-[0_8px_20px_rgba(96,126,100,.15)] transition hover:-translate-y-0.5 hover:bg-[#557159] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Processing..." : "Confirm"}
          </button>
        </div>
      </motion.div>
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
          Loading admin sessions...
        </p>
      </div>
    </main>
  );
}

function Avatar({
  src,
  initial,
  size,
}: {
  src: string;
  initial: string;
  size: "md" | "lg";
}) {
  const dimensions =
    size === "lg"
      ? "h-14 w-14 rounded-2xl text-sm"
      : "h-11 w-11 rounded-xl text-xs";

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`${dimensions} shrink-0 border-2 border-white object-cover shadow-sm`}
      />
    );
  }

  return (
    <div
      className={`${dimensions} flex shrink-0 items-center justify-center border-2 border-white bg-[#EDE8E2] font-black text-[#6D625A] shadow-sm`}
    >
      {initial}
    </div>
  );
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M12 7V12L15 14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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

function CheckIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12.5L9.5 17L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
      <circle cx="12" cy="16.3" r="0.8" fill="currentColor" />
    </svg>
  );
}

function RefreshIcon({ className = "h-4 w-4" }: { className?: string }) {
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

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <circle cx="11" cy="11" r="6.8" />
      <path d="M16.2 16.2L21 21" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DurationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M12 7V12H15"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect
        x="3.5"
        y="4"
        width="17"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 20H16M12 16V20"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M19 10.5C19 15.2 12 20 12 20S5 15.2 5 10.5a7 7 0 1114 0Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle
        cx="12"
        cy="10.5"
        r="2.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M10.5 13.5L13.5 10.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M7.7 16.3H6.8a4.3 4.3 0 010-8.6h3.1a4.3 4.3 0 013.8 2.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M16.3 7.7h.9a4.3 4.3 0 010 8.6h-3.1a4.3 4.3 0 01-3.8-2.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 13h4l2-7 4 12 2-5h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
