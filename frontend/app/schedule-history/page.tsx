"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

type SessionStatus =
  | "pending"
  | "approved"
  | "completed"
  | "cancelled"
  | "rejected"
  | "expired";

type MeetingType = "online" | "offline";

type MentorProfile = {
  id?: number;
  user_id?: number;
  profile_photo?: string | null;
  job_title?: string | null;
  company?: string | null;
  timezone?: string | null;
};

type Mentor = {
  id: number;
  name: string;
  email?: string | null;
  profile?: MentorProfile | null;
};

type BookedSlot = {
  id: number;
  mentor_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  availability_id?: number | null;
};

type Feedback = {
  id?: number;
  rating?: number;
  comment?: string | null;
};

type Session = {
  id: number;
  mentor_id: number;
  mentee_id: number;
  booked_slot_id: number;
  topic: string;
  message: string;
  duration: number;
  meeting_type: MeetingType;
  meeting_link?: string | null;
  meeting_location?: string | null;
  status: SessionStatus;

  mentor?: Mentor | null;

  /*
   * Laravel Eloquent bisa mengirim relasi:
   * booked_slot
   *
   * Kita tetap mempertahankan bookedSlot sebagai fallback
   * supaya frontend lebih toleran terhadap bentuk response.
   */
  booked_slot?: BookedSlot | null;
  bookedSlot?: BookedSlot | null;

  feedback?: Feedback | null;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: Session[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

type DetailResponse = {
  success: boolean;
  message?: string;
  data?: Session;
};

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -70px 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: visible ? `${delay}ms` : "0ms",
      }}
      className={[
        "transform-gpu will-change-transform",
        "transition-all duration-[900ms]",
        "ease-[cubic-bezier(0.16,1,0.3,1)]",
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-6 scale-[0.99] opacity-0",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function CalendarIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="4.5"
        width="18"
        height="17"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M7 2.75V6.5M17 2.75V6.5M3 9.5H21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
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

function VideoIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="6.5"
        width="12.5"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M15.5 10L20 7.75V16.25L15.5 14V10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M19 10.2C19 15.1 12 21 12 21S5 15.1 5 10.2a7 7 0 1 1 14 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <circle
        cx="12"
        cy="10.2"
        r="2.3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ArrowRightIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12H19M13 6L19 12L13 18"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EmptyCalendarIcon() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="17"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      <path
        d="M7 2.75V6.5M17 2.75V6.5M3 9.5H21"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <path
        d="M8 14H16M8 17H13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getStatusLabel(status: SessionStatus) {
  switch (status) {
    case "pending":
      return "Menunggu Persetujuan";

    case "approved":
      return "Disetujui";

    case "completed":
      return "Selesai";

    case "cancelled":
      return "Dibatalkan";

    case "rejected":
      return "Ditolak";

    case "expired":
      return "Kadaluarsa";

    default:
      return status;
  }
}

function getStatusClass(status: SessionStatus) {
  switch (status) {
    case "pending":
      return "bg-[#FFF6E5] text-[#9A681A] border-[#F2D7A0]";

    case "approved":
      return "bg-[#E8F0E8] text-[#1E3F20] border-[#C9DAC9]";

    case "completed":
      return "bg-[#EEF2F7] text-[#4C5F78] border-[#D8E0EA]";

    case "cancelled":
      return "bg-[#F9EEEE] text-[#9A4C4C] border-[#ECD1D1]";

    case "rejected":
      return "bg-[#F9EEEE] text-[#9A4C4C] border-[#ECD1D1]";

    case "expired":
      return "bg-[#F3F3F1] text-[#77736E] border-[#E3E1DD]";

    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function getInitials(name?: string | null) {
  if (!name) {
    return "CC";
  }

  const parts = name.trim().split(/\s+/).slice(0, 2);

  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const cleanValue = value.includes("T") ? value.split("T")[0] : value;

  const date = new Date(`${cleanValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  /*
   * Mendukung:
   * 14:00
   * 14:00:00
   * 2026-09-28T14:00:00
   */
  if (value.includes("T")) {
    const timePart = value.split("T")[1];

    if (timePart) {
      return timePart.slice(0, 5);
    }
  }

  return value.slice(0, 5);
}

function getBookedSlot(session: Session): BookedSlot | null {
  return session.booked_slot ?? session.bookedSlot ?? null;
}

function canCancel(status: SessionStatus) {
  return status === "pending" || status === "approved";
}

function isUpcoming(session: Session) {
  const bookedSlot = getBookedSlot(session);

  if (session.status !== "approved" || !bookedSlot?.date) {
    return false;
  }

  const dateValue = bookedSlot.date;
  const timeValue = bookedSlot.start_time ?? "00:00";

  const start = new Date(`${dateValue}T${timeValue}`);

  if (Number.isNaN(start.getTime())) {
    return false;
  }

  return start.getTime() >= Date.now();
}

const TABS = [
  {
    key: "all",
    label: "Semua",
  },
  {
    key: "pending",
    label: "Menunggu",
  },
  {
    key: "upcoming",
    label: "Disetujui",
  },
  {
    key: "completed",
    label: "Selesai",
  },
  {
    key: "cancelled",
    label: "Dibatalkan",
  },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ScheduleHistoryPage() {
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedTab, setSelectedTab] = useState<TabKey>("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const [detailLoading, setDetailLoading] = useState(false);

  const [cancelTarget, setCancelTarget] = useState<Session | null>(null);

  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    void fetchSessions(selectedTab);
  }, [router, selectedTab]);

  async function fetchSessions(tab: TabKey, silent = false) {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const query =
        tab === "all"
          ? "per_page=50"
          : `tab=${encodeURIComponent(tab)}&per_page=50`;

      const response = await fetch(`${API_BASE_URL}/sessions?${query}`, {
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

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Gagal mengambil data jadwal.");
      }

      setSessions(result.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data jadwal.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function openDetail(sessionId: number) {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setDetailLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
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

      const result: DetailResponse = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message ?? "Detail sesi tidak dapat diambil.");
      }

      setSelectedSession(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil detail sesi.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function confirmCancel() {
    if (!cancelTarget) {
      return;
    }

    const token = localStorage.getItem("auth_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setCancelling(true);

      const response = await fetch(
        `${API_BASE_URL}/sessions/${cancelTarget.id}/cancel`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401) {
        localStorage.removeItem("auth_token");
        router.replace("/login");
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Gagal membatalkan sesi.");
      }

      setCancelTarget(null);

      await fetchSessions(selectedTab, true);

      if (selectedSession?.id === cancelTarget.id) {
        setSelectedSession((current) =>
          current
            ? {
                ...current,
                status: "cancelled",
              }
            : null,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat membatalkan sesi.",
      );
    } finally {
      setCancelling(false);
    }
  }

  const summary = useMemo(() => {
    return {
      total: sessions.length,
      pending: sessions.filter((item) => item.status === "pending").length,
      approved: sessions.filter((item) => item.status === "approved").length,
      completed: sessions.filter((item) => item.status === "completed").length,
    };
  }, [sessions]);

  const emptyText = useMemo(() => {
    switch (selectedTab) {
      case "pending":
        return {
          title: "Belum ada jadwal yang menunggu",
          description:
            "Permintaan konsultasi yang masih menunggu persetujuan mentor akan muncul di sini.",
        };

      case "upcoming":
        return {
          title: "Belum ada jadwal yang disetujui",
          description:
            "Jadwal konsultasi yang sudah disetujui mentor akan muncul di sini.",
        };

      case "completed":
        return {
          title: "Belum ada sesi yang selesai",
          description:
            "Riwayat konsultasi yang sudah selesai akan tersimpan di sini.",
        };

      case "cancelled":
        return {
          title: "Belum ada jadwal yang dibatalkan",
          description:
            "Sesi yang dibatalkan, ditolak, atau kadaluarsa akan muncul di sini.",
        };

      default:
        return {
          title: "Belum ada jadwal",
          description:
            "Saat kamu mengajukan konsultasi kepada mentor, jadwalnya akan muncul di halaman ini.",
        };
    }
  }, [selectedTab]);

  return (
    <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
      <Navbar />

      <main>
        {/* =========================
            HERO
        ========================== */}
        <section className="relative overflow-hidden border-b border-[#EAE6E0] bg-[#F4EFE8]">
          <div className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-[#DCE6D8]/70 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-[#E8D8C7]/60 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:px-8 md:py-18">
            <Reveal>
              <div className="max-w-3xl">
                <span className="inline-flex items-center rounded-full border border-[#C7D4C4] bg-white/70 px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#1E3F20] shadow-sm backdrop-blur-sm">
                  My Schedule
                </span>

                <h1 className="mt-5 text-4xl font-black tracking-tight text-[#2C1E16] md:text-5xl">
                  Jadwal Saya
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6D655E] md:text-base">
                  Lihat semua permintaan konsultasi, jadwal yang sudah
                  disetujui, hingga riwayat sesi bersama mentor di satu tempat.
                </p>
              </div>
            </Reveal>

            {/* SUMMARY */}
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                {
                  label: "Total",
                  value: summary.total,
                  delay: 80,
                },
                {
                  label: "Menunggu",
                  value: summary.pending,
                  delay: 160,
                },
                {
                  label: "Disetujui",
                  value: summary.approved,
                  delay: 240,
                },
                {
                  label: "Selesai",
                  value: summary.completed,
                  delay: 320,
                },
              ].map((item) => (
                <Reveal key={item.label} delay={item.delay}>
                  <div className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-[0_14px_40px_rgba(44,30,22,0.05)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#8A6A47]">
                      {item.label}
                    </p>

                    <p className="mt-2 text-3xl font-black text-[#2C1E16]">
                      {item.value}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* =========================
            CONTENT
        ========================== */}
        <section className="mx-auto max-w-7xl px-6 py-10 md:px-8 md:py-14">
          {/* FILTER */}
          <Reveal>
            <div className="rounded-3xl border border-[#E9E5DE] bg-white p-3 shadow-[0_18px_60px_rgba(44,30,22,0.05)]">
              <div className="flex flex-wrap gap-2">
                {TABS.map((tab) => {
                  const active = selectedTab === tab.key;

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setSelectedTab(tab.key)}
                      className={[
                        "cursor-pointer rounded-2xl px-4 py-2.5 text-xs font-extrabold transition-all duration-500",
                        active
                          ? "bg-[#1E3F20] text-white shadow-md"
                          : "bg-transparent text-[#766E67] hover:bg-[#F5F2ED] hover:text-[#2C1E16]",
                      ].join(" ")}
                    >
                      {tab.label}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => void fetchSessions(selectedTab, true)}
                  disabled={refreshing}
                  className="ml-auto flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold text-[#8A6A47] transition-all duration-500 hover:bg-[#F7F3EE] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={refreshing ? "animate-spin" : ""}
                    aria-hidden="true"
                  >
                    <path
                      d="M20 11A8 8 0 1 0 21 15"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />

                    <path
                      d="M20 5V11H14"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>

                  {refreshing ? "Memuat..." : "Refresh"}
                </button>
              </div>
            </div>
          </Reveal>

          {/* ERROR */}
          {error && (
            <Reveal className="mt-6">
              <div className="rounded-2xl border border-[#EBCFCF] bg-[#FFF7F7] p-5">
                <p className="text-sm font-extrabold text-[#984F4F]">
                  Terjadi kesalahan
                </p>

                <p className="mt-1 text-sm leading-6 text-[#8A6868]">{error}</p>

                <button
                  type="button"
                  onClick={() => void fetchSessions(selectedTab)}
                  className="mt-4 cursor-pointer rounded-xl bg-[#1E3F20] px-4 py-2.5 text-xs font-extrabold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#173219]"
                >
                  Coba Lagi
                </button>
              </div>
            </Reveal>
          )}

          {/* LOADING */}
          {loading ? (
            <div className="mt-8 space-y-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-3xl border border-[#EDEAE5] bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-[#EEEAE4]" />

                    <div className="flex-1">
                      <div className="h-4 w-44 rounded bg-[#EEEAE4]" />

                      <div className="mt-3 h-3 w-60 rounded bg-[#F1EEEA]" />

                      <div className="mt-7 grid gap-3 sm:grid-cols-3">
                        <div className="h-10 rounded-xl bg-[#F4F1ED]" />
                        <div className="h-10 rounded-xl bg-[#F4F1ED]" />
                        <div className="h-10 rounded-xl bg-[#F4F1ED]" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            /* EMPTY STATE */
            <Reveal className="mt-8">
              <div className="rounded-3xl border border-[#EAE5DE] bg-white px-6 py-14 text-center shadow-[0_18px_60px_rgba(44,30,22,0.04)]">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F3F0EA] text-[#8A6A47]">
                  <EmptyCalendarIcon />
                </div>

                <h2 className="mt-6 text-xl font-black text-[#2C1E16]">
                  {emptyText.title}
                </h2>

                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#77706A]">
                  {emptyText.description}
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/mentors")}
                  className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#1E3F20] px-5 py-3 text-xs font-extrabold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#173219] hover:shadow-lg active:scale-[0.985]"
                >
                  Cari Mentor
                  <ArrowRightIcon size={15} />
                </button>
              </div>
            </Reveal>
          ) : (
            /* SESSION LIST */
            <div className="mt-8 space-y-5">
              {sessions.map((session, index) => {
                const mentor = session.mentor;
                const profile = mentor?.profile;

                /*
                 * Ambil booked slot dari snake_case atau camelCase.
                 */
                const bookedSlot = getBookedSlot(session);

                return (
                  <Reveal key={session.id} delay={Math.min(index * 110, 550)}>
                    <article className="group overflow-hidden rounded-3xl border border-[#E9E4DD] bg-white shadow-[0_18px_60px_rgba(44,30,22,0.045)] transition-all duration-700 hover:-translate-y-1 hover:shadow-[0_26px_80px_rgba(44,30,22,0.08)]">
                      <div className="p-6 md:p-7">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                          {/* MAIN */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-4">
                              {profile?.profile_photo ? (
                                <img
                                  src={profile.profile_photo}
                                  alt={mentor?.name ?? "Mentor"}
                                  className="h-14 w-14 flex-shrink-0 rounded-2xl border border-[#E8E2DA] object-cover shadow-sm"
                                />
                              ) : (
                                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#E8F0E8] text-sm font-black text-[#1E3F20]">
                                  {getInitials(mentor?.name)}
                                </div>
                              )}

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h2 className="truncate text-lg font-black text-[#2C1E16] md:text-xl">
                                    {mentor?.name ?? "Mentor"}
                                  </h2>

                                  <span
                                    className={[
                                      "rounded-full border px-2.5 py-1 text-[9px] font-extrabold",
                                      getStatusClass(session.status),
                                    ].join(" ")}
                                  >
                                    {getStatusLabel(session.status)}
                                  </span>
                                </div>

                                <p className="mt-1 text-xs font-semibold text-[#1E3F20]">
                                  {profile?.job_title ?? "Career Mentor"}
                                </p>

                                {profile?.company && (
                                  <p className="mt-1 text-xs text-[#817970]">
                                    {profile.company}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* TOPIC */}
                            <div className="mt-6 rounded-2xl bg-[#F8F5F0] p-5">
                              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#9A7B5F]">
                                Topik Konsultasi
                              </p>

                              <h3 className="mt-2 text-base font-black leading-6 text-[#2C1E16]">
                                {session.topic}
                              </h3>

                              {session.message && (
                                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#756D67]">
                                  {session.message}
                                </p>
                              )}
                            </div>

                            {/* SESSION INFO */}
                            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                              {/* TANGGAL */}
                              <div className="rounded-2xl border border-[#ECE7E0] bg-white p-4 transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#FCFBF8]">
                                <div className="flex items-center gap-2 text-[#8A6A47]">
                                  <CalendarIcon size={16} />

                                  <span className="text-[9px] font-extrabold uppercase tracking-[0.12em]">
                                    Tanggal
                                  </span>
                                </div>

                                <p className="mt-2 text-xs font-extrabold leading-5 text-[#2C1E16]">
                                  {formatDate(bookedSlot?.date)}
                                </p>
                              </div>

                              {/* WAKTU */}
                              <div className="rounded-2xl border border-[#ECE7E0] bg-white p-4 transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#FCFBF8]">
                                <div className="flex items-center gap-2 text-[#8A6A47]">
                                  <ClockIcon size={16} />

                                  <span className="text-[9px] font-extrabold uppercase tracking-[0.12em]">
                                    Waktu
                                  </span>
                                </div>

                                <p className="mt-2 text-xs font-extrabold text-[#2C1E16]">
                                  {formatTime(bookedSlot?.start_time)} —{" "}
                                  {formatTime(bookedSlot?.end_time)}
                                </p>
                              </div>

                              {/* FORMAT */}
                              <div className="rounded-2xl border border-[#ECE7E0] bg-white p-4 transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#FCFBF8]">
                                <div className="flex items-center gap-2 text-[#8A6A47]">
                                  {session.meeting_type === "online" ? (
                                    <VideoIcon size={16} />
                                  ) : (
                                    <LocationIcon size={16} />
                                  )}

                                  <span className="text-[9px] font-extrabold uppercase tracking-[0.12em]">
                                    Format
                                  </span>
                                </div>

                                <p className="mt-2 text-xs font-extrabold text-[#2C1E16]">
                                  {session.meeting_type === "online"
                                    ? "Online"
                                    : "Offline"}
                                </p>
                              </div>

                              {/* DURASI */}
                              <div className="rounded-2xl border border-[#ECE7E0] bg-white p-4 transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#FCFBF8]">
                                <div className="flex items-center gap-2 text-[#8A6A47]">
                                  <ClockIcon size={16} />

                                  <span className="text-[9px] font-extrabold uppercase tracking-[0.12em]">
                                    Durasi
                                  </span>
                                </div>

                                <p className="mt-2 text-xs font-extrabold text-[#2C1E16]">
                                  {session.duration} menit
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* ACTIONS */}
                          <div className="w-full lg:max-w-[220px]">
                            <div className="rounded-2xl border border-[#ECE7E0] bg-[#FCFBF8] p-4">
                              <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#9A7B5F]">
                                Status Sesi
                              </p>

                              <p className="mt-2 text-sm font-black text-[#2C1E16]">
                                {getStatusLabel(session.status)}
                              </p>

                              {session.status === "pending" && (
                                <p className="mt-2 text-xs leading-5 text-[#7B746E]">
                                  Permintaanmu sedang menunggu konfirmasi dari
                                  mentor.
                                </p>
                              )}

                              {session.status === "approved" &&
                                isUpcoming(session) && (
                                  <p className="mt-2 text-xs leading-5 text-[#7B746E]">
                                    Jadwalmu sudah dikonfirmasi. Pastikan hadir
                                    sesuai waktu yang dipilih.
                                  </p>
                                )}

                              {session.status === "completed" && (
                                <p className="mt-2 text-xs leading-5 text-[#7B746E]">
                                  Sesi ini sudah selesai.
                                </p>
                              )}

                              {session.status === "cancelled" && (
                                <p className="mt-2 text-xs leading-5 text-[#7B746E]">
                                  Sesi ini sudah dibatalkan.
                                </p>
                              )}

                              {session.status === "rejected" && (
                                <p className="mt-2 text-xs leading-5 text-[#7B746E]">
                                  Permintaan ini tidak disetujui oleh mentor.
                                </p>
                              )}

                              {session.status === "expired" && (
                                <p className="mt-2 text-xs leading-5 text-[#7B746E]">
                                  Jadwal ini sudah tidak berlaku.
                                </p>
                              )}

                              <div className="mt-4 space-y-2">
                                <button
                                  type="button"
                                  onClick={() => void openDetail(session.id)}
                                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1E3F20] px-4 py-3 text-xs font-extrabold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#173219] hover:shadow-lg active:scale-[0.985]"
                                >
                                  Lihat Detail
                                  <ArrowRightIcon size={15} />
                                </button>

                                {session.status === "approved" &&
                                  session.meeting_type === "online" &&
                                  session.meeting_link && (
                                    <a
                                      href={session.meeting_link}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#C9DAC9] bg-[#E8F0E8] px-4 py-3 text-xs font-extrabold text-[#1E3F20] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#DDE9DD] active:scale-[0.985]"
                                    >
                                      <VideoIcon size={15} />
                                      Join Meeting
                                    </a>
                                  )}

                                {canCancel(session.status) && (
                                  <button
                                    type="button"
                                    onClick={() => setCancelTarget(session)}
                                    className="w-full cursor-pointer rounded-xl border border-[#E7D5D1] bg-white px-4 py-3 text-xs font-extrabold text-[#9A5A50] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FFF8F7] active:scale-[0.985]"
                                  >
                                    Batalkan Jadwal
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* =========================
          DETAIL MODAL
      ========================== */}
      {selectedSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2C1E16]/45 p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedSession(null)}
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[#FCFBF8] shadow-2xl">
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#ECE7E0] bg-[#FCFBF8]/95 px-6 py-5 backdrop-blur-md">
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#8A6A47]">
                  Session Detail
                </p>

                <h2 className="mt-1 text-xl font-black text-[#2C1E16]">
                  Detail Jadwal
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#E6E0D9] bg-white text-[#6D655E] transition-all duration-300 hover:bg-[#F4F0EA]"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {/* Mentor */}
              <div className="flex items-center gap-4 rounded-2xl border border-[#EAE5DE] bg-white p-4">
                {selectedSession.mentor?.profile?.profile_photo ? (
                  <img
                    src={selectedSession.mentor.profile.profile_photo}
                    alt={selectedSession.mentor.name}
                    className="h-14 w-14 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0E8] text-sm font-black text-[#1E3F20]">
                    {getInitials(selectedSession.mentor?.name)}
                  </div>
                )}

                <div>
                  <p className="text-base font-black text-[#2C1E16]">
                    {selectedSession.mentor?.name ?? "Mentor"}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-[#1E3F20]">
                    {selectedSession.mentor?.profile?.job_title ??
                      "Career Mentor"}
                  </p>

                  {selectedSession.mentor?.profile?.company && (
                    <p className="mt-1 text-xs text-[#817970]">
                      {selectedSession.mentor.profile.company}
                    </p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="rounded-2xl border border-[#EAE5DE] bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-extrabold text-[#6D655E]">
                    Status
                  </p>

                  <span
                    className={[
                      "rounded-full border px-3 py-1.5 text-[10px] font-extrabold",
                      getStatusClass(selectedSession.status),
                    ].join(" ")}
                  >
                    {getStatusLabel(selectedSession.status)}
                  </span>
                </div>
              </div>

              {/* Topic */}
              <div className="rounded-2xl border border-[#EAE5DE] bg-white p-5">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#8A6A47]">
                  Topik
                </p>

                <h3 className="mt-2 text-base font-black text-[#2C1E16]">
                  {selectedSession.topic}
                </h3>

                {selectedSession.message && (
                  <p className="mt-3 text-sm leading-7 text-[#736B65]">
                    {selectedSession.message}
                  </p>
                )}
              </div>

              {/* Schedule */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#EAE5DE] bg-white p-5">
                  <div className="flex items-center gap-2 text-[#8A6A47]">
                    <CalendarIcon size={17} />

                    <span className="text-[9px] font-extrabold uppercase tracking-[0.12em]">
                      Tanggal
                    </span>
                  </div>

                  {(() => {
                    const bookedSlot = getBookedSlot(selectedSession);

                    return (
                      <p className="mt-2 text-sm font-black leading-6 text-[#2C1E16]">
                        {formatDate(bookedSlot?.date)}
                      </p>
                    );
                  })()}
                </div>

                <div className="rounded-2xl border border-[#EAE5DE] bg-white p-5">
                  <div className="flex items-center gap-2 text-[#8A6A47]">
                    <ClockIcon size={17} />

                    <span className="text-[9px] font-extrabold uppercase tracking-[0.12em]">
                      Waktu
                    </span>
                  </div>

                  {(() => {
                    const bookedSlot = getBookedSlot(selectedSession);

                    return (
                      <p className="mt-2 text-sm font-black text-[#2C1E16]">
                        {formatTime(bookedSlot?.start_time)} —{" "}
                        {formatTime(bookedSlot?.end_time)}
                      </p>
                    );
                  })()}
                </div>
              </div>

              {/* Meeting */}
              <div className="rounded-2xl border border-[#EAE5DE] bg-white p-5">
                <div className="flex items-center gap-2 text-[#8A6A47]">
                  {selectedSession.meeting_type === "online" ? (
                    <VideoIcon size={17} />
                  ) : (
                    <LocationIcon size={17} />
                  )}

                  <span className="text-[9px] font-extrabold uppercase tracking-[0.12em]">
                    Format Konsultasi
                  </span>
                </div>

                <p className="mt-2 text-sm font-black text-[#2C1E16]">
                  {selectedSession.meeting_type === "online"
                    ? "Online"
                    : "Offline"}
                </p>

                {selectedSession.meeting_type === "online" &&
                  selectedSession.meeting_link && (
                    <a
                      href={selectedSession.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1E3F20] px-4 py-3 text-xs font-extrabold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#173219]"
                    >
                      <VideoIcon size={15} />
                      Join Meeting
                    </a>
                  )}

                {selectedSession.meeting_type === "offline" &&
                  selectedSession.meeting_location && (
                    <div className="mt-3 rounded-xl bg-[#F8F5F0] px-4 py-3 text-sm font-semibold text-[#5E5751]">
                      {selectedSession.meeting_location}
                    </div>
                  )}
              </div>

              {/* Footer actions */}
              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:justify-end">
                {canCancel(selectedSession.status) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCancelTarget(selectedSession);
                      setSelectedSession(null);
                    }}
                    className="cursor-pointer rounded-xl border border-[#E7D5D1] bg-white px-5 py-3 text-xs font-extrabold text-[#9A5A50] transition-all duration-300 hover:bg-[#FFF8F7]"
                  >
                    Batalkan Jadwal
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="cursor-pointer rounded-xl bg-[#1E3F20] px-5 py-3 text-xs font-extrabold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#173219]"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>

          {detailLoading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#2C1E16]/10">
              <div className="rounded-2xl border border-white/70 bg-white px-5 py-4 text-sm font-bold text-[#2C1E16] shadow-xl">
                Memuat detail...
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================
          CANCEL MODAL
      ========================== */}
      {cancelTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#2C1E16]/45 p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => {
              if (!cancelling) {
                setCancelTarget(null);
              }
            }}
          />

          <div className="relative z-10 w-full max-w-md rounded-3xl bg-[#FCFBF8] p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0ED] text-[#9A5A50]">
              <CloseIcon size={20} />
            </div>

            <h2 className="mt-5 text-xl font-black text-[#2C1E16]">
              Batalkan Jadwal?
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#726B65]">
              Kamu akan membatalkan sesi konsultasi bersama{" "}
              <span className="font-extrabold text-[#2C1E16]">
                {cancelTarget.mentor?.name ?? "mentor"}
              </span>
              . Tindakan ini akan mengubah status jadwal menjadi dibatalkan.
            </p>

            <div className="mt-5 rounded-2xl bg-[#F8F5F0] p-4">
              <p className="text-xs font-black text-[#2C1E16]">
                {cancelTarget.topic}
              </p>

              {(() => {
                const bookedSlot = getBookedSlot(cancelTarget);

                return (
                  <p className="mt-1 text-xs text-[#7A726B]">
                    {formatDate(bookedSlot?.date)} ·{" "}
                    {formatTime(bookedSlot?.start_time)}
                  </p>
                );
              })()}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
                className="cursor-pointer rounded-xl border border-[#E5DED6] bg-white px-5 py-3 text-xs font-extrabold text-[#645D57] transition-all duration-300 hover:bg-[#F6F2ED] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Jangan Batalkan
              </button>

              <button
                type="button"
                onClick={() => void confirmCancel()}
                disabled={cancelling}
                className="cursor-pointer rounded-xl bg-[#9A5A50] px-5 py-3 text-xs font-extrabold text-white transition-all duration-300 hover:bg-[#874D45] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelling ? "Membatalkan..." : "Ya, Batalkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
