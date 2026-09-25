"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  skills: string[];
  description: string;
  salary: string;
  posted_at: string | null;
  is_active: boolean;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

const jobTypes = [
  "Semua Tipe",
  "Full Time",
  "Part Time",
  "Hybrid",
  "Remote",
  "Internship",
];

const locations = [
  "Semua Lokasi",
  "Denpasar, Bali",
  "Badung, Bali",
  "Gianyar, Bali",
  "Bali",
  "Bali / Remote",
  "Remote",
];

const categoryStyles: Record<
  string,
  {
    badge: string;
    icon: string;
    iconText: string;
  }
> = {
  Technology: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    icon: "bg-emerald-50 text-emerald-700",
    iconText: "T",
  },
  Design: {
    badge: "bg-violet-50 text-violet-700 border-violet-100",
    icon: "bg-violet-50 text-violet-700",
    iconText: "D",
  },
  Product: {
    badge: "bg-sky-50 text-sky-700 border-sky-100",
    icon: "bg-sky-50 text-sky-700",
    iconText: "P",
  },
  "Product Management": {
    badge: "bg-sky-50 text-sky-700 border-sky-100",
    icon: "bg-sky-50 text-sky-700",
    iconText: "P",
  },
  Marketing: {
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    icon: "bg-amber-50 text-amber-700",
    iconText: "M",
  },
  "Digital Marketing": {
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    icon: "bg-amber-50 text-amber-700",
    iconText: "M",
  },
};

const typeStyles: Record<string, string> = {
  "Full Time": "bg-[#1E3F20]/8 text-[#1E3F20] border-[#1E3F20]/10",
  "Part Time": "bg-pink-50 text-pink-700 border-pink-100",
  Hybrid: "bg-sky-50 text-sky-700 border-sky-100",
  Remote: "bg-violet-50 text-violet-700 border-violet-100",
  Internship: "bg-orange-50 text-orange-700 border-orange-100",
};

/* =========================================================
   REVEAL CARD
   Tetap menggunakan animasi yang kamu suka
========================================================= */

function RevealCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
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
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
      }}
      className={[
        "transition-all duration-700 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/* =========================================================
   REVEAL ITEM
   Untuk Search / Filter / Heading
========================================================= */

function RevealItem({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
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
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.12,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
      }}
      className={[
        "transform-gpu transition-all duration-700 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/* =========================================================
   FORMAT POSTED DATE
========================================================= */

function formatPostedDate(postedAt: string | null): string {
  if (!postedAt) {
    return "baru saja";
  }

  const posted = new Date(postedAt);

  if (Number.isNaN(posted.getTime())) {
    return "baru saja";
  }

  const now = new Date();

  const diffMs = Math.max(0, now.getTime() - posted.getTime());

  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "baru saja";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} menit lalu`;
  }

  if (diffHours < 24) {
    return `${diffHours} jam lalu`;
  }

  if (diffDays < 7) {
    return `${diffDays} hari lalu`;
  }

  if (diffDays < 14) {
    return "1 minggu lalu";
  }

  if (diffDays < 21) {
    return "2 minggu lalu";
  }

  return `${Math.floor(diffDays / 7)} minggu lalu`;
}

export default function JobsPage() {
  const router = useRouter();

  /* =======================================================
     STATE
  ======================================================= */

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("Semua Tipe");
  const [location, setLocation] = useState("Semua Lokasi");
  const [sortBy, setSortBy] = useState("terbaru");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

  /* =======================================================
     LOAD SAVED JOBS
  ======================================================= */

  useEffect(() => {
    const storedSavedJobs = localStorage.getItem("saved_jobs");

    if (!storedSavedJobs) {
      return;
    }

    try {
      const parsed = JSON.parse(storedSavedJobs);

      if (Array.isArray(parsed)) {
        setSavedJobs(parsed);
      }
    } catch {
      localStorage.removeItem("saved_jobs");
    }
  }, []);

  /* =======================================================
     FETCH JOBS FROM LARAVEL API
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/jobs`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `Gagal mengambil data jobs. Status: ${response.status}`,
          );
        }

        const result = await response.json();

        if (!result?.success) {
          throw new Error(result?.message ?? "Data lowongan gagal diambil.");
        }

        if (!Array.isArray(result?.data)) {
          throw new Error("Format data API Jobs tidak sesuai.");
        }

        if (!cancelled) {
          setJobs(result.data);
        }
      } catch (fetchError) {
        if (cancelled) {
          return;
        }

        console.error("Fetch jobs error:", fetchError);

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Terjadi kesalahan saat mengambil data lowongan.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchJobs();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     SAVE JOB
  ======================================================= */

  const toggleSaveJob = (event: React.MouseEvent, jobId: number) => {
    event.stopPropagation();

    setSavedJobs((current) => {
      const next = current.includes(jobId)
        ? current.filter((id) => id !== jobId)
        : [...current, jobId];

      localStorage.setItem("saved_jobs", JSON.stringify(next));

      return next;
    });
  };

  /* =======================================================
     OPEN JOB DETAIL
  ======================================================= */

  const openJob = (jobId: number) => {
    router.push(`/jobs/${jobId}`);
  };

  const handleCardKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
    jobId: number,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openJob(jobId);
    }
  };

  /* =======================================================
     FILTER & SORT
  ======================================================= */

  const filteredJobs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    let result = jobs.filter((job) => {
      const matchesSearch =
        !normalizedSearch ||
        job.title.toLowerCase().includes(normalizedSearch) ||
        job.company.toLowerCase().includes(normalizedSearch) ||
        job.category.toLowerCase().includes(normalizedSearch) ||
        job.location.toLowerCase().includes(normalizedSearch) ||
        job.skills.some((skill) =>
          skill.toLowerCase().includes(normalizedSearch),
        );

      const matchesType = jobType === "Semua Tipe" || job.type === jobType;

      const matchesLocation =
        location === "Semua Lokasi" || job.location === location;

      const matchesSaved = !showSavedOnly || savedJobs.includes(job.id);

      return matchesSearch && matchesType && matchesLocation && matchesSaved;
    });

    if (sortBy === "az") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sortBy === "za") {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title));
    }

    if (sortBy === "terbaru") {
      result = [...result].sort((a, b) => {
        const first = a.posted_at ? new Date(a.posted_at).getTime() : 0;

        const second = b.posted_at ? new Date(b.posted_at).getTime() : 0;

        return second - first;
      });
    }

    return result;
  }, [jobs, search, jobType, location, sortBy, showSavedOnly, savedJobs]);

  /* =======================================================
     RESET FILTER
  ======================================================= */

  const clearFilters = () => {
    setSearch("");
    setJobType("Semua Tipe");
    setLocation("Semua Lokasi");
    setSortBy("terbaru");
    setShowSavedOnly(false);
  };

  /* =======================================================
     RETRY
  ======================================================= */

  const retryFetchJobs = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <Navbar />

      <main>
        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="hero-blob hero-blob-one absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#1E3F20]/6 blur-3xl" />

            <div className="hero-blob hero-blob-two absolute top-40 -left-24 h-72 w-72 rounded-full bg-[#D8B48A]/10 blur-3xl" />

            <div className="hero-blob hero-blob-three absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-violet-100/35 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-6 pb-7 pt-7 sm:pb-8 sm:pt-9 lg:pt-10">
            <div className="mx-auto max-w-2xl text-center">
              <span className="hero-badge inline-flex items-center gap-2 rounded-full border border-[#1E3F20]/10 bg-white/85 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1E3F20] shadow-sm backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1E3F20]" />
                Career Opportunities
              </span>

              <h1 className="hero-title mt-4 text-3xl font-extrabold tracking-tight text-[#2C1E16] sm:text-4xl lg:text-[40px]">
                Temukan peluang
                <br />
                <span className="text-[#1E3F20]">karier yang tepat</span>
              </h1>

              <div className="hero-line mx-auto mt-4 h-px bg-[#1E3F20]/20" />

              <p className="hero-description mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-600 sm:text-[15px]">
                Cari lowongan yang sesuai dengan keahlian, pengalaman, dan
                tujuan kariermu.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            SEARCH & FILTER
        ====================================================== */}

        <section className="mx-auto max-w-7xl px-6 pb-10">
          <RevealCard delay={80}>
            <div className="rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-[0_12px_40px_rgba(44,30,22,0.05)] backdrop-blur sm:p-5">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.8fr_1fr_1fr_auto]">
                {/* SEARCH */}

                <RevealItem delay={100} className="min-w-0">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">
                      ⌕
                    </span>

                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Cari posisi, perusahaan, atau skill..."
                      className="h-12 w-full rounded-2xl border border-gray-200 bg-[#FCFBF8] pl-11 pr-4 text-sm text-[#2C1E16] outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-[#1E3F20]/40 focus:bg-white focus:ring-4 focus:ring-[#1E3F20]/5"
                    />
                  </div>
                </RevealItem>

                {/* TYPE */}

                <RevealItem delay={160}>
                  <select
                    value={jobType}
                    onChange={(event) => setJobType(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-gray-200 bg-[#FCFBF8] px-4 text-sm text-[#2C1E16] outline-none transition-all duration-300 focus:border-[#1E3F20]/40 focus:bg-white focus:ring-4 focus:ring-[#1E3F20]/5"
                  >
                    {jobTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </RevealItem>

                {/* LOCATION */}

                <RevealItem delay={220}>
                  <select
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-gray-200 bg-[#FCFBF8] px-4 text-sm text-[#2C1E16] outline-none transition-all duration-300 focus:border-[#1E3F20]/40 focus:bg-white focus:ring-4 focus:ring-[#1E3F20]/5"
                  >
                    {locations.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </RevealItem>

                {/* RESET */}

                <RevealItem delay={280}>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-5 text-sm font-bold text-gray-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm lg:w-auto"
                  >
                    Reset
                  </button>
                </RevealItem>
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                {/* SAVED */}

                <RevealItem delay={340}>
                  <button
                    type="button"
                    onClick={() => setShowSavedOnly((current) => !current)}
                    className={[
                      "inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all duration-300 sm:w-auto",
                      showSavedOnly
                        ? "border-[#1E3F20] bg-[#1E3F20] text-white shadow-md"
                        : "border-[#1E3F20]/15 bg-white text-[#1E3F20] hover:bg-[#1E3F20]/5 hover:shadow-sm",
                    ].join(" ")}
                  >
                    <span className={showSavedOnly ? "animate-pulse" : ""}>
                      {showSavedOnly ? "♥" : "♡"}
                    </span>

                    {showSavedOnly
                      ? "Menampilkan Tersimpan"
                      : `Lowongan Tersimpan (${savedJobs.length})`}
                  </button>
                </RevealItem>

                {/* SORT */}

                <RevealItem delay={400}>
                  <div className="flex items-center justify-between gap-2 sm:justify-end">
                    <span className="text-xs font-medium text-gray-400">
                      Urutkan:
                    </span>

                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                      className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 outline-none transition-all duration-300 focus:border-[#1E3F20]/30 focus:ring-4 focus:ring-[#1E3F20]/5"
                    >
                      <option value="terbaru">Terbaru</option>

                      <option value="az">A - Z</option>

                      <option value="za">Z - A</option>
                    </select>
                  </div>
                </RevealItem>
              </div>
            </div>
          </RevealCard>
        </section>

        {/* =====================================================
            JOB LIST
        ====================================================== */}

        <section className="mx-auto max-w-7xl px-6 pb-20">
          <RevealItem delay={60}>
            <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#1E3F20]">
                  Lowongan tersedia
                </p>

                <h2 className="mt-1 text-2xl font-extrabold text-[#2C1E16] sm:text-3xl">
                  {loading
                    ? "Memuat lowongan..."
                    : `${filteredJobs.length} peluang ditemukan`}
                </h2>
              </div>

              {!loading && !error && (
                <div className="text-xs text-gray-400">
                  Klik kartu untuk melihat detail
                </div>
              )}
            </div>
          </RevealItem>

          {/* ===================================================
              LOADING
          ==================================================== */}

          {loading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="min-h-[360px] animate-pulse rounded-[26px] border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-gray-100" />

                  <div className="mx-auto mt-5 h-3 w-28 rounded bg-gray-100" />

                  <div className="mx-auto mt-3 h-5 w-44 rounded bg-gray-100" />

                  <div className="mx-auto mt-5 flex justify-center gap-2">
                    <div className="h-6 w-20 rounded-full bg-gray-100" />
                    <div className="h-6 w-20 rounded-full bg-gray-100" />
                  </div>

                  <div className="mx-auto mt-5 h-3 w-32 rounded bg-gray-100" />

                  <div className="mx-auto mt-4 h-10 w-56 rounded bg-gray-100" />

                  <div className="mt-5 border-t border-gray-100 pt-4">
                    <div className="mx-auto h-5 w-28 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* =================================================
               ERROR
            ================================================== */

            <RevealCard delay={120}>
              <div className="rounded-[28px] border border-red-100 bg-white p-10 text-center shadow-sm sm:p-16">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-500">
                  !
                </div>

                <h3 className="mt-5 text-xl font-extrabold text-[#2C1E16]">
                  Gagal memuat lowongan
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={retryFetchJobs}
                  className="mt-6 rounded-xl bg-[#1E3F20] px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-lg"
                >
                  Coba Lagi
                </button>
              </div>
            </RevealCard>
          ) : filteredJobs.length === 0 ? (
            /* =================================================
               EMPTY
            ================================================== */

            <RevealCard delay={120}>
              <div className="rounded-[28px] border border-gray-100 bg-white p-10 text-center shadow-sm sm:p-16">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1E3F20]/8 text-3xl text-[#1E3F20]">
                  ⌕
                </div>

                <h3 className="mt-5 text-xl font-extrabold">
                  Lowongan tidak ditemukan
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">
                  Coba ubah kata pencarian atau filter yang sedang digunakan.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-xl bg-[#1E3F20] px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-lg"
                >
                  Hapus Filter
                </button>
              </div>
            </RevealCard>
          ) : (
            /* =================================================
               JOB GRID
            ================================================== */

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredJobs.map((job, index) => {
                const isSaved = savedJobs.includes(job.id);

                const category =
                  categoryStyles[job.category] ?? categoryStyles.Technology;

                const typeStyle =
                  typeStyles[job.type] ?? typeStyles["Full Time"];

                return (
                  <RevealCard key={job.id} delay={Math.min(index * 80, 480)}>
                    <article
                      role="button"
                      tabIndex={0}
                      onClick={() => openJob(job.id)}
                      onKeyDown={(event) => handleCardKeyDown(event, job.id)}
                      className="group relative flex min-h-[360px] cursor-pointer flex-col overflow-hidden rounded-[26px] border border-gray-100 bg-white p-5 text-center shadow-[0_8px_25px_rgba(44,30,22,0.045)] outline-none transition-all duration-300 hover:-translate-y-2 hover:border-[#1E3F20]/15 hover:shadow-[0_24px_55px_rgba(30,63,32,0.14)] focus-visible:ring-4 focus-visible:ring-[#1E3F20]/10 sm:p-6"
                    >
                      {/* Top glow */}

                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#1E3F20]/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      {/* HEADER */}

                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-extrabold shadow-sm ${category.icon}`}
                        >
                          {category.iconText}
                        </div>

                        <button
                          type="button"
                          aria-label={
                            isSaved
                              ? "Hapus lowongan dari tersimpan"
                              : "Simpan lowongan"
                          }
                          onClick={(event) => toggleSaveJob(event, job.id)}
                          className={[
                            "absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border text-base transition-all duration-200",
                            isSaved
                              ? "border-[#1E3F20] bg-[#1E3F20] text-white shadow-md"
                              : "border-gray-200 bg-white text-gray-400 hover:border-[#1E3F20]/20 hover:bg-[#1E3F20]/5 hover:text-[#1E3F20]",
                          ].join(" ")}
                        >
                          {isSaved ? "♥" : "♡"}
                        </button>
                      </div>

                      {/* COMPANY */}

                      <div className="mt-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-gray-400">
                          {job.company}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Diposting {formatPostedDate(job.posted_at)}
                        </p>
                      </div>

                      {/* TITLE */}

                      <h3 className="mt-4 text-lg font-extrabold leading-snug text-[#2C1E16] transition-colors duration-300 group-hover:text-[#1E3F20]">
                        {job.title}
                      </h3>

                      {/* BADGES */}

                      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-[10px] font-bold ${typeStyle}`}
                        >
                          {job.type}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-[10px] font-bold ${category.badge}`}
                        >
                          {job.category}
                        </span>
                      </div>

                      {/* LOCATION */}

                      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-500">
                        <span className="text-gray-400">⌖</span>

                        <span>{job.location}</span>
                      </div>

                      {/* DESCRIPTION */}

                      <p className="mx-auto mt-4 line-clamp-2 max-w-[270px] text-xs leading-relaxed text-gray-500">
                        {job.description}
                      </p>

                      {/* SKILLS */}

                      <div className="mt-4 flex min-h-[30px] flex-wrap items-center justify-center gap-1.5">
                        {job.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-[10px] font-semibold text-gray-500 transition-colors group-hover:bg-[#FCFBF8]"
                          >
                            {skill}
                          </span>
                        ))}

                        {job.skills.length > 3 && (
                          <span className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-[10px] font-semibold text-gray-400">
                            +{job.skills.length - 3}
                          </span>
                        )}
                      </div>

                      {/* FOOTER */}

                      <div className="mt-auto pt-5">
                        <div className="border-t border-gray-100 pt-4">
                          <div className="flex items-end justify-center gap-2">
                            <p className="text-lg font-extrabold text-[#2C1E16]">
                              {job.salary}
                            </p>

                            <span className="pb-0.5 text-[10px] text-gray-400">
                              /perkiraan
                            </span>
                          </div>

                          <div className="mt-3">
                            <span className="inline-flex items-center gap-2 text-[11px] font-bold text-[#1E3F20] transition-all group-hover:gap-3">
                              Lihat Detail
                              <span>→</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </RevealCard>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* =====================================================
          ANIMATION STYLES
      ====================================================== */}

      <style jsx>{`
        .hero-badge,
        .hero-title,
        .hero-description {
          opacity: 0;
          animation-name: heroFadeUp;
          animation-duration: 900ms;
          animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          animation-fill-mode: forwards;
          will-change: transform, opacity;
        }

        .hero-badge {
          animation-delay: 50ms;
        }

        .hero-title {
          animation-delay: 140ms;
        }

        .hero-description {
          animation-delay: 230ms;
        }

        .hero-line {
          width: 0;
          opacity: 0;
          animation: lineGrow 900ms cubic-bezier(0.22, 1, 0.36, 1) 350ms
            forwards;
        }

        .hero-blob {
          will-change: transform;
        }

        .hero-blob-one {
          animation: floatBlobOne 9s ease-in-out infinite;
        }

        .hero-blob-two {
          animation: floatBlobTwo 11s ease-in-out infinite;
        }

        .hero-blob-three {
          animation: floatBlobThree 10s ease-in-out infinite;
        }

        @keyframes heroFadeUp {
          0% {
            opacity: 0;
            transform: translate3d(0, 14px, 0);
          }

          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes lineGrow {
          0% {
            width: 0;
            opacity: 0;
          }

          100% {
            width: 72px;
            opacity: 1;
          }
        }

        @keyframes floatBlobOne {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(-14px, 12px, 0) scale(1.04);
          }
        }

        @keyframes floatBlobTwo {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(12px, -10px, 0) scale(1.05);
          }
        }

        @keyframes floatBlobThree {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(-8px, -12px, 0) scale(1.03);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-badge,
          .hero-title,
          .hero-description,
          .hero-line,
          .hero-blob {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            width: auto;
          }

          .hero-line {
            width: 72px;
          }
        }
      `}</style>
    </div>
  );
}
