"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Availability = {
  id?: number;
  day_of_week: number;
  start_time?: string;
  end_time?: string;
  is_active?: boolean;
};

type DaySchedule = {
  day_of_week: number;
  label: string;
  short_label: string;
  enabled: boolean;
  start_time: string;
  end_time: string;
};

type MeResponse = {
  success?: boolean;
  message?: string;
  data?: {
    id?: number | string;
  } | null;
};

type AvailabilityResponse = {
  success?: boolean;
  message?: string;
  data?: Availability[];
};

type SaveResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
  errors?: Record<string, string[] | string>;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const DAYS = [
  {
    day_of_week: 0,
    label: "Sunday",
    short_label: "Su",
  },
  {
    day_of_week: 1,
    label: "Monday",
    short_label: "Mo",
  },
  {
    day_of_week: 2,
    label: "Tuesday",
    short_label: "Tu",
  },
  {
    day_of_week: 3,
    label: "Wednesday",
    short_label: "We",
  },
  {
    day_of_week: 4,
    label: "Thursday",
    short_label: "Th",
  },
  {
    day_of_week: 5,
    label: "Friday",
    short_label: "Fr",
  },
  {
    day_of_week: 6,
    label: "Saturday",
    short_label: "Sa",
  },
];

function normalizeTime(value?: string) {
  if (!value) {
    return "09:00";
  }

  return value.slice(0, 5);
}

function createDefaultSchedule(): DaySchedule[] {
  return DAYS.map((day) => ({
    day_of_week: day.day_of_week,
    label: day.label,
    short_label: day.short_label,
    enabled: false,
    start_time: "09:00",
    end_time: "17:00",
  }));
}

function getInitials(label: string) {
  return label.slice(0, 2);
}

export default function MentorAvailabilityPage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    createDefaultSchedule(),
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  /* =========================================================
     LOAD AVAILABILITY
  ========================================================= */

  const loadAvailability = useCallback(async () => {
    const token = localStorage.getItem("auth_token") || "";

    if (!token) {
      setError("Sesi login tidak ditemukan. Silakan login kembali.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      let mentorId = localStorage.getItem("user_id");

      /*
       * Kalau user_id belum ada di localStorage,
       * ambil dari endpoint /me.
       */
      if (!mentorId) {
        const meResponse = await fetch(`${API_URL}/me`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const meResult = (await meResponse
          .json()
          .catch(() => null)) as MeResponse | null;

        if (meResponse.ok && meResult?.data?.id) {
          mentorId = String(meResult.data.id);
          localStorage.setItem("user_id", mentorId);
        }
      }

      if (!mentorId) {
        setError("Tidak dapat menentukan akun mentor.");
        return;
      }

      /*
       * Ambil availability dari backend.
       */
      const response = await fetch(
        `${API_URL}/mentors/${mentorId}/availability`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        },
      );

      const result = (await response
        .json()
        .catch(() => null)) as AvailabilityResponse | null;

      if (!response.ok) {
        setError(result?.message || "Gagal mengambil availability mentor.");
        return;
      }

      const backendAvailability = Array.isArray(result?.data)
        ? result.data
        : [];

      const freshSchedule = createDefaultSchedule();

      backendAvailability.forEach((item) => {
        const index = freshSchedule.findIndex(
          (day) => Number(day.day_of_week) === Number(item.day_of_week),
        );

        if (index === -1) {
          return;
        }

        /*
         * Hanya anggap aktif kalau backend memang aktif.
         */
        const isActive = item.is_active !== false;

        freshSchedule[index] = {
          ...freshSchedule[index],
          enabled: isActive,
          start_time: normalizeTime(item.start_time),
          end_time: normalizeTime(item.end_time),
        };
      });

      setSchedule(freshSchedule);
    } catch (err) {
      console.error("Load availability error:", err);

      setError("Tidak dapat terhubung ke Laravel backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  /* =========================================================
     TOGGLE DAY
  ========================================================= */

  const toggleDay = (dayIndex: number) => {
    setSchedule((current) =>
      current.map((day, index) => {
        if (index !== dayIndex) {
          return day;
        }

        return {
          ...day,
          enabled: !day.enabled,
        };
      }),
    );

    setError("");
    setSuccess("");
  };

  /* =========================================================
     UPDATE TIME
  ========================================================= */

  const updateTime = (
    dayIndex: number,
    type: "start_time" | "end_time",
    value: string,
  ) => {
    setSchedule((current) =>
      current.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              [type]: value,
            }
          : day,
      ),
    );

    setError("");
    setSuccess("");
  };

  /* =========================================================
     ACTIVE DAYS
  ========================================================= */

  const activeDays = useMemo(() => {
    return schedule.filter((day) => day.enabled).length;
  }, [schedule]);

  /* =========================================================
     SAVE
  ========================================================= */

  const saveAvailability = async () => {
    const token = localStorage.getItem("auth_token") || "";

    if (!token) {
      setError("Sesi login tidak ditemukan. Silakan login kembali.");
      return;
    }

    setError("");
    setSuccess("");

    /*
     * Validasi minimal satu hari.
     */
    const activeSchedule = schedule.filter((day) => day.enabled);

    if (activeSchedule.length === 0) {
      setError("Pilih minimal satu hari yang tersedia.");
      return;
    }

    /*
     * Validasi jam.
     */
    for (const day of activeSchedule) {
      if (!day.start_time || !day.end_time) {
        setError(`${day.label}: waktu mulai dan selesai wajib diisi.`);
        return;
      }

      if (day.start_time >= day.end_time) {
        setError(
          `${day.label}: waktu selesai harus lebih besar dari waktu mulai.`,
        );
        return;
      }
    }

    /*
     * PAYLOAD BACKEND
     */
    const availabilities = activeSchedule.map((day) => ({
      day_of_week: day.day_of_week,
      start_time: day.start_time,
      end_time: day.end_time,
    }));

    const payload = {
      availabilities,
    };

    console.log("Sending availability payload:", payload);

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/availability`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = (await response
        .json()
        .catch(() => null)) as SaveResponse | null;

      console.log("Availability save response:", result);

      if (!response.ok) {
        /*
         * Laravel validation errors.
         */
        if (result?.errors) {
          const messages = Object.values(result.errors)
            .flatMap((value) => (Array.isArray(value) ? value : [value]))
            .filter(Boolean);

          if (messages.length > 0) {
            setError(messages.join(" "));
            return;
          }
        }

        setError(result?.message || "Gagal menyimpan availability.");

        return;
      }

      /*
       * Berhasil.
       */
      const successMessage =
        result?.message || "Availability berhasil disimpan.";

      setSuccess(successMessage);
      setShowSuccessPopup(true);

      /*
       * Tutup popup otomatis setelah 3 detik.
       */
      window.setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);

      /*
       * Reload data dari backend.
       */
      await loadAvailability();
    } catch (err) {
      console.error("Availability save error:", err);

      setError("Tidak dapat terhubung ke Laravel backend.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <>
        <style jsx global>{`
          @keyframes availability-loading-pulse {
            0% {
              opacity: 0.45;
              transform: translateY(4px);
            }

            50% {
              opacity: 1;
              transform: translateY(0);
            }

            100% {
              opacity: 0.45;
              transform: translateY(4px);
            }
          }
        `}</style>

        <main className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-[#FCFBF8]">
          <div
            className="flex flex-col items-center"
            style={{
              animation: "availability-loading-pulse 1.6s ease-in-out infinite",
            }}
          >
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E5DEED] border-t-[#8B6FB5]" />

            <p className="mt-4 text-xs font-bold text-gray-400">
              Loading availability...
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes availability-page-enter {
          0% {
            opacity: 0;
            transform: translateY(18px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes availability-hero-enter {
          0% {
            opacity: 0;
            transform: translateY(14px) scale(0.985);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes availability-card-enter {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.985);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes availability-popup-enter {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(0.94);
          }

          60% {
            opacity: 1;
            transform: translateY(-2px) scale(1.015);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
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

      {/* =====================================================
          PAGE
      ====================================================== */}

      <main className="mx-auto max-w-[1200px] px-5 py-7 sm:px-7 xl:px-10">
        {/* ===================================================
            HERO
        ==================================================== */}

        <section
          className="rounded-[30px] border border-[#E4DBEF] bg-gradient-to-br from-[#F5F0FB] via-white to-[#F6F8FD] p-6 shadow-[0_15px_40px_rgba(139,111,181,0.06)] sm:p-8"
          style={{
            animation:
              "availability-hero-enter 700ms cubic-bezier(0.22, 1, 0.36, 1) both",
          }}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-[#F0EAF8] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#7B5AA8] transition duration-300 hover:-translate-y-0.5 hover:bg-[#E9DFF5]">
                Availability
              </span>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#2C1E16]">
                Set your mentoring hours
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500">
                Choose the days and hours when mentees can book your time.
              </p>
            </div>

            <div className="group rounded-2xl bg-white px-5 py-4 shadow-[0_10px_24px_rgba(44,30,22,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(44,30,22,0.08)]">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-gray-400">
                Active days
              </p>

              <p className="mt-1 text-3xl font-extrabold text-[#8B6FB5] transition-transform duration-300 group-hover:scale-105">
                {activeDays}
              </p>
            </div>
          </div>
        </section>

        {/* ===================================================
            ERROR
        ==================================================== */}

        {error && (
          <div
            className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold leading-6 text-red-700"
            style={{
              animation:
                "availability-page-enter 450ms cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            {error}
          </div>
        )}

        {/* ===================================================
            SUCCESS INLINE
        ==================================================== */}

        {success && !showSuccessPopup && (
          <div
            className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800"
            style={{
              animation:
                "availability-page-enter 450ms cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            {success}
          </div>
        )}

        {/* ===================================================
            WEEKLY TEMPLATE
        ==================================================== */}

        <section
          className="mt-7 rounded-[30px] border border-[#E4E2DD] bg-white p-5 shadow-[0_12px_32px_rgba(44,30,22,0.035)] sm:p-7"
          style={{
            animation:
              "availability-page-enter 800ms 120ms cubic-bezier(0.22, 1, 0.36, 1) both",
          }}
        >
          <div className="mb-6">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-gray-400">
              Weekly Template
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-[#2C1E16]">
              Weekly availability
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Your backend will automatically generate concrete 45-minute
              booking slots for the following four weeks.
            </p>
          </div>

          <div className="space-y-3">
            {schedule.map((day, index) => (
              <div
                key={day.day_of_week}
                className={[
                  "group/day rounded-2xl border p-4",
                  "transform-gpu will-change-transform",
                  "transition-all duration-300 ease-out",
                  "hover:-translate-y-1 hover:scale-[1.008]",
                  "hover:shadow-[0_14px_30px_rgba(88,69,111,0.08)]",
                  "focus-within:-translate-y-1 focus-within:shadow-[0_14px_30px_rgba(88,69,111,0.08)]",
                  day.enabled
                    ? "border-[#DCCEF0] bg-[#FBF9FE] shadow-[0_8px_22px_rgba(139,111,181,0.06)] hover:border-[#CFC0E7]"
                    : "border-[#ECE9E3] bg-[#FCFBF8] hover:border-[#DDD6E7] hover:bg-white",
                ].join(" ")}
                style={{
                  animation:
                    "availability-card-enter 650ms cubic-bezier(0.22, 1, 0.36, 1) both",
                  animationDelay: `${220 + index * 70}ms`,
                }}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  {/* =================================================
                      CLICKABLE DAY AREA
                  ================================================== */}

                  <button
                    type="button"
                    onClick={() => toggleDay(index)}
                    aria-pressed={day.enabled}
                    className="group flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl text-left outline-none"
                  >
                    <div
                      className={[
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                        "text-sm font-extrabold",
                        "transform-gpu transition-all duration-300 ease-out",
                        "group-hover:scale-[1.07] group-hover:-rotate-1",
                        day.enabled
                          ? "bg-[#8B6FB5] text-white shadow-[0_10px_22px_rgba(139,111,181,0.22)]"
                          : "bg-[#F0EEE8] text-gray-400 group-hover:bg-[#ECE8F1] group-hover:text-[#8B6FB5]",
                      ].join(" ")}
                    >
                      {getInitials(day.short_label)}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-[#2C1E16]">
                        {day.label}
                      </p>

                      <p
                        className={[
                          "mt-0.5 text-[11px] font-semibold transition-colors duration-300",
                          day.enabled
                            ? "text-[#8B6FB5]"
                            : "text-gray-400 group-hover:text-[#857B93]",
                        ].join(" ")}
                      >
                        {day.enabled ? "Available for booking" : "Unavailable"}
                      </p>
                    </div>

                    {/* Status indicator */}

                    <div
                      className={[
                        "ml-auto mr-2 hidden h-10 w-10 shrink-0 items-center justify-center rounded-full sm:flex",
                        "transform-gpu transition-all duration-300 ease-out",
                        "group-hover:scale-105",
                        day.enabled
                          ? "bg-[#F0EAF8] text-[#8B6FB5]"
                          : "bg-[#F0EEE8] text-gray-300 group-hover:bg-[#ECE8F1] group-hover:text-[#B7A8C6]",
                      ].join(" ")}
                    >
                      {day.enabled ? (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="transition-transform duration-300 group-hover:scale-110"
                        >
                          <path
                            d="M5 12.5L9.5 17L19 7.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <span className="h-2.5 w-2.5 rounded-full bg-current transition-transform duration-300 group-hover:scale-125" />
                      )}
                    </div>
                  </button>

                  {/* =================================================
                      TIME INPUTS
                  ================================================== */}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div>
                      <label
                        htmlFor={`start-${day.day_of_week}`}
                        className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.1em] text-gray-400"
                      >
                        Start
                      </label>

                      <input
                        id={`start-${day.day_of_week}`}
                        type="time"
                        value={day.start_time}
                        onChange={(event) =>
                          updateTime(index, "start_time", event.target.value)
                        }
                        disabled={!day.enabled}
                        className="w-[105px] cursor-pointer rounded-xl border border-[#DDD9D0] bg-white px-3 py-2.5 text-sm font-bold text-gray-700 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-[#CDBEE2] hover:shadow-[0_8px_18px_rgba(88,69,111,0.06)] focus:-translate-y-0.5 focus:border-[#8B6FB5] focus:ring-4 focus:ring-[#8B6FB5]/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 disabled:hover:translate-y-0 disabled:hover:border-[#DDD9D0] disabled:hover:shadow-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`end-${day.day_of_week}`}
                        className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.1em] text-gray-400"
                      >
                        End
                      </label>

                      <input
                        id={`end-${day.day_of_week}`}
                        type="time"
                        value={day.end_time}
                        onChange={(event) =>
                          updateTime(index, "end_time", event.target.value)
                        }
                        disabled={!day.enabled}
                        className="w-[105px] cursor-pointer rounded-xl border border-[#DDD9D0] bg-white px-3 py-2.5 text-sm font-bold text-gray-700 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-[#CDBEE2] hover:shadow-[0_8px_18px_rgba(88,69,111,0.06)] focus:-translate-y-0.5 focus:border-[#8B6FB5] focus:ring-4 focus:ring-[#8B6FB5]/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 disabled:hover:translate-y-0 disabled:hover:border-[#DDD9D0] disabled:hover:shadow-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile status */}

                <div
                  className={[
                    "mt-3 flex items-center gap-2 text-[10px] font-bold transition-colors duration-300 sm:hidden",
                    day.enabled ? "text-[#8B6FB5]" : "text-gray-400",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "h-1.5 w-1.5 rounded-full transition-transform duration-300 group-hover/day:scale-125",
                      day.enabled ? "bg-[#8B6FB5]" : "bg-gray-300",
                    ].join(" ")}
                  />

                  {day.enabled
                    ? "Klik hari untuk menonaktifkan"
                    : "Klik hari untuk mengaktifkan"}
                </div>
              </div>
            ))}
          </div>

          {/* =================================================
              SAVE AREA
          ================================================== */}

          <div
            className="mt-7 flex flex-col gap-4 rounded-2xl bg-[#F7F2FB] p-5 transition-all duration-300 hover:bg-[#F5EFFA] hover:shadow-[0_10px_26px_rgba(139,111,181,0.05)] sm:flex-row sm:items-center sm:justify-between"
            style={{
              animation:
                "availability-card-enter 650ms 780ms cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            <div>
              <p className="text-sm font-extrabold text-[#2C1E16]">
                Ready to publish your availability?
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                {activeDays} hari aktif dan siap digunakan untuk booking.
              </p>
            </div>

            <button
              type="button"
              onClick={saveAvailability}
              disabled={saving}
              className="group cursor-pointer rounded-xl bg-[#8B6FB5] px-6 py-3 text-xs font-extrabold text-white shadow-[0_10px_22px_rgba(139,111,181,0.18)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:bg-[#795DA5] hover:shadow-[0_15px_28px_rgba(139,111,181,0.24)] active:translate-y-0 active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              <span className="inline-flex items-center gap-2">
                {saving && (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                )}

                {saving ? "Saving..." : "Save Availability"}
              </span>
            </button>
          </div>
        </section>
      </main>

      {/* =====================================================
          SUCCESS POPUP
      ====================================================== */}

      {showSuccessPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 px-5 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-[28px] bg-white p-7 text-center shadow-2xl"
            style={{
              animation:
                "availability-popup-enter 550ms cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-[0_10px_22px_rgba(16,185,129,0.08)]">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="animate-[availability-check_500ms_ease-out]"
              >
                <path
                  d="M5 12.5L9.5 17L19 7.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2 className="mt-5 text-xl font-extrabold text-[#2C1E16]">
              Availability berhasil!
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Jadwal mentoring kamu sudah berhasil disimpan. Sistem akan
              menggunakan jadwal ini untuk membuat slot booking.
            </p>

            <button
              type="button"
              onClick={() => setShowSuccessPopup(false)}
              className="mt-6 w-full rounded-xl bg-[#1E3F20] px-5 py-3 text-sm font-extrabold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-[0_10px_22px_rgba(30,63,32,0.18)] active:translate-y-0"
            >
              Oke
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes availability-check {
          0% {
            opacity: 0;
            transform: scale(0.55) rotate(-8deg);
          }

          70% {
            opacity: 1;
            transform: scale(1.12) rotate(2deg);
          }

          100% {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
}
