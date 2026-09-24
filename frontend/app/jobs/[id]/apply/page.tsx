"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { useParams, useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string | null;
};

type FormState = {
  full_name: string;
  email: string;
  phone: string;
  cover_letter: string;
  portfolio_url: string;
};

const MAX_CV_SIZE = 5 * 1024 * 1024;

function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
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
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export default function JobApplyPage() {
  const router = useRouter();
  const params = useParams();

  const jobId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? (params.id[0] ?? "")
        : "";

  const [job, setJob] = useState<Job | null>(null);

  const [form, setForm] = useState<FormState>({
    full_name: "",
    email: "",
    phone: "",
    cover_letter: "",
    portfolio_url: "",
  });

  const [cvFile, setCvFile] = useState<File | null>(null);

  const [loadingJob, setLoadingJob] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /* =======================================================
     LOAD JOB + USER
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoadingJob(true);
      setError("");

      try {
        const token = localStorage.getItem("auth_token");

        if (!token) {
          router.push("/login");
          return;
        }

        /* =================================================
           Ambil detail job
        ================================================= */

        const jobResponse = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        const jobData = await jobResponse.json();

        if (!jobResponse.ok || !jobData?.success) {
          throw new Error(jobData?.message ?? "Data pekerjaan gagal dimuat.");
        }

        if (!jobData?.data) {
          throw new Error("Data pekerjaan tidak tersedia.");
        }

        if (!cancelled) {
          setJob(jobData.data);
        }

        /* =================================================
           Ambil user yang sedang login
        ================================================= */

        const meResponse = await fetch(`${API_BASE_URL}/me`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (meResponse.ok) {
          const meData = await meResponse.json();

          const user =
            meData?.data?.user ?? meData?.data ?? meData?.user ?? null;

          if (!cancelled) {
            setForm((current) => ({
              ...current,
              full_name: user?.name ?? localStorage.getItem("user_name") ?? "",
              email: user?.email ?? "",
            }));
          }
        } else {
          const storedName = localStorage.getItem("user_name");

          if (!cancelled && storedName) {
            setForm((current) => ({
              ...current,
              full_name: storedName,
            }));
          }
        }
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        console.error("Load apply page error:", loadError);

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Terjadi kesalahan saat memuat halaman.",
        );
      } finally {
        if (!cancelled) {
          setLoadingJob(false);
        }
      }
    };

    if (jobId) {
      loadData();
    }

    return () => {
      cancelled = true;
    };
  }, [jobId, router]);

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /* =======================================================
     CV CHANGE
  ======================================================= */

  const handleCvChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError("");

    const file = event.target.files?.[0];

    if (!file) {
      setCvFile(null);
      return;
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      event.target.value = "";
      setCvFile(null);
      setError("CV harus berupa file PDF.");
      return;
    }

    if (file.size > MAX_CV_SIZE) {
      event.target.value = "";
      setCvFile(null);
      setError("Ukuran CV maksimal 5 MB.");
      return;
    }

    setCvFile(file);
  };

  /* =======================================================
     REMOVE CV
  ======================================================= */

  const removeCv = () => {
    setCvFile(null);

    const input = document.getElementById("cv") as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }

    setError("");
  };

  /* =======================================================
     CLOSE SUCCESS MODAL
  ======================================================= */

  const handleCloseSuccess = () => {
    router.push("/jobs");
  };

  /* =======================================================
     SUBMIT APPLICATION
  ======================================================= */

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!job) {
      return;
    }

    setError("");

    const token = localStorage.getItem("auth_token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (!cvFile) {
      setError("Silakan upload CV terlebih dahulu.");
      return;
    }

    const isPdf =
      cvFile.type === "application/pdf" ||
      cvFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError("CV harus berupa file PDF.");
      return;
    }

    if (cvFile.size > MAX_CV_SIZE) {
      setError("Ukuran CV maksimal 5 MB.");
      return;
    }

    setSubmitting(true);

    try {
      /* =================================================
         FormData untuk mengirim file CV
      ================================================= */

      const formData = new FormData();

      formData.append("full_name", form.full_name.trim());

      formData.append("email", form.email.trim());

      if (form.phone.trim()) {
        formData.append("phone", form.phone.trim());
      }

      formData.append("cv", cvFile);

      if (form.cover_letter.trim()) {
        formData.append("cover_letter", form.cover_letter.trim());
      }

      if (form.portfolio_url.trim()) {
        formData.append("portfolio_url", form.portfolio_url.trim());
      }

      /* =================================================
         Kirim ke Laravel
      ================================================= */

      const response = await fetch(`${API_BASE_URL}/jobs/${job.id}/apply`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("auth_token");
          router.push("/login");
          return;
        }

        if (response.status === 422) {
          const validationErrors = data?.errors;

          if (validationErrors) {
            const messages = Object.values(validationErrors)
              .flat()
              .filter(Boolean)
              .join(" ");

            throw new Error(
              messages || data?.message || "Data lamaran tidak valid.",
            );
          }
        }

        throw new Error(data?.message ?? "Lamaran gagal dikirim.");
      }

      /* =================================================
         BERHASIL
      ================================================= */

      setSuccess(true);
    } catch (submitError) {
      console.error("Submit application error:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Terjadi kesalahan saat mengirim lamaran.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loadingJob) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
        <main className="mx-auto max-w-4xl px-6 pb-20 pt-10">
          <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />

          <div className="mt-7 rounded-[30px] border border-gray-100 bg-white p-7 shadow-sm sm:p-8">
            <div className="h-5 w-28 animate-pulse rounded bg-gray-100" />

            <div className="mt-5 h-10 w-2/3 animate-pulse rounded bg-gray-100" />

            <div className="mt-3 h-5 w-40 animate-pulse rounded bg-gray-100" />
          </div>

          <div className="mt-6 rounded-[30px] border border-gray-100 bg-white p-7 shadow-sm sm:p-8">
            <div className="h-8 w-56 animate-pulse rounded bg-gray-100" />

            <div className="mt-8 space-y-5">
              <div className="h-14 animate-pulse rounded-xl bg-gray-100" />
              <div className="h-14 animate-pulse rounded-xl bg-gray-100" />
              <div className="h-14 animate-pulse rounded-xl bg-gray-100" />
              <div className="h-36 animate-pulse rounded-xl bg-gray-100" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* =======================================================
     ERROR / JOB NOT FOUND
  ======================================================= */

  if (!job) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
        <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6">
          <div className="w-full rounded-[30px] border border-red-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl font-extrabold text-red-500">
              !
            </div>

            <h1 className="mt-5 text-2xl font-extrabold">
              Lowongan Tidak Ditemukan
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              {error || "Data lowongan yang kamu pilih tidak tersedia."}
            </p>

            <button
              type="button"
              onClick={() => router.push("/jobs")}
              className="mt-6 rounded-xl bg-[#1E3F20] px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-lg"
            >
              Kembali ke Lowongan
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
      {/* ===================================================
          NAVBAR
      ==================================================== */}

      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 md:px-8">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="cursor-pointer border-none bg-transparent text-xl font-extrabold tracking-tight text-[#1E3F20]"
        >
          Career Cafe
        </button>

        <div className="hidden items-center gap-8 text-sm font-semibold text-gray-600 md:flex">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="cursor-pointer border-none bg-transparent transition-colors hover:text-[#1E3F20]"
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => router.push("/jobs")}
            className="cursor-pointer border-none bg-transparent font-bold text-[#1E3F20]"
          >
            Jobs
          </button>

          <button
            type="button"
            onClick={() => router.push("/mentors")}
            className="cursor-pointer border-none bg-transparent transition-colors hover:text-[#1E3F20]"
          >
            Mentor
          </button>

          <button
            type="button"
            onClick={() => router.push("/community")}
            className="cursor-pointer border-none bg-transparent transition-colors hover:text-[#1E3F20]"
          >
            Community
          </button>

          <button
            type="button"
            onClick={() => router.push("/schedule")}
            className="cursor-pointer border-none bg-transparent transition-colors hover:text-[#1E3F20]"
          >
            Schedule
          </button>
        </div>

        <div className="rounded-full border border-gray-200 bg-gray-50 p-1">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E3F20] text-xs font-bold text-white">
              {form.full_name ? form.full_name.charAt(0).toUpperCase() : "P"}
            </div>

            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("auth_token");
                localStorage.removeItem("user_name");
                localStorage.removeItem("user_role");

                router.push("/login");
              }}
              className="cursor-pointer border-none bg-transparent px-3 text-xs font-bold text-red-600 transition-colors hover:text-red-700"
            >
              Keluar
            </button>
          </div>
        </div>
      </nav>

      {/* ===================================================
          CONTENT
      ==================================================== */}

      <main className="mx-auto max-w-3xl px-6 py-10 md:py-14">
        {/* BACK */}
        <Reveal>
          <button
            type="button"
            onClick={() => router.push(`/jobs/${job.id}`)}
            className="cursor-pointer border-none bg-transparent text-sm font-bold text-gray-500 transition-colors hover:text-[#1E3F20]"
          >
            ← Kembali ke Detail Lowongan
          </button>
        </Reveal>

        {/* JOB SUMMARY */}
        <Reveal delay={80}>
          <section className="mt-6 rounded-[30px] border border-gray-100 bg-white p-7 shadow-sm md:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <span className="inline-flex rounded-full border border-[#1E3F20]/10 bg-[#E8F0E8] px-3 py-1 text-[10px] font-extrabold text-[#1E3F20]">
                  {job.type}
                </span>

                <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#2C1E16] sm:text-4xl">
                  Lamar Pekerjaan
                </h1>

                <p className="mt-2 text-xl font-extrabold text-[#1E3F20]">
                  {job.title}
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-600">
                  {job.company}
                </p>

                <p className="mt-1 text-sm text-gray-500">{job.location}</p>
              </div>

              <div className="rounded-2xl border border-[#E8E1D8] bg-[#FCFBF8] px-5 py-4 sm:min-w-[170px]">
                <p className="text-xs text-gray-500">Perkiraan Gaji</p>

                <p className="mt-1 font-extrabold text-[#1E3F20]">
                  {job.salary || "Negosiasi"}
                </p>
              </div>
            </div>
          </section>
        </Reveal>

        {/* APPLICATION FORM */}
        <Reveal delay={160}>
          <section className="mt-6 rounded-[30px] border border-gray-100 bg-white p-7 shadow-sm md:p-8">
            <div className="mb-7">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8A6A47]">
                Application Form
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-[#2C1E16]">
                Lengkapi Data Lamaran
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Isi data dengan benar dan upload CV terbaru kamu sebelum
                mengirim lamaran.
              </p>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium leading-relaxed text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* NAMA */}
              <div>
                <label
                  htmlFor="full_name"
                  className="mb-2 block text-sm font-bold text-[#2C1E16]"
                >
                  Nama Lengkap
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="full_name"
                  type="text"
                  value={form.full_name}
                  onChange={(event) =>
                    handleChange("full_name", event.target.value)
                  }
                  placeholder="Masukkan nama lengkap"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-[#1E3F20]/40 focus:ring-2 focus:ring-[#1E3F20]/10"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-[#2C1E16]"
                >
                  Email
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    handleChange("email", event.target.value)
                  }
                  placeholder="contoh@email.com"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-[#1E3F20]/40 focus:ring-2 focus:ring-[#1E3F20]/10"
                />
              </div>

              {/* PHONE */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-bold text-[#2C1E16]"
                >
                  Nomor HP
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    handleChange("phone", event.target.value)
                  }
                  placeholder="081234567890"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-[#1E3F20]/40 focus:ring-2 focus:ring-[#1E3F20]/10"
                />
              </div>

              {/* CV */}
              <div>
                <label
                  htmlFor="cv"
                  className="mb-2 block text-sm font-bold text-[#2C1E16]"
                >
                  CV / Resume
                  <span className="ml-1 text-red-500">*</span>
                </label>

                {!cvFile ? (
                  <label
                    htmlFor="cv"
                    className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#1E3F20]/15 bg-[#FCFBF8] px-5 py-9 text-center transition-all duration-300 hover:border-[#1E3F20]/30 hover:bg-[#E8F0E8]/40"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0E8] text-2xl text-[#1E3F20] transition-transform duration-300 group-hover:-translate-y-1">
                      ↑
                    </div>

                    <p className="mt-4 text-sm font-extrabold text-[#2C1E16]">
                      Upload CV kamu
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Klik untuk memilih file PDF
                    </p>

                    <p className="mt-3 text-[10px] font-semibold text-gray-400">
                      PDF • maksimal 5 MB
                    </p>

                    <input
                      id="cv"
                      name="cv"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleCvChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="rounded-2xl border border-[#1E3F20]/10 bg-[#FCFBF8] p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 text-sm font-extrabold text-red-600">
                        PDF
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#2C1E16]">
                          {cvFile.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={removeCv}
                        className="cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-red-600 transition-all hover:bg-red-50"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                )}

                <p className="mt-2 text-[10px] leading-5 text-gray-400">
                  CV akan disimpan bersama data lamaran kamu dan digunakan untuk
                  proses seleksi.
                </p>
              </div>

              {/* PORTFOLIO */}
              <div>
                <label
                  htmlFor="portfolio_url"
                  className="mb-2 block text-sm font-bold text-[#2C1E16]"
                >
                  Portfolio
                  <span className="ml-1 font-normal text-gray-400">
                    (opsional)
                  </span>
                </label>

                <input
                  id="portfolio_url"
                  type="url"
                  value={form.portfolio_url}
                  onChange={(event) =>
                    handleChange("portfolio_url", event.target.value)
                  }
                  placeholder="https://github.com/username"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-[#1E3F20]/40 focus:ring-2 focus:ring-[#1E3F20]/10"
                />
              </div>

              {/* COVER LETTER */}
              <div>
                <label
                  htmlFor="cover_letter"
                  className="mb-2 block text-sm font-bold text-[#2C1E16]"
                >
                  Cover Letter
                  <span className="ml-1 font-normal text-gray-400">
                    (opsional)
                  </span>
                </label>

                <textarea
                  id="cover_letter"
                  value={form.cover_letter}
                  onChange={(event) =>
                    handleChange("cover_letter", event.target.value)
                  }
                  placeholder="Ceritakan secara singkat mengapa kamu tertarik dengan posisi ini..."
                  rows={7}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm leading-relaxed outline-none transition-all placeholder:text-gray-400 focus:border-[#1E3F20]/40 focus:ring-2 focus:ring-[#1E3F20]/10"
                />
              </div>

              {/* INFO */}
              <div className="rounded-2xl border border-[#1E3F20]/10 bg-[#1E3F20]/5 px-4 py-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#1E3F20] text-xs font-bold text-white">
                    i
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#1E3F20]">
                      Yang perlu diperhatikan
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-gray-600">
                      CV wajib berupa PDF dengan ukuran maksimal 5 MB. Pastikan
                      CV yang diupload merupakan CV terbaru kamu.
                    </p>
                  </div>
                </div>
              </div>

              {/* BUTTON */}
              <div className="flex flex-col gap-3 pt-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => router.push(`/jobs/${job.id}`)}
                  disabled={submitting}
                  className="order-2 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-bold text-[#2C1E16] transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:order-1 sm:w-auto"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={submitting || Boolean(success)}
                  className="order-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1E3F20] px-7 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:order-2 sm:ml-auto sm:w-auto"
                >
                  {submitting
                    ? "Mengirim Lamaran..."
                    : success
                      ? "Lamaran Terkirim ✓"
                      : "Kirim Lamaran →"}
                </button>
              </div>
            </form>
          </section>
        </Reveal>
      </main>

      {/* ===================================================
          SUCCESS MODAL
      ==================================================== */}

      {success && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2C1E16]/40 px-6 backdrop-blur-sm">
          <div className="w-full max-w-md animate-[modalIn_0.35s_ease-out] rounded-[30px] border border-white/80 bg-white p-7 text-center shadow-[0_25px_80px_rgba(44,30,22,0.22)] sm:p-9">
            {/* SUCCESS ICON */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F0E8]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1E3F20] text-3xl font-bold text-white shadow-lg">
                ✓
              </div>
            </div>

            {/* TITLE */}
            <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-[#2C1E16]">
              Lamaran Berhasil!
            </h2>

            {/* DESCRIPTION */}
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
              Lamaran kamu untuk posisi{" "}
              <span className="font-bold text-[#2C1E16]">{job.title}</span> di{" "}
              <span className="font-bold text-[#1E3F20]">{job.company}</span>{" "}
              sudah berhasil dikirim.
            </p>

            {/* STATUS */}
            <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Status: Pending
            </div>

            {/* INFO */}
            <p className="mt-4 text-xs leading-5 text-gray-400">
              Lamaran kamu sedang menunggu proses selanjutnya. Kamu bisa melihat
              perkembangan lamaran melalui halaman Lamaran Saya.
            </p>

            {/* BUTTON */}
            <button
              type="button"
              onClick={handleCloseSuccess}
              className="mt-7 w-full cursor-pointer rounded-xl bg-[#1E3F20] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-lg"
            >
              Kembali ke Lowongan →
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL ANIMATION
      ==================================================== */}

      <style jsx>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.96);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
