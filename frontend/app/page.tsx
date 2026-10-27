"use client";
import OptimizedImage from "@/components/OptimizedImage";

import { useEffect, useState } from "react";
import Link from "next/link";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { API_BASE_URL, API_ORIGIN, apiFetch } from "@/lib/api";

type JobListing = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
};

type Mentor = {
  id: number;
  name: string;
  role: string;
  company: string;
  rating: number | null;
  image: string;
  expertise: string[];
};

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function asText(value: unknown, fallback = ""): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

function unwrapList(payload: unknown): unknown[] {
  const root = asRecord(payload);

  if (Array.isArray(root.data)) {
    return root.data;
  }

  const nested = asRecord(root.data);

  if (Array.isArray(nested.data)) {
    return nested.data;
  }

  return [];
}

function resolveImageUrl(value: unknown): string {
  const imagePath = asText(value);
if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  return `${API_ORIGIN}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
}

function normalizeJob(value: unknown): JobListing {
  const job = asRecord(value);

  return {
    id: Number(job.id),
    title: asText(job.title, "Lowongan tanpa judul"),
    company: asText(job.company, "Perusahaan belum dicantumkan"),
    location: asText(job.location, "Lokasi belum dicantumkan"),
    type: asText(job.type, "Tipe kerja belum dicantumkan"),
    salary: asText(job.salary, "Gaji belum dicantumkan"),
  };
}

function normalizeMentor(value: unknown): Mentor {
  const mentor = asRecord(value);
  const profile = asRecord(mentor.profile);
  const rawRating = profile.avg_rating;
  const ratingValue =
    typeof rawRating === "number" ? rawRating : Number(rawRating);

  const rating =
    rawRating !== null &&
    rawRating !== undefined &&
    rawRating !== "" &&
    Number.isFinite(ratingValue) &&
    ratingValue > 0
      ? ratingValue
      : null;

  const skills = Array.isArray(mentor.skills)
    ? mentor.skills
        .map((skill) => {
          if (typeof skill === "string") {
            return skill.trim();
          }

          return asText(asRecord(skill).name);
        })
        .filter(Boolean)
    : [];

  return {
    id: Number(mentor.id),
    name: asText(mentor.name, "Mentor"),
    role: asText(profile.job_title, "Mentor Karier"),
    company: asText(profile.company, "Informasi perusahaan belum tersedia"),
    rating,
    image: resolveImageUrl(profile.profile_photo),
    expertise: skills,
  };
}

const heroImages = {
  consultation:
    "https://48603975.fs1.hubspotusercontent-na1.net/hubfs/48603975/AI-Generated%20Media/Images/Cozy%20Coffee%20Shop%20Conversation%20with%20Warm%20Lighting-1.png",

  mentor:
    "https://s3.eu-north-1.amazonaws.com/cdn-site.mediaplanet.com/app/uploads/sites/114/2025/10/23100920/vicky-1761228546-GettyImages-1731803248-576x486.jpg",

  collaboration:
    "https://insight.atlas-mapping.com/hubfs/AI-Generated%20Media/Images/Two%20professionals%20working%20in%20the%20agency%20industry%20collaborating%20on%20some%20work%20in%20a%20casual%20space%20such%20as%20a%20coffee%20shop.jpeg",

  career:
    "https://imageio.forbes.com/specials-images/imageserve/69bc23ff65045f051f753e12/0x0.jpg?fit=bounds&format=jpg&height=900&width=1600",
};

export default function HomePage() {
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [jobsRetry, setJobsRetry] = useState(0);

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentorsLoading, setMentorsLoading] = useState(true);
  const [mentorsError, setMentorsError] = useState("");
  const [mentorsRetry, setMentorsRetry] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadJobs() {
      try {
        const response = await apiFetch(`${API_BASE_URL}/jobs`);

        if (!response.ok) {
          throw new Error(`Gagal memuat lowongan (HTTP ${response.status}).`);
        }

        const payload: unknown = await response.json();
        const jobs = unwrapList(payload).map(normalizeJob);

        if (active) {
          setJobListings(jobs);
          setJobsError("");
        }
      } catch (error) {
        if (active) {
          setJobListings([]);
          setJobsError(
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat lowongan.",
          );
        }
      } finally {
        if (active) {
          setJobsLoading(false);
        }
      }
    }

    void loadJobs();

    return () => {
      active = false;
    };
  }, [jobsRetry]);

  useEffect(() => {
    let active = true;

    async function loadMentors() {
      try {
        const response = await apiFetch(`${API_BASE_URL}/mentors`);

        if (!response.ok) {
          throw new Error(`Gagal memuat mentor (HTTP ${response.status}).`);
        }

        const payload: unknown = await response.json();
        const loadedMentors = unwrapList(payload).map(normalizeMentor);

        if (active) {
          setMentors(loadedMentors);
          setMentorsError("");
        }
      } catch (error) {
        if (active) {
          setMentors([]);
          setMentorsError(
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat mentor.",
          );
        }
      } finally {
        if (active) {
          setMentorsLoading(false);
        }
      }
    }

    void loadMentors();

    return () => {
      active = false;
    };
  }, [mentorsRetry]);

  function retryJobs() {
    setJobsError("");
    setJobsLoading(true);
    setJobsRetry((count) => count + 1);
  }

  function retryMentors() {
    setMentorsError("");
    setMentorsLoading(true);
    setMentorsRetry((count) => count + 1);
  }

  return (
    <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
      <Navbar />

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative w-full overflow-hidden bg-[#F4EFE8]">
        {/* Decorative blobs */}

        <div className="pointer-events-none absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-[#DCE6D8]/60 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[30rem] w-[30rem] rounded-full bg-[#E8D8C7]/50 blur-3xl" />

        <div className="pointer-events-none absolute right-[20%] top-[30%] h-52 w-52 rounded-full bg-[#F7E8E5]/35 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:px-8 md:py-14 lg:py-16">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
            {/* =================================================
                LEFT HERO
            ================================================== */}

            <div className="lg:col-span-6">
              <div
                className="cc-reveal mb-4 flex items-center gap-3"
                style={{ animationDelay: "70ms" }}
              >
                <span className="hero-line h-px w-10 bg-[#1E3F20]/30" />

                <span className="rounded-full bg-[linear-gradient(90deg,#EFE7DB_0%,#F8F0E8_55%,#EDF3EA_100%)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A8074]">
                  Career Cafe
                </span>
              </div>

              <h1
                className="cc-reveal max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight text-[#2C1E16] sm:text-5xl lg:text-6xl"
                style={{ animationDelay: "120ms" }}
              >
                Your Career Journey,
                <span className="mt-1 block text-[#1E3F20]">
                  Better Together
                </span>
              </h1>

              {/* Hero description */}

              <p
                className="cc-reveal mt-6 max-w-xl text-sm leading-7 text-[#6B6259] sm:text-base lg:text-lg"
                style={{ animationDelay: "180ms" }}
              >
                Get direct guidance from experienced mentors, expand your
                professional network, and discover the best career opportunities
                at Career Cafe.
              </p>

              <div
                className="cc-reveal mt-8 flex flex-col gap-3 sm:flex-row"
                style={{ animationDelay: "240ms" }}
              >
                <Link
                  href="/mentors"
                  className="group inline-flex items-center justify-center gap-3 rounded-xl bg-[#1E3F20] px-7 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152E17] hover:shadow-lg"
                >
                  Start Consultation
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <a
                  href="#mentor-section"
                  className="inline-flex items-center justify-center rounded-xl border border-[#D7CEC1] bg-white px-7 py-3.5 text-sm font-bold text-[#2C1E16] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F8F5F0] hover:shadow-md"
                >
                  Learn More
                </a>
              </div>

              {/* Supported by community & industry */}

              <div
                className="cc-reveal mt-9"
                style={{ animationDelay: "300ms" }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8A8074]">
                  Supported by community & industry
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold text-[#9A9187]">
                  <span>INSTIKI</span>

                  <span className="text-[#C8BFB4]">•</span>

                  <span>Central Saga</span>

                  <span className="text-[#C8BFB4]">•</span>

                  <span>Pemuda Bingung</span>

                  <span className="text-[#C8BFB4]">•</span>

                  <span>TechBali</span>
                </div>
              </div>
            </div>

            {/* =================================================
                RIGHT HERO
            ================================================== */}

            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Main consultation */}

                <div
                  className="cc-reveal row-span-2 h-full"
                  style={{ animationDelay: "100ms" }}
                >
                  <Link
                    href="/mentors"
                    className="group relative block min-h-[430px] w-full overflow-hidden rounded-[2rem] bg-[linear-gradient(145deg,#EEE4D7_0%,#E7EFE5_52%,#F3E4E9_100%)] text-left shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <OptimizedImage
                      src={heroImages.consultation}
                      alt="Career consultation at Career Cafe"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#233626]/82 via-[#4E5A45]/18 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(to_top,rgba(71,96,72,0.54),rgba(235,220,214,0.08),transparent)]" />

                    <div className="absolute bottom-5 left-5 right-5">
                      <p className="inline-flex rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 backdrop-blur-md">
                        Career Consultation
                      </p>

                      <h3 className="mt-2 max-w-sm text-xl font-extrabold leading-tight text-white sm:text-2xl">
                        Find the career path
                        <span className="block text-white/80">
                          that matches your potential.
                        </span>
                      </h3>
                    </div>

                    <span className="absolute right-5 top-5 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-[#1E3F20] opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      →
                    </span>
                  </Link>
                </div>

                {/* Mentor */}

                <div className="cc-reveal" style={{ animationDelay: "160ms" }}>
                  <Link
                    href="/mentors/1"
                    className="group relative block min-h-[205px] w-full overflow-hidden rounded-[2rem] bg-[linear-gradient(145deg,#E5EEE5_0%,#EDE4D9_52%,#F4E6EA_100%)] text-left shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <OptimizedImage
                      src={heroImages.mentor}
                      alt="Professional mentor"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#2F4732]/80 via-[#5B705C]/16 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(to_top,rgba(77,101,78,0.48),transparent)]" />

                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="inline-flex rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/75 backdrop-blur-md">
                        Mentor
                      </p>

                      <p className="mt-1 text-sm font-extrabold text-white">
                        Find Professional Mentors
                      </p>

                      <p className="mt-1 text-[10px] text-white/75">
                        Discuss your career journey
                      </p>
                    </div>

                    <span className="absolute right-4 top-4 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-[linear-gradient(135deg,#FFFFFF_0%,#F4F7EE_100%)] text-[#1E3F20] opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      →
                    </span>
                  </Link>
                </div>

                {/* Community */}

                <div className="cc-reveal" style={{ animationDelay: "220ms" }}>
                  <Link
                    href="/community"
                    className="group relative block min-h-[205px] w-full overflow-hidden rounded-[2rem] bg-[linear-gradient(145deg,#ECE5F3_0%,#F5E5E2_52%,#E7EFE6_100%)] text-left shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <OptimizedImage
                      src={heroImages.collaboration}
                      alt="Community and collaboration"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#3F364A]/80 via-[#705E75]/16 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(to_top,rgba(99,74,100,0.44),rgba(236,224,238,0.06),transparent)]" />

                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="inline-flex rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/75 backdrop-blur-md">
                        Community
                      </p>

                      <p className="mt-1 text-sm font-extrabold text-white">
                        Grow Together as a Community
                      </p>

                      <p className="mt-1 text-[10px] text-white/75">
                        Build connections and share experiences
                      </p>
                    </div>

                    <span className="absolute right-4 top-4 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-[linear-gradient(135deg,#FFFFFF_0%,#F6EFF7_100%)] text-[#1E3F20] opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      →
                    </span>
                  </Link>
                </div>
              </div>

              {/* Learn with mentor */}

              <div className="cc-reveal" style={{ animationDelay: "280ms" }}>
                <Link
                  href="/mentors"
                  className="group mt-5 ml-auto flex w-full items-center gap-4 rounded-2xl border border-white/80 bg-[linear-gradient(135deg,#FFFFFF_0%,#F7F3ED_48%,#EDF3EA_100%)] px-5 py-4 text-left shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl sm:max-w-[520px]"
                >
                  <div className="flex flex-shrink-0 -space-x-2">
                    <OptimizedImage
                      src={heroImages.career}
                      alt=""
                      className="h-10 w-10 rounded-full border-2 border-white object-cover"
                      loading="lazy"
                      decoding="async"
                    />

                    <OptimizedImage
                      src={heroImages.mentor}
                      alt=""
                      className="h-10 w-10 rounded-full border-2 border-white object-cover"
                      loading="lazy"
                      decoding="async"
                    />

                    <OptimizedImage
                      src={heroImages.collaboration}
                      alt=""
                      className="h-10 w-10 rounded-full border-2 border-white object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-[#2C1E16]">
                      Learn with experienced mentors
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-gray-500">
                      Discover new opportunities and connections with a
                      professional community.
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-6 py-12 md:px-8">
        {/* ===================================================
            JOB SECTION
        ==================================================== */}

        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="mb-1 inline-flex rounded-full bg-[linear-gradient(90deg,#F8EBDD_0%,#F6F1E4_50%,#EAF1E7_100%)] px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-[#8A6A47]">
                Career Opportunities
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#2C1E16] md:text-3xl">
                Latest Career Opportunities
              </h2>
            </div>

            <Link
              href="/jobs"
              className="rounded-full bg-[linear-gradient(90deg,#EFF5EC_0%,#F8F2EA_100%)] px-4 py-2 text-sm font-bold text-[#1E3F20] transition-all duration-300 hover:-translate-y-0.5"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
            {jobsLoading ? (
              Array.from({ length: 3 }, (_, index) => (
                <div
                  key={`job-loading-${index}`}
                  className="min-h-[230px] animate-pulse rounded-2xl border border-[#DCE7DB] bg-[#F5F8F2] p-6"
                  aria-label="Memuat lowongan"
                >
                  <div className="mb-6 h-6 w-24 rounded-full bg-[#E0E9DC]" />
                  <div className="mb-3 h-5 w-3/4 rounded bg-[#E0E9DC]" />
                  <div className="h-4 w-1/2 rounded bg-[#E8E3DA]" />
                  <div className="mt-8 h-9 rounded bg-[#E0E9DC]" />
                </div>
              ))
            ) : jobsError ? (
              <div
                role="alert"
                className="col-span-full rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
              >
                <p className="font-semibold text-red-800">
                  Lowongan belum dapat dimuat
                </p>
                <p className="mt-2 text-sm text-red-700">{jobsError}</p>
                <button
                  type="button"
                  onClick={retryJobs}
                  className="mt-4 rounded-xl bg-[#1E3F20] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#152E17]"
                >
                  Coba Lagi
                </button>
              </div>
            ) : jobListings.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-[#DCE7DB] bg-[#F8FAF6] px-6 py-10 text-center">
                <p className="text-lg font-bold text-[#2C1E16]">
                  Belum ada lowongan tersedia
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Lowongan aktif akan ditampilkan di sini ketika tersedia.
                </p>
              </div>
            ) : (
              jobListings.map((job, index) => (
              <article
                key={job.id}
                className={[
                  "cc-card group flex min-h-[230px] flex-col justify-between rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                  index === 0
                    ? "border-[#DCE7DB] bg-[linear-gradient(145deg,#F5FAF3_0%,#FFFFFF_52%,#F3EEE7_100%)]"
                    : index === 1
                      ? "border-[#EADFD7] bg-[linear-gradient(145deg,#FFF7EF_0%,#FFFFFF_52%,#F2F5EA_100%)]"
                      : "border-[#E5DBE8] bg-[linear-gradient(145deg,#F8F1F9_0%,#FFFFFF_50%,#EFF4EC_100%)]",
                ].join(" ")}
                style={{
                  animationDelay: `${index * 90}ms`,
                }}
              >
                <div>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span
                      className={[
                        "rounded-full px-3 py-1 text-[10px] font-bold",
                        index === 0
                          ? "bg-[#E8F0E8] text-[#1E3F20]"
                          : index === 1
                            ? "bg-[#F9EBDD] text-[#996B40]"
                            : "bg-[#EEE8F4] text-[#725A8D]",
                      ].join(" ")}
                    >
                      {job.type}
                    </span>

                    <span className="rounded-full bg-white/55 px-2.5 py-1 text-right text-[10px] font-semibold text-gray-400">
                      {job.location}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#2C1E16] transition-colors duration-300 group-hover:text-[#1E3F20]">
                    {job.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">{job.company}</p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-black/[0.06] pt-4">
                  <span
                    className={[
                      "rounded-full px-3 py-1.5 text-sm font-extrabold",
                      index === 0
                        ? "bg-[#EAF3E9] text-[#1E3F20]"
                        : index === 1
                          ? "bg-[#FFF0DF] text-[#A36735]"
                          : "bg-[#F0E9F7] text-[#76558E]",
                    ].join(" ")}
                  >
                    {job.salary}
                  </span>

                  <Link
                    href={`/jobs/${job.id}`}
                    className="rounded-xl bg-[#1E3F20] px-4 py-2 text-xs font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152E17] hover:shadow-lg"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            )))}
          </div>
        </section>

        {/* ===================================================
            MENTOR SECTION
        ==================================================== */}

        <section id="mentor-section" className="scroll-mt-24">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="mb-1 inline-flex rounded-full bg-[linear-gradient(90deg,#EAF2E8_0%,#F5F0E6_50%,#F6E8EC_100%)] px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-[#557257]">
                Meet Your Mentor
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#2C1E16] md:text-3xl">
                Featured Mentors
              </h2>
            </div>

            <Link
              href="/mentors"
              className="rounded-full bg-[linear-gradient(90deg,#EDF3EA_0%,#F8F1E7_100%)] px-4 py-2 text-sm font-bold text-[#1E3F20] transition-all duration-300 hover:-translate-y-0.5"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {mentorsLoading ? (
              Array.from({ length: 4 }, (_, index) => (
                <div
                  key={`mentor-loading-${index}`}
                  className="min-h-[430px] animate-pulse overflow-hidden rounded-2xl border border-[#DCE7DB] bg-[#F5F8F2]"
                  aria-label="Memuat mentor"
                >
                  <div className="h-52 bg-[#E0E9DC]" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-3/4 rounded bg-[#E0E9DC]" />
                    <div className="h-4 w-full rounded bg-[#E8E3DA]" />
                    <div className="h-4 w-2/3 rounded bg-[#E8E3DA]" />
                    <div className="mt-5 h-8 rounded bg-[#E0E9DC]" />
                  </div>
                </div>
              ))
            ) : mentorsError ? (
              <div
                role="alert"
                className="col-span-full rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
              >
                <p className="font-semibold text-red-800">
                  Data mentor belum dapat dimuat
                </p>
                <p className="mt-2 text-sm text-red-700">{mentorsError}</p>
                <button
                  type="button"
                  onClick={retryMentors}
                  className="mt-4 rounded-xl bg-[#1E3F20] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#152E17]"
                >
                  Coba Lagi
                </button>
              </div>
            ) : mentors.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-[#DCE7DB] bg-[#F8FAF6] px-6 py-10 text-center">
                <p className="text-lg font-bold text-[#2C1E16]">
                  Belum ada mentor tersedia
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Profil mentor aktif akan ditampilkan di sini ketika tersedia.
                </p>
              </div>
            ) : (
              mentors.map((mentor, index) => (
              <article
                key={mentor.id}
                className={[
                  "cc-card group flex min-h-[430px] flex-col overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                  index === 0
                    ? "border-[#DCE7DB] bg-[linear-gradient(180deg,#F2F8F1_0%,#FFFFFF_42%,#EEF5EC_100%)]"
                    : index === 1
                      ? "border-[#E9DDD7] bg-[linear-gradient(180deg,#FFF5EE_0%,#FFFFFF_42%,#F5F0E8_100%)]"
                      : index === 2
                        ? "border-[#E5DCEB] bg-[linear-gradient(180deg,#F7F1FB_0%,#FFFFFF_42%,#F1EDF7_100%)]"
                        : "border-[#DDE6E0] bg-[linear-gradient(180deg,#EEF6F0_0%,#FFFFFF_42%,#F2F6EA_100%)]",
                ].join(" ")}
                style={{
                  animationDelay: `${index * 80}ms`,
                }}
              >
                <div
                  className={[
                    "relative h-52 flex-shrink-0 overflow-hidden",
                    index === 0
                      ? "bg-[linear-gradient(135deg,#DDEBDD_0%,#F2EEE5_100%)]"
                      : index === 1
                        ? "bg-[linear-gradient(135deg,#F8E7DB_0%,#F2EEE5_100%)]"
                        : index === 2
                          ? "bg-[linear-gradient(135deg,#E9E0F1_0%,#F3E8EA_100%)]"
                          : "bg-[linear-gradient(135deg,#DFEEE3_0%,#EFE8DD_100%)]",
                  ].join(" ")}
                >
                  {mentor.image ? (
                    <OptimizedImage
                      src={mentor.image}
                      alt={mentor.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div
                      aria-label={`Foto ${mentor.name} belum tersedia`}
                      className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#DDEBDD_0%,#F2EEE5_100%)] text-5xl font-bold text-[#557257]"
                    >
                      {mentor.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div
                    className={[
                      "absolute inset-0",
                      index === 0
                        ? "bg-gradient-to-t from-[#324E35]/34 via-transparent to-[#EAF3E8]/10"
                        : index === 1
                          ? "bg-gradient-to-t from-[#715441]/28 via-transparent to-[#FFF0E5]/10"
                          : index === 2
                            ? "bg-gradient-to-t from-[#594963]/30 via-transparent to-[#F0E7F6]/10"
                            : "bg-gradient-to-t from-[#3E5A46]/30 via-transparent to-[#EAF2E9]/10",
                    ].join(" ")}
                  />

                  <div
                    className={[
                      "absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t to-transparent",
                      index === 0
                        ? "from-[#58765B]/38"
                        : index === 1
                          ? "from-[#A46F4B]/30"
                          : index === 2
                            ? "from-[#806391]/30"
                            : "from-[#62816A]/32",
                    ].join(" ")}
                  />

                  {mentor.rating !== null && (
                    <div className="absolute right-3 top-3 rounded-full bg-[linear-gradient(135deg,#FFFFFF_0%,#F7F3EC_100%)] px-2.5 py-1 text-[10px] font-bold text-[#2C1E16] shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                      ★ {mentor.rating.toFixed(1)}
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-1 text-lg font-bold text-[#2C1E16]">
                    {mentor.name}
                  </h3>

                  <p className="mt-1 min-h-[32px] text-xs font-semibold leading-4 text-[#1E3F20]">
                    {mentor.role}
                  </p>

                  <p className="mt-1 min-h-[32px] text-xs leading-4 text-gray-500">
                    {mentor.company}
                  </p>

                  <div className="mt-4 min-h-[50px]">
                    <div className="flex flex-wrap gap-1.5">
                      {mentor.expertise.map((skill, skillIndex) => (
                        <span
                          key={skill}
                          className={[
                            "rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all duration-300",
                            skillIndex % 3 === 0
                              ? "bg-[#EAF2E8] text-[#557357] group-hover:bg-[#DDEBDD]"
                              : skillIndex % 3 === 1
                                ? "bg-[#F7EDE3] text-[#9A6C44] group-hover:bg-[#F1E3D5]"
                                : "bg-[#F0EAF6] text-[#765A8D] group-hover:bg-[#E8DFF1]",
                          ].join(" ")}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-5">
                    <Link
                      href={`/mentors/${mentor.id}`}
                      className="block w-full rounded-xl border border-[#1E3F20] bg-white/80 py-2.5 text-center text-xs font-bold text-[#1E3F20] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1E3F20] hover:text-white hover:shadow-md"
                    >
                      View Profile & Schedule
                    </Link>
                  </div>
                </div>
              </article>
            )))}
          </div>
        </section>
      </main>

      <Footer />

      {/* =====================================================
          CSS ANIMATION
      ====================================================== */}

      <style>{`
        .cc-reveal {
          opacity: 0;
          animation: ccFadeUp 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .cc-card {
          animation: ccFadeUp 650ms cubic-bezier(0.22, 1, 0.36, 1) 100ms both;
        }

        .hero-line {
          transform-origin: left center;
          animation: ccLine 650ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes ccFadeUp {
          from {
            opacity: 0;
            transform: translate3d(0, 24px, 0);
          }

          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes ccLine {
          from {
            opacity: 0;
            transform: scaleX(0);
          }

          to {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cc-reveal,
          .cc-card,
          .hero-line {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
