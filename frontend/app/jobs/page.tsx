"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

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

/* =========================================================
   JOB TYPES
========================================================= */

const jobTypes = [
  {
    value: "all",
    label: "All Types",
  },
  {
    value: "Full Time",
    label: "Full Time",
  },
  {
    value: "Part Time",
    label: "Part Time",
  },
  {
    value: "Hybrid",
    label: "Hybrid",
  },
  {
    value: "Remote",
    label: "Remote",
  },
  {
    value: "Internship",
    label: "Internship",
  },
];

/* =========================================================
   LOCATIONS
========================================================= */

const locations = [
  {
    value: "all",
    label: "All Locations",
  },
  {
    value: "Denpasar, Bali",
    label: "Denpasar, Bali",
  },
  {
    value: "Badung, Bali",
    label: "Badung, Bali",
  },
  {
    value: "Gianyar, Bali",
    label: "Gianyar, Bali",
  },
  {
    value: "Bali",
    label: "Bali",
  },
  {
    value: "Bali / Remote",
    label: "Bali / Remote",
  },
  {
    value: "Remote",
    label: "Remote",
  },
];

/* =========================================================
   CATEGORY STYLES
========================================================= */

const categoryStyles: Record<
  string,
  {
    badge: string;
    icon: string;
    iconText: string;
  }
> = {
  Technology: {
    badge:
      "bg-[linear-gradient(90deg,#E4F0E4_0%,#EEF5E9_52%,#F1ECE4_100%)] text-[#557257] border-[#DCE8DA]",
    icon: "bg-[linear-gradient(135deg,#E2F0E2_0%,#F2F0E5_100%)] text-[#557257]",
    iconText: "T",
  },

  Design: {
    badge:
      "bg-[linear-gradient(90deg,#EEE6F5_0%,#F4EBF2_52%,#F6EFE4_100%)] text-[#78618D] border-[#E7DDED]",
    icon: "bg-[linear-gradient(135deg,#EEE5F5_0%,#F4E9ED_100%)] text-[#78618D]",
    iconText: "D",
  },

  Product: {
    badge:
      "bg-[linear-gradient(90deg,#E5F0F7_0%,#EDF4F7_52%,#F5ECE3_100%)] text-[#537A92] border-[#DCE9F0]",
    icon: "bg-[linear-gradient(135deg,#E3F0F7_0%,#F2EFE6_100%)] text-[#537A92]",
    iconText: "P",
  },

  "Product Management": {
    badge:
      "bg-[linear-gradient(90deg,#E5F0F7_0%,#EDF4F7_52%,#F5ECE3_100%)] text-[#537A92] border-[#DCE9F0]",
    icon: "bg-[linear-gradient(135deg,#E3F0F7_0%,#F2EFE6_100%)] text-[#537A92]",
    iconText: "P",
  },

  Marketing: {
    badge:
      "bg-[linear-gradient(90deg,#FFF0DA_0%,#FFF5E5_52%,#F4EBDD_100%)] text-[#9A6B3E] border-[#F0DFC7]",
    icon: "bg-[linear-gradient(135deg,#FFF0D9_0%,#F6EBDD_100%)] text-[#9A6B3E]",
    iconText: "M",
  },

  "Digital Marketing": {
    badge:
      "bg-[linear-gradient(90deg,#FFF0DA_0%,#FFF5E5_52%,#F4EBDD_100%)] text-[#9A6B3E] border-[#F0DFC7]",
    icon: "bg-[linear-gradient(135deg,#FFF0D9_0%,#F6EBDD_100%)] text-[#9A6B3E]",
    iconText: "M",
  },
};

/* =========================================================
   TYPE STYLES
========================================================= */

const typeStyles: Record<string, string> = {
  "Full Time":
    "bg-[linear-gradient(90deg,#E6F1E5_0%,#F0F5EA_100%)] text-[#557257] border-[#DCE8DA]",

  "Part Time":
    "bg-[linear-gradient(90deg,#F9E6EA_0%,#F7EEF0_100%)] text-[#A5606C] border-[#EED9DE]",

  Hybrid:
    "bg-[linear-gradient(90deg,#E5F0F7_0%,#EEF4F7_100%)] text-[#557A94] border-[#DCE8F0]",

  Remote:
    "bg-[linear-gradient(90deg,#EEE7F5_0%,#F4EDF4_100%)] text-[#78628F] border-[#E4DCEC]",

  Internship:
    "bg-[linear-gradient(90deg,#FFF0DC_0%,#F9F0E4_100%)] text-[#A06F3F] border-[#F0E0CD]",
};

/* =========================================================
   REVEAL CARD
========================================================= */

function RevealCard({
  children,
  delay = 0,
}: {
  children: ReactNode;
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
========================================================= */

function RevealItem({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
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
    return "just now";
  }

  const posted = new Date(postedAt);

  if (Number.isNaN(posted.getTime())) {
    return "just now";
  }

  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - posted.getTime());

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  }

  if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  }

  if (diffDays < 14) {
    return "1 week ago";
  }

  if (diffDays < 21) {
    return "2 weeks ago";
  }

  const weeks = Math.floor(diffDays / 7);

  return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
}

/* =========================================================
   PAGE
========================================================= */

export default function JobsPage() {
  const router = useRouter();

  /* =======================================================
     STATE
  ======================================================= */

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("all");
  const [location, setLocation] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
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
          throw new Error(`Failed to fetch jobs. Status: ${response.status}`);
        }

        const result = await response.json();

        if (!result?.success) {
          throw new Error(
            result?.message ?? "Failed to retrieve job listings.",
          );
        }

        if (!Array.isArray(result?.data)) {
          throw new Error("The Jobs API returned an invalid data format.");
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
            : "An error occurred while fetching job listings.",
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

  const toggleSaveJob = (event: MouseEvent, jobId: number) => {
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
    event: KeyboardEvent<HTMLElement>,
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

      const matchesType = jobType === "all" || job.type === jobType;

      const matchesLocation = location === "all" || job.location === location;

      const matchesSaved = !showSavedOnly || savedJobs.includes(job.id);

      return matchesSearch && matchesType && matchesLocation && matchesSaved;
    });

    if (sortBy === "az") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sortBy === "za") {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title));
    }

    if (sortBy === "latest") {
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
    setJobType("all");
    setLocation("all");
    setSortBy("latest");
    setShowSavedOnly(false);
  };

  /* =======================================================
     RETRY
  ======================================================= */

  const retryFetchJobs = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#FCFBF8_0%,#FAF6F0_46%,#F2F7F1_100%)] font-sans text-[#2C1E16]">
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <Navbar />

      <main>
        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="relative overflow-hidden">
          {/* BACKGROUND */}

          <div className="pointer-events-none absolute inset-0">
            <div className="hero-blob hero-blob-one absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#DCEADB]/65 blur-3xl" />

            <div className="hero-blob hero-blob-two absolute -left-24 top-40 h-72 w-72 rounded-full bg-[#F0DDCE]/55 blur-3xl" />

            <div className="hero-blob hero-blob-three absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-[#EEE3F1]/45 blur-3xl" />

            <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-[#FFF8EE]/50 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-6 pb-7 pt-7 sm:pb-8 sm:pt-9 lg:pt-10">
            <div className="mx-auto max-w-2xl rounded-[34px] bg-[linear-gradient(135deg,rgba(238,245,235,0.72)_0%,rgba(251,245,235,0.80)_50%,rgba(248,237,241,0.64)_100%)] px-6 py-8 text-center shadow-[0_18px_45px_rgba(74,58,43,0.045)] backdrop-blur-sm sm:px-8">
              <h1 className="hero-title text-3xl font-extrabold tracking-tight text-[#2C1E16] sm:text-4xl lg:text-[40px]">
                Discover the right
                <br />
                <span className="bg-[linear-gradient(90deg,#55765B_0%,#8A6E55_48%,#9D6679_100%)] bg-clip-text text-transparent">
                  career opportunities
                </span>
              </h1>

              <div className="hero-line mx-auto mt-4 h-px rounded-full bg-[linear-gradient(90deg,transparent_0%,#A8BCA9_25%,#D5BA9E_52%,#D7A8B6_75%,transparent_100%)]" />

              <p className="hero-description mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-600 sm:text-[15px]">
                Find job opportunities that match your skills, experience, and
                career goals.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            SEARCH & FILTER
        ====================================================== */}

        <section className="mx-auto max-w-7xl px-6 pb-10">
          <RevealCard delay={80}>
            <div className="rounded-[30px] border border-white/80 bg-[linear-gradient(135deg,#FFFFFF_0%,#FBF5ED_52%,#F0F6EF_100%)] p-4 shadow-[0_14px_40px_rgba(44,30,22,0.055)] backdrop-blur sm:p-5">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.8fr_1fr_1fr_auto]">
                {/* SEARCH */}

                <RevealItem delay={100} className="min-w-0">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#AAA098]">
                      ⌕
                    </span>

                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search by position, company, or skill..."
                      className="h-12 w-full rounded-2xl border border-[#E7E1D9] bg-[linear-gradient(90deg,#FCFAF6_0%,#FFFDFC_55%,#F7FAF5_100%)] pl-11 pr-4 text-sm text-[#2C1E16] outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-[#A6B9A7] focus:bg-white focus:ring-4 focus:ring-[#55765B]/10"
                    />
                  </div>
                </RevealItem>

                {/* TYPE */}

                <RevealItem delay={160}>
                  <select
                    value={jobType}
                    onChange={(event) => setJobType(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-[#E9E1D7] bg-[linear-gradient(135deg,#FFF9F0_0%,#F7FBF5_100%)] px-4 text-sm text-[#2C1E16] outline-none transition-all duration-300 focus:border-[#A8BAA9] focus:bg-white focus:ring-4 focus:ring-[#55765B]/10"
                  >
                    {jobTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </RevealItem>

                {/* LOCATION */}

                <RevealItem delay={220}>
                  <select
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-[#E8E2D9] bg-[linear-gradient(135deg,#F3F7EE_0%,#FFFDFC_100%)] px-4 text-sm text-[#2C1E16] outline-none transition-all duration-300 focus:border-[#A8BAA9] focus:bg-white focus:ring-4 focus:ring-[#55765B]/10"
                  >
                    {locations.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </RevealItem>

                {/* RESET */}

                <RevealItem delay={280}>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="h-12 w-full rounded-2xl border border-[#E5DDD4] bg-[linear-gradient(135deg,#FFFFFF_0%,#F8F2E9_100%)] px-5 text-sm font-bold text-[#756A61] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D7CEC2] hover:bg-white hover:shadow-sm lg:w-auto"
                  >
                    Reset
                  </button>
                </RevealItem>
              </div>

              <div className="mt-4 flex flex-col gap-3 rounded-2xl border-t border-[#ECE5DC] bg-[linear-gradient(90deg,#F8F2EA_0%,#FCFAF7_48%,#F0F6F0_100%)] px-2 pt-4 sm:flex-row sm:items-center sm:justify-between">
                {/* SAVED */}

                <RevealItem delay={340}>
                  <button
                    type="button"
                    onClick={() => setShowSavedOnly((current) => !current)}
                    className={[
                      "inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all duration-300 sm:w-auto",

                      showSavedOnly
                        ? "border-[#55765B] bg-[linear-gradient(135deg,#55765B_0%,#739078_100%)] text-white shadow-md"
                        : "border-[#AFC0B0] bg-[linear-gradient(135deg,#FFFFFF_0%,#EEF5EC_100%)] text-[#557257] hover:-translate-y-0.5 hover:shadow-sm",
                    ].join(" ")}
                  >
                    <span className={showSavedOnly ? "animate-pulse" : ""}>
                      {showSavedOnly ? "♥" : "♡"}
                    </span>

                    {showSavedOnly
                      ? "Showing Saved Jobs"
                      : `Saved Jobs (${savedJobs.length})`}
                  </button>
                </RevealItem>

                {/* SORT */}

                <RevealItem delay={400}>
                  <div className="flex items-center justify-between gap-2 sm:justify-end">
                    <span className="text-xs font-medium text-[#A19991]">
                      Sort by:
                    </span>

                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                      className="h-10 rounded-xl border border-[#E7E0D7] bg-[linear-gradient(135deg,#FFFFFF_0%,#F8F3EA_100%)] px-3 text-xs font-semibold text-gray-600 outline-none transition-all duration-300 focus:border-[#B4C1B3] focus:ring-4 focus:ring-[#55765B]/5"
                    >
                      <option value="latest">Latest</option>
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
                <p className="inline-flex rounded-full bg-[linear-gradient(90deg,#E8F1E5_0%,#F5EEE3_52%,#F4E9EE_100%)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#557257]">
                  Available positions
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-[#2C1E16] sm:text-3xl">
                  {loading
                    ? "Loading job opportunities..."
                    : `${filteredJobs.length} opportunities found`}
                </h2>
              </div>

              {!loading && !error && (
                <div className="rounded-full bg-[linear-gradient(90deg,#F5EFE6_0%,#EEF4EC_100%)] px-3 py-1.5 text-xs text-[#9B9289]">
                  Click a card to view details
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
                  className="min-h-[360px] animate-pulse rounded-[28px] border border-[#EAE3DB] bg-[linear-gradient(145deg,#FFFFFF_0%,#F8F1E9_50%,#F0F6EF_100%)] p-6 shadow-sm"
                >
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-[linear-gradient(135deg,#E8EFE7_0%,#F2EAE4_100%)]" />

                  <div className="mx-auto mt-5 h-3 w-28 rounded-full bg-[#EDE6DE]" />

                  <div className="mx-auto mt-3 h-5 w-44 rounded-lg bg-[#E5DED6]" />

                  <div className="mx-auto mt-5 flex justify-center gap-2">
                    <div className="h-6 w-20 rounded-full bg-[#EAF1E8]" />
                    <div className="h-6 w-20 rounded-full bg-[#F2EAF1]" />
                  </div>

                  <div className="mx-auto mt-5 h-3 w-32 rounded bg-[#EEE7E0]" />

                  <div className="mx-auto mt-4 h-10 w-56 rounded bg-[#E9E2DA]" />

                  <div className="mt-5 border-t border-[#ECE5DC] pt-4">
                    <div className="mx-auto h-5 w-28 rounded bg-[#E6DFD7]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* =================================================
               ERROR
            ================================================== */

            <RevealCard delay={120}>
              <div className="rounded-[30px] border border-[#F0D8D3] bg-[linear-gradient(145deg,#FFF5F2_0%,#FFFFFF_55%,#F8EEF0_100%)] p-10 text-center shadow-sm sm:p-16">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#FCE4E1_0%,#F7E9EC_100%)] text-2xl font-black text-[#B55B51] shadow-sm">
                  !
                </div>

                <h3 className="mt-5 text-xl font-extrabold text-[#2C1E16]">
                  Failed to load job opportunities
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={retryFetchJobs}
                  className="mt-6 rounded-xl bg-[linear-gradient(135deg,#557257_0%,#78917B_100%)] px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Try Again
                </button>
              </div>
            </RevealCard>
          ) : filteredJobs.length === 0 ? (
            /* =================================================
               EMPTY
            ================================================== */

            <RevealCard delay={120}>
              <div className="rounded-[30px] border border-dashed border-[#DDD5CC] bg-[linear-gradient(145deg,#FFFFFF_0%,#FAF4EB_52%,#F1F6F0_100%)] p-10 text-center shadow-sm sm:p-16">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#E7F0E4_0%,#F1E8F3_100%)] text-3xl text-[#557257] shadow-sm">
                  ⌕
                </div>

                <h3 className="mt-5 text-xl font-extrabold text-[#2C1E16]">
                  No jobs found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">
                  Try changing your search terms or adjusting the filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-xl bg-[linear-gradient(135deg,#557257_0%,#78917B_100%)] px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Clear Filters
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
                      className={[
                        "group relative flex min-h-[360px] cursor-pointer flex-col overflow-hidden rounded-[28px] border p-5 text-center outline-none transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_55px_rgba(74,58,43,0.11)] focus-visible:ring-4 sm:p-6",

                        index % 4 === 0
                          ? "border-[#DFE9DC] bg-[linear-gradient(145deg,#F2F8F0_0%,#FFFFFF_45%,#F7EFE6_100%)] focus-visible:ring-[#55765B]/10"
                          : index % 4 === 1
                            ? "border-[#E9DED8] bg-[linear-gradient(145deg,#FFF4EA_0%,#FFFFFF_46%,#F2F6ED_100%)] focus-visible:ring-[#A06F3F]/10"
                            : index % 4 === 2
                              ? "border-[#E5DDEC] bg-[linear-gradient(145deg,#F7F0FA_0%,#FFFFFF_46%,#F3EDF7_100%)] focus-visible:ring-[#78618D]/10"
                              : "border-[#DDE7E7] bg-[linear-gradient(145deg,#EDF6F5_0%,#FFFFFF_46%,#F5EEE7_100%)] focus-visible:ring-[#537A92]/10",
                      ].join(" ")}
                    >
                      {/* =================================================
                          TOP GLOW
                      ================================================== */}

                      <div
                        className={[
                          "pointer-events-none absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100",

                          index % 4 === 0
                            ? "bg-[linear-gradient(90deg,transparent,#8CAA90,transparent)]"
                            : index % 4 === 1
                              ? "bg-[linear-gradient(90deg,transparent,#D2A074,transparent)]"
                              : index % 4 === 2
                                ? "bg-[linear-gradient(90deg,transparent,#B49BC4,transparent)]"
                                : "bg-[linear-gradient(90deg,transparent,#92B4B5,transparent)]",
                        ].join(" ")}
                      />

                      {/* =================================================
                          HEADER
                      ================================================== */}

                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={[
                            "mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-extrabold shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105",
                            category.icon,
                          ].join(" ")}
                        >
                          {category.iconText}
                        </div>

                        {/* SAVE BUTTON */}

                        <button
                          type="button"
                          aria-label={
                            isSaved ? "Remove job from saved jobs" : "Save job"
                          }
                          onClick={(event) => toggleSaveJob(event, job.id)}
                          className={[
                            "absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border text-base transition-all duration-300",

                            isSaved
                              ? "border-[#55765B] bg-[linear-gradient(135deg,#55765B_0%,#78927B_100%)] text-white shadow-md"
                              : "border-[#E3DDD5] bg-[linear-gradient(135deg,#FFFFFF_0%,#F7F1E9_100%)] text-[#AAA098] hover:-translate-y-0.5 hover:border-[#B4C7B5] hover:bg-[#EFF5ED] hover:text-[#557257] hover:shadow-sm",
                          ].join(" ")}
                        >
                          {isSaved ? "♥" : "♡"}
                        </button>
                      </div>

                      {/* =================================================
                          COMPANY
                      ================================================== */}

                      <div className="mt-4">
                        <p className="inline-flex rounded-full bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#918880]">
                          {job.company}
                        </p>

                        <p className="mt-2 text-xs text-[#AAA098]">
                          Posted {formatPostedDate(job.posted_at)}
                        </p>
                      </div>

                      {/* =================================================
                          TITLE
                      ================================================== */}

                      <h3 className="mt-4 text-lg font-extrabold leading-snug text-[#2C1E16] transition-colors duration-300 group-hover:text-[#557257]">
                        {job.title}
                      </h3>

                      {/* =================================================
                          BADGES
                      ================================================== */}

                      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-[10px] font-bold shadow-sm ${typeStyle}`}
                        >
                          {job.type}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-[10px] font-bold shadow-sm ${category.badge}`}
                        >
                          {job.category}
                        </span>
                      </div>

                      {/* =================================================
                          LOCATION
                      ================================================== */}

                      <div className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-white/50 px-3 py-1.5 text-xs text-[#7F7770]">
                        <span className="text-[#A39A91]">⌖</span>
                        <span>{job.location}</span>
                      </div>

                      {/* =================================================
                          DESCRIPTION
                      ================================================== */}

                      <p className="mx-auto mt-4 line-clamp-2 max-w-[270px] text-xs leading-relaxed text-[#817972]">
                        {job.description}
                      </p>

                      {/* =================================================
                          SKILLS
                      ================================================== */}

                      <div className="mt-4 flex min-h-[30px] flex-wrap items-center justify-center gap-1.5">
                        {job.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-lg border border-white/70 bg-[linear-gradient(135deg,#FFFFFF_0%,#F5F0E9_52%,#F0F5EF_100%)] px-2.5 py-1.5 text-[10px] font-semibold text-[#79716A] shadow-sm transition-all duration-300 group-hover:-translate-y-0.5"
                          >
                            {skill}
                          </span>
                        ))}

                        {job.skills.length > 3 && (
                          <span className="rounded-lg bg-[linear-gradient(135deg,#F0E8F5_0%,#F7ECEF_100%)] px-2.5 py-1.5 text-[10px] font-semibold text-[#806A8E]">
                            +{job.skills.length - 3}
                          </span>
                        )}
                      </div>

                      {/* =================================================
                          FOOTER
                      ================================================== */}

                      <div className="mt-auto pt-5">
                        <div className="rounded-[20px] border-t border-black/[0.06] bg-[linear-gradient(90deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.55)_50%,rgba(255,255,255,0.18)_100%)] px-3 pt-4">
                          <div className="flex items-end justify-center gap-2">
                            <p className="rounded-full bg-[linear-gradient(90deg,#EEF4EA_0%,#F8EEE4_50%,#F2EAF3_100%)] px-4 py-1.5 text-lg font-extrabold text-[#557257]">
                              {job.salary}
                            </p>

                            <span className="pb-1 text-[10px] text-[#A39A91]">
                              /estimated
                            </span>
                          </div>

                          <div className="mt-3">
                            <span className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(90deg,#F0F5ED_0%,#F7F0E8_50%,#F4EBF1_100%)] px-4 py-1.5 text-[11px] font-bold text-[#557257] transition-all duration-300 group-hover:gap-3">
                              View Details
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
        .hero-title,
        .hero-description {
          opacity: 0;
          animation-name: heroFadeUp;
          animation-duration: 900ms;
          animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          animation-fill-mode: forwards;
          will-change: transform, opacity;
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
          .hero-title,
          .hero-description,
          .hero-line,
          .hero-blob {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }

          .hero-line {
            width: 72px;
          }
        }
      `}</style>
    </div>
  );
}
