"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

type MenteeProfile = {
  id?: number;
  user_id?: number;
  profile_photo?: string | null;
  cover_photo?: string | null;
  job_title?: string | null;
  company?: string | null;
  location?: string | null;
  experience_years?: number | null;
  education?: string | null;
  bio?: string | null;
  linkedin_url?: string | null;
  timezone?: string | null;
};

type Mentee = {
  id: number;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  status?: string | null;
  created_at?: string | null;
  profile?: MenteeProfile | null;

  total_sessions_count?: number;
  completed_sessions_count?: number;
  pending_sessions_count?: number;
  approved_sessions_count?: number;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
  pagination?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
};

/* =========================================================
   HELPERS
========================================================= */

function resolveImageUrl(value?: string | null) {
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

function getInitials(name?: string | null) {
  const normalized = name?.trim();

  if (!normalized) {
    return "M";
  }

  const parts = normalized.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(
    0,
  )}`.toUpperCase();
}

function getStatus(mentee: Mentee) {
  return mentee.status?.toLowerCase() === "inactive" ? "inactive" : "active";
}

function extractMentees(result: ApiResponse): Mentee[] {
  const raw = result.data;

  if (Array.isArray(raw)) {
    return raw.filter((item): item is Mentee =>
      Boolean(
        item &&
        typeof item === "object" &&
        "id" in item &&
        typeof (item as { id?: unknown }).id === "number",
      ),
    );
  }

  if (raw && typeof raw === "object" && "data" in raw) {
    const nested = (raw as { data?: unknown }).data;

    if (Array.isArray(nested)) {
      return nested.filter((item): item is Mentee =>
        Boolean(
          item &&
          typeof item === "object" &&
          "id" in item &&
          typeof (item as { id?: unknown }).id === "number",
        ),
      );
    }
  }

  return [];
}

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/* =========================================================
   ICONS
========================================================= */

function UsersIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M3.5 19C4.3 15.8 6.1 14.2 9 14.2C11.9 14.2 13.7 15.8 14.5 19"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M15.5 5.5C17.6 5.7 19 7 19 9C19 10.6 18.1 11.8 16.6 12.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M17 14.3C19 14.7 20.2 16 20.7 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
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
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M16 16L21 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RefreshIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 11A8 8 0 0 0 6.3 5.3L4 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 4.5V7.5H7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 13A8 8 0 0 0 17.7 18.7L20 16.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 19.5V16.5H17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 3V7M16 3V7M4 10H20"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M8 14H8.01M12 14H12.01M16 14H16.01M8 17H8.01M12 17H12.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12.5L9.5 17L19 7"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 7V12L15 14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MapPinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M19 10.2C19 15.2 12 20 12 20C12 20 5 15.2 5 10.2C5 6.7 8.13 4 12 4C15.87 4 19 6.7 19 10.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminMenteesPage() {
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);

  async function loadMentees(showRefresh = false) {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setError("Sesi admin tidak ditemukan.");
      setLoading(false);
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const params = new URLSearchParams();

      params.set("per_page", "100");

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const response = await fetch(
        `${API_URL}/admin/mentees?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        },
      );

      const result: ApiResponse = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_name");
        localStorage.removeItem("user_role");
        window.location.href = "/login";
        return;
      }

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Data mentee tidak dapat dimuat.");
      }

      setMentees(extractMentees(result));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memuat data mentee.",
      );

      setMentees([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("user_role");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (role !== "admin") {
      window.location.href = "/";
      return;
    }

    void loadMentees();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (
        typeof window !== "undefined" &&
        localStorage.getItem("auth_token") &&
        localStorage.getItem("user_role") === "admin"
      ) {
        void loadMentees(true);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search, statusFilter]);

  const activeCount = useMemo(
    () => mentees.filter((mentee) => getStatus(mentee) === "active").length,
    [mentees],
  );

  const inactiveCount = useMemo(
    () => mentees.filter((mentee) => getStatus(mentee) === "inactive").length,
    [mentees],
  );

  const totalSessions = useMemo(
    () =>
      mentees.reduce(
        (total, mentee) => total + Number(mentee.total_sessions_count ?? 0),
        0,
      ),
    [mentees],
  );

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#FCFBF8] px-4 pb-10 pt-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        {/* HEADER */}
        <section className="mentor-fade">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#8B6FB5]" />

                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#9A9087]">
                  Admin Workspace
                </p>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-[#302823] sm:text-[38px]">
                Mentees
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8A8178]">
                Kelola akun mentee dan pantau aktivitas konsultasi mereka di
                Career Cafe.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadMentees(true)}
              disabled={refreshing}
              className="group inline-flex w-fit cursor-pointer items-center gap-2 rounded-2xl border border-[#E6DED6] bg-white px-4 py-3 text-xs font-black text-[#514840] shadow-[0_8px_24px_rgba(44,30,22,.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D8CFC6] hover:shadow-[0_14px_30px_rgba(44,30,22,.07)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshIcon
                className={[
                  "h-4 w-4 transition-transform duration-500",
                  refreshing ? "animate-spin" : "group-hover:rotate-180",
                ].join(" ")}
              />

              {refreshing ? "Memuat..." : "Refresh"}
            </button>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Total Mentee"
            value={mentees.length}
            description="Mentee dari hasil filter"
            tone="lavender"
            icon={<UsersIcon />}
          />

          <StatCard
            label="Mentee Aktif"
            value={activeCount}
            description={`${inactiveCount} akun inactive`}
            tone="green"
            icon={<span className="h-2.5 w-2.5 rounded-full bg-[#1E3F20]" />}
          />

          <StatCard
            label="Total Sesi"
            value={totalSessions}
            description="Aktivitas sesi dari mentee"
            tone="blue"
            icon={<CalendarIcon />}
          />
        </section>

        {/* TOOLBAR */}
        <section className="mt-7 rounded-[24px] border border-[#E8E1DA] bg-white p-4 shadow-[0_10px_35px_rgba(44,30,22,.04)]">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A39A92]" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama, email, pekerjaan, perusahaan, lokasi..."
                className="h-11 w-full rounded-2xl border border-[#E9E2DC] bg-[#FCFBF8] pl-11 pr-4 text-xs font-semibold text-[#3E352F] outline-none transition-all duration-200 placeholder:text-[#AAA19A] focus:border-[#CFC0DC] focus:bg-white focus:ring-4 focus:ring-[#F0E9F8]"
              />
            </div>

            <div className="flex items-center gap-2">
              {(
                [
                  ["all", "Semua"],
                  ["active", "Aktif"],
                  ["inactive", "Inactive"],
                ] as const
              ).map(([value, label]) => {
                const active = statusFilter === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value)}
                    className={[
                      "cursor-pointer rounded-xl px-3.5 py-2.5 text-[10px] font-black transition-all duration-200",
                      active
                        ? "bg-[#F0E9F8] text-[#76559A] shadow-sm"
                        : "bg-[#F8F5F1] text-[#8B8178] hover:bg-[#F2EEE9] hover:text-[#554B44]",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 px-1">
            <p className="text-[10px] font-semibold text-[#A09890]">
              Menampilkan{" "}
              <span className="font-black text-[#554B44]">
                {mentees.length}
              </span>{" "}
              mentee
            </p>

            {(search || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="cursor-pointer text-[10px] font-black text-[#8063A0] transition hover:text-[#634580]"
              >
                Reset filter
              </button>
            )}
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <section className="mt-5 rounded-[22px] border border-[#F0D6D1] bg-[#FFF8F6] px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black text-[#A9554C]">
                  Gagal memuat mentee
                </p>

                <p className="mt-1 text-[11px] leading-5 text-[#A57972]">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadMentees()}
                className="cursor-pointer rounded-xl bg-[#A9554C] px-4 py-2.5 text-[10px] font-black text-white transition hover:bg-[#93473F]"
              >
                Coba Lagi
              </button>
            </div>
          </section>
        )}

        {/* CONTENT */}
        <section className="mt-6">
          {loading ? (
            <LoadingGrid />
          ) : mentees.length === 0 ? (
            <EmptyState
              onReset={() => {
                setSearch("");
                setStatusFilter("all");
              }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {mentees.map((mentee, index) => (
                <MenteeCard
                  key={mentee.id}
                  mentee={mentee}
                  index={index}
                  onOpen={() => setSelectedMentee(mentee)}
                />
              ))}
            </div>
          )}
        </section>

        {/* DETAIL MODAL */}
        {selectedMentee && (
          <MenteeDetailModal
            mentee={selectedMentee}
            onClose={() => setSelectedMentee(null)}
          />
        )}
      </div>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        @keyframes menteeFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.994);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes menteeFadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes menteeScaleIn {
          from {
            opacity: 0;
            transform: scale(0.97);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .mentor-fade {
          animation: menteeFadeIn 0.6s ease-out both;
        }

        .mentee-card {
          animation: menteeFadeUp 0.72s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .mentee-modal {
          animation: menteeScaleIn 0.38s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        ::selection {
          background: rgba(139, 111, 181, 0.18);
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  description,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  tone: "lavender" | "green" | "blue";
}) {
  const styles = {
    lavender: {
      wrapper: "border-[#E8E0F0] bg-[#FEFCFF]",
      icon: "bg-[#F0E9F8] text-[#76559A]",
    },
    green: {
      wrapper: "border-[#E3EBE1] bg-[#FCFEFC]",
      icon: "bg-[#E8F0E7] text-[#315F34]",
    },
    blue: {
      wrapper: "border-[#E4EBF3] bg-[#FBFDFF]",
      icon: "bg-[#EAF0F7] text-[#557393]",
    },
  };

  return (
    <div
      className={[
        "group rounded-[22px] border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(44,30,22,.06)]",
        styles[tone].wrapper,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#9B928A]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-[#332A24]">
            {value}
          </p>

          <p className="mt-1 text-[10px] font-semibold text-[#9A9189]">
            {description}
          </p>
        </div>

        <span
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] transition-transform duration-300 group-hover:scale-105",
            styles[tone].icon,
          ].join(" ")}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   MENTEE CARD
========================================================= */

function MenteeCard({
  mentee,
  index,
  onOpen,
}: {
  mentee: Mentee;
  index: number;
  onOpen: () => void;
}) {
  const image = resolveImageUrl(mentee.profile?.profile_photo);
  const initials = getInitials(mentee.name);
  const status = getStatus(mentee);

  const totalSessions = Number(mentee.total_sessions_count ?? 0);
  const completedSessions = Number(mentee.completed_sessions_count ?? 0);
  const pendingSessions = Number(mentee.pending_sessions_count ?? 0);

  return (
    <article
      className="mentee-card group overflow-hidden rounded-[24px] border border-[#E8E1DA] bg-white shadow-[0_8px_26px_rgba(44,30,22,.035)] transition-all duration-500 hover:-translate-y-1 hover:border-[#DDD4CB] hover:shadow-[0_20px_44px_rgba(44,30,22,.08)]"
      style={{
        animationDelay: `${index * 55}ms`,
      }}
    >
      <div className="flex flex-col p-5 sm:p-6">
        {/* TOP */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[16px] bg-[#F0E9F8]">
              {image ? (
                <img
                  src={image}
                  alt={mentee.name || "Mentee"}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-black text-[#76559A]">
                  {initials}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-base font-black text-[#302823]">
                  {mentee.name || "Mentee Tanpa Nama"}
                </h2>

                <span
                  className={[
                    "hidden shrink-0 rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-[0.08em] sm:inline-flex",
                    status === "active"
                      ? "bg-[#E8F0E7] text-[#37643B]"
                      : "bg-[#F8E9E5] text-[#B55F55]",
                  ].join(" ")}
                >
                  {status === "active" ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="mt-1 truncate text-[10px] font-semibold text-[#827870]">
                {mentee.email || "Email belum tersedia"}
              </p>

              <p className="mt-1 text-[9px] font-semibold text-[#AAA098]">
                Bergabung {formatDate(mentee.created_at)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpen}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[#F7F4F0] text-[#81776E] transition-all duration-300 hover:scale-105 hover:bg-[#F0E9F8] hover:text-[#76559A]"
            title="Lihat detail mentee"
          >
            <span className="text-[10px] font-black">•••</span>
          </button>
        </div>

        {/* PROFILE DATA */}
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <MiniInfo
            label="Job"
            value={mentee.profile?.job_title || "Belum diisi"}
          />

          <MiniInfo
            label="Company"
            value={mentee.profile?.company || "Belum diisi"}
          />

          <MiniInfo
            label="Location"
            value={mentee.profile?.location || "Belum diisi"}
          />

          <MiniInfo
            label="Education"
            value={mentee.profile?.education || "Belum diisi"}
          />
        </div>

        {/* SESSION STATS */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <SessionStat
            icon={<CalendarIcon />}
            value={totalSessions}
            label="Sessions"
          />

          <SessionStat
            icon={<CheckIcon />}
            value={completedSessions}
            label="Completed"
          />

          <SessionStat
            icon={<ClockIcon />}
            value={pendingSessions}
            label="Pending"
          />
        </div>

        {/* FOOTER */}
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#F0EBE6] pt-4">
          <span className="text-[9px] font-semibold text-[#A09890]">
            Mentee ID #{mentee.id}
          </span>

          <button
            type="button"
            onClick={onOpen}
            className="cursor-pointer text-[9px] font-black text-[#7A5CA7] transition-all hover:translate-x-0.5 hover:text-[#5F4383]"
          >
            Lihat Detail →
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   MINI INFO
========================================================= */

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#EEE8E2] bg-[#FCFAF8] px-3.5 py-3">
      <p className="text-[8px] font-black uppercase tracking-[0.08em] text-[#9A9189]">
        {label}
      </p>

      <p className="mt-1 truncate text-[10px] font-black text-[#514840]">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   SESSION STAT
========================================================= */

function SessionStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-[#FCFAF8] px-3 py-3 text-center">
      <div className="flex items-center justify-center text-[#8C8178]">
        {icon}
      </div>

      <p className="mt-1 text-sm font-black text-[#514840]">{value}</p>

      <p className="text-[8px] font-black uppercase tracking-[0.08em] text-[#A49A92]">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[24px] border border-[#E9E2DB] bg-white p-6"
        >
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 animate-pulse rounded-[16px] bg-[#EEE9E4]" />

            <div className="flex-1">
              <div className="h-4 w-40 animate-pulse rounded bg-[#EEE9E4]" />

              <div className="mt-2 h-3 w-52 animate-pulse rounded bg-[#F2EEEA]" />

              <div className="mt-2 h-2.5 w-28 animate-pulse rounded bg-[#F5F2EE]" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="h-14 animate-pulse rounded-2xl bg-[#F6F3F0]" />
            <div className="h-14 animate-pulse rounded-2xl bg-[#F6F3F0]" />
            <div className="h-14 animate-pulse rounded-2xl bg-[#F6F3F0]" />
            <div className="h-14 animate-pulse rounded-2xl bg-[#F6F3F0]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-[28px] border border-[#E8E1DA] bg-white px-6 py-16 text-center shadow-[0_10px_35px_rgba(44,30,22,.035)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0E9F8] text-[#76559A]">
        <SearchIcon className="h-6 w-6" />
      </div>

      <h3 className="mt-5 text-base font-black text-[#3A302A]">
        Mentee tidak ditemukan
      </h3>

      <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-[#978D84]">
        Tidak ada mentee yang cocok dengan pencarian atau filter yang sedang
        digunakan.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-5 cursor-pointer rounded-xl bg-[#76559A] px-4 py-2.5 text-[10px] font-black text-white transition hover:bg-[#624582]"
      >
        Reset Filter
      </button>
    </div>
  );
}

/* =========================================================
   DETAIL MODAL
========================================================= */

function MenteeDetailModal({
  mentee,
  onClose,
}: {
  mentee: Mentee;
  onClose: () => void;
}) {
  const image = resolveImageUrl(mentee.profile?.profile_photo);
  const initials = getInitials(mentee.name);

  const status = getStatus(mentee);

  const totalSessions = Number(mentee.total_sessions_count ?? 0);
  const completedSessions = Number(mentee.completed_sessions_count ?? 0);
  const pendingSessions = Number(mentee.pending_sessions_count ?? 0);
  const approvedSessions = Number(mentee.approved_sessions_count ?? 0);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#2C1E16]/35 p-0 backdrop-blur-[3px] sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="mentee-modal max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-t-[28px] border border-[#E6DED6] bg-white shadow-[0_30px_90px_rgba(44,30,22,.2)] sm:rounded-[28px]">
        <div className="max-h-[92vh] overflow-y-auto">
          {/* HEADER */}
          <div className="sticky top-0 z-10 border-b border-[#EEE8E2] bg-white/95 px-5 py-4 backdrop-blur-sm sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.17em] text-[#A19890]">
                  Mentee Profile
                </p>

                <h2 className="mt-1 text-base font-black text-[#302823]">
                  Detail Mentee
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-[#F7F4F0] text-[#7E756D] transition hover:bg-[#EEE9E4] hover:text-[#463D37]"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {/* PROFILE HERO */}
            <div className="overflow-hidden rounded-[24px] border border-[#E7E0D9] bg-[#FCFAF7]">
              <div className="relative h-36 overflow-hidden bg-[#F0E9F8] sm:h-44">
                {mentee.profile?.cover_photo ? (
                  <img
                    src={resolveImageUrl(mentee.profile.cover_photo)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#F0E9F8] via-[#F4EEE7] to-[#E9F0E7]" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#2C1E16]/25 to-transparent" />

                <span
                  className={[
                    "absolute right-4 top-4 rounded-full px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.1em]",
                    status === "active"
                      ? "bg-[#E8F0E7] text-[#37643B]"
                      : "bg-[#F8E9E5] text-[#B55F55]",
                  ].join(" ")}
                >
                  {status === "active" ? "Active" : "Inactive"}
                </span>

                <div className="absolute bottom-[-1px] left-5 h-20 w-20 overflow-hidden rounded-[20px] border-4 border-white bg-[#F0E9F8] shadow-md sm:left-6 sm:h-24 sm:w-24">
                  {image ? (
                    <img
                      src={image}
                      alt={mentee.name || "Mentee"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-black text-[#76559A]">
                      {initials}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-5 pb-5 pt-7 sm:px-6 sm:pb-6">
                <h3 className="text-xl font-black tracking-tight text-[#302823]">
                  {mentee.name || "Mentee Tanpa Nama"}
                </h3>

                <p className="mt-1 text-sm font-bold text-[#71675F]">
                  {mentee.email || "Email belum tersedia"}
                </p>

                <p className="mt-1 text-xs font-semibold text-[#A0978E]">
                  Mentee ID #{mentee.id}
                </p>
              </div>
            </div>

            {/* SESSION SUMMARY */}
            <section className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <DetailStat label="Total" value={totalSessions} tone="lavender" />

              <DetailStat
                label="Approved"
                value={approvedSessions}
                tone="blue"
              />

              <DetailStat
                label="Pending"
                value={pendingSessions}
                tone="amber"
              />

              <DetailStat
                label="Completed"
                value={completedSessions}
                tone="green"
              />
            </section>

            {/* PERSONAL INFO */}
            <section className="mt-5 rounded-[22px] border border-[#E8E1DA] bg-white p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#A19890]">
                Personal & Career
              </p>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <DetailInfo
                  label="Job Title"
                  value={mentee.profile?.job_title || "—"}
                />

                <DetailInfo
                  label="Company"
                  value={mentee.profile?.company || "—"}
                />

                <DetailInfo
                  label="Location"
                  value={mentee.profile?.location || "—"}
                />

                <DetailInfo
                  label="Education"
                  value={mentee.profile?.education || "—"}
                />

                <DetailInfo
                  label="Experience"
                  value={
                    mentee.profile?.experience_years !== null &&
                    mentee.profile?.experience_years !== undefined
                      ? `${mentee.profile.experience_years} tahun`
                      : "—"
                  }
                />

                <DetailInfo
                  label="Timezone"
                  value={mentee.profile?.timezone || "—"}
                />
              </div>
            </section>

            {/* BIO */}
            <section className="mt-4 rounded-[22px] border border-[#E8E1DA] bg-white p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#A19890]">
                Bio
              </p>

              <p className="mt-3 text-xs leading-6 text-[#6F655D]">
                {mentee.profile?.bio?.trim() ||
                  "Mentee belum menambahkan bio profesional."}
              </p>
            </section>

            {/* META */}
            <section className="mt-4 rounded-[22px] border border-[#E8E1DA] bg-[#FCFAF8] p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailInfo
                  label="Account Status"
                  value={status === "active" ? "Active" : "Inactive"}
                />

                <DetailInfo
                  label="Joined"
                  value={formatDate(mentee.created_at)}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL STAT
========================================================= */

function DetailStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "lavender" | "blue" | "amber" | "green";
}) {
  const styles = {
    lavender: "bg-[#F0E9F8] text-[#76559A]",
    blue: "bg-[#EAF0F7] text-[#557393]",
    amber: "bg-[#FFF0D4] text-[#B76C19]",
    green: "bg-[#E8F0E7] text-[#37643B]",
  };

  return (
    <div
      className={["rounded-[20px] px-4 py-4 text-center", styles[tone]].join(
        " ",
      )}
    >
      <p className="text-lg font-black">{value}</p>

      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.1em] opacity-75">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   DETAIL INFO
========================================================= */

function DetailInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#EEE8E2] bg-[#FCFAF8] px-3.5 py-3">
      <p className="text-[8px] font-black uppercase tracking-[0.08em] text-[#9A9189]">
        {label}
      </p>

      <p className="mt-1.5 break-words text-[10px] font-black text-[#514840]">
        {value}
      </p>
    </div>
  );
}
