"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const BACKEND_URL = API_URL.replace(/\/api$/, "");

/* =========================================================
   TYPES
========================================================= */

type Profile = {
  profile_photo?: string | null;
  bio?: string | null;
  job_title?: string | null;
  company?: string | null;
  location?: string | null;
  experience_years?: number | null;
  avg_rating?: number | string | null;
  total_reviews?: number | null;
};

type User = {
  id: number;
  name: string;
  email?: string | null;
};

type Slot = {
  id?: number;
  starts_at?: string | null;
  ends_at?: string | null;
};

type Session = {
  id: number;
  topic?: string | null;
  message?: string | null;
  duration?: number | null;
  meeting_type?: string | null;
  meeting_link?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  mentor_id?: number | null;
  mentee_id?: number | null;
  mentor?: User | null;
  mentee?: User | null;
  booked_slot?: Slot | null;
  bookedSlot?: Slot | null;
};

type ActivityPoint = {
  label: string;
  value: number;
};

type ProfileApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    id?: number;
    name?: string | null;
    email?: string | null;
    role?: string | null;
    profile?: Profile | null;
    skills?: unknown[];
  } | null;
};

type MeApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    id?: number;
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
};

/* =========================================================
   HELPERS
========================================================= */

function getSlot(session: Session) {
  return session.booked_slot ?? session.bookedSlot ?? null;
}

function parseDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/**
 * Mengubah path foto dari Laravel menjadi URL yang bisa
 * langsung digunakan oleh browser.
 */
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
    return `${BACKEND_URL}${value}`;
  }

  if (value.startsWith("storage/")) {
    return `${BACKEND_URL}/${value}`;
  }

  return `${BACKEND_URL}/storage/${value}`;
}

function getInitial(name?: string | null) {
  return name?.trim().charAt(0).toUpperCase() || "M";
}

function formatTime(value?: string | null) {
  const date = parseDate(value);

  if (!date) {
    return "—";
  }

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value?: string | null) {
  const date = parseDate(value);

  if (!date) {
    return "—";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatShortDate(value?: string | null) {
  const date = parseDate(value);

  if (!date) {
    return "—";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });
}

function formatMonth(value?: string | null) {
  const date = parseDate(value);

  if (!date) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
  });
}

function statusText(status?: string | null) {
  switch (String(status ?? "").toLowerCase()) {
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

    default:
      return status || "Unknown";
  }
}

function statusClass(status?: string | null) {
  switch (String(status ?? "").toLowerCase()) {
    case "pending":
      return "bg-[#E6F4EA] text-[#1B5E20]";

    case "approved":
      return "bg-[#E6F4EA] text-[#1B5E20]";

    case "completed":
      return "bg-[#E6F4EA] text-[#1B5E20]";

    case "rejected":
      return "bg-[#E6F4EA] text-[#1B5E20]";

    default:
      return "bg-[#E8F5E8] text-[#786F68]";
  }
}

function isUpcoming(session: Session) {
  const date = parseDate(getSlot(session)?.starts_at);

  if (!date) {
    return false;
  }

  const status = String(session.status ?? "").toLowerCase();

  return (
    date.getTime() >= Date.now() &&
    (status === "pending" || status === "approved")
  );
}

function isCompleted(session: Session) {
  return String(session.status ?? "").toLowerCase() === "completed";
}

/* =========================================================
   PAGE
========================================================= */

export default function MentorDashboardPage() {
  const [mentorName, setMentorName] = useState("Mentor Professional");

  const [profile, setProfile] = useState<Profile | null>(null);

  /**
   * Foto sekarang TIDAK lagi menggunakan hardcode.
   *
   * Nilainya akan diambil dari:
   * /api/profile -> data.profile.profile_photo
   */
  const [profileImage, setProfileImage] = useState("");

  const [sessions, setSessions] = useState<Session[]>([]);

  const [imageFailed, setImageFailed] = useState(false);

  const [loading, setLoading] = useState(true);

  /* =======================================================
     LOAD DATA
  ======================================================== */

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem("auth_token") || "";

      const storedName = localStorage.getItem("user_name") || "";

      if (storedName) {
        setMentorName(storedName);
      }

      /**
       * Jangan lagi memasang foto default Trio.
       * Dashboard akan menunggu foto dari backend.
       */
      setProfileImage("");
      setImageFailed(false);

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const [meResponse, profileResponse, sessionsResponse] =
          await Promise.all([
            fetch(`${API_URL}/me`, {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
              cache: "no-store",
            }),

            fetch(`${API_URL}/profile`, {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
              cache: "no-store",
            }),

            fetch(`${API_URL}/sessions?per_page=100`, {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
              cache: "no-store",
            }),
          ]);

        const [meData, profileData, sessionsData] = await Promise.all([
          meResponse.json().catch(() => null),
          profileResponse.json().catch(() => null),
          sessionsResponse.json().catch(() => null),
        ]);

        /* =================================================
           USER
        ================================================== */

        if (meResponse.ok) {
          const typedMe = meData as MeApiResponse | null;

          const user = typedMe?.data;

          if (user?.name) {
            setMentorName(user.name);
            localStorage.setItem("user_name", user.name);
          }
        }

        /* =================================================
           PROFILE
        ================================================== */

        if (profileResponse.ok) {
          const typedProfile = profileData as ProfileApiResponse | null;

          /**
           * Backend:
           *
           * data: {
           *   id,
           *   name,
           *   email,
           *   role,
           *   profile: {
           *      profile_photo,
           *      ...
           *   }
           * }
           *
           * Jadi yang kita butuhkan adalah:
           *
           * typedProfile.data.profile
           */
          const resolvedProfile = typedProfile?.data?.profile ?? null;

          setProfile(resolvedProfile);

          /**
           * Ambil foto dari profile database.
           */
          const photoUrl = resolveImageUrl(resolvedProfile?.profile_photo);

          setProfileImage(photoUrl);
          setImageFailed(false);
        }

        /* =================================================
           SESSIONS
        ================================================== */

        if (sessionsResponse.ok) {
          const raw = sessionsData?.data ?? sessionsData;

          const list = Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.data)
              ? raw.data
              : Array.isArray(sessionsData?.sessions)
                ? sessionsData.sessions
                : [];

          setSessions(list);
        }
      } catch (error) {
        console.error("Dashboard load error:", error);

        /**
         * Kalau API gagal, jangan kembali ke foto Trio.
         * Tampilkan inisial mentor.
         */
        setProfileImage("");
        setImageFailed(false);
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  /* =======================================================
     CALCULATIONS
  ======================================================== */

  const firstName = mentorName.trim().split(/\s+/)[0] || "Mentor";

  const statistics = useMemo(() => {
    const upcoming = sessions.filter(isUpcoming).length;

    const pending = sessions.filter(
      (session) => String(session.status ?? "").toLowerCase() === "pending",
    ).length;

    const completed = sessions.filter(isCompleted).length;

    const totalMentees = new Set(
      sessions
        .map((session) => session.mentee?.id ?? session.mentee_id)
        .filter(Boolean),
    ).size;

    const rating = Number(profile?.avg_rating ?? 0);

    return {
      upcoming,
      pending,
      completed,
      totalMentees,
      rating,
    };
  }, [profile?.avg_rating, sessions]);

  const recentMentees = useMemo(() => {
    const unique = new Map<
      number,
      {
        user: User;
        session: Session;
      }
    >();

    [...sessions]
      .sort(
        (a, b) =>
          (parseDate(b.created_at)?.getTime() ?? 0) -
          (parseDate(a.created_at)?.getTime() ?? 0),
      )
      .forEach((session) => {
        if (session.mentee && !unique.has(session.mentee.id)) {
          unique.set(session.mentee.id, {
            user: session.mentee,
            session,
          });
        }
      });

    return Array.from(unique.values()).slice(0, 5);
  }, [sessions]);

  const upcomingSessions = useMemo(() => {
    return sessions
      .filter(isUpcoming)
      .sort(
        (a, b) =>
          (parseDate(getSlot(a)?.starts_at)?.getTime() ?? 0) -
          (parseDate(getSlot(b)?.starts_at)?.getTime() ?? 0),
      )
      .slice(0, 3);
  }, [sessions]);

  const featuredSession = useMemo(() => {
    return (
      [...sessions]
        .filter((session) => session.mentee)
        .sort(
          (a, b) =>
            (parseDate(b.created_at)?.getTime() ?? 0) -
            (parseDate(a.created_at)?.getTime() ?? 0),
        )[0] ?? null
    );
  }, [sessions]);

  const activity = useMemo<ActivityPoint[]>(() => {
    const points: ActivityPoint[] = [];

    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);

      date.setDate(date.getDate() - index);

      const key = date.toISOString().slice(0, 10);

      const value = sessions.filter((session) => {
        const dateValue =
          parseDate(getSlot(session)?.starts_at) ??
          parseDate(session.created_at);

        return dateValue?.toISOString().slice(0, 10) === key;
      }).length;

      points.push({
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        value,
      });
    }

    return points;
  }, [sessions]);

  const maxActivity = Math.max(1, ...activity.map((item) => item.value));

  const profileCompletion = useMemo(() => {
    const fields = [
      profile?.bio,
      profile?.job_title,
      profile?.company,
      profile?.location,
      profile?.experience_years,
    ];

    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [profile]);

  const ratingText = statistics.rating > 0 ? statistics.rating.toFixed(1) : "—";

  const hasMentorPhoto = Boolean(profileImage) && !imageFailed;

  const monthName = new Date().toLocaleDateString("en-US", {
    month: "long",
  });

  /* =======================================================
     LOADING
  ======================================================== */

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#FAFEFA] p-6 lg:p-8">
        <div className="mx-auto max-w-[1400px] animate-pulse">
          <div className="h-10 w-64 rounded-xl bg-[#DDEEDD]" />

          <div className="mt-6 grid gap-4 xl:grid-cols-[1.62fr_.78fr]">
            <div className="h-[318px] rounded-[28px] bg-[#E6F4EA]" />

            <div className="h-[318px] rounded-[28px] bg-[#EAF6EA]" />
          </div>

          <div className="mt-4 h-[96px] rounded-[24px] bg-[#EAF6EA]" />

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.62fr_.78fr]">
            <div className="h-[350px] rounded-[26px] bg-[#EAF6EA]" />

            <div className="h-[350px] rounded-[26px] bg-[#EAF6EA]" />
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     DASHBOARD
  ======================================================== */

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#FAFEFA] px-5 pb-14 pt-7 sm:px-7 lg:px-9 xl:px-10">
      <div className="mx-auto max-w-[1400px]">
        {/* ==================================================
            HEADER
        =================================================== */}

        <section className="mentor-reveal flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#AAA097]">
              Mentor Dashboard
            </p>

            <h1 className="mt-1.5 text-[38px] font-black tracking-[-0.065em] text-[#302923] sm:text-[44px]">
              Welcome back, {firstName}
            </h1>

            <p className="mt-2 max-w-[520px] text-xs font-medium leading-5 text-[#978D85] sm:text-sm">
              Track your sessions, guide your mentees,
              <br className="hidden sm:block" />
              and make every conversation count.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-[#D8ECD8] bg-white px-4 py-2.5 text-[9px] font-black text-[#746A62] shadow-sm">
              {monthName}
            </span>

            <Link
              href="/mentor/requests"
              className="rounded-xl bg-[#4CAF50] px-4 py-2.5 text-[9px] font-black text-white shadow-[0_10px_24px_rgba(96,126,100,.14)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#4CAF50]"
            >
              Review requests
            </Link>
          </div>
        </section>

        {/* ==================================================
            HERO ROW
        =================================================== */}

        <section className="mt-6 grid gap-4 xl:grid-cols-[1.62fr_.78fr]">
          {/* ==================================================
              FEATURED MENTOR
          =================================================== */}

          <div className="mentor-reveal mentor-delay-1 relative min-h-[318px] overflow-hidden rounded-[28px] border border-[#DDE9D7] bg-[#F6F2E9] shadow-[0_22px_48px_rgba(71,98,76,.10)]">
            {/* SOFT CREAM + SAGE GRADIENT */}

            <div className="absolute inset-0 bg-[linear-gradient(135deg,#F6F2E9_0%,#F5F5EA_34%,#E6F4EA_66%,#CBE6C8_100%)]" />

            {/* BACKGROUND SHAPES */}

            <div className="pointer-events-none absolute -left-24 -top-24 h-[300px] w-[300px] rounded-full bg-[#E6F4EA]/75 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-36 left-[22%] h-[310px] w-[310px] rounded-full bg-[#CBE6C8]/55 blur-3xl" />

            <div className="pointer-events-none absolute right-[15%] top-[-25%] h-[280px] w-[280px] rounded-full bg-white/55 blur-3xl" />

            {/* ==================================================
                MENTOR PHOTO
            =================================================== */}

            {/* CURVED GREEN PHOTO ACCENT */}
            <div className="pointer-events-none absolute right-[-72px] top-1/2 z-[1] h-[360px] w-[430px] -translate-y-1/2 rounded-[58%_42%_50%_50%/58%_42%_58%_42%] bg-[linear-gradient(135deg,#E6F4EA_4%,#A8DCA8_42%,#81C784_72%,#4CAF50_100%)] opacity-80 shadow-[0_18px_55px_rgba(76,175,80,0.12)]" />

            <div className="pointer-events-none absolute right-[18px] top-1/2 z-[1] h-[300px] w-[350px] -translate-y-1/2 rounded-[55%_45%_48%_52%/56%_44%_56%_44%] border-[26px] border-[#81C784]/28" />

            <div className="pointer-events-none absolute inset-0 z-[2]">
              {hasMentorPhoto ? (
                <img
                  src={profileImage}
                  alt={mentorName}
                  className="absolute inset-y-0 right-0 h-full w-[62%] object-cover object-[center_28%] transition-transform duration-[1000ms] ease-out hover:scale-[1.018]"
                  onError={() => {
                    setImageFailed(true);
                  }}
                />
              ) : (
                <div className="absolute inset-y-0 right-0 flex w-[62%] items-center justify-center bg-[#CBE6C8]">
                  <span className="text-6xl font-black text-[#4C6B50]/45">
                    {getInitial(mentorName)}
                  </span>
                </div>
              )}
            </div>

            {/* PHOTO BLEND */}

            <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_right,#F6F2E9_0%,#F6F2E9_25%,rgba(246,242,233,0.98)_34%,rgba(230,244,234,0.86)_46%,rgba(230,244,234,0.58)_56%,rgba(230,244,234,0.28)_65%,rgba(203,230,200,0.08)_73%,rgba(203,230,200,0)_82%)]" />

            {/* SOFT PHOTO HAZE */}

            <div className="pointer-events-none absolute inset-y-0 left-[36%] z-[11] w-[28%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.48)_0%,rgba(230,244,234,0.18)_42%,rgba(230,244,234,0)_76%)] blur-[20px]" />

            {/* TOP BLEND */}

            <div className="pointer-events-none absolute inset-x-0 top-0 z-[12] h-24 bg-gradient-to-b from-white/55 via-white/15 to-transparent" />

            {/* BOTTOM BLEND */}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[12] h-28 bg-gradient-to-t from-[#B8D8B6]/48 via-[#DDEDDD]/10 to-transparent" />

            {/* WHOLE CARD SOFT LIGHT */}

            <div className="pointer-events-none absolute inset-0 z-[13] bg-[linear-gradient(108deg,rgba(255,255,255,0.14)_15%,rgba(255,255,255,0.04)_55%,rgba(255,255,255,0)_100%)]" />

            {/* ==================================================
                CONTENT
            =================================================== */}

            <div className="relative z-30 flex min-h-[318px] w-full flex-col justify-between p-7 sm:p-8 lg:p-9">
              <div className="max-w-[57%]">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#55765B]">
                    Featured mentor
                  </span>

                  <span className="h-1 w-1 rounded-full bg-[#81C784]" />

                  <span className="text-[8px] font-bold text-[#729276]">
                    Career Cafe
                  </span>
                </div>

                <h2 className="mt-3 text-[31px] font-black tracking-[-0.055em] text-[#1B5E20] sm:text-[38px]">
                  {mentorName}
                </h2>

                <p className="mt-1.5 text-sm font-semibold text-[#47684B]">
                  {profile?.job_title || "Career Mentor"}

                  {profile?.company ? ` · ${profile.company}` : ""}
                </p>

                <p className="mt-5 max-w-[500px] text-xs font-medium leading-5 text-[#617064]">
                  {profile?.bio ||
                    "Guide mentees with practical career insight, meaningful sessions, and experience from your professional journey."}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-start gap-2">
                <div className="flex flex-col items-start gap-2">
                  <Link
                    href="/mentor/profile"
                    className="rounded-xl bg-[#4CAF50] px-4 py-2.5 text-[9px] font-black text-white shadow-[0_9px_22px_rgba(76,175,80,.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#38BE3C]"
                  >
                    View profile
                  </Link>

                  <div className="inline-flex items-center gap-2 rounded-full border border-[#B9E0BA] bg-white/90 px-3.5 py-2 shadow-[0_8px_20px_rgba(76,175,80,.10)] backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#4CAF50]" />

                    <span className="text-[8px] font-black text-[#1B5E20]">
                      Active mentor
                    </span>
                  </div>
                </div>

                <Link
                  href="/mentor/availability"
                  className="rounded-xl border border-[#A8DCA8] bg-white/72 px-4 py-2.5 text-[9px] font-black text-[#1B5E20] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white"
                >
                  Availability
                </Link>
              </div>
            </div>
          </div>

          {/* ==================================================
              ACTIVITY GROWTH
          =================================================== */}

          <div className="mentor-reveal mentor-delay-2 rounded-[28px] border border-[#DDEEDD] bg-white p-6 shadow-[0_16px_38px_rgba(53,39,29,.045)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#AAA097]">
                  Activity growth
                </p>

                <h2 className="mt-2 text-[28px] font-black tracking-[-0.055em] text-[#2F2924]">
                  +{statistics.completed}
                </h2>

                <div className="mt-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4CAF50]" />

                  <span className="text-[9px] font-semibold text-[#91877F]">
                    completed sessions
                  </span>
                </div>
              </div>

              <span className="rounded-lg bg-[#F2FAF2] px-2.5 py-1.5 text-[8px] font-black text-[#827870]">
                Last 7 days
              </span>
            </div>

            <div className="mt-6 rounded-[22px] bg-[#F5FAF5] px-2.5 py-3">
              <svg
                viewBox="0 0 620 205"
                className="h-[195px] w-full"
                role="img"
                aria-label="Mentor activity chart"
              >
                {[0, 1, 2, 3].map((line) => {
                  const y = 35 + line * 38;

                  return (
                    <line
                      key={line}
                      x1="24"
                      y1={y}
                      x2="600"
                      y2={y}
                      stroke="#D9EED9"
                      strokeWidth="1"
                      strokeDasharray="4 7"
                    />
                  );
                })}

                <polyline
                  points={activity
                    .map((point, index) => {
                      const x = 28 + index * 90;
                      const y = 168 - (point.value / maxActivity) * 110;

                      return `${x},${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {activity.map((point, index) => {
                  const x = 28 + index * 90;

                  const y = 168 - (point.value / maxActivity) * 110;

                  return (
                    <g key={`${point.label}-${index}`}>
                      <circle
                        cx={x}
                        cy={y}
                        r="5.5"
                        fill="#FFFFFF"
                        stroke="#4CAF50"
                        strokeWidth="3"
                      />

                      <text
                        x={x}
                        y="193"
                        textAnchor="middle"
                        fontSize="10"
                        fill="#AAA099"
                      >
                        {point.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </section>

        {/* ==================================================
            STATISTICS
        =================================================== */}

        <section className="mentor-reveal mentor-delay-2 mt-4 grid grid-cols-2 overflow-visible rounded-[24px] border border-[#DDEEDD] bg-white shadow-[0_14px_34px_rgba(53,39,29,.04)] sm:grid-cols-4">
          <DashboardStat
            label="Total mentees"
            value={statistics.totalMentees.toString()}
            note="people helped"
            emphasis="green"
          />

          <DashboardStat
            label="Upcoming"
            value={statistics.upcoming.toString()}
            note="sessions"
            emphasis="blue"
          />

          <DashboardStat
            label="Pending"
            value={statistics.pending.toString()}
            note="requests"
            emphasis="amber"
          />

          <DashboardStat
            label="Rating"
            value={ratingText}
            note={`${profile?.total_reviews ?? 0} reviews`}
            emphasis="gold"
          />
        </section>

        {/* ==================================================
            LOWER CONTENT
        =================================================== */}

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.62fr_.78fr]">
          {/* LEFT */}

          <div className="space-y-4">
            {/* RECENT MENTORING */}

            <div className="mentor-reveal mentor-delay-3 rounded-[26px] border border-[#DDEEDD] bg-white p-6 shadow-[0_16px_36px_rgba(53,39,29,.045)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#AAA097]">
                    Top performing
                  </p>

                  <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-[#342C26]">
                    Recent mentoring
                  </h2>
                </div>

                <Link
                  href="/mentor/sessions"
                  className="text-[9px] font-black text-[#877D75] transition hover:text-[#38BE3C]"
                >
                  View all →
                </Link>
              </div>

              <div className="mt-5 overflow-hidden rounded-[18px] border border-[#E2F0E2]">
                <div className="hidden grid-cols-[1.25fr_1fr_.65fr_.55fr] border-b border-[#E2F0E2] bg-[#F5FAF5] px-4 py-3 text-[8px] font-black uppercase tracking-[0.12em] text-[#AAA097] sm:grid">
                  <span>Mentee</span>
                  <span>Session</span>
                  <span>Status</span>
                  <span className="text-right">Date</span>
                </div>

                {recentMentees.length === 0 ? (
                  <div className="px-5 py-10 text-center text-xs font-semibold text-[#9D948C]">
                    No mentoring activity yet.
                  </div>
                ) : (
                  recentMentees.map(({ user, session }) => (
                    <div
                      key={user.id}
                      className="grid grid-cols-1 gap-3 border-b border-[#E8F5E8] px-4 py-3 last:border-b-0 sm:grid-cols-[1.25fr_1fr_.65fr_.55fr] sm:items-center"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E6F4EA] text-[9px] font-black text-[#38BE3C]">
                          {getInitial(user.name)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-[10px] font-black text-[#3A312B]">
                            {user.name}
                          </p>

                          <p className="truncate text-[8px] font-medium text-[#A19890]">
                            {user.email || "Mentee"}
                          </p>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[9px] font-black text-[#5D544D]">
                          {session.topic || "Career session"}
                        </p>

                        <p className="mt-0.5 text-[8px] font-medium text-[#A19890]">
                          {session.duration || 45} min
                        </p>
                      </div>

                      <span
                        className={[
                          "inline-flex w-fit rounded-full px-2 py-1 text-[7px] font-black",
                          statusClass(session.status),
                        ].join(" ")}
                      >
                        {statusText(session.status)}
                      </span>

                      <span className="text-left text-[8px] font-bold text-[#A19890] sm:text-right">
                        {formatDate(session.created_at)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* UPCOMING */}

            <div className="mentor-reveal mentor-delay-4 rounded-[26px] border border-[#DDEEDD] bg-white p-6 shadow-[0_16px_36px_rgba(53,39,29,.045)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#AAA097]">
                    Sessions
                  </p>

                  <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-[#342C26]">
                    Upcoming
                  </h2>
                </div>

                <Link
                  href="/mentor/schedule"
                  className="rounded-xl bg-[#EAF6EA] px-3 py-2 text-[8px] font-black text-[#756B63] transition hover:bg-[#E6F4EA] hover:text-[#38BE3C]"
                >
                  Open schedule
                </Link>
              </div>

              <div className="mt-5 grid gap-2.5">
                {upcomingSessions.length === 0 ? (
                  <div className="rounded-[18px] border border-dashed border-[#CBE6C8] bg-[#F7FBF7] px-4 py-9 text-center">
                    <p className="text-xs font-black text-[#746A62]">
                      No upcoming sessions
                    </p>

                    <p className="mt-1 text-[9px] font-medium text-[#A49A92]">
                      Your next approved mentoring sessions will appear here.
                    </p>
                  </div>
                ) : (
                  upcomingSessions.map((session) => {
                    const slot = getSlot(session);

                    return (
                      <Link
                        key={session.id}
                        href="/mentor/sessions"
                        className="group grid grid-cols-[76px_1fr_auto] items-center gap-3 rounded-[18px] border border-[#E2F0E2] bg-[#FBFEFB] p-3 transition duration-300 hover:-translate-y-0.5 hover:border-[#CBE6C8] hover:shadow-sm"
                      >
                        <div className="rounded-xl bg-[#EEF8EE] px-2 py-2 text-center">
                          <p className="text-[7px] font-black uppercase tracking-[0.12em] text-[#9D9289]">
                            {formatMonth(slot?.starts_at)}
                          </p>

                          <p className="mt-0.5 text-base font-black text-[#3A312B]">
                            {formatShortDate(slot?.starts_at)}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-[10px] font-black text-[#3A302A]">
                            {session.topic || "Career session"}
                          </p>

                          <p className="mt-1 truncate text-[8px] font-semibold text-[#A19890]">
                            {session.mentee?.name || "Mentee"}
                            {" · "}
                            {formatTime(slot?.starts_at)}
                          </p>
                        </div>

                        <span className="text-lg text-[#B5ACA5] transition group-hover:translate-x-1 group-hover:text-[#38BE3C]">
                          →
                        </span>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div className="space-y-4">
            {/* MENTOR IMPACT */}

            <div className="mentor-reveal mentor-delay-3 rounded-[26px] border border-[#DDEEDD] bg-white p-6 shadow-[0_16px_36px_rgba(53,39,29,.045)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#AAA097]">
                    Mentor impact
                  </p>

                  <h2 className="mt-2 text-[27px] font-black tracking-[-0.05em] text-[#322A24]">
                    +{statistics.completed}
                  </h2>

                  <p className="mt-1 text-[8px] font-semibold text-[#968C84]">
                    completed sessions
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F4EA] text-[#38BE3C]">
                  <ImpactIcon />
                </div>
              </div>

              <div className="mt-5 rounded-[20px] bg-[#F4FBF4] p-4">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black tracking-[-0.05em] text-[#302923]">
                    {statistics.totalMentees}
                  </span>

                  <span className="mb-1 text-[9px] font-bold text-[#968C84]">
                    unique mentees
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-8 gap-1.5">
                  {Array.from({
                    length: 8,
                  }).map((_, index) => (
                    <span
                      key={index}
                      className={[
                        "h-8 rounded-lg transition-all duration-300",
                        "hover:-translate-y-1",
                        index < Math.min(8, statistics.completed + 2)
                          ? "bg-[#81C784]"
                          : "bg-[#CBE6C8]",
                      ].join(" ")}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-[#E3F1E3] pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[#AAA097]">
                      Profile completion
                    </p>

                    <p className="mt-1 text-2xl font-black tracking-[-0.05em] text-[#332B25]">
                      {profileCompletion}%
                    </p>
                  </div>

                  <Link
                    href="/mentor/profile"
                    className="rounded-xl bg-[#EFF9EF] px-3 py-2 text-[8px] font-black text-[#71675F] transition hover:bg-[#DDF0DD] hover:text-[#38BE3C]"
                  >
                    Edit
                  </Link>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#DCEEDC]">
                  <div
                    className="h-full rounded-full bg-[#38BE3C] transition-all duration-700"
                    style={{
                      width: `${Math.max(8, profileCompletion)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* LATEST CONNECTION */}

            <div className="mentor-reveal mentor-delay-4 rounded-[26px] border border-[#DDEEDD] bg-white p-6 shadow-[0_16px_36px_rgba(53,39,29,.045)]">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#AAA097]">
                Latest connection
              </p>

              <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-[#342C26]">
                Recent mentee
              </h2>

              {featuredSession ? (
                <div className="mt-5 rounded-[20px] bg-[#F2FAF2] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E6F4EA] text-xs font-black text-[#38BE3C]">
                      {getInitial(featuredSession.mentee?.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-black text-[#3A312B]">
                        {featuredSession.mentee?.name || "Mentee"}
                      </p>

                      <p className="mt-0.5 truncate text-[9px] font-semibold text-[#9A9189]">
                        {featuredSession.topic || "Career mentoring"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-3 py-2.5">
                    <div>
                      <p className="text-[7px] font-black uppercase tracking-[0.12em] text-[#AAA097]">
                        Status
                      </p>

                      <span
                        className={[
                          "mt-1 inline-flex rounded-full px-2 py-1 text-[7px] font-black",
                          statusClass(featuredSession.status),
                        ].join(" ")}
                      >
                        {statusText(featuredSession.status)}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-[7px] font-black uppercase tracking-[0.12em] text-[#AAA097]">
                        Date
                      </p>

                      <p className="mt-1 text-[9px] font-black text-[#4A4038]">
                        {formatShortDate(featuredSession.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-[20px] border border-dashed border-[#CBE6C8] bg-[#F7FBF7] px-4 py-10 text-center text-[9px] font-semibold text-[#A09890]">
                  Your latest mentee connection will appear here.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ==================================================
            QUICK ACTIONS
        =================================================== */}

        <section className="mentor-reveal mentor-delay-4 mt-4 rounded-[26px] border border-[#D9EDD9] bg-[#EFF9EF] p-4">
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction
              href="/mentor/requests"
              label="Requests"
              value={statistics.pending.toString()}
              note="pending review"
              tone="amber"
              icon={<RequestIcon />}
            />

            <QuickAction
              href="/mentor/schedule"
              label="Schedule"
              value={statistics.upcoming.toString()}
              note="upcoming sessions"
              tone="blue"
              icon={<CalendarIcon />}
            />

            <QuickAction
              href="/mentor/availability"
              label="Availability"
              value="4w"
              note="slots ahead"
              tone="lavender"
              icon={<ClockIcon />}
            />

            <QuickAction
              href="/mentor/feedback"
              label="Feedback"
              value={ratingText}
              note="average rating"
              tone="coral"
              icon={<StarIcon />}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  href,
  label,
  value,
  note,
  tone,
  icon,
}: {
  href: string;
  label: string;
  value: string;
  note: string;
  tone: "amber" | "blue" | "lavender" | "coral";
  icon: ReactNode;
}) {
  const tones = {
    amber: "bg-[#E6F4EA] text-[#1B5E20]",

    blue: "bg-[#CBE6C8] text-[#4CAF50]",

    lavender: "bg-[#E6F4EA] text-[#1B5E20]",

    coral: "bg-[#E6F4EA] text-[#1B5E20]",
  };

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-[18px] border border-white bg-white/80 p-3.5 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
    >
      <span
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition",
          "group-hover:scale-105",
          tones[tone],
        ].join(" ")}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-black text-[#3A312B]">
          {label}
        </span>

        <span className="mt-0.5 block truncate text-[8px] font-semibold text-[#9D938B]">
          {value} {note}
        </span>
      </span>

      <span className="text-base text-[#B4ABA3] transition group-hover:translate-x-1 group-hover:text-[#38BE3C]">
        →
      </span>
    </Link>
  );
}

/* =========================================================
   STAT
========================================================= */

function DashboardStat({
  label,
  value,
  note,
  emphasis,
}: {
  label: string;
  value: string;
  note: string;
  emphasis: "green" | "blue" | "amber" | "gold";
}) {
  const accent = {
    green: {
      glow: "hover:border-[#CBE6C8]",
      value: "group-hover:text-[#38BE3C]",
      dot: "bg-[#4CAF50]",
    },

    blue: {
      glow: "hover:border-[#CBE6C8]",
      value: "group-hover:text-[#1B5E20]",
      dot: "bg-[#81C784]",
    },

    amber: {
      glow: "hover:border-[#CBE6C8]",
      value: "group-hover:text-[#1B5E20]",
      dot: "bg-[#4CAF50]",
    },

    gold: {
      glow: "hover:border-[#CBE6C8]",
      value: "group-hover:text-[#38BE3C]",
      dot: "bg-[#81C784]",
    },
  };

  const selectedAccent = accent[emphasis];

  return (
    <div
      className={[
        "group relative min-h-[94px] overflow-visible border-b border-[#E5F2E5] px-5 py-4",
        "transform-gpu will-change-transform",
        "transition-all duration-300 ease-out",
        "hover:z-20 hover:-translate-y-1.5 hover:scale-[1.025]",
        "hover:bg-white hover:shadow-[0_18px_36px_rgba(53,39,29,.09)]",
        "last:border-b-0",
        "sm:border-b-0 sm:border-r sm:last:border-r-0",
        selectedAccent.glow,
      ].join(" ")}
    >
      <span
        className={[
          "pointer-events-none absolute right-5 top-4 h-1.5 w-1.5 rounded-full opacity-0",
          "transition-all duration-300",
          "group-hover:opacity-100",
          selectedAccent.dot,
        ].join(" ")}
      />

      <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#AAA097] transition-colors duration-300 group-hover:text-[#887D74]">
        {label}
      </p>

      <div className="mt-1 flex items-end gap-2">
        <span
          className={[
            "text-2xl font-black tracking-[-0.05em] text-[#302923]",
            "transform-gpu transition-all duration-300 ease-out",
            "group-hover:-translate-y-0.5 group-hover:scale-[1.06]",
            selectedAccent.value,
          ].join(" ")}
        >
          {value}
        </span>

        <span className="mb-1 text-[8px] font-semibold text-[#9D938B] transition-colors duration-300 group-hover:text-[#7F756D]">
          {note}
        </span>
      </div>

      <span className="absolute bottom-0 left-5 h-[2px] w-0 rounded-full bg-[#38BE3C] transition-all duration-300 group-hover:w-10" />
    </div>
  );
}

/* =========================================================
   IMPACT ICON
========================================================= */

function ImpactIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 4C12 4 6.5 6.5 6.5 12.5C6.5 16.5 9.2 20 12 20C14.8 20 17.5 16.5 17.5 12.5C17.5 6.5 12 4 12 4Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      <path
        d="M12 20V10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <path
        d="M12 14C10 14 8.5 12.8 8 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M12 12C14 12 15.5 10.8 16 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   REQUEST ICON
========================================================= */

function RequestIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />

      <path
        d="M3.5 19C4.3 15.7 6.1 14.2 9 14.2C11.9 14.2 13.7 15.7 14.5 19"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M18 8V14M15 11H21"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   CALENDAR ICON
========================================================= */

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M7 3V7M17 3V7M3 10H21"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   CLOCK ICON
========================================================= */

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />

      <path
        d="M12 7V12L15.5 14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   STAR ICON
========================================================= */

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3.8L14.48 8.82L20.02 9.63L16.01 13.54L16.96 19.06L12 16.45L7.04 19.06L7.99 13.54L3.98 9.63L9.52 8.82L12 3.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
