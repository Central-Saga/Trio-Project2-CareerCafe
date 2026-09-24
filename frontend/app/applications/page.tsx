"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string | null;
  salary: string | null;
};

type Application = {
  id: number;
  job_id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  cv_path: string | null;
  cover_letter: string | null;
  portfolio_url: string | null;
  status: string;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
  job: Job | null;
};

type StatusConfig = {
  label: string;
  className: string;
  dotClassName: string;
};

const getStatusConfig = (status: string): StatusConfig => {
  const normalized = status.toLowerCase();

  switch (normalized) {
    case "accepted":
    case "accepted":
    case "diterima":
      return {
        label: "Diterima",
        className: "border-emerald-100 bg-emerald-50 text-emerald-700",
        dotClassName: "bg-emerald-500",
      };

    case "rejected":
    case "ditolak":
      return {
        label: "Ditolak",
        className: "border-red-100 bg-red-50 text-red-700",
        dotClassName: "bg-red-500",
      };

    case "reviewed":
    case "diproses":
    case "review":
      return {
        label: "Sedang Ditinjau",
        className: "border-sky-100 bg-sky-50 text-sky-700",
        dotClassName: "bg-sky-500",
      };

    case "pending":
    default:
      return {
        label: "Pending",
        className: "border-amber-100 bg-amber-50 text-amber-700",
        dotClassName: "bg-amber-500",
      };
  }
};

const formatAppliedDate = (value: string | null): string => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(true);
    }, delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [delay]);

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

export default function ApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchApplications = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("auth_token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/applications`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("auth_token");
          router.push("/login");
          return;
        }

        if (!response.ok || !result?.success) {
          throw new Error(result?.message ?? "Daftar lamaran gagal dimuat.");
        }

        if (!cancelled) {
          setApplications(Array.isArray(result?.data) ? result.data : []);
        }
      } catch (fetchError) {
        if (cancelled) {
          return;
        }

        console.error("Fetch applications error:", fetchError);

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Terjadi kesalahan saat mengambil daftar lamaran.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchApplications();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
      {/* ===================================================
          NAVBAR
      ==================================================== */}

      <Navbar />

      {/* ===================================================
          HERO
      ==================================================== */}

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#DCE6D8]/45 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#E8D8C7]/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-8 pt-10 sm:pb-10 sm:pt-12">
          <Reveal>
            <button
              type="button"
              onClick={() => router.push("/jobs")}
              className="group inline-flex cursor-pointer items-center gap-2 border-none bg-transparent text-sm font-bold text-[#1E3F20] transition-all duration-300 hover:-translate-x-1"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-0.5">
                ←
              </span>
              Kembali ke Lowongan
            </button>
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-7 max-w-3xl">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8A6A47]">
                Career Application
              </p>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#2C1E16] sm:text-4xl">
                Lamaran Saya
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
                Pantau semua pekerjaan yang sudah kamu lamar dan lihat status
                proses lamaranmu dalam satu tempat.
              </p>
            </div>
          </Reveal>

          {/* SUMMARY */}
          {!loading && !error && (
            <Reveal delay={150}>
              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold text-gray-400">
                    Total Lamaran
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-[#1E3F20]">
                    {applications.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold text-gray-400">
                    Sedang Diproses
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-amber-600">
                    {
                      applications.filter(
                        (application) =>
                          application.status.toLowerCase() === "pending",
                      ).length
                    }
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold text-gray-400">
                    CV Terlampir
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-[#2C1E16]">
                    {
                      applications.filter((application) =>
                        Boolean(application.cv_path),
                      ).length
                    }
                  </p>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ===================================================
          MAIN CONTENT
      ==================================================== */}

      <main className="mx-auto max-w-7xl px-6 pb-20">
        {/* LOADING */}
        {loading && (
          <div className="space-y-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm sm:p-7"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="h-5 w-28 rounded-full bg-gray-100" />

                    <div className="mt-4 h-8 w-2/3 rounded bg-gray-100" />

                    <div className="mt-3 h-4 w-1/3 rounded bg-gray-100" />

                    <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div className="h-12 rounded-xl bg-gray-100" />
                      <div className="h-12 rounded-xl bg-gray-100" />
                      <div className="h-12 rounded-xl bg-gray-100" />
                      <div className="h-12 rounded-xl bg-gray-100" />
                    </div>
                  </div>

                  <div className="h-11 w-full rounded-xl bg-gray-100 lg:w-36" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <Reveal>
            <div className="rounded-[30px] border border-red-100 bg-white p-10 text-center shadow-sm sm:p-16">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl font-extrabold text-red-500">
                !
              </div>

              <h2 className="mt-5 text-2xl font-extrabold text-[#2C1E16]">
                Gagal Memuat Lamaran
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {error}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 rounded-xl bg-[#1E3F20] px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-lg"
              >
                Coba Lagi
              </button>
            </div>
          </Reveal>
        )}

        {/* EMPTY */}
        {!loading && !error && applications.length === 0 && (
          <Reveal>
            <div className="rounded-[30px] border border-gray-100 bg-white p-10 text-center shadow-sm sm:p-16">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#E8F0E8] text-3xl text-[#1E3F20]">
                ☕
              </div>

              <h2 className="mt-6 text-2xl font-extrabold text-[#2C1E16]">
                Belum Ada Lamaran
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                Kamu belum melamar pekerjaan apa pun. Temukan lowongan yang
                cocok dan mulai perjalanan kariermu.
              </p>

              <button
                type="button"
                onClick={() => router.push("/jobs")}
                className="mt-7 rounded-xl bg-[#1E3F20] px-7 py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-lg"
              >
                Cari Lowongan →
              </button>
            </div>
          </Reveal>
        )}

        {/* APPLICATION LIST */}
        {!loading && !error && applications.length > 0 && (
          <div className="space-y-5">
            {applications.map((application, index) => {
              const status = getStatusConfig(application.status);

              return (
                <Reveal key={application.id} delay={Math.min(index * 80, 480)}>
                  <article className="group overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-[0_8px_30px_rgba(44,30,22,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-[#1E3F20]/10 hover:shadow-[0_20px_50px_rgba(30,63,32,0.10)]">
                    <div className="h-1 bg-gradient-to-r from-transparent via-[#1E3F20]/25 to-transparent" />

                    <div className="p-6 sm:p-7">
                      {/* HEADER */}
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {application.job?.type && (
                              <span className="inline-flex rounded-full border border-[#1E3F20]/10 bg-[#E8F0E8] px-3 py-1 text-[10px] font-extrabold text-[#1E3F20]">
                                {application.job.type}
                              </span>
                            )}

                            {application.job?.category && (
                              <span className="inline-flex rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[10px] font-bold text-sky-700">
                                {application.job.category}
                              </span>
                            )}
                          </div>

                          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[#2C1E16] sm:text-3xl">
                            {application.job?.title ??
                              "Lowongan Tidak Diketahui"}
                          </h2>

                          <p className="mt-1 text-sm font-bold text-[#1E3F20]">
                            {application.job?.company ??
                              "Perusahaan Tidak Diketahui"}
                          </p>

                          {application.job?.location && (
                            <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                              <span className="text-gray-400">⌖</span>

                              {application.job.location}
                            </p>
                          )}
                        </div>

                        {/* STATUS */}
                        <div
                          className={[
                            "inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold",
                            status.className,
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "h-2 w-2 rounded-full",
                              status.dotClassName,
                            ].join(" ")}
                          />

                          {status.label}
                        </div>
                      </div>

                      {/* DETAILS */}
                      <div className="mt-7 grid grid-cols-1 gap-3 border-y border-gray-100 py-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl bg-[#FCFBF8] p-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                            Dilamar
                          </p>

                          <p className="mt-1 text-sm font-bold text-[#2C1E16]">
                            {formatAppliedDate(application.applied_at)}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#FCFBF8] p-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                            Tipe
                          </p>

                          <p className="mt-1 text-sm font-bold text-[#2C1E16]">
                            {application.job?.type ?? "-"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#FCFBF8] p-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                            Gaji
                          </p>

                          <p className="mt-1 text-sm font-bold text-[#1E3F20]">
                            {application.job?.salary ?? "Negosiasi"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#FCFBF8] p-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                            CV
                          </p>

                          <p
                            className={[
                              "mt-1 text-sm font-bold",
                              application.cv_path
                                ? "text-emerald-700"
                                : "text-gray-400",
                            ].join(" ")}
                          >
                            {application.cv_path ? "✓ Terlampir" : "Belum ada"}
                          </p>
                        </div>
                      </div>

                      {/* COVER LETTER */}
                      {application.cover_letter && (
                        <div className="mt-5 rounded-2xl border border-gray-100 bg-[#FCFBF8] p-5">
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#8A6A47]">
                            Cover Letter
                          </p>

                          <p className="mt-2 text-sm leading-7 text-gray-600">
                            {application.cover_letter}
                          </p>
                        </div>
                      )}

                      {/* ACTIONS */}
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-gray-400">
                          Lamaran #{application.id}
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                          {application.job && (
                            <button
                              type="button"
                              onClick={() =>
                                router.push(`/jobs/${application.job?.id}`)
                              }
                              className="cursor-pointer rounded-xl border border-gray-200 bg-white px-5 py-3 text-xs font-bold text-[#2C1E16] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1E3F20]/20 hover:bg-[#F8F7F4] hover:shadow-sm"
                            >
                              Lihat Lowongan
                            </button>
                          )}

                          {application.portfolio_url && (
                            <button
                              type="button"
                              onClick={() =>
                                window.open(
                                  application.portfolio_url ?? "",
                                  "_blank",
                                  "noopener,noreferrer",
                                )
                              }
                              className="cursor-pointer rounded-xl bg-[#1E3F20] px-5 py-3 text-xs font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-lg"
                            >
                              Lihat Portfolio →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </main>

      {/* ===================================================
          FOOTER
      ==================================================== */}

      <Footer />
    </div>
  );
}
