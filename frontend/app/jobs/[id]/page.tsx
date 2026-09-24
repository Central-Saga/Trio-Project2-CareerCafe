"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

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
   REVEAL COMPONENT
   Animasi sama dengan Home / Mentor / Jobs
========================================================= */

function Reveal({
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
        threshold: 0.08,
        rootMargin: "0px 0px -20px 0px",
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
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/* =========================================================
   HERO REVEAL
   Animasi awal halaman Detail Job
========================================================= */

function HeroReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setVisible(true);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      style={{
        transitionDelay: `${delay}ms`,
      }}
      className={[
        "transform-gpu transition-all duration-700 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();

  const jobId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? (params.id[0] ?? "")
        : "";

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     FETCH DETAIL JOB DARI LARAVEL API
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const fetchJob = async () => {
      if (!jobId) {
        setError("ID lowongan tidak valid.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setJob(null);

        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result?.success) {
          throw new Error(
            result?.message ?? "Detail lowongan tidak ditemukan.",
          );
        }

        if (!result?.data) {
          throw new Error("Data detail lowongan tidak tersedia.");
        }

        if (!cancelled) {
          setJob(result.data);
        }
      } catch (fetchError) {
        if (cancelled) {
          return;
        }

        console.error("Fetch job detail error:", fetchError);

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Terjadi kesalahan saat mengambil detail lowongan.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchJob();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  /* =======================================================
     APPLY
  ======================================================= */

  const handleApply = () => {
    if (!job) {
      return;
    }

    router.push(`/jobs/${job.id}/apply`);
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
        <Navbar />

        <main className="mx-auto max-w-5xl px-6 pb-20 pt-10">
          {/* Back skeleton */}
          <div className="h-5 w-44 animate-pulse rounded bg-gray-200" />

          {/* Hero skeleton */}
          <div className="mt-7 rounded-[30px] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-7 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />

                <div className="mt-5 h-10 w-2/3 animate-pulse rounded bg-gray-100" />

                <div className="mt-3 h-5 w-40 animate-pulse rounded bg-gray-100" />

                <div className="mt-3 h-4 w-48 animate-pulse rounded bg-gray-100" />
              </div>

              <div className="h-24 w-full animate-pulse rounded-2xl bg-gray-100 md:w-52" />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
            <div className="space-y-6">
              <div className="h-56 animate-pulse rounded-[28px] bg-white" />
              <div className="h-40 animate-pulse rounded-[28px] bg-white" />
            </div>

            <div className="h-80 animate-pulse rounded-[28px] bg-white" />
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
        <Navbar />

        <main className="mx-auto max-w-5xl px-6 pb-20 pt-10">
          <Reveal delay={0}>
            <div className="rounded-[30px] border border-red-100 bg-white p-10 text-center shadow-sm sm:p-16">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl font-extrabold text-red-500">
                !
              </div>

              <h1 className="mt-5 text-2xl font-extrabold text-[#2C1E16]">
                Lowongan tidak ditemukan
              </h1>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {error || "Data lowongan yang kamu cari tidak tersedia."}
              </p>

              <button
                type="button"
                onClick={() => router.push("/jobs")}
                className="mt-6 rounded-xl bg-[#1E3F20] px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-lg"
              >
                Kembali ke Lowongan
              </button>
            </div>
          </Reveal>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
      {/* ===================================================
          NAVBAR
      ==================================================== */}

      <Navbar />

      {/* ===================================================
          HERO / JOB HEADER
      ==================================================== */}

      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#DCE6D8]/45 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#E8D8C7]/40 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-6 pb-6 pt-8 sm:pb-8 sm:pt-10">
          {/* Back button */}
          <HeroReveal delay={0}>
            <button
              type="button"
              onClick={() => router.push("/jobs")}
              className="group mb-7 inline-flex cursor-pointer items-center gap-2 bg-transparent text-sm font-bold text-[#1E3F20] transition-all duration-300 hover:-translate-x-1"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-0.5">
                ←
              </span>
              Kembali ke Lowongan
            </button>
          </HeroReveal>

          {/* Main header */}
          <HeroReveal delay={60}>
            <div className="relative overflow-hidden rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_15px_50px_rgba(44,30,22,0.06)] backdrop-blur sm:p-8">
              {/* Top accent */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#1E3F20]/35 to-transparent" />

              <div className="flex flex-col gap-7 md:flex-row md:items-start md:justify-between">
                {/* Job identity */}
                <div className="min-w-0 flex-1">
                  <HeroReveal delay={110}>
                    <span className="inline-flex items-center rounded-full border border-[#1E3F20]/10 bg-[#E8F0E8] px-3 py-1 text-xs font-bold text-[#1E3F20]">
                      {job.type}
                    </span>
                  </HeroReveal>

                  <HeroReveal delay={150}>
                    <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-[#2C1E16] sm:text-4xl">
                      {job.title}
                    </h1>
                  </HeroReveal>

                  <HeroReveal delay={190}>
                    <p className="mt-2 text-sm font-bold text-[#1E3F20] sm:text-base">
                      {job.company}
                    </p>
                  </HeroReveal>

                  <HeroReveal delay={230}>
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <span className="text-gray-400">⌖</span>

                      <span>{job.location}</span>
                    </div>
                  </HeroReveal>

                  {job.category && (
                    <HeroReveal delay={270}>
                      <div className="mt-3">
                        <span className="inline-flex rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[10px] font-bold text-sky-700">
                          {job.category}
                        </span>
                      </div>
                    </HeroReveal>
                  )}
                </div>

                {/* Salary */}
                <HeroReveal delay={150}>
                  <div className="w-full rounded-2xl border border-[#E8E1D8] bg-[#FCFBF8] px-5 py-4 md:w-auto md:min-w-[200px]">
                    <p className="text-xs font-medium text-gray-500">
                      Perkiraan Gaji
                    </p>

                    <p className="mt-1 text-lg font-extrabold text-[#1E3F20]">
                      {job.salary}
                    </p>

                    <p className="mt-1 text-[10px] text-gray-400">
                      sesuai posisi & pengalaman
                    </p>
                  </div>
                </HeroReveal>
              </div>
            </div>
          </HeroReveal>
        </div>
      </section>

      {/* ===================================================
          DETAIL CONTENT
      ==================================================== */}

      <main className="mx-auto max-w-5xl px-6 pb-20 pt-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          {/* =================================================
              LEFT CONTENT
          ================================================== */}

          <div className="min-w-0">
            {/* About */}
            <Reveal delay={0}>
              <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm sm:p-7">
                <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8A6A47]">
                  Job Description
                </p>

                <h2 className="text-2xl font-extrabold text-[#2C1E16]">
                  Tentang Posisi
                </h2>

                <div className="mt-4 h-px w-12 bg-[#1E3F20]/20" />

                <p className="mt-5 text-sm leading-7 text-gray-600">
                  {job.description}
                </p>
              </section>
            </Reveal>

            {/* Skills */}
            <Reveal delay={90} className="mt-6">
              <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm sm:p-7">
                <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8A6A47]">
                  Requirements
                </p>

                <h2 className="text-2xl font-extrabold text-[#2C1E16]">
                  Keahlian yang Dibutuhkan
                </h2>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  {job.skills.map((skill, index) => (
                    <Reveal key={skill} delay={index * 70}>
                      <span className="inline-flex rounded-xl border border-gray-100 bg-[#F8F7F4] px-4 py-2.5 text-sm font-semibold text-[#2C1E16] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1E3F20]/15 hover:bg-[#E8F0E8] hover:text-[#1E3F20] hover:shadow-sm">
                        {skill}
                      </span>
                    </Reveal>
                  ))}
                </div>
              </section>
            </Reveal>
          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================== */}

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Reveal delay={150}>
              <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-[0_12px_40px_rgba(44,30,22,0.05)]">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8A6A47]">
                  Interested?
                </p>

                <h3 className="mt-2 text-xl font-extrabold text-[#2C1E16]">
                  Lamar posisi ini
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Kirim lamaran untuk posisi{" "}
                  <span className="font-semibold text-[#2C1E16]">
                    {job.title}
                  </span>{" "}
                  di{" "}
                  <span className="font-semibold text-[#1E3F20]">
                    {job.company}
                  </span>
                  .
                </p>

                <div className="mt-5 space-y-3">
                  {/* Apply */}
                  <button
                    type="button"
                    onClick={handleApply}
                    className="group w-full cursor-pointer rounded-xl bg-[#1E3F20] px-5 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-lg"
                  >
                    <span className="inline-flex items-center gap-2">
                      Lamar Sekarang
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </button>

                  {/* Other jobs */}
                  <button
                    type="button"
                    onClick={() => router.push("/jobs")}
                    className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-bold text-[#2C1E16] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1E3F20]/20 hover:bg-[#F8F7F4] hover:shadow-sm"
                  >
                    Lihat Lowongan Lain
                  </button>
                </div>

                {/* Small info */}
                <div className="mt-5 border-t border-gray-100 pt-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Tipe pekerjaan</span>

                    <span className="font-bold text-[#2C1E16]">{job.type}</span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-gray-400">Lokasi</span>

                    <span className="max-w-[150px] text-right font-bold text-[#2C1E16]">
                      {job.location}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-gray-400">Perusahaan</span>

                    <span className="max-w-[150px] text-right font-bold text-[#2C1E16]">
                      {job.company}
                    </span>
                  </div>

                  {job.category && (
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-gray-400">Kategori</span>

                      <span className="max-w-[150px] text-right font-bold text-[#2C1E16]">
                        {job.category}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          </aside>
        </div>
      </main>

      {/* ===================================================
          FOOTER
      ==================================================== */}

      <Footer />
    </div>
  );
}
