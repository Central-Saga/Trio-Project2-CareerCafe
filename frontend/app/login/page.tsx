"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Email atau kata sandi tidak sesuai.");
      }

      /*
       * Struktur backend yang digunakan:
       *
       * data.data.user
       * data.data.token
       *
       * Tetap dibuat fallback supaya lebih aman jika response backend
       * berubah sedikit.
       */
      const userData = data.data?.user || data.user || {};
      const token = data.data?.token || data.access_token;

      const userName = userData.name || data.name || "Pengguna";

      const userRole = String(
        userData.role || data.role || "mentee",
      ).toLowerCase();

      /*
       * Simpan token autentikasi
       */
      if (token) {
        localStorage.setItem("auth_token", token);
      }

      /*
       * Simpan informasi user
       */
      localStorage.setItem("user_name", userName);
      localStorage.setItem("user_role", userRole);

      /*
       * REDIRECT BERDASARKAN ROLE
       *
       * Admin  -> Admin Dashboard
       * Mentor -> Mentor Dashboard
       * Mentee -> Home Career Cafe
       */
      if (userRole === "admin") {
        router.push("/admin/dashboard");
      } else if (userRole === "mentor") {
        router.push("/mentor/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat proses login.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes login-left-enter {
          0% {
            opacity: 0;
            transform: translateX(-28px);
          }

          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes login-right-enter {
          0% {
            opacity: 0;
            transform: translateX(28px);
          }

          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes login-fade-up {
          0% {
            opacity: 0;
            transform: translateY(18px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes login-logo-enter {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.96);
          }

          70% {
            opacity: 1;
            transform: translateY(-2px) scale(1.01);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes login-feature-enter {
          0% {
            opacity: 0;
            transform: translateY(14px) scale(0.97);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes login-bg-zoom {
          0% {
            transform: scale(1.03);
          }

          50% {
            transform: scale(1.055);
          }

          100% {
            transform: scale(1.03);
          }
        }

        @keyframes login-soft-pulse {
          0%,
          100% {
            opacity: 0.55;
            transform: scale(1);
          }

          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        @keyframes login-error-enter {
          0% {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }

          60% {
            opacity: 1;
            transform: translateY(1px) scale(1.01);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes login-spinner {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes login-button-success {
          0% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.02);
          }

          100% {
            transform: scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <div className="relative flex min-h-screen w-full overflow-hidden bg-[#FCFBF8] font-sans text-[#2C1E16]">
        {/* =====================================================
            LEFT SIDE
        ====================================================== */}
        <div className="relative hidden min-h-screen w-1/2 overflow-hidden lg:flex">
          {/* BACKGROUND IMAGE */}
          <div
            className="absolute inset-[-2%] bg-cover bg-center"
            style={{
              backgroundImage: "url('/image/cafe.jpg')",
              animation: "login-bg-zoom 18s ease-in-out infinite",
            }}
          />

          {/* SOFT WHITE OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FCFBF8] via-[#FCFBF8]/82 to-transparent" />

          <div className="absolute inset-y-0 right-0 w-[18%] bg-gradient-to-l from-white/10 to-transparent" />

          {/* DECORATIVE LIGHT */}
          <div
            className="pointer-events-none absolute left-[16%] top-[15%] h-36 w-36 rounded-full bg-white/25 blur-3xl"
            style={{
              animation: "login-soft-pulse 6s ease-in-out infinite",
            }}
          />

          <div
            className="pointer-events-none absolute bottom-[15%] left-[33%] h-40 w-40 rounded-full bg-[#D8E4D8]/25 blur-3xl"
            style={{
              animation: "login-soft-pulse 7s ease-in-out infinite 1s",
            }}
          />

          {/* CONTENT */}
          <div className="relative z-10 flex h-full w-full flex-col justify-center px-12 xl:px-20">
            {/* LOGO */}
            <div
              className="-mb-6"
              style={{
                animation:
                  "login-logo-enter 850ms cubic-bezier(0.22, 1, 0.36, 1) both",
              }}
            >
              <img
                src="/image/logo.png"
                alt="Logo Career Cafe"
                className="-ml-6 h-56 w-auto mix-blend-multiply transition-transform duration-500 hover:scale-[1.015]"
              />
            </div>

            {/* TITLE */}
            <h1
              className="mb-6 text-5xl font-extrabold leading-tight text-[#2C1E16] xl:text-6xl"
              style={{
                animation:
                  "login-fade-up 800ms 120ms cubic-bezier(0.22, 1, 0.36, 1) both",
              }}
            >
              Temukan Mentor,
              <br />
              Bangun Karier,
              <br />
              Raih Masa Depan
            </h1>

            {/* DESCRIPTION */}
            <p
              className="mb-10 max-w-md text-lg leading-relaxed text-[#2C1E16] opacity-80"
              style={{
                animation:
                  "login-fade-up 800ms 220ms cubic-bezier(0.22, 1, 0.36, 1) both",
              }}
            >
              Career Cafe adalah platform konsultasi karier untuk membantu kamu
              belajar, berdiskusi, dan tumbuh bersama mentor profesional.
            </p>

            {/* FEATURES */}
            <div className="flex gap-6 xl:gap-10">
              {/* FEATURE 1 */}
              <div
                className="group flex cursor-default flex-col gap-2"
                style={{
                  animation:
                    "login-feature-enter 700ms 320ms cubic-bezier(0.22, 1, 0.36, 1) both",
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E3F20]/10 text-[#1E3F20] shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:bg-[#1E3F20]/15">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v-.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                    />
                  </svg>
                </div>

                <span className="text-xs font-semibold text-[#2C1E16]">
                  Mentor
                  <br />
                  Profesional
                </span>
              </div>

              {/* FEATURE 2 */}
              <div
                className="group flex cursor-default flex-col gap-2"
                style={{
                  animation:
                    "login-feature-enter 700ms 410ms cubic-bezier(0.22, 1, 0.36, 1) both",
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E3F20]/10 text-[#1E3F20] shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:bg-[#1E3F20]/15">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                    />
                  </svg>
                </div>

                <span className="text-xs font-semibold text-[#2C1E16]">
                  Sesi Konsultasi
                  <br />
                  Fleksibel
                </span>
              </div>

              {/* FEATURE 3 */}
              <div
                className="group flex cursor-default flex-col gap-2"
                style={{
                  animation:
                    "login-feature-enter 700ms 500ms cubic-bezier(0.22, 1, 0.36, 1) both",
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E3F20]/10 text-[#1E3F20] shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:bg-[#1E3F20]/15">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                    />
                  </svg>
                </div>

                <span className="text-xs font-semibold text-[#2C1E16]">
                  Dukungan
                  <br />
                  Komunitas
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}
        <div
          className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden bg-white p-8 sm:p-12 xl:p-20 lg:w-1/2"
          style={{
            animation:
              "login-right-enter 850ms cubic-bezier(0.22, 1, 0.36, 1) both",
          }}
        >
          {/* MOBILE REGISTER */}
          <div
            className="absolute right-6 top-6 z-10 text-xs sm:right-10 sm:top-10 sm:text-sm"
            style={{
              animation:
                "login-fade-up 650ms 350ms cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            <span className="text-gray-500">Belum punya akun? </span>

            <Link
              href="/register"
              className="font-bold text-[#1E3F20] transition-all duration-300 hover:translate-x-0.5 hover:underline"
            >
              Daftar sekarang →
            </Link>
          </div>

          {/* FORM WRAPPER */}
          <div
            className="relative z-10 mx-auto w-full max-w-md"
            style={{
              animation:
                "login-fade-up 800ms 180ms cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            {/* ERROR */}
            {error && (
              <div
                className="mb-6 rounded-xl border border-red-100 bg-red-50 p-3 text-center text-sm font-medium text-red-600 shadow-[0_8px_20px_rgba(185,28,28,0.05)]"
                style={{
                  animation:
                    "login-error-enter 450ms cubic-bezier(0.22, 1, 0.36, 1) both",
                }}
              >
                {error}
              </div>
            )}

            {/* TITLE */}
            <div
              style={{
                animation:
                  "login-fade-up 700ms 260ms cubic-bezier(0.22, 1, 0.36, 1) both",
              }}
            >
              <h2 className="mb-2 text-3xl font-bold text-[#2C1E16]">
                Selamat Datang Kembali
              </h2>

              <p className="mb-6 text-sm leading-relaxed text-gray-500">
                Masuk ke akun Career Cafe kamu untuk melanjutkan perjalanan
                kariermu.
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* EMAIL */}
              <div
                style={{
                  animation:
                    "login-fade-up 650ms 340ms cubic-bezier(0.22, 1, 0.36, 1) both",
                }}
              >
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-bold text-[#2C1E16]"
                >
                  Email atau Nomor Telepon
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trioriawan@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#2C1E16] shadow-[0_4px_14px_rgba(44,30,22,0.02)] outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 hover:shadow-[0_6px_18px_rgba(44,30,22,0.04)] focus:-translate-y-0.5 focus:border-[#1E3F20] focus:shadow-[0_10px_24px_rgba(30,63,32,0.08)] focus:ring-4 focus:ring-[#1E3F20]/10"
                  required
                />
              </div>

              {/* PASSWORD */}
              <div
                style={{
                  animation:
                    "login-fade-up 650ms 410ms cubic-bezier(0.22, 1, 0.36, 1) both",
                }}
              >
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-bold text-[#2C1E16]"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#2C1E16] shadow-[0_4px_14px_rgba(44,30,22,0.02)] outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 hover:shadow-[0_6px_18px_rgba(44,30,22,0.04)] focus:-translate-y-0.5 focus:border-[#1E3F20] focus:shadow-[0_10px_24px_rgba(30,63,32,0.08)] focus:ring-4 focus:ring-[#1E3F20]/10"
                  required
                />
              </div>

              {/* OPTIONS */}
              <div
                className="flex items-center justify-between text-sm"
                style={{
                  animation:
                    "login-fade-up 650ms 480ms cubic-bezier(0.22, 1, 0.36, 1) both",
                }}
              >
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-[#1E3F20] transition-all focus:ring-[#1E3F20]"
                  />

                  <span className="text-gray-600">Ingat saya</span>
                </label>

                <Link
                  href="#"
                  className="font-semibold text-[#1E3F20] transition-all duration-300 hover:translate-x-0.5 hover:underline"
                >
                  Lupa password?
                </Link>
              </div>

              {/* LOGIN BUTTON */}
              <div
                style={{
                  animation:
                    "login-fade-up 650ms 550ms cubic-bezier(0.22, 1, 0.36, 1) both",
                }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1E3F20] py-3.5 font-bold text-white shadow-[0_10px_22px_rgba(30,63,32,0.14)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.005] hover:bg-[#173119] hover:shadow-[0_15px_28px_rgba(30,63,32,0.2)] active:translate-y-0 active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <span
                        className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                        style={{
                          animation: "login-spinner 700ms linear infinite",
                        }}
                      />

                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk</span>

                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* DIVIDER */}
            <div
              className="my-5 flex items-center justify-center gap-3"
              style={{
                animation:
                  "login-fade-up 650ms 620ms cubic-bezier(0.22, 1, 0.36, 1) both",
              }}
            >
              <span className="h-px w-full bg-gray-200" />

              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                atau
              </span>

              <span className="h-px w-full bg-gray-200" />
            </div>

            {/* GOOGLE */}
            <button
              type="button"
              className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-bold text-[#2C1E16] shadow-[0_4px_14px_rgba(44,30,22,0.02)] transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-50 hover:shadow-[0_10px_22px_rgba(44,30,22,0.06)] active:translate-y-0"
              style={{
                animation:
                  "login-fade-up 650ms 690ms cubic-bezier(0.22, 1, 0.36, 1) both",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-300 group-hover:scale-110"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />

                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />

                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />

                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>

              <span>Lanjut dengan Google</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
