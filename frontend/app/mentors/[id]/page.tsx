"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { useParams, useRouter } from "next/navigation";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

type Skill = {
  id: number;
  name: string;
};

type Industry = {
  id: number;
  name: string;
  description?: string | null;
};

type MentorProfile = {
  id: number;
  user_id: number;
  industry_id: number | null;
  profile_photo: string | null;
  bio: string | null;
  location: string | null;
  job_title: string | null;
  company: string | null;
  experience_years: number | null;
  education: string | null;
  linkedin_url: string | null;
  timezone: string | null;
  avg_rating: string | number;
  total_reviews: number;
  industry: Industry | null;
};

type Mentee = {
  id: number;
  name: string;
};

type Feedback = {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string | null;
  mentee: Mentee | null;
};

type Availability = {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

type Mentor = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  completed_sessions_count: number;
  profile: MentorProfile | null;
  skills: Skill[];
  availabilities: Availability[];
  mentor_feedbacks: Feedback[];
};

type ApiResponse = {
  success: boolean;
  message: string;
  data: Mentor;
};

const dayNames: Record<number, string> = {
  0: "Minggu",
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
};

const skillLogoMap: Record<string, string> = {
  laravel: "laravel",
  "next.js": "nextdotjs",
  nextjs: "nextdotjs",
  react: "react",
  html: "html5",
  html5: "html5",
  css: "css",
  javascript: "javascript",
  typescript: "typescript",
  php: "php",
  python: "python",
  nodejs: "nodedotjs",
  "node.js": "nodedotjs",
  postgresql: "postgresql",
  mysql: "mysql",
  docker: "docker",
  figma: "figma",
  photoshop: "adobephotoshop",
  "adobe xd": "adobexd",
  notion: "notion",
  seo: "google",
  "social media": "meta",
  branding: "adobeillustrator",
};

function formatTime(time: string) {
  if (!time) return "-";
  return time.slice(0, 5);
}

function formatDate(date: string | null) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getSkillLogo(skillName: string) {
  return skillLogoMap[skillName.trim().toLowerCase()];
}

/* ============================================================
   SCROLL REVEAL
============================================================ */

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -60px 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
      }}
      className={`
        transform-gpu
        will-change-transform
        transition-all
        duration-700
        ease-out
        motion-reduce:transition-none
        ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/* ============================================================
   SKILL BADGE
============================================================ */

function SkillBadge({ skill }: { skill: Skill }) {
  const logo = getSkillLogo(skill.name);

  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-gray-100 bg-[#FCFBF8] px-3 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D6E0D6] hover:bg-[#F7F9F5]">
      {logo ? (
        <img
          src={`https://cdn.simpleicons.org/${logo}`}
          alt=""
          className="h-4 w-4 object-contain"
          loading="lazy"
        />
      ) : (
        <div className="flex h-4 w-4 items-center justify-center rounded bg-[#1E3F20] text-[8px] font-extrabold text-white">
          {skill.name.charAt(0).toUpperCase()}
        </div>
      )}

      <span className="text-xs font-bold text-gray-700">{skill.name}</span>
    </div>
  );
}

/* ============================================================
   RATING STARS
============================================================ */

function RatingStars({
  rating,
  size = "text-xs",
}: {
  rating: number;
  size?: string;
}) {
  const roundedRating = Math.round(rating);

  return (
    <div
      className={`flex items-center tracking-[0.08em] ${size} text-amber-500`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index}>{index < roundedRating ? "★" : "☆"}</span>
      ))}
    </div>
  );
}

/* ============================================================
   LOADING PAGE
============================================================ */

function LoadingPage() {
  return (
    <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-5 py-7 sm:px-6 sm:py-9 lg:px-8">
        <div className="mb-6 h-4 w-32 animate-pulse rounded bg-gray-200" />

        <div className="grid animate-pulse grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="h-[390px] rounded-[26px] bg-gray-200 sm:h-[430px] lg:h-[460px]" />
          </div>

          <div className="space-y-4 lg:col-span-7">
            <div className="h-6 w-36 rounded-full bg-gray-200" />
            <div className="h-10 w-4/5 rounded-xl bg-gray-200" />
            <div className="h-4 w-2/5 rounded bg-gray-200" />

            <div className="grid grid-cols-3 gap-3">
              <div className="h-20 rounded-2xl bg-gray-200" />
              <div className="h-20 rounded-2xl bg-gray-200" />
              <div className="h-20 rounded-2xl bg-gray-200" />
            </div>

            <div className="h-16 rounded-2xl bg-gray-200" />
          </div>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-8">
            <div className="h-44 rounded-[26px] bg-gray-200" />
            <div className="h-36 rounded-[26px] bg-gray-200" />
            <div className="h-48 rounded-[26px] bg-gray-200" />
          </div>

          <div className="space-y-5 lg:col-span-4">
            <div className="h-64 rounded-[26px] bg-gray-200" />
            <div className="h-44 rounded-[26px] bg-gray-200" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ============================================================
   MAIN PAGE
============================================================ */

export default function MentorDetailPage() {
  const router = useRouter();
  const params = useParams();

  const mentorId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? (params.id[0] ?? "")
        : "";

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!mentorId) return;

    const controller = new AbortController();

    const fetchMentor = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://127.0.0.1:8000/api/mentors/${mentorId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const result: ApiResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil detail mentor.");
        }

        setMentor(result.data);
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          return;
        }

        console.error("Gagal mengambil detail mentor:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil detail mentor.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMentor();

    return () => controller.abort();
  }, [mentorId]);

  const handleBooking = () => {
    if (!mentor) return;

    router.push(`/schedule?mentor_id=${mentor.id}`);
  };

  const activeAvailability = useMemo(() => {
    return mentor?.availabilities?.filter((item) => item.is_active) ?? [];
  }, [mentor]);

  const sortedAvailability = useMemo(() => {
    return [...activeAvailability].sort(
      (a, b) => a.day_of_week - b.day_of_week,
    );
  }, [activeAvailability]);

  const feedbacks = useMemo(() => {
    return mentor?.mentor_feedbacks ?? [];
  }, [mentor]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
        <Navbar />

        <main className="mx-auto max-w-3xl px-5 py-14 sm:px-6 sm:py-16">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition-colors hover:text-[#1E3F20]"
          >
            <span>←</span>
            Kembali
          </button>

          <div className="rounded-[26px] border border-red-100 bg-white p-8 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl font-bold text-red-600">
              !
            </div>

            <h1 className="mt-5 text-2xl font-extrabold text-[#2C1E16]">
              Mentor tidak ditemukan
            </h1>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
              {error || "Data mentor tidak tersedia."}
            </p>

            <button
              type="button"
              onClick={() => router.push("/mentors")}
              className="mt-6 rounded-xl bg-[#1E3F20] px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-md"
            >
              Kembali ke Daftar Mentor
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const profile = mentor.profile;

  const rating = Number(profile?.avg_rating || 0);
  const reviews = Number(profile?.total_reviews || 0);

  const image =
    profile?.profile_photo ||
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=85";

  const experience = profile?.experience_years ?? 0;
  const completedSessions = mentor.completed_sessions_count ?? 0;

  return (
    <div className="min-h-screen scroll-smooth bg-[#FCFBF8] font-sans text-[#2C1E16]">
      <Navbar />

      {/* ============================================================
          HERO PROFILE
      ============================================================ */}

      <section className="border-b border-[#E9E1D7] bg-[#F4EFE8]">
        <div className="mx-auto max-w-6xl px-5 py-7 sm:px-6 sm:py-9 lg:px-8">
          {/* BACK */}

          <Reveal>
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition-all duration-300 hover:-translate-x-0.5 hover:text-[#1E3F20]"
            >
              <span>←</span>
              Kembali ke Mentor
            </button>
          </Reveal>

          <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12 lg:gap-6">
            {/* ======================================================
                PHOTO
            ======================================================= */}

            <Reveal className="lg:col-span-5" delay={50}>
              <div className="group relative h-[390px] overflow-hidden rounded-[26px] bg-[#E8DED3] shadow-lg sm:h-[430px] lg:h-[460px]">
                <img
                  src={image}
                  alt={mentor.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

                {/* ONLINE */}

                <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 shadow-md backdrop-blur-sm">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700">
                    Online
                  </span>
                </div>

                {/* INDUSTRY */}

                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-flex items-center rounded-full bg-white/95 px-3.5 py-2 text-[11px] font-extrabold text-[#1E3F20] shadow-md">
                    {profile?.industry?.name || "Professional"}
                  </span>
                </div>
              </div>
            </Reveal>

            {/* ======================================================
                MAIN INFORMATION
            ======================================================= */}

            <Reveal className="lg:col-span-7" delay={120}>
              <div className="flex h-full flex-col rounded-[26px] border border-white bg-white p-5 shadow-sm sm:p-6 lg:p-7">
                {/* STATUS */}

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF2EA] px-3 py-1.5 text-[10px] font-extrabold text-[#1E3F20]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1E3F20]" />
                    Mentor Aktif
                  </span>

                  {profile?.location && (
                    <span className="inline-flex items-center rounded-full bg-[#F4EFE8] px-3 py-1.5 text-[10px] font-bold text-gray-600">
                      {profile.location}
                    </span>
                  )}
                </div>

                {/* NAME */}

                <h1 className="mt-4 text-3xl font-extrabold leading-[1.08] tracking-tight text-[#2C1E16] sm:text-4xl">
                  {mentor.name}
                </h1>

                <p className="mt-2.5 text-base font-bold text-[#1E3F20] sm:text-lg">
                  {profile?.job_title || "Mentor Career"}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {profile?.company || "Career Cafe"}
                </p>

                {/* RATING */}

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-amber-500">★</span>

                    <span className="text-base font-extrabold">
                      {rating.toFixed(1)}
                    </span>

                    <span className="text-xs text-gray-400">
                      ({reviews} review)
                    </span>
                  </div>

                  <div className="h-4 w-px bg-gray-200" />

                  <div className="text-xs text-gray-500">
                    <span className="font-bold text-[#2C1E16]">
                      {completedSessions}
                    </span>{" "}
                    sesi selesai
                  </div>
                </div>

                {/* QUICK STATS */}

                <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <div className="rounded-2xl bg-[#FAF7F2] p-3.5 transition-all duration-300 hover:-translate-y-0.5">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-gray-400">
                      Pengalaman
                    </p>

                    <p className="mt-1.5 text-sm font-extrabold">
                      {experience} tahun
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FAF7F2] p-3.5 transition-all duration-300 hover:-translate-y-0.5">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-gray-400">
                      Pendidikan
                    </p>

                    <p className="mt-1.5 line-clamp-2 text-xs font-extrabold">
                      {profile?.education || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FAF7F2] p-3.5 transition-all duration-300 hover:-translate-y-0.5">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-gray-400">
                      Format
                    </p>

                    <p className="mt-1.5 text-sm font-extrabold">
                      Video Meeting
                    </p>
                  </div>
                </div>

                {/* CTA */}

                <div className="mt-auto border-t border-gray-100 pt-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400">
                        Biaya konsultasi
                      </p>

                      <p className="mt-0.5 text-lg font-extrabold text-[#1E3F20]">
                        Gratis
                      </p>

                      <p className="mt-0.5 text-[9px] text-gray-400">
                        Durasi sesi 45 menit
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleBooking}
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E3F20] px-6 py-3.5 text-sm font-extrabold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-lg sm:w-auto"
                    >
                      Jadwalkan Sesi
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================================
          MAIN CONTENT
      ============================================================ */}

      <main className="mx-auto max-w-6xl px-5 py-9 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-7">
          {/* ========================================================
              LEFT
          ======================================================== */}

          <div className="space-y-5 lg:col-span-8">
            {/* ABOUT */}

            <Reveal>
              <section className="rounded-[26px] border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md sm:p-7">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF2EA] text-[#1E3F20]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="h-4.5 w-4.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-3-9.75h6M12 7.5v5.25l3 1.75"
                      />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold sm:text-xl">
                      Tentang Mentor
                    </h2>

                    <p className="mt-0.5 text-[10px] text-gray-400">
                      Profil dan pengalaman profesional
                    </p>
                  </div>
                </div>

                <p className="text-sm leading-7 text-gray-600">
                  {profile?.bio ||
                    "Mentor profesional yang siap membantu perjalanan kariermu melalui diskusi, pengalaman, dan arahan yang relevan."}
                </p>
              </section>
            </Reveal>

            {/* SKILLS */}

            <Reveal delay={80}>
              <section className="rounded-[26px] border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md sm:p-7">
                <div className="mb-4">
                  <h2 className="text-lg font-extrabold sm:text-xl">
                    Keahlian & Topik
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Area yang dapat kamu diskusikan bersama mentor.
                  </p>
                </div>

                {mentor.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {mentor.skills.map((skill) => (
                      <SkillBadge key={skill.id} skill={skill} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[#FAF7F2] p-5 text-sm text-gray-400">
                    Belum ada keahlian yang ditambahkan.
                  </div>
                )}
              </section>
            </Reveal>

            {/* AVAILABILITY */}

            <Reveal delay={120}>
              <section className="rounded-[26px] border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md sm:p-7">
                <div className="mb-4">
                  <h2 className="text-lg font-extrabold sm:text-xl">
                    Jadwal Tersedia
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Waktu yang tersedia untuk konsultasi dengan mentor.
                  </p>
                </div>

                {sortedAvailability.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {sortedAvailability.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-[#FAF7F2] p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F7F3EC]"
                      >
                        <div>
                          <p className="text-sm font-extrabold text-[#2C1E16]">
                            {dayNames[item.day_of_week] || "Hari"}
                          </p>

                          <p className="mt-1 text-xs font-bold text-[#1E3F20]">
                            {formatTime(item.start_time)} -{" "}
                            {formatTime(item.end_time)}
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF2EA] px-2.5 py-1 text-[9px] font-extrabold text-[#1E3F20]">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Tersedia
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[#FAF7F2] p-5">
                    <p className="text-sm text-gray-500">
                      Jadwal mentor belum tersedia.
                    </p>
                  </div>
                )}
              </section>
            </Reveal>

            {/* FEEDBACK */}

            <Reveal delay={160}>
              <section className="rounded-[26px] border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md sm:p-7">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold sm:text-xl">
                      Ulasan Mentor
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Pengalaman dari mentee yang pernah berkonsultasi.
                    </p>
                  </div>

                  <div className="w-fit rounded-2xl bg-[#FAF7F2] px-4 py-3 sm:text-right">
                    <div className="text-xl font-extrabold">
                      {rating.toFixed(1)}
                    </div>

                    <RatingStars rating={rating} size="text-sm" />

                    <p className="mt-1 text-[10px] text-gray-400">
                      {reviews} review
                    </p>
                  </div>
                </div>

                {feedbacks.length > 0 ? (
                  <div className="space-y-5">
                    {feedbacks.map((feedback) => {
                      const feedbackRating = Number(feedback.rating) || 0;

                      return (
                        <div
                          key={feedback.id}
                          className="border-t border-gray-100 pt-5 first:border-t-0 first:pt-0"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#1E3F20] text-xs font-extrabold text-white">
                                {feedback.mentee?.name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "U"}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-extrabold">
                                  {feedback.mentee?.name || "Pengguna"}
                                </p>

                                {feedback.created_at && (
                                  <p className="mt-0.5 text-[10px] text-gray-400">
                                    {formatDate(feedback.created_at)}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex-shrink-0">
                              <RatingStars rating={feedbackRating} />
                            </div>
                          </div>

                          {feedback.comment && (
                            <p className="mt-3 text-sm leading-6 text-gray-600">
                              “{feedback.comment}”
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[#FAF7F2] p-5 text-center">
                    <p className="text-sm text-gray-500">
                      Belum ada ulasan untuk mentor ini.
                    </p>
                  </div>
                )}
              </section>
            </Reveal>
          </div>

          {/* ========================================================
              RIGHT SIDEBAR
          ======================================================== */}

          <aside className="lg:col-span-4 lg:self-start">
            {/*
              PENTING:
              Sidebar sengaja TIDAK menggunakan sticky.
              Jadi seluruh bagian kanan akan ikut mengikuti
              scroll halaman bersama konten kiri.
            */}

            <div className="space-y-4">
              {/* CTA */}

              <Reveal delay={100}>
                <div className="overflow-hidden rounded-[26px] bg-[#1E3F20] p-6 text-white shadow-lg transition-all duration-300 hover:shadow-xl sm:p-7">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 6.75h7.5A2.25 2.25 0 0118 9v6a2.25 2.25 0 01-2.25 2.25h-7.5A2.25 2.25 0 016 15V9a2.25 2.25 0 012.25-2.25z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m18 10.5 3-1.5v6l-3-1.5"
                      />
                    </svg>
                  </div>

                  <p className="mt-4 text-[9px] font-extrabold uppercase tracking-[0.16em] text-white/60">
                    Mentor Career Cafe
                  </p>

                  <h3 className="mt-2 text-xl font-extrabold leading-tight sm:text-2xl">
                    Siap mulai konsultasi?
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/75">
                    Pilih jadwal yang sesuai dan mulai sesi video meeting
                    bersama mentor mengenai karier, skill, atau pengalaman
                    profesional.
                  </p>

                  <button
                    type="button"
                    onClick={handleBooking}
                    className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#1E3F20] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F4EFE8]"
                  >
                    Jadwalkan Sesi
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                </div>
              </Reveal>

              {/* INFO */}

              <Reveal delay={160}>
                <div className="rounded-[26px] border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                  <h3 className="text-base font-extrabold sm:text-lg">
                    Informasi Mentor
                  </h3>

                  <div className="mt-4 space-y-3.5">
                    <div>
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-gray-400">
                        Lokasi
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#2C1E16]">
                        {profile?.location || "-"}
                      </p>
                    </div>

                    <div className="border-t border-gray-100 pt-3.5">
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-gray-400">
                        Industri
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#2C1E16]">
                        {profile?.industry?.name || "-"}
                      </p>
                    </div>

                    <div className="border-t border-gray-100 pt-3.5">
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-gray-400">
                        Zona Waktu
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#2C1E16]">
                        {profile?.timezone || "Asia/Makassar"}
                      </p>
                    </div>

                    <div className="border-t border-gray-100 pt-3.5">
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-gray-400">
                        Sesi selesai
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#2C1E16]">
                        {completedSessions} sesi
                      </p>
                    </div>

                    {profile?.linkedin_url && (
                      <div className="border-t border-gray-100 pt-3.5">
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-bold text-[#1E3F20] transition-all duration-300 hover:translate-x-0.5 hover:underline"
                        >
                          Lihat LinkedIn
                          <span>↗</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>

              {/* QUICK ACTION */}

              <Reveal delay={220}>
                <button
                  type="button"
                  onClick={() => router.push("/mentors")}
                  className="group flex w-full items-center justify-between rounded-[22px] border border-gray-100 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div>
                    <p className="text-sm font-extrabold text-[#2C1E16]">
                      Cari mentor lainnya
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Lihat semua mentor yang tersedia.
                    </p>
                  </div>

                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#EAF2EA] font-bold text-[#1E3F20] transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </Reveal>
            </div>
          </aside>
        </div>
      </main>

      {/* ============================================================
          SHARED FOOTER
      ============================================================ */}

      <Footer />
    </div>
  );
}
