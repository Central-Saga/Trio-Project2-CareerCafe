"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

type Skill = {
  id?: number;
  name?: string | null;
};

type Industry = {
  id?: number;
  name?: string | null;
};

type MentorProfile = {
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
  avg_rating?: number | string | null;
  total_reviews?: number | null;
  industry?: Industry | null;
};

type Mentor = {
  id: number;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  status?: string | null;
  profile?: MentorProfile | null;
  skills?: Skill[] | null;
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

function formatRating(value?: number | string | null) {
  const rating = Number(value ?? 0);

  if (!Number.isFinite(rating) || rating <= 0) {
    return "—";
  }

  return rating.toFixed(1);
}

function getSkills(mentor: Mentor) {
  return Array.isArray(mentor.skills)
    ? mentor.skills
        .map((skill) => skill.name?.trim())
        .filter((skill): skill is string => Boolean(skill))
    : [];
}

function getIndustryName(mentor: Mentor) {
  return mentor.profile?.industry?.name?.trim() || "Belum ditentukan";
}

function getStatus(mentor: Mentor) {
  const status = mentor.status?.toLowerCase();

  if (status === "inactive" || status === "suspended") {
    return "inactive";
  }

  return "active";
}

function extractMentors(result: ApiResponse): Mentor[] {
  const raw = result.data;

  if (Array.isArray(raw)) {
    return raw.filter((item): item is Mentor =>
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
      return nested.filter((item): item is Mentor =>
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

/* =========================================================
   ICONS
========================================================= */

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

function StarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 3.7L14.55 8.86L20.25 9.69L16.13 13.72L17.1 19.4L12 16.72L6.9 19.4L7.87 13.72L3.75 9.69L9.45 8.86L12 3.7Z" />
    </svg>
  );
}

function BriefcaseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="7"
        width="17"
        height="12.5"
        rx="2.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 7V5.5C8 4.67 8.67 4 9.5 4H14.5C15.33 4 16 4.67 16 5.5V7"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M3.5 11H20.5" stroke="currentColor" strokeWidth="1.7" />
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

function ChevronRightIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 5L16 12L9 19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
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

function EyeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.8 12C5.2 7.8 8.27 5.7 12 5.7C15.73 5.7 18.8 7.8 21.2 12C18.8 16.2 15.73 18.3 12 18.3C8.27 18.3 5.2 16.2 2.8 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function BuildingIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 20V5.5C4 4.67 4.67 4 5.5 4H12.5C13.33 4 14 4.67 14 5.5V20"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M14 9H18.5C19.33 9 20 9.67 20 10.5V20"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 8H10M8 11H10M8 14H10M16.5 12H18M16.5 15H18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3 20H21"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  async function loadMentors(showRefreshState = false) {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setError("Sesi login admin tidak ditemukan.");
      setLoading(false);
      return;
    }

    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(`${API_URL}/mentors?per_page=100`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result: ApiResponse = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_name");
        localStorage.removeItem("user_role");
        window.location.href = "/login";
        return;
      }

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Data mentor tidak dapat dimuat.");
      }

      const mentorList = extractMentors(result);

      setMentors(mentorList);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil daftar mentor.",
      );
      setMentors([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const role = localStorage.getItem("user_role");
    const token = localStorage.getItem("auth_token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (role !== "admin") {
      window.location.href = "/";
      return;
    }

    void loadMentors();
  }, []);

  const filteredMentors = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return mentors.filter((mentor) => {
      const status = getStatus(mentor);

      if (statusFilter !== "all" && status !== statusFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const skillText = getSkills(mentor).join(" ").toLowerCase();

      const searchableText = [
        mentor.name,
        mentor.email,
        mentor.profile?.job_title,
        mentor.profile?.company,
        mentor.profile?.location,
        mentor.profile?.education,
        getIndustryName(mentor),
        skillText,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [mentors, search, statusFilter]);

  const activeCount = useMemo(
    () => mentors.filter((mentor) => getStatus(mentor) === "active").length,
    [mentors],
  );

  const inactiveCount = useMemo(
    () => mentors.filter((mentor) => getStatus(mentor) === "inactive").length,
    [mentors],
  );

  const averageRating = useMemo(() => {
    const ratings = mentors
      .map((mentor) => Number(mentor.profile?.avg_rating ?? 0))
      .filter((rating) => Number.isFinite(rating) && rating > 0);

    if (ratings.length === 0) {
      return "—";
    }

    const average =
      ratings.reduce((total, rating) => total + rating, 0) / ratings.length;

    return average.toFixed(1);
  }, [mentors]);

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#FCFBF8] px-4 pb-10 pt-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        {/* =====================================================
            HEADER
        ===================================================== */}
        <section className="mentor-fade">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#5B789E]" />
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#9A9087]">
                  Admin Workspace
                </p>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-[#302823] sm:text-[38px]">
                Mentors
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8A8178]">
                Kelola dan pantau mentor yang sudah terdaftar di Career Cafe.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadMentors(true)}
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

        {/* =====================================================
            STATS
        ===================================================== */}
        <section className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3 mentor-reveal mentor-delay-1">
          <StatCard
            label="Total Mentor"
            value={mentors.length}
            description="Semua mentor terdaftar"
            icon={<UsersIcon />}
            tone="blue"
          />

          <StatCard
            label="Mentor Aktif"
            value={activeCount}
            description="Siap menerima mentee"
            icon={<span className="h-2.5 w-2.5 rounded-full bg-[#1E3F20]" />}
            tone="green"
          />

          <StatCard
            label="Average Rating"
            value={averageRating}
            description={
              mentors.length
                ? `${inactiveCount} mentor inactive`
                : "Belum ada rating"
            }
            icon={<StarIcon />}
            tone="amber"
          />
        </section>

        {/* =====================================================
            TOOLBAR
        ===================================================== */}
        <section className="mt-7 rounded-[24px] border border-[#E8E1DA] bg-white p-4 shadow-[0_10px_35px_rgba(44,30,22,.04)] mentor-reveal mentor-delay-2">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A39A92]" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama, email, pekerjaan, perusahaan, skill..."
                className="h-11 w-full rounded-2xl border border-[#E9E2DC] bg-[#FCFBF8] pl-11 pr-4 text-xs font-semibold text-[#3E352F] outline-none transition-all duration-200 placeholder:text-[#AAA19A] focus:border-[#B9C8D9] focus:bg-white focus:ring-4 focus:ring-[#E7EEF6]"
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
                        ? "bg-[#EAF0F7] text-[#4F6988] shadow-sm"
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
                {filteredMentors.length}
              </span>{" "}
              dari{" "}
              <span className="font-black text-[#554B44]">
                {mentors.length}
              </span>{" "}
              mentor
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="cursor-pointer text-[10px] font-black text-[#5B789E] transition hover:text-[#3E5874]"
              >
                Reset pencarian
              </button>
            )}
          </div>
        </section>

        {/* =====================================================
            ERROR
        ===================================================== */}
        {error && (
          <section className="mt-5 rounded-[22px] border border-[#F0D6D1] bg-[#FFF8F6] px-5 py-4 mentor-scale">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black text-[#A9554C]">
                  Gagal memuat mentor
                </p>
                <p className="mt-1 text-[11px] leading-5 text-[#A57972]">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadMentors()}
                className="cursor-pointer rounded-xl bg-[#A9554C] px-4 py-2.5 text-[10px] font-black text-white transition hover:bg-[#93473F]"
              >
                Coba Lagi
              </button>
            </div>
          </section>
        )}

        {/* =====================================================
            CONTENT
        ===================================================== */}
        <section className="mt-6 mentor-reveal mentor-delay-3">
          {loading ? (
            <LoadingGrid />
          ) : filteredMentors.length === 0 ? (
            <EmptyState
              search={search}
              onReset={() => {
                setSearch("");
                setStatusFilter("all");
              }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {filteredMentors.map((mentor, index) => (
                <MentorAdminCard
                  key={mentor.id}
                  mentor={mentor}
                  index={index}
                  onOpen={() => setSelectedMentor(mentor)}
                />
              ))}
            </div>
          )}
        </section>

        {/* =====================================================
            DETAIL MODAL
        ===================================================== */}
        {selectedMentor && (
          <MentorDetailModal
            mentor={selectedMentor}
            onClose={() => setSelectedMentor(null)}
          />
        )}
      </div>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        @keyframes mentorAdminFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.994);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes mentorAdminFadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes mentorAdminScaleIn {
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
          animation: mentorAdminFadeIn 0.6s ease-out both;
        }

        .mentor-reveal {
          animation: mentorAdminFadeUp 0.72s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .mentor-scale {
          animation: mentorAdminScaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .mentor-delay-1 {
          animation-delay: 0.06s;
        }

        .mentor-delay-2 {
          animation-delay: 0.12s;
        }

        .mentor-delay-3 {
          animation-delay: 0.18s;
        }

        ::selection {
          background: rgba(91, 120, 158, 0.18);
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
  tone: "blue" | "green" | "amber";
}) {
  const styles = {
    blue: {
      wrapper: "border-[#E4EBF3] bg-[#FBFDFF]",
      icon: "bg-[#EAF0F7] text-[#557393]",
    },
    green: {
      wrapper: "border-[#E3EBE1] bg-[#FCFEFC]",
      icon: "bg-[#E8F0E7] text-[#315F34]",
    },
    amber: {
      wrapper: "border-[#EEE6D8] bg-[#FFFDF8]",
      icon: "bg-[#F8EFD9] text-[#B67A2B]",
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
   MENTOR CARD
========================================================= */

function MentorAdminCard({
  mentor,
  index,
  onOpen,
}: {
  mentor: Mentor;
  index: number;
  onOpen: () => void;
}) {
  const image = resolveImageUrl(mentor.profile?.profile_photo);
  const initials = getInitials(mentor.name);
  const skills = getSkills(mentor);
  const rating = formatRating(mentor.profile?.avg_rating);
  const reviews = Number(mentor.profile?.total_reviews ?? 0);
  const status = getStatus(mentor);

  return (
    <article
      className="group overflow-hidden rounded-[24px] border border-[#E8E1DA] bg-white shadow-[0_8px_26px_rgba(44,30,22,.035)] transition-all duration-500 hover:-translate-y-1 hover:border-[#DDD4CB] hover:shadow-[0_20px_44px_rgba(44,30,22,.08)]"
      style={{
        animationDelay: `${index * 55}ms`,
      }}
    >
      <div className="grid min-h-[250px] grid-cols-[minmax(0,1fr)_126px] sm:grid-cols-[minmax(0,1fr)_155px]">
        {/* Left */}
        <div className="flex min-w-0 flex-col justify-between p-5 sm:p-6">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[15px] bg-[#EEF2F6] sm:h-14 sm:w-14">
                  {image ? (
                    <img
                      src={image}
                      alt={mentor.name || "Mentor"}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#EAF0F7] text-sm font-black text-[#557393]">
                      {initials}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-sm font-black text-[#302823] sm:text-base">
                      {mentor.name || "Mentor Tanpa Nama"}
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
                    {mentor.profile?.job_title || "Professional Mentor"}
                  </p>

                  <p className="mt-0.5 truncate text-[9px] font-semibold text-[#AAA098]">
                    {mentor.profile?.company || "Independent"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpen}
                title="Lihat detail mentor"
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[#F7F4F0] text-[#81776E] transition-all duration-300 hover:scale-105 hover:bg-[#EAF0F7] hover:text-[#557393]"
              >
                <EyeIcon />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <InfoMini
                icon={<BriefcaseIcon />}
                label="Experience"
                value={
                  mentor.profile?.experience_years !== null &&
                  mentor.profile?.experience_years !== undefined
                    ? `${mentor.profile.experience_years} tahun`
                    : "—"
                }
              />

              <InfoMini
                icon={<MapPinIcon />}
                label="Location"
                value={mentor.profile?.location || "—"}
              />
            </div>

            <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#FCFAF8] px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <StarIcon className="h-3.5 w-3.5 text-[#D39A38]" />

                <span className="text-xs font-black text-[#514840]">
                  {rating}
                </span>

                <span className="text-[9px] font-semibold text-[#AAA098]">
                  ({reviews} review)
                </span>
              </div>

              <span className="text-[9px] font-black text-[#8E857D]">
                {getIndustryName(mentor)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap gap-1.5">
              {skills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-[#EEF3F8] px-2.5 py-1.5 text-[8px] font-black text-[#5C7390]"
                >
                  {skill}
                </span>
              ))}

              {skills.length > 3 && (
                <span className="rounded-lg bg-[#F6F2EE] px-2.5 py-1.5 text-[8px] font-black text-[#8A8077]">
                  +{skills.length - 3}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onOpen}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-[9px] font-black text-[#587594] transition-all hover:gap-2 hover:text-[#405A74]"
            >
              Detail
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right image */}
        <div className="relative overflow-hidden bg-[#EDE8E2]">
          {image ? (
            <img
              src={image}
              alt={mentor.name || "Mentor"}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EAF0F7] via-[#F2ECE7] to-[#E8F0E7]">
              <span className="text-3xl font-black text-[#627A95]">
                {initials}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/20" />

          <div className="absolute bottom-3 left-3 right-3">
            <span className="inline-flex rounded-xl bg-white/90 px-2.5 py-2 text-[8px] font-black text-[#514840] shadow-sm backdrop-blur-sm">
              Mentor #{mentor.id}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   INFO MINI
========================================================= */

function InfoMini({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#EEE8E2] bg-white px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[#8E857D]">
        {icon}

        <span className="text-[8px] font-black uppercase tracking-[0.08em]">
          {label}
        </span>
      </div>

      <p className="mt-1 truncate text-[10px] font-black text-[#514840]">
        {value}
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
          className="overflow-hidden rounded-[24px] border border-[#E9E2DB] bg-white"
        >
          <div className="grid min-h-[250px] grid-cols-[minmax(0,1fr)_126px] sm:grid-cols-[minmax(0,1fr)_155px]">
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 animate-pulse rounded-[15px] bg-[#EEE9E4]" />

                <div className="min-w-0 flex-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-[#EEE9E4]" />
                  <div className="mt-2 h-3 w-24 animate-pulse rounded bg-[#F2EEEA]" />
                  <div className="mt-2 h-2.5 w-28 animate-pulse rounded bg-[#F5F2EE]" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <div className="h-14 animate-pulse rounded-2xl bg-[#F6F3F0]" />
                <div className="h-14 animate-pulse rounded-2xl bg-[#F6F3F0]" />
              </div>

              <div className="mt-3 h-10 animate-pulse rounded-2xl bg-[#F8F5F2]" />

              <div className="mt-5 flex gap-2">
                <div className="h-6 w-16 animate-pulse rounded-lg bg-[#F0ECE8]" />
                <div className="h-6 w-20 animate-pulse rounded-lg bg-[#F0ECE8]" />
                <div className="h-6 w-14 animate-pulse rounded-lg bg-[#F0ECE8]" />
              </div>
            </div>

            <div className="animate-pulse bg-[#EEE9E4]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({
  search,
  onReset,
}: {
  search: string;
  onReset: () => void;
}) {
  return (
    <div className="rounded-[28px] border border-[#E8E1DA] bg-white px-6 py-16 text-center shadow-[0_10px_35px_rgba(44,30,22,.035)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF0F7] text-[#557393]">
        <SearchIcon className="h-6 w-6" />
      </div>

      <h3 className="mt-5 text-base font-black text-[#3A302A]">
        {search ? "Mentor tidak ditemukan" : "Belum ada mentor"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-[#978D84]">
        {search
          ? "Coba gunakan kata kunci lain seperti nama, perusahaan, pekerjaan, industry, atau skill."
          : "Belum ada data mentor yang bisa ditampilkan di halaman admin."}
      </p>

      {search && (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 cursor-pointer rounded-xl bg-[#5B789E] px-4 py-2.5 text-[10px] font-black text-white transition hover:bg-[#48637F]"
        >
          Reset Filter
        </button>
      )}
    </div>
  );
}

/* =========================================================
   DETAIL MODAL
========================================================= */

function MentorDetailModal({
  mentor,
  onClose,
}: {
  mentor: Mentor;
  onClose: () => void;
}) {
  const image = resolveImageUrl(mentor.profile?.profile_photo);
  const initials = getInitials(mentor.name);
  const skills = getSkills(mentor);
  const rating = formatRating(mentor.profile?.avg_rating);
  const reviews = Number(mentor.profile?.total_reviews ?? 0);
  const status = getStatus(mentor);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#2C1E16]/35 p-0 backdrop-blur-[3px] sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="mentor-scale max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-t-[28px] border border-[#E6DED6] bg-white shadow-[0_30px_90px_rgba(44,30,22,.2)] sm:rounded-[28px]">
        <div className="max-h-[92vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 z-10 border-b border-[#EEE8E2] bg-white/95 px-5 py-4 backdrop-blur-sm sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.17em] text-[#A19890]">
                  Mentor Profile
                </p>

                <h2 className="mt-1 text-base font-black text-[#302823]">
                  Detail Mentor
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
            {/* Profile Hero */}
            <div className="overflow-hidden rounded-[24px] border border-[#E7E0D9] bg-[#FCFAF7]">
              <div className="relative h-36 overflow-hidden bg-[#EAEFF4] sm:h-44">
                {mentor.profile?.cover_photo ? (
                  <img
                    src={resolveImageUrl(mentor.profile.cover_photo)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#E7EEF5] via-[#F2ECE7] to-[#E8F0E7]" />
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

                <div className="absolute bottom-[-1px] left-5 h-20 w-20 overflow-hidden rounded-[20px] border-4 border-white bg-[#EAF0F7] shadow-md sm:left-6 sm:h-24 sm:w-24">
                  {image ? (
                    <img
                      src={image}
                      alt={mentor.name || "Mentor"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-black text-[#557393]">
                      {initials}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-5 pb-5 pt-7 sm:px-6 sm:pb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-[#302823]">
                      {mentor.name || "Mentor Tanpa Nama"}
                    </h3>

                    <p className="mt-1 text-sm font-bold text-[#71675F]">
                      {mentor.profile?.job_title || "Professional Mentor"}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[#A0978E]">
                      {mentor.profile?.company || "Independent"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl bg-[#FFF9EC] px-3 py-2">
                    <StarIcon className="h-4 w-4 text-[#D39A38]" />

                    <div>
                      <p className="text-xs font-black text-[#5E5142]">
                        {rating}
                      </p>
                      <p className="text-[8px] font-semibold text-[#A49A8D]">
                        {reviews} review
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <DetailInfo
                    icon={<span className="text-[11px]">@</span>}
                    label="Email"
                    value={mentor.email || "—"}
                  />

                  <DetailInfo
                    icon={<MapPinIcon />}
                    label="Location"
                    value={mentor.profile?.location || "—"}
                  />

                  <DetailInfo
                    icon={<BuildingIcon />}
                    label="Industry"
                    value={getIndustryName(mentor)}
                  />

                  <DetailInfo
                    icon={<BriefcaseIcon />}
                    label="Experience"
                    value={
                      mentor.profile?.experience_years !== null &&
                      mentor.profile?.experience_years !== undefined
                        ? `${mentor.profile.experience_years} tahun`
                        : "—"
                    }
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <section className="mt-5 rounded-[22px] border border-[#E8E1DA] bg-white p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#A19890]">
                Professional Bio
              </p>

              <p className="mt-3 text-xs leading-6 text-[#6F655D]">
                {mentor.profile?.bio?.trim() ||
                  "Mentor ini belum menambahkan bio profesional."}
              </p>
            </section>

            {/* Skills */}
            <section className="mt-4 rounded-[22px] border border-[#E8E1DA] bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#A19890]">
                    Skills
                  </p>

                  <p className="mt-1 text-xs font-black text-[#453B35]">
                    Keahlian mentor
                  </p>
                </div>

                <span className="rounded-full bg-[#EEF3F8] px-2.5 py-1.5 text-[8px] font-black text-[#5C7390]">
                  {skills.length} skill
                </span>
              </div>

              {skills.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-xl bg-[#F1F5F9] px-3 py-2 text-[9px] font-black text-[#5B7390]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-[10px] font-semibold text-[#A1978E]">
                  Belum ada skill yang ditambahkan.
                </p>
              )}
            </section>

            {/* Education */}
            <section className="mt-4 rounded-[22px] border border-[#E8E1DA] bg-white p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#A19890]">
                Education
              </p>

              <p className="mt-2 text-xs font-bold text-[#5B514A]">
                {mentor.profile?.education || "—"}
              </p>
            </section>

            {/* Actions */}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link
                href={`/mentors/${mentor.id}`}
                target="_blank"
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-[#DCE4EB] bg-[#F5F8FB] px-4 py-3 text-[10px] font-black text-[#56718F] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#EDF3F8]"
              >
                Lihat Halaman Mentor
              </Link>

              {mentor.profile?.linkedin_url && (
                <a
                  href={mentor.profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#1E3F20] px-4 py-3 text-[10px] font-black text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#163219]"
                >
                  Buka LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL INFO
========================================================= */

function DetailInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#EEE8E2] bg-[#FCFAF8] px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-[#90867E]">
        {icon}

        <span className="text-[8px] font-black uppercase tracking-[0.08em]">
          {label}
        </span>
      </div>

      <p className="mt-1.5 break-words text-[10px] font-black text-[#514840]">
        {value}
      </p>
    </div>
  );
}
