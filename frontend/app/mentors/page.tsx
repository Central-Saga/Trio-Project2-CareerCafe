"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { useRouter } from "next/navigation";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type Skill = {
  id?: number;
  name: string;
};

type Industry = {
  id?: number;
  name: string;
};

type Profile = {
  job_title?: string | null;
  company?: string | null;
  location?: string | null;
  profile_photo?: string | null;
  bio?: string | null;
  experience_years?: number | null;
  avg_rating?: number | string | null;
  total_reviews?: number | null;
  education?: string | null;
  industry?: Industry | null;
  hourly_rate?: number | null;
  session_price?: number | null;
};

type Mentor = {
  id: number;
  name: string;
  email?: string;
  role?: string;
  status?: string;
  profile?: Profile | null;
  skills?: Skill[];
  completed_sessions_count?: number;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: Mentor[];
  pagination?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
};

/* ============================================================
   SKILL LOGO
============================================================ */

const skillLogoMap: Record<
  string,
  {
    slug?: string;
    label: string;
  }
> = {
  laravel: {
    slug: "laravel",
    label: "Laravel",
  },

  "next.js": {
    slug: "nextdotjs",
    label: "Next.js",
  },

  nextjs: {
    slug: "nextdotjs",
    label: "Next.js",
  },

  react: {
    slug: "react",
    label: "React",
  },

  html: {
    slug: "html5",
    label: "HTML",
  },

  html5: {
    slug: "html5",
    label: "HTML5",
  },

  css: {
    slug: "css",
    label: "CSS",
  },

  javascript: {
    slug: "javascript",
    label: "JavaScript",
  },

  typescript: {
    slug: "typescript",
    label: "TypeScript",
  },

  php: {
    slug: "php",
    label: "PHP",
  },

  python: {
    slug: "python",
    label: "Python",
  },

  nodejs: {
    slug: "nodedotjs",
    label: "Node.js",
  },

  "node.js": {
    slug: "nodedotjs",
    label: "Node.js",
  },

  postgresql: {
    slug: "postgresql",
    label: "PostgreSQL",
  },

  mysql: {
    slug: "mysql",
    label: "MySQL",
  },

  docker: {
    slug: "docker",
    label: "Docker",
  },

  figma: {
    slug: "figma",
    label: "Figma",
  },

  photoshop: {
    slug: "adobephotoshop",
    label: "Photoshop",
  },

  "adobe xd": {
    slug: "adobexd",
    label: "Adobe XD",
  },

  notion: {
    slug: "notion",
    label: "Notion",
  },

  seo: {
    slug: "google",
    label: "SEO",
  },

  "social media": {
    slug: "meta",
    label: "Social Media",
  },

  branding: {
    slug: "adobeillustrator",
    label: "Branding",
  },
};

function normalizeSkillName(name: string) {
  return name.trim().toLowerCase();
}

function getSkillLogo(skillName: string) {
  const normalized = normalizeSkillName(skillName);

  return (
    skillLogoMap[normalized] ?? {
      label: skillName,
    }
  );
}

/* ============================================================
   PRICE
============================================================ */

function getMentorPrice(
  sessionPrice?: number | null,
  hourlyRate?: number | null,
) {
  if (
    typeof sessionPrice === "number" &&
    Number.isFinite(sessionPrice) &&
    sessionPrice > 0
  ) {
    return sessionPrice;
  }

  if (
    typeof hourlyRate === "number" &&
    Number.isFinite(hourlyRate) &&
    hourlyRate > 0
  ) {
    return hourlyRate;
  }

  return 0;
}

function formatPrice(sessionPrice?: number | null, hourlyRate?: number | null) {
  const price = getMentorPrice(sessionPrice, hourlyRate);

  if (price <= 0) {
    return "Gratis";
  }

  return `Rp${price.toLocaleString("id-ID")}`;
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
        threshold: 0.12,
        rootMargin: "0px 0px -50px 0px",
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
      className={`transform-gpu transition-all duration-700 ease-out motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ============================================================
   SKILL BADGE
============================================================ */

function MentorSkill({ skill }: { skill: Skill }) {
  const logo = getSkillLogo(skill.name);

  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg border border-gray-100 bg-[#FCFBF8] px-2.5 py-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D8E1D8] hover:bg-[#F7F9F5]">
      {logo.slug ? (
        <img
          src={`https://cdn.simpleicons.org/${logo.slug}`}
          alt={logo.label}
          className="h-4 w-4 object-contain"
          loading="lazy"
        />
      ) : (
        <div className="flex h-4 w-4 items-center justify-center rounded bg-[#1E3F20] text-[8px] font-extrabold text-white">
          {skill.name.charAt(0).toUpperCase()}
        </div>
      )}

      <span className="text-[10px] font-bold text-gray-700">{skill.name}</span>
    </div>
  );
}

/* ============================================================
   MENTOR CARD
============================================================ */

function MentorCard({
  mentor,
  onOpen,
}: {
  mentor: Mentor;
  onOpen: () => void;
}) {
  const profile = mentor.profile;

  const rating =
    profile?.avg_rating !== null && profile?.avg_rating !== undefined
      ? Number(profile.avg_rating).toFixed(1)
      : "0.0";

  const reviews = profile?.total_reviews ?? 0;

  const price = formatPrice(profile?.session_price, profile?.hourly_rate);

  const image =
    profile?.profile_photo ||
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85";

  const skills = mentor.skills ?? [];

  return (
    <article className="group overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-xl">
      <div className="grid min-h-[265px] grid-cols-[minmax(0,1fr)_125px] sm:grid-cols-[minmax(0,1fr)_155px] lg:grid-cols-[minmax(0,1fr)_175px]">
        {/* ======================================================
            KONTEN
        ======================================================= */}
        <div className="flex min-w-0 flex-col p-4 sm:p-5 lg:p-6">
          {/* BADGE + RATING */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex w-fit items-center rounded-full bg-[#EAF2EA] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-[#1E3F20] transition-colors duration-300">
              Mentor Profesional
            </span>

            <div className="flex items-center gap-1 rounded-full bg-[#FFF8E6] px-2.5 py-1 transition-transform duration-300 group-hover:scale-[1.02]">
              <span className="text-xs text-yellow-500">★</span>

              <span className="text-[10px] font-extrabold text-[#2C1E16]">
                {rating}
              </span>

              <span className="text-[9px] font-semibold text-gray-400">
                ({reviews})
              </span>
            </div>
          </div>

          {/* NAMA + PROFESI */}
          <div className="mt-4">
            <h2 className="line-clamp-1 text-lg font-extrabold tracking-tight text-[#2C1E16] transition-colors duration-300 group-hover:text-[#1E3F20] sm:text-xl">
              {mentor.name}
            </h2>

            <p className="mt-0.5 line-clamp-1 text-xs font-bold text-[#1E3F20] sm:text-sm">
              {profile?.job_title || "Professional Mentor"}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[10px] text-gray-500">
              {profile?.company && (
                <span className="line-clamp-1">{profile.company}</span>
              )}

              {profile?.location && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>{profile.location}</span>
                </>
              )}
            </div>
          </div>

          {/* BIO */}
          <p className="mt-3 line-clamp-3 text-[11px] leading-5 text-gray-500 sm:text-xs">
            {profile?.bio ||
              "Mentor berpengalaman yang siap membantu kamu berkembang, berdiskusi, dan menemukan langkah karier yang tepat."}
          </p>

          {/* SKILL */}
          <div className="mt-3">
            <p className="mb-2 text-[9px] font-extrabold uppercase tracking-[0.14em] text-gray-400">
              Ahli dalam
            </p>

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 4).map((skill) => (
                  <MentorSkill
                    key={`${mentor.id}-${skill.id ?? skill.name}`}
                    skill={skill}
                  />
                ))}

                {skills.length > 4 && (
                  <div className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1.5 text-[10px] font-bold text-gray-500">
                    +{skills.length - 4}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-gray-400">
                Keahlian belum tersedia.
              </p>
            )}
          </div>

          {/* CARD FOOTER */}
          <div className="mt-auto pt-4">
            <div className="flex items-end justify-between gap-3 border-t border-gray-100 pt-3">
              <div className="min-w-0">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-gray-400">
                  Harga sesi
                </p>

                <div className="mt-0.5 flex items-baseline gap-1">
                  <span className="truncate text-base font-extrabold text-[#1E3F20] sm:text-lg">
                    {price}
                  </span>

                  <span className="text-[9px] font-semibold text-gray-400">
                    / 45 mnt
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpen}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#1E3F20] px-3.5 py-2.5 text-[10px] font-extrabold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#173119] hover:shadow-md active:translate-y-0"
              >
                Profil
                <span className="text-xs transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================
            FOTO KANAN
        ======================================================= */}
        <div className="relative min-h-full overflow-hidden bg-[#EAF2EA]">
          <img
            src={image}
            alt={mentor.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
          />

          <div className="absolute inset-0 bg-gradient-to-l from-black/15 via-transparent to-transparent transition-opacity duration-500 group-hover:from-black/20" />

          <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 shadow-md backdrop-blur-sm transition-transform duration-300 group-hover:-translate-y-0.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />

            <span className="text-[8px] font-extrabold uppercase tracking-wide text-gray-700">
              Online
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   SKELETON
============================================================ */

function MentorSkeleton() {
  return (
    <div className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
      <div className="grid min-h-[265px] grid-cols-[minmax(0,1fr)_125px] sm:grid-cols-[minmax(0,1fr)_155px] lg:grid-cols-[minmax(0,1fr)_175px]">
        <div className="animate-pulse p-5">
          <div className="h-5 w-28 rounded-full bg-gray-200" />

          <div className="mt-5 h-7 w-48 max-w-full rounded-lg bg-gray-200" />

          <div className="mt-2 h-4 w-36 rounded bg-gray-100" />

          <div className="mt-4 h-12 w-full rounded-lg bg-gray-100" />

          <div className="mt-4 flex gap-2">
            <div className="h-7 w-20 rounded-lg bg-gray-100" />
            <div className="h-7 w-20 rounded-lg bg-gray-100" />
          </div>

          <div className="mt-5 border-t border-gray-100 pt-3">
            <div className="h-3 w-20 rounded bg-gray-100" />

            <div className="mt-2 h-6 w-28 rounded bg-gray-200" />
          </div>
        </div>

        <div className="animate-pulse bg-gray-200" />
      </div>
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function MentorsPage() {
  const router = useRouter();

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  /* ============================================================
     SEARCH DEBOUNCE
  ============================================================ */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [search]);

  /* ============================================================
     FETCH MENTORS
  ============================================================ */

  useEffect(() => {
    const controller = new AbortController();

    const fetchMentors = async () => {
      try {
        setLoading(true);
        setError("");

        const query = new URLSearchParams({
          per_page: "20",
        });

        if (debouncedSearch) {
          query.set("search", debouncedSearch);
        }

        const response = await fetch(
          `http://127.0.0.1:8000/api/mentors?${query.toString()}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            signal: controller.signal,
          },
        );

        const data: ApiResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Data mentor gagal dimuat.");
        }

        setMentors(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil data mentor.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();

    return () => controller.abort();
  }, [debouncedSearch]);

  /* ============================================================
     INDUSTRIES
  ============================================================ */

  const industries = useMemo(() => {
    const values = mentors
      .map((mentor) => mentor.profile?.industry?.name)
      .filter((value): value is string => Boolean(value));

    return Array.from(new Set(values)).sort();
  }, [mentors]);

  /* ============================================================
     FILTERS
  ============================================================ */

  const filteredMentors = useMemo(() => {
    return mentors.filter((mentor) => {
      const profile = mentor.profile;

      const rating = Number(profile?.avg_rating ?? 0);

      const experience = Number(profile?.experience_years ?? 0);

      const price = getMentorPrice(
        profile?.session_price,
        profile?.hourly_rate,
      );

      const industry = profile?.industry?.name?.toLowerCase() ?? "";

      /* INDUSTRY */

      if (
        industryFilter !== "all" &&
        industry !== industryFilter.toLowerCase()
      ) {
        return false;
      }

      /* PRICE */

      if (priceFilter === "free" && price > 0) {
        return false;
      }

      if (priceFilter === "under100" && (price === 0 || price >= 100000)) {
        return false;
      }

      if (priceFilter === "100to200" && (price < 100000 || price > 200000)) {
        return false;
      }

      if (priceFilter === "above200" && price <= 200000) {
        return false;
      }

      /* RATING */

      if (ratingFilter === "4plus" && rating < 4) {
        return false;
      }

      if (ratingFilter === "4.5plus" && rating < 4.5) {
        return false;
      }

      if (ratingFilter === "4.8plus" && rating < 4.8) {
        return false;
      }

      /* EXPERIENCE */

      if (experienceFilter === "1plus" && experience < 1) {
        return false;
      }

      if (experienceFilter === "3plus" && experience < 3) {
        return false;
      }

      if (experienceFilter === "5plus" && experience < 5) {
        return false;
      }

      return true;
    });
  }, [mentors, industryFilter, priceFilter, ratingFilter, experienceFilter]);

  /* ============================================================
     ACTIVE FILTER COUNT
  ============================================================ */

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (industryFilter !== "all") count++;

    if (priceFilter !== "all") count++;

    if (ratingFilter !== "all") count++;

    if (experienceFilter !== "all") count++;

    return count;
  }, [industryFilter, priceFilter, ratingFilter, experienceFilter]);

  /* ============================================================
     RESET FILTER
  ============================================================ */

  const resetFilters = () => {
    setIndustryFilter("all");
    setPriceFilter("all");
    setRatingFilter("all");
    setExperienceFilter("all");
  };

  return (
    <div className="min-h-screen scroll-smooth bg-[#FCFBF8] font-sans text-[#2C1E16]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-5 py-9 sm:px-6 sm:py-12 lg:px-8">
        {/* ======================================================
            HEADER
        ======================================================= */}
        <Reveal>
          <section className="mb-8 text-center sm:mb-9">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#EAF2EA] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#1E3F20]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1E3F20]" />
              Career Mentoring
            </div>

            <h1 className="mx-auto max-w-4xl text-3xl font-extrabold tracking-tight text-[#2C1E16] sm:text-4xl">
              Temukan mentor yang tepat
              <span className="block text-[#1E3F20]">
                untuk perjalanan kariermu.
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-500">
              Belajar langsung dari profesional berpengalaman, diskusikan
              tantangan kariermu, dan dapatkan arahan yang relevan dengan
              tujuanmu.
            </p>
          </section>
        </Reveal>

        {/* ======================================================
            SEARCH + FILTER
        ======================================================= */}
        <Reveal delay={100}>
          <section className="mb-8">
            <div className="rounded-3xl border border-gray-100 bg-white p-3 shadow-sm transition-all duration-500 hover:shadow-md">
              <div className="flex flex-col gap-2.5 xl:flex-row">
                {/* SEARCH */}
                <div className="relative min-w-0 flex-1">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                        d="m21 21-4.534-4.534m0 0A7.5 7.5 0 1 0 5.86 5.86a7.5 7.5 0 0 0 10.607 10.607Z"
                      />
                    </svg>
                  </div>

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari mentor, skill, atau bidang..."
                    className="w-full rounded-2xl border border-gray-200 bg-[#FCFBF8] py-3 pl-11 pr-11 text-sm text-[#2C1E16] outline-none transition-all duration-300 focus:border-[#1E3F20] focus:ring-4 focus:ring-[#1E3F20]/10"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-all duration-300 hover:rotate-90 hover:text-gray-700"
                      aria-label="Hapus pencarian"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 6l12 12M18 6 6 18"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* INDUSTRY */}
                <div className="xl:w-40">
                  <select
                    value={industryFilter}
                    onChange={(event) => setIndustryFilter(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-[#FCFBF8] px-4 py-3 text-xs font-semibold text-gray-700 outline-none transition-all duration-300 focus:border-[#1E3F20] focus:ring-4 focus:ring-[#1E3F20]/10"
                  >
                    <option value="all">Semua Bidang</option>

                    {industries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PRICE */}
                <div className="xl:w-40">
                  <select
                    value={priceFilter}
                    onChange={(event) => setPriceFilter(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-[#FCFBF8] px-4 py-3 text-xs font-semibold text-gray-700 outline-none transition-all duration-300 focus:border-[#1E3F20] focus:ring-4 focus:ring-[#1E3F20]/10"
                  >
                    <option value="all">Semua Harga</option>
                    <option value="free">Gratis</option>
                    <option value="under100">Di bawah Rp100rb</option>
                    <option value="100to200">Rp100rb - Rp200rb</option>
                    <option value="above200">Di atas Rp200rb</option>
                  </select>
                </div>

                {/* RATING */}
                <div className="xl:w-36">
                  <select
                    value={ratingFilter}
                    onChange={(event) => setRatingFilter(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-[#FCFBF8] px-4 py-3 text-xs font-semibold text-gray-700 outline-none transition-all duration-300 focus:border-[#1E3F20] focus:ring-4 focus:ring-[#1E3F20]/10"
                  >
                    <option value="all">Semua Rating</option>
                    <option value="4plus">⭐ 4.0+</option>
                    <option value="4.5plus">⭐ 4.5+</option>
                    <option value="4.8plus">⭐ 4.8+</option>
                  </select>
                </div>

                {/* EXPERIENCE */}
                <div className="xl:w-36">
                  <select
                    value={experienceFilter}
                    onChange={(event) =>
                      setExperienceFilter(event.target.value)
                    }
                    className="w-full rounded-2xl border border-gray-200 bg-[#FCFBF8] px-4 py-3 text-xs font-semibold text-gray-700 outline-none transition-all duration-300 focus:border-[#1E3F20] focus:ring-4 focus:ring-[#1E3F20]/10"
                  >
                    <option value="all">Pengalaman</option>
                    <option value="1plus">1+ tahun</option>
                    <option value="3plus">3+ tahun</option>
                    <option value="5plus">5+ tahun</option>
                  </select>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 px-1 pt-2.5">
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <span className="font-semibold">
                    {loading
                      ? "Memuat mentor..."
                      : `${filteredMentors.length} mentor ditemukan`}
                  </span>

                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-[#EAF2EA] px-2 py-0.5 font-bold text-[#1E3F20]">
                      {activeFilterCount} filter aktif
                    </span>
                  )}
                </div>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-[10px] font-bold text-[#1E3F20] transition-all duration-300 hover:translate-x-0.5 hover:underline"
                  >
                    Reset filter
                  </button>
                )}
              </div>
            </div>
          </section>
        </Reveal>

        {/* ======================================================
            ERROR
        ======================================================= */}
        {error && (
          <Reveal>
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          </Reveal>
        )}

        {/* ======================================================
            MENTOR GRID
        ======================================================= */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <MentorSkeleton />
              <MentorSkeleton />
              <MentorSkeleton />
              <MentorSkeleton />
            </div>
          ) : filteredMentors.length === 0 ? (
            <Reveal>
              <div className="rounded-[24px] border border-dashed border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF2EA] text-[#1E3F20]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.6}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-4.35-4.35m1.1-5.4A6.5 6.5 0 1 1 4.75 4.75a6.5 6.5 0 0 1 13 6.5Z"
                    />
                  </svg>
                </div>

                <h2 className="mt-4 text-lg font-extrabold">
                  Mentor tidak ditemukan
                </h2>

                <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-gray-500">
                  Coba ubah kata pencarian atau gunakan filter yang berbeda.
                </p>

                <div className="mt-5 flex justify-center gap-2">
                  {(activeFilterCount > 0 || search) && (
                    <button
                      type="button"
                      onClick={() => {
                        resetFilters();
                        setSearch("");
                      }}
                      className="rounded-xl bg-[#1E3F20] px-4 py-2.5 text-[10px] font-extrabold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#173119] hover:shadow-md"
                    >
                      Reset Semua
                    </button>
                  )}
                </div>
              </div>
            </Reveal>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {filteredMentors.map((mentor, index) => (
                <Reveal key={mentor.id} delay={Math.min(index * 90, 450)}>
                  <MentorCard
                    mentor={mentor}
                    onOpen={() => router.push(`/mentors/${mentor.id}`)}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ============================================================
          SHARED FOOTER
      ============================================================ */}
      <Footer />
    </div>
  );
}
