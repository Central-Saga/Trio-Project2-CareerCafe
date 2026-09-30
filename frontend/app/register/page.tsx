"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    if (!name.trim()) {
      setError("Full name is required.");
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      /*
       * Register biasa tidak mengirim role.
       *
       * Backend harus menentukan role akun baru
       * sebagai mentee.
       */

      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const validationMessage =
          data.errors?.name?.[0] ||
          data.errors?.email?.[0] ||
          data.errors?.password?.[0] ||
          data.errors?.password_confirmation?.[0];

        throw new Error(
          validationMessage ||
            data.message ||
            "Registration failed. Please try again.",
        );
      }

      /*
       * Struktur backend:
       *
       * data.data.user
       * data.data.token
       */

      const userData = data.data?.user || data.user || {};
      const token = data.data?.token || data.access_token;

      const userName = userData.name || name.trim();

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

      /*
       * Register biasa selalu mentee.
       */

      localStorage.setItem("user_role", "mentee");

      /*
       * Beri sedikit waktu agar transisi terasa halus.
       */

      await new Promise((resolve) => setTimeout(resolve, 500));

      /*
       * Setelah register berhasil,
       * masuk ke halaman utama Career Cafe.
       */

      router.push("/");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during registration.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes register-left-enter {
          0% {
            opacity: 0;
            transform: translateX(-24px);
          }

          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes register-right-enter {
          0% {
            opacity: 0;
            transform: translateX(24px);
          }

          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes register-fade-up {
          0% {
            opacity: 0;
            transform: translateY(12px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes register-logo-enter {
          0% {
            opacity: 0;
            transform: translateY(14px) scale(0.97);
          }

          70% {
            opacity: 1;
            transform: translateY(-1px) scale(1.01);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes register-feature-enter {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes register-bg-zoom {
          0% {
            transform: scale(1.025);
          }

          50% {
            transform: scale(1.045);
          }

          100% {
            transform: scale(1.025);
          }
        }

        @keyframes register-soft-pulse {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(1);
          }

          50% {
            opacity: 0.72;
            transform: scale(1.04);
          }
        }

        @keyframes register-error-enter {
          0% {
            opacity: 0;
            transform: translateY(-4px) scale(0.99);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes register-spinner {
          to {
            transform: rotate(360deg);
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
              animation: "register-bg-zoom 18s ease-in-out infinite",
            }}
          />

          {/* BASE OVERLAY */}

          <div className="absolute inset-0 bg-gradient-to-r from-[#FCFBF8]/95 via-[#FCFBF8]/50 to-transparent" />

          {/* ==================================================
              LARGE SOFT CENTER GRADIENT BLEND
          =================================================== */}

          <div className="pointer-events-none absolute inset-y-0 right-[-10px] z-20 w-80 bg-gradient-to-r from-transparent via-white/10 via-35% via-white/30 via-58% via-white/65 to-white" />

          {/* SECOND FEATHER */}

          <div className="pointer-events-none absolute inset-y-[-8%] right-[-55px] z-[21] w-72 bg-gradient-to-r from-transparent via-white/15 to-white/90 blur-2xl" />

          {/* THIRD SOFT HAZE */}

          <div className="pointer-events-none absolute inset-y-0 right-[-25px] z-[22] w-52 bg-gradient-to-r from-transparent via-white/30 to-white blur-[10px]" />

          {/* FINAL WHITE FADE */}

          <div className="pointer-events-none absolute inset-y-0 right-0 z-[23] w-28 bg-gradient-to-r from-transparent to-white/95" />

          {/* DECORATIVE LIGHT */}

          <div
            className="pointer-events-none absolute left-[16%] top-[14%] h-28 w-28 rounded-full bg-white/20 blur-3xl"
            style={{
              animation: "register-soft-pulse 6s ease-in-out infinite",
            }}
          />

          <div
            className="pointer-events-none absolute bottom-[14%] left-[32%] h-32 w-32 rounded-full bg-[#D8E4D8]/20 blur-3xl"
            style={{
              animation: "register-soft-pulse 7s ease-in-out infinite 1s",
            }}
          />

          {/* CONTENT */}

          <div
            className="relative z-30 flex h-screen w-full flex-col justify-center px-10 xl:px-16"
            style={{
              animation:
                "register-left-enter 750ms cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            {/* LOGO */}

            <div
              className="-mb-5"
              style={{
                animation:
                  "register-logo-enter 750ms cubic-bezier(0.22, 1, 0.36, 1) both",
              }}
            >
              <img
                src="/image/logo.png"
                alt="Logo Career Cafe"
                className="-ml-5 h-40 w-auto mix-blend-multiply transition-transform duration-500 hover:scale-[1.01] xl:h-44"
              />
            </div>

            {/* TITLE */}

            <h1
              className="mb-4 text-[38px] font-extrabold leading-[1.02] tracking-[-0.035em] text-[#2C1E16] xl:text-[46px]"
              style={{
                animation:
                  "register-fade-up 700ms 100ms cubic-bezier(0.22, 1, 0.36, 1) both",
              }}
            >
              Start Your Journey,
              <br />
              Build Your Career,
              <br />
              Shape Your Future
            </h1>

            {/* DESCRIPTION */}

            <p
              className="mb-6 max-w-[430px] text-sm leading-6 text-[#2C1E16] opacity-75 xl:text-[15px]"
              style={{
                animation:
                  "register-fade-up 700ms 180ms cubic-bezier(0.22, 1, 0.36, 1) both",
              }}
            >
              Career Cafe is a career coaching platform that helps you learn,
              connect, and grow with professional mentors.
            </p>

            {/* FEATURES */}

            <div className="flex gap-5 xl:gap-7">
              {/* FEATURE 1 */}

              <div
                className="group flex cursor-default flex-col gap-1.5"
                style={{
                  animation:
                    "register-feature-enter 600ms 260ms cubic-bezier(0.22, 1, 0.36, 1) both",
                }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E3F20]/10 text-[#1E3F20] shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:bg-[#1E3F20]/15">
                  <UsersIcon />
                </div>

                <span className="text-[10px] font-semibold leading-4 text-[#2C1E16]">
                  Mentor
                  <br />
                  Professional
                </span>
              </div>

              {/* FEATURE 2 */}

              <div
                className="group flex cursor-default flex-col gap-1.5"
                style={{
                  animation:
                    "register-feature-enter 600ms 340ms cubic-bezier(0.22, 1, 0.36, 1) both",
                }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E3F20]/10 text-[#1E3F20] shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:bg-[#1E3F20]/15">
                  <SessionIcon />
                </div>

                <span className="text-[10px] font-semibold leading-4 text-[#2C1E16]">
                  Coaching Sessions
                  <br />
                  Flexible
                </span>
              </div>

              {/* FEATURE 3 */}

              <div
                className="group flex cursor-default flex-col gap-1.5"
                style={{
                  animation:
                    "register-feature-enter 600ms 420ms cubic-bezier(0.22, 1, 0.36, 1) both",
                }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E3F20]/10 text-[#1E3F20] shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:bg-[#1E3F20]/15">
                  <GrowthIcon />
                </div>

                <span className="text-[10px] font-semibold leading-4 text-[#2C1E16]">
                  Community
                  <br />
                  Support
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}

        <div
          className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden bg-white px-6 py-6 sm:px-10 lg:w-1/2 lg:px-12 xl:px-16"
          style={{
            animation:
              "register-right-enter 750ms cubic-bezier(0.22, 1, 0.36, 1) both",
          }}
        >
          {/* LOGIN LINK */}

          <div
            className="absolute right-5 top-5 z-10 text-[11px] sm:right-8 sm:top-7 sm:text-xs"
            style={{
              animation:
                "register-fade-up 600ms 250ms cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            <span className="text-gray-500">Already have an account? </span>

            <Link
              href="/login"
              className="font-bold text-[#1E3F20] transition-all duration-300 hover:translate-x-0.5 hover:underline"
            >
              Log in now →
            </Link>
          </div>

          {/* FORM WRAPPER */}

          <div className="relative z-10 mx-auto w-full max-w-[390px]">
            {/* ERROR */}

            {error && (
              <div
                className="mb-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-center text-xs font-medium text-red-600 shadow-[0_6px_16px_rgba(185,28,28,0.05)]"
                style={{
                  animation:
                    "register-error-enter 350ms cubic-bezier(0.22, 1, 0.36, 1) both",
                }}
              >
                {error}
              </div>
            )}

            {/* TITLE */}

            <div
              style={{
                animation:
                  "register-fade-up 650ms 160ms cubic-bezier(0.22, 1, 0.36, 1) both",
              }}
            >
              <h2 className="mb-1.5 text-[26px] font-bold tracking-[-0.025em] text-[#2C1E16] sm:text-[28px]">
                Create a New Account
              </h2>

              <p className="mb-5 text-xs leading-5 text-gray-500 sm:text-sm">
                Sign up for Career Cafe and start your journey of growth,
                learning, and career development.
              </p>
            </div>

            {/* FORM */}

            <form onSubmit={handleRegister} className="space-y-2.5">
              {/* NAME */}

              <div
                style={{
                  animation:
                    "register-fade-up 600ms 270ms cubic-bezier(0.22, 1, 0.36, 1) both",
                }}
              >
                <label
                  htmlFor="name"
                  className="mb-1 block text-xs font-bold text-[#2C1E16]"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Trio Riawan"
                  autoComplete="name"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-[#2C1E16] shadow-[0_3px_10px_rgba(44,30,22,0.02)] outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 hover:shadow-[0_5px_14px_rgba(44,30,22,0.04)] focus:-translate-y-0.5 focus:border-[#1E3F20] focus:shadow-[0_8px_18px_rgba(30,63,32,0.08)] focus:ring-4 focus:ring-[#1E3F20]/10 sm:text-sm"
                  required
                />
              </div>

              {/* EMAIL */}

              <div
                style={{
                  animation:
                    "register-fade-up 600ms 320ms cubic-bezier(0.22, 1, 0.36, 1) both",
                }}
              >
                <label
                  htmlFor="email"
                  className="mb-1 block text-xs font-bold text-[#2C1E16]"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trioriawan@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-[#2C1E16] shadow-[0_3px_10px_rgba(44,30,22,0.02)] outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 hover:shadow-[0_5px_14px_rgba(44,30,22,0.04)] focus:-translate-y-0.5 focus:border-[#1E3F20] focus:shadow-[0_8px_18px_rgba(30,63,32,0.08)] focus:ring-4 focus:ring-[#1E3F20]/10 sm:text-sm"
                  required
                />
              </div>

              {/* PASSWORD */}

              <div
                style={{
                  animation:
                    "register-fade-up 600ms 370ms cubic-bezier(0.22, 1, 0.36, 1) both",
                }}
              >
                <label
                  htmlFor="password"
                  className="mb-1 block text-xs font-bold text-[#2C1E16]"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  minLength={8}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-[#2C1E16] shadow-[0_3px_10px_rgba(44,30,22,0.02)] outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 hover:shadow-[0_5px_14px_rgba(44,30,22,0.04)] focus:-translate-y-0.5 focus:border-[#1E3F20] focus:shadow-[0_8px_18px_rgba(30,63,32,0.08)] focus:ring-4 focus:ring-[#1E3F20]/10 sm:text-sm"
                  required
                />
              </div>

              {/* CONFIRM PASSWORD */}

              <div
                style={{
                  animation:
                    "register-fade-up 600ms 420ms cubic-bezier(0.22, 1, 0.36, 1) both",
                }}
              >
                <label
                  htmlFor="password_confirmation"
                  className="mb-1 block text-xs font-bold text-[#2C1E16]"
                >
                  Confirm Password
                </label>

                <input
                  id="password_confirmation"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  minLength={8}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-[#2C1E16] shadow-[0_3px_10px_rgba(44,30,22,0.02)] outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 hover:shadow-[0_5px_14px_rgba(44,30,22,0.04)] focus:-translate-y-0.5 focus:border-[#1E3F20] focus:shadow-[0_8px_18px_rgba(30,63,32,0.08)] focus:ring-4 focus:ring-[#1E3F20]/10 sm:text-sm"
                  required
                />
              </div>

              {/* TERMS */}

              <div
                className="flex items-start gap-2 pt-0.5 text-[10px]"
                style={{
                  animation:
                    "register-fade-up 600ms 470ms cubic-bezier(0.22, 1, 0.36, 1) both",
                }}
              >
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="mt-0.5 rounded border-gray-300 text-[#1E3F20] focus:ring-[#1E3F20]"
                />

                <label
                  htmlFor="terms"
                  className="cursor-pointer leading-4 text-gray-600"
                >
                  Saya setuju menggunakan Career Cafe secara bertanggung jawab
                  dan memberikan informasi yang benar.
                </label>
              </div>

              {/* REGISTER BUTTON */}

              <div
                style={{
                  animation:
                    "register-fade-up 600ms 520ms cubic-bezier(0.22, 1, 0.36, 1) both",
                }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1E3F20] py-3 text-xs font-bold text-white shadow-[0_8px_18px_rgba(30,63,32,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.005] hover:bg-[#173119] hover:shadow-[0_12px_22px_rgba(30,63,32,0.2)] active:translate-y-0 active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:scale-100 sm:text-sm"
                >
                  {loading ? (
                    <>
                      <span
                        className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white"
                        style={{
                          animation: "register-spinner 700ms linear infinite",
                        }}
                      />

                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar</span>

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
              className="my-3.5 flex items-center justify-center gap-2.5"
              style={{
                animation:
                  "register-fade-up 600ms 580ms cubic-bezier(0.22, 1, 0.36, 1) both",
              }}
            >
              <span className="h-px w-full bg-gray-200" />

              <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                atau
              </span>

              <span className="h-px w-full bg-gray-200" />
            </div>

            {/* GOOGLE */}

            <button
              type="button"
              className="group flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white py-3 text-xs font-bold text-[#2C1E16] shadow-[0_3px_10px_rgba(44,30,22,0.02)] transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-50 hover:shadow-[0_8px_18px_rgba(44,30,22,0.06)] active:translate-y-0 sm:text-sm"
              style={{
                animation:
                  "register-fade-up 600ms 640ms cubic-bezier(0.22, 1, 0.36, 1) both",
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-300 group-hover:scale-105"
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
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87 0 3.3 0 6.16-4.53z"
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

/* =========================================================
   ICONS
========================================================= */

function UsersIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />

      <path
        d="M3.5 18C4.2 15.2 6 13.8 9 13.8C12 13.8 13.8 15.2 14.5 18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M16 8.2C16.3 6.6 17.45 5.5 18.8 5.5C20.3 5.5 21.5 6.8 21.5 8.3C21.5 9.8 20.3 11.1 18.8 11.1C18.45 11.1 18.12 11.05 17.8 10.9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SessionIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M12.375 12a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M16.125 12a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M21 12c0 4.2-4.03 7.5-9 7.5a9.9 9.9 0 01-2.6-.34A6.2 6.2 0 014.8 20.8a4.6 4.6 0 001-2.1C3.9 17.35 3 14.85 3 12c0-4.2 4.03-7.5 9-7.5s9 3.3 9 7.5z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GrowthIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M16 7.1l5.86 1.72-1.72 5.86"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
