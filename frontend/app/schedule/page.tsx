"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useRouter, useSearchParams } from "next/navigation";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type Mentor = {
  id: number;
  name: string;
  profile?: {
    job_title?: string | null;
    company?: string | null;
    location?: string | null;
    profile_photo?: string | null;
    bio?: string | null;
    experience_years?: number | null;
    avg_rating?: number | string | null;
    total_reviews?: number | null;
    education?: string | null;
    industry?: {
      id: number;
      name: string;
    } | null;
  };
};

type Slot = {
  id: number;
  mentor_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  availability_id?: number;
};

type BookingSuccess = {
  mentorName: string;
  date: string;
  startTime: string;
  endTime: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

/* =========================================================
   REVEAL ANIMATION
========================================================= */

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
        threshold: 0.08,
        rootMargin: "0px 0px -80px 0px",
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
        transitionDelay: visible ? `${delay}ms` : "0ms",
      }}
      className={[
        "transform-gpu will-change-transform",
        "transition-all duration-[900ms]",
        "ease-[cubic-bezier(0.16,1,0.3,1)]",
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-7 scale-[0.985] opacity-0",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/* =========================================================
   ICONS
========================================================= */

function CalendarIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 3.5V7M16 3.5V7M4 9.5h16M5.5 4.5h13A1.5 1.5 0 0120 6v13a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 19V6a1.5 1.5 0 011.5-1.5z"
      />
    </svg>
  );
}

function ClockIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      className={className}
    >
      <circle cx="12" cy="12" r="8.5" />

      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5v5l3.25 2" />
    </svg>
  );
}

function UserIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75a17.933 17.933 0 01-7.5-1.632z"
      />
    </svg>
  );
}

function VideoIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h6a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function LocationIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z"
      />

      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}

function CheckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ArrowRightIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14M13 6l6 6-6 6"
      />
    </svg>
  );
}

function SparkleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l1.35 5.15L18.5 9.5l-5.15 1.35L12 16l-1.35-5.15L5.5 9.5l5.15-1.35L12 3z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75L19 15z"
      />
    </svg>
  );
}

/* =========================================================
   MAIN CONTENT
========================================================= */

function SchedulePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mentorId = searchParams.get("mentor_id");

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");

  const [meetingType, setMeetingType] = useState<"online" | "offline">(
    "online",
  );

  const [meetingLocation, setMeetingLocation] = useState("");

  const [loadingMentor, setLoadingMentor] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(true);

  const [bookingLoading, setBookingLoading] = useState(false);

  const [error, setError] = useState("");
  const [bookingError, setBookingError] = useState("");

  const [successModal, setSuccessModal] = useState<BookingSuccess | null>(null);

  /* =========================================================
     TODAY
  ========================================================= */

  const today = useMemo(() => {
    const date = new Date();

    date.setHours(0, 0, 0, 0);

    return date;
  }, []);

  /* =========================================================
     DATE LIST
  ========================================================= */

  const dates = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);

      date.setDate(today.getDate() + index);

      const iso = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      return {
        iso,
        dayName: date.toLocaleDateString("id-ID", {
          weekday: "short",
        }),
        dayNumber: date.toLocaleDateString("id-ID", {
          day: "2-digit",
        }),
        monthName: date.toLocaleDateString("id-ID", {
          month: "short",
        }),
      };
    });
  }, [today]);

  useEffect(() => {
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0].iso);
    }
  }, [dates, selectedDate]);

  /* =========================================================
     FETCH MENTOR
  ========================================================= */

  useEffect(() => {
    if (!mentorId) {
      setError("Mentor belum dipilih.");
      setLoadingMentor(false);
      setLoadingSlots(false);

      return;
    }

    const controller = new AbortController();

    const fetchMentor = async () => {
      try {
        setLoadingMentor(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/mentors/${mentorId}`, {
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Data mentor gagal ditemukan.");
        }

        setMentor(data.data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil data mentor.",
        );
      } finally {
        setLoadingMentor(false);
      }
    };

    fetchMentor();

    return () => controller.abort();
  }, [mentorId]);

  /* =========================================================
     FETCH SLOTS
  ========================================================= */

  const fetchSlots = async () => {
    if (!mentorId) {
      return;
    }

    try {
      setLoadingSlots(true);
      setError("");

      const from = dates[0]?.iso;
      const to = dates[dates.length - 1]?.iso;

      if (!from || !to) {
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/mentors/${mentorId}/slots?from=${from}&to=${to}`,
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Jadwal mentor gagal dimuat.");
      }

      const fetchedSlots: Slot[] = Array.isArray(data.data) ? data.data : [];

      setSlots(fetchedSlots);

      setSelectedSlotId((currentSelectedSlotId) => {
        const stillAvailable = fetchedSlots.some(
          (slot) =>
            slot.id === currentSelectedSlotId && slot.status === "available",
        );

        return stillAvailable ? currentSelectedSlotId : null;
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil jadwal.",
      );
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (!mentorId || dates.length === 0) {
      return;
    }

    fetchSlots();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentorId, dates]);

  /* =========================================================
     DERIVED
  ========================================================= */

  const selectedDateSlots = useMemo(() => {
    return slots.filter(
      (slot) => slot.date === selectedDate && slot.status === "available",
    );
  }, [slots, selectedDate]);

  const selectedSlot = useMemo(() => {
    return slots.find((slot) => slot.id === selectedSlotId) ?? null;
  }, [slots, selectedSlotId]);

  const availableTotal = useMemo(() => {
    return slots.filter((slot) => slot.status === "available").length;
  }, [slots]);

  /* =========================================================
     FORMATTERS
  ========================================================= */

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const formatDateLong = (dateString: string) => {
    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  /* =========================================================
     BOOKING
  ========================================================= */

  const handleBooking = async () => {
    setBookingError("");

    const token = localStorage.getItem("auth_token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (!selectedSlot) {
      setBookingError("Silakan pilih waktu konsultasi terlebih dahulu.");

      return;
    }

    if (!topic.trim()) {
      setBookingError("Topik konsultasi wajib diisi.");
      return;
    }

    if (!message.trim()) {
      setBookingError("Pesan konsultasi wajib diisi.");
      return;
    }

    if (meetingType === "offline" && !meetingLocation.trim()) {
      setBookingError("Lokasi pertemuan wajib diisi untuk sesi offline.");

      return;
    }

    try {
      setBookingLoading(true);

      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          booked_slot_id: selectedSlot.id,
          topic: topic.trim(),
          message: message.trim(),
          duration: 45,
          meeting_type: meetingType,
          meeting_link:
            meetingType === "online" ? "https://meet.google.com" : null,
          meeting_location:
            meetingType === "offline" ? meetingLocation.trim() : null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        let messageText = data.message || "Booking sesi gagal dilakukan.";

        if (data.errors) {
          const validationMessages = Object.values(data.errors)
            .flat()
            .map(String);

          if (validationMessages.length > 0) {
            messageText = validationMessages.join(" ");
          }
        }

        throw new Error(messageText);
      }

      setSuccessModal({
        mentorName: mentor?.name || "Mentor",
        date: selectedSlot.date,
        startTime: selectedSlot.start_time,
        endTime: selectedSlot.end_time,
      });

      setTopic("");
      setMessage("");
      setMeetingLocation("");
      setSelectedSlotId(null);

      await fetchSlots();
    } catch (err) {
      setBookingError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat membuat booking.",
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const closeSuccessModal = () => {
    setSuccessModal(null);
  };

  /* =========================================================
     RATING
  ========================================================= */

  const rating =
    mentor?.profile?.avg_rating !== null &&
    mentor?.profile?.avg_rating !== undefined
      ? Number(mentor.profile.avg_rating).toFixed(1)
      : "0.0";

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loadingMentor) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] text-[#2C1E16]">
        <Navbar />

        <main className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="mx-auto mb-4 h-5 w-32 rounded-full bg-gray-200" />

            <div className="mx-auto mb-3 h-10 w-80 max-w-full rounded-xl bg-gray-200" />

            <div className="mx-auto mb-12 h-4 w-[520px] max-w-full rounded-lg bg-gray-200" />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-6">
                <div className="h-40 rounded-[2rem] bg-white shadow-sm" />
                <div className="h-56 rounded-[2rem] bg-white shadow-sm" />
                <div className="h-60 rounded-[2rem] bg-white shadow-sm" />
                <div className="h-[520px] rounded-[2rem] bg-white shadow-sm" />
              </div>

              <div className="h-[520px] rounded-[2rem] bg-white shadow-sm" />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /* =========================================================
     ERROR STATE
  ========================================================= */

  if (error && !mentor) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] text-[#2C1E16]">
        <Navbar />

        <main className="mx-auto max-w-3xl px-6 py-20">
          <div className="overflow-hidden rounded-[2rem] border border-red-100 bg-white p-8 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m0 3.75h.008M10.29 3.86l-8.01 13.89A1.5 1.5 0 003.58 20h16.84a1.5 1.5 0 001.299-2.25L13.71 3.86a1.5 1.5 0 00-2.598 0z"
                />
              </svg>
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-red-500">
              Schedule
            </p>

            <h1 className="mt-2 text-2xl font-extrabold text-[#2C1E16] sm:text-3xl">
              Jadwal tidak dapat dimuat
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => router.back()}
              className="mt-7 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1E3F20] px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-lg"
            >
              Kembali
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-[#2C1E16]">
      <Navbar />

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-[#EAE4DB] bg-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#E5EEE4] blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-20 h-72 w-72 rounded-full bg-[#EEE4D8] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12 lg:px-8">
          <Reveal delay={0}>
            <button
              type="button"
              onClick={() => router.back()}
              className="group mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-500 transition-colors duration-300 hover:text-[#1E3F20]"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">
                ←
              </span>
              Kembali ke profil mentor
            </button>
          </Reveal>

          <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <Reveal delay={100}>
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#DCE8DA] bg-[#F1F6EF] px-3.5 py-2 text-xs font-bold text-[#1E3F20] shadow-sm">
                  <SparkleIcon className="h-4 w-4" />
                  Jadwalkan Coffee Chat
                </div>

                <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-[#2C1E16] sm:text-5xl">
                  Atur waktu yang
                  <span className="block text-[#1E3F20]">
                    paling nyaman untukmu.
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-[#6B6259] sm:text-base">
                  Pilih tanggal, tentukan waktu konsultasi, lalu ceritakan
                  kebutuhanmu kepada mentor sebelum sesi dimulai.
                </p>
              </div>
            </Reveal>

            <Reveal delay={220}>
              <div className="rounded-[2rem] border border-[#E8E1D7] bg-[#FCFBF8] p-5 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF2EA] text-[#1E3F20]">
                    <CalendarIcon />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                      Ketersediaan
                    </p>

                    <p className="mt-1 text-lg font-extrabold text-[#2C1E16]">
                      {availableTotal} slot tersedia
                    </p>
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E7E2DA]">
                  <div
                    className="h-full rounded-full bg-[#1E3F20] transition-all duration-1000 ease-out"
                    style={{
                      width:
                        availableTotal > 0
                          ? `${Math.min(
                              100,
                              Math.max(14, availableTotal * 8),
                            )}%`
                          : "8%",
                    }}
                  />
                </div>

                <p className="mt-3 text-xs leading-5 text-gray-500">
                  Jadwal diperbarui dari ketersediaan mentor secara langsung.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12 lg:px-8">
        {/* ===================================================
            ERROR
        ==================================================== */}

        {error && (
          <Reveal delay={0} className="mb-7">
            <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700">
              <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white text-red-600 shadow-sm">
                !
              </div>

              <div>
                <p className="font-bold">Ada kendala</p>

                <p className="mt-0.5 leading-6">{error}</p>
              </div>
            </div>
          </Reveal>
        )}

        {/* ===================================================
            STEPS
        ==================================================== */}

        <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Reveal delay={0}>
            <div className="group h-full rounded-2xl border border-[#DCE7DA] bg-[#F2F7F0] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E3F20] text-sm font-extrabold text-white shadow-sm">
                  1
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1E3F20]/60">
                    Langkah pertama
                  </p>

                  <p className="text-sm font-extrabold text-[#2C1E16]">
                    Pilih tanggal & waktu
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="group h-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3EEE7] text-sm font-extrabold text-[#8A6A47]">
                  2
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                    Langkah kedua
                  </p>

                  <p className="text-sm font-extrabold text-[#2C1E16]">
                    Ceritakan kebutuhanmu
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <div className="group h-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3EEE7] text-sm font-extrabold text-[#8A6A47]">
                  3
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                    Langkah ketiga
                  </p>

                  <p className="text-sm font-extrabold text-[#2C1E16]">
                    Ajukan booking
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ===================================================
            MAIN GRID
        ==================================================== */}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* =================================================
              LEFT
          ================================================== */}

          <section className="space-y-7">
            {/* =================================================
                MENTOR
            ================================================== */}

            <Reveal delay={80}>
              <div className="group overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:shadow-lg">
                <div className="relative overflow-hidden bg-[#1E3F20] px-5 py-5 sm:px-6 sm:py-6">
                  <div className="pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

                  <div className="relative flex items-center gap-4">
                    <div className="h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-2xl border-2 border-white/30 bg-[#EAF2EA]">
                      {mentor?.profile?.profile_photo ? (
                        <img
                          src={mentor.profile.profile_photo}
                          alt={mentor.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-extrabold text-[#1E3F20]">
                          {mentor?.name?.charAt(0).toUpperCase() || "M"}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
                        Kamu akan bertemu dengan
                      </p>

                      <h2 className="mt-1 truncate text-lg font-extrabold text-white sm:text-xl">
                        {mentor?.name}
                      </h2>

                      <p className="mt-1 text-sm font-semibold text-white/80">
                        {mentor?.profile?.job_title || "Professional Mentor"}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-white/60">
                        {mentor?.profile?.company || "Career Cafe Mentor"}
                      </p>
                    </div>

                    <div className="hidden rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-center backdrop-blur-sm sm:block">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-white/60">
                        Rating
                      </div>

                      <div className="mt-1 flex items-center gap-1 text-sm font-extrabold text-white">
                        <span className="text-amber-300">★</span>

                        {rating}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4 sm:p-6">
                  <div className="rounded-2xl bg-[#FCFBF8] p-3.5 transition-all duration-300 hover:-translate-y-0.5">
                    <div className="flex items-center gap-2 text-[#1E3F20]">
                      <SparkleIcon className="h-4 w-4" />

                      <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        Rating
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-extrabold">{rating}/5</p>
                  </div>

                  <div className="rounded-2xl bg-[#FCFBF8] p-3.5 transition-all duration-300 hover:-translate-y-0.5">
                    <div className="flex items-center gap-2 text-[#1E3F20]">
                      <UserIcon className="h-4 w-4" />

                      <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        Review
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-extrabold">
                      {mentor?.profile?.total_reviews ?? 0}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FCFBF8] p-3.5 transition-all duration-300 hover:-translate-y-0.5">
                    <div className="flex items-center gap-2 text-[#1E3F20]">
                      <ClockIcon className="h-4 w-4" />

                      <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        Pengalaman
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-extrabold">
                      {mentor?.profile?.experience_years ?? 0} tahun
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FCFBF8] p-3.5 transition-all duration-300 hover:-translate-y-0.5">
                    <div className="flex items-center gap-2 text-[#1E3F20]">
                      <LocationIcon className="h-4 w-4" />

                      <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        Lokasi
                      </span>
                    </div>

                    <p className="mt-2 truncate text-sm font-extrabold">
                      {mentor?.profile?.location || "Indonesia"}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* =================================================
                DATE PICKER
            ================================================== */}

            <Reveal delay={140}>
              <div className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm transition-all duration-500 hover:shadow-md sm:p-6">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#F3EEE7] px-3 py-1.5 text-[10px] font-bold text-[#8A6A47]">
                      LANGKAH 01
                    </div>

                    <h2 className="text-xl font-extrabold text-[#2C1E16]">
                      Pilih tanggal
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Pilih hari yang paling nyaman untuk sesi konsultasi.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-[#F8F5F0] px-3 py-2 text-xs font-semibold text-gray-500">
                    <CalendarIcon className="h-4 w-4 text-[#1E3F20]" />7 hari ke
                    depan
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                  {dates.map((date, index) => {
                    const active = selectedDate === date.iso;

                    const count = slots.filter(
                      (slot) =>
                        slot.date === date.iso && slot.status === "available",
                    ).length;

                    return (
                      <Reveal key={date.iso} delay={index * 120}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDate(date.iso);
                            setSelectedSlotId(null);
                            setBookingError("");
                          }}
                          className={[
                            "group relative w-full overflow-hidden rounded-2xl border p-3.5 text-left",
                            "transition-all duration-400",
                            "hover:-translate-y-1 hover:shadow-md",
                            "active:scale-[0.985]",
                            active
                              ? "border-[#1E3F20] bg-[#1E3F20] text-white shadow-lg"
                              : "border-gray-100 bg-[#FCFBF8] hover:border-[#BFCFBE] hover:bg-[#F7F9F5]",
                          ].join(" ")}
                        >
                          {index === 0 && (
                            <span
                              className={[
                                "absolute right-2 top-2 rounded-full px-2 py-1 text-[8px] font-extrabold uppercase tracking-wide",
                                active
                                  ? "bg-white/15 text-white"
                                  : "bg-[#EAF2EA] text-[#1E3F20]",
                              ].join(" ")}
                            >
                              Hari ini
                            </span>
                          )}

                          <p
                            className={[
                              "text-[11px] font-bold uppercase tracking-wide",
                              active ? "text-white/70" : "text-gray-400",
                            ].join(" ")}
                          >
                            {date.dayName}
                          </p>

                          <p className="mt-2 text-2xl font-extrabold leading-none">
                            {date.dayNumber}
                          </p>

                          <p
                            className={[
                              "mt-1 text-xs font-semibold",
                              active ? "text-white/75" : "text-gray-500",
                            ].join(" ")}
                          >
                            {date.monthName}
                          </p>

                          <div
                            className={[
                              "mt-4 rounded-xl px-2.5 py-2 text-[9px] font-bold transition-all duration-500",
                              active
                                ? "bg-white/10 text-white/80"
                                : count > 0
                                  ? "bg-[#EAF2EA] text-[#1E3F20]"
                                  : "bg-gray-100 text-gray-400",
                            ].join(" ")}
                          >
                            {count > 0 ? `${count} slot` : "Tidak tersedia"}
                          </div>

                          {active && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/25" />
                          )}
                        </button>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            {/* =================================================
                TIME SLOTS
            ================================================== */}

            <Reveal delay={180}>
              <div className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm transition-all duration-500 hover:shadow-md sm:p-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#F3EEE7] px-3 py-1.5 text-[10px] font-bold text-[#8A6A47]">
                      LANGKAH 02
                    </div>

                    <h2 className="text-xl font-extrabold text-[#2C1E16]">
                      Pilih waktu
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {selectedDate
                        ? formatDateLong(selectedDate)
                        : "Pilih tanggal terlebih dahulu"}
                    </p>
                  </div>

                  {selectedDateSlots.length > 0 && (
                    <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#EAF2EA] px-3 py-2 text-xs font-bold text-[#1E3F20]">
                      <span className="h-2 w-2 rounded-full bg-[#1E3F20]" />
                      {selectedDateSlots.length} slot tersedia
                    </div>
                  )}
                </div>

                {loadingSlots ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-24 animate-pulse rounded-2xl bg-gray-100"
                      />
                    ))}
                  </div>
                ) : selectedDateSlots.length === 0 ? (
                  <div className="rounded-[1.75rem] border border-dashed border-gray-200 bg-[#FCFBF8] p-10 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F3F0EA] text-gray-400">
                      <CalendarIcon className="h-7 w-7" />
                    </div>

                    <p className="mt-5 text-sm font-extrabold text-gray-700">
                      Belum ada slot tersedia
                    </p>

                    <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-gray-400">
                      Mentor belum membuka jadwal konsultasi pada tanggal ini.
                      Coba pilih tanggal lainnya.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {selectedDateSlots.map((slot, index) => {
                      const active = selectedSlotId === slot.id;

                      return (
                        <Reveal key={slot.id} delay={index * 120}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSlotId(slot.id);
                              setBookingError("");
                            }}
                            className={[
                              "group relative w-full rounded-2xl border px-4 py-4 text-left",
                              "transition-all duration-400",
                              "hover:-translate-y-1 hover:shadow-md",
                              "active:scale-[0.985]",
                              active
                                ? "border-[#1E3F20] bg-[#EAF2EA] shadow-md"
                                : "border-gray-100 bg-[#FCFBF8] hover:border-[#AFC1B0] hover:bg-[#F7F9F5]",
                            ].join(" ")}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={[
                                  "text-[10px] font-extrabold uppercase tracking-wide",
                                  active ? "text-[#1E3F20]" : "text-gray-400",
                                ].join(" ")}
                              >
                                Konsultasi
                              </span>

                              <span
                                className={[
                                  "h-2.5 w-2.5 rounded-full transition-all duration-500",
                                  active
                                    ? "bg-[#1E3F20] shadow-[0_0_0_4px_rgba(30,63,32,0.08)]"
                                    : "bg-emerald-500",
                                ].join(" ")}
                              />
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                              <ClockIcon
                                className={[
                                  "h-4 w-4 transition-colors duration-500",
                                  active ? "text-[#1E3F20]" : "text-gray-400",
                                ].join(" ")}
                              />

                              <p
                                className={[
                                  "text-base font-extrabold",
                                  active ? "text-[#1E3F20]" : "text-[#2C1E16]",
                                ].join(" ")}
                              >
                                {formatTime(slot.start_time)} –{" "}
                                {formatTime(slot.end_time)}
                              </p>
                            </div>

                            <p
                              className={[
                                "mt-2 text-[10px] font-semibold",
                                active ? "text-[#1E3F20]/70" : "text-gray-400",
                              ].join(" ")}
                            >
                              45 menit
                            </p>

                            {active && (
                              <div className="absolute bottom-0 left-4 right-4 h-1 rounded-full bg-[#1E3F20]" />
                            )}
                          </button>
                        </Reveal>
                      );
                    })}
                  </div>
                )}
              </div>
            </Reveal>

            {/* =================================================
                CONSULTATION FORM
            ================================================== */}

            <Reveal delay={220}>
              <div className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm transition-all duration-500 hover:shadow-md sm:p-6">
                <div className="mb-7">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#F3EEE7] px-3 py-1.5 text-[10px] font-bold text-[#8A6A47]">
                    LANGKAH 03
                  </div>

                  <h2 className="text-xl font-extrabold text-[#2C1E16]">
                    Detail konsultasi
                  </h2>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                    Berikan sedikit konteks agar mentor bisa datang ke sesi
                    dengan persiapan yang lebih baik.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* TOPIC */}

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <label
                        htmlFor="topic"
                        className="block text-sm font-bold text-[#2C1E16]"
                      >
                        Topik konsultasi
                      </label>

                      <span className="text-[10px] font-semibold text-gray-400">
                        Maks. 255 karakter
                      </span>
                    </div>

                    <input
                      id="topic"
                      type="text"
                      value={topic}
                      onChange={(event) => setTopic(event.target.value)}
                      placeholder="Contoh: Persiapan interview frontend developer"
                      maxLength={255}
                      className="w-full rounded-2xl border border-gray-200 bg-[#FCFBF8] px-4 py-4 text-sm text-[#2C1E16] outline-none transition-all duration-500 placeholder:text-gray-400 focus:border-[#1E3F20] focus:bg-white focus:ring-4 focus:ring-[#1E3F20]/10"
                    />
                  </div>

                  {/* MESSAGE */}

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <label
                        htmlFor="message"
                        className="block text-sm font-bold text-[#2C1E16]"
                      >
                        Pesan untuk mentor
                      </label>

                      <span className="rounded-full bg-[#F8F5F0] px-2.5 py-1 text-[10px] font-bold text-gray-400">
                        {message.length}/500
                      </span>
                    </div>

                    <textarea
                      id="message"
                      value={message}
                      onChange={(event) => {
                        setMessage(event.target.value.slice(0, 500));
                      }}
                      rows={6}
                      placeholder="Ceritakan apa yang sedang kamu hadapi atau apa yang ingin kamu tanyakan..."
                      className="w-full resize-none rounded-2xl border border-gray-200 bg-[#FCFBF8] px-4 py-4 text-sm leading-6 text-[#2C1E16] outline-none transition-all duration-500 placeholder:text-gray-400 focus:border-[#1E3F20] focus:bg-white focus:ring-4 focus:ring-[#1E3F20]/10"
                    />
                  </div>

                  {/* MEETING TYPE */}

                  <div>
                    <div className="mb-3">
                      <p className="text-sm font-bold text-[#2C1E16]">
                        Format pertemuan
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Pilih cara kamu ingin bertemu dengan mentor.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {/* ONLINE */}

                      <button
                        type="button"
                        onClick={() => {
                          setMeetingType("online");
                          setMeetingLocation("");
                        }}
                        className={[
                          "group rounded-2xl border p-4 text-left",
                          "transition-all duration-500",
                          "hover:-translate-y-1 hover:shadow-md",
                          "active:scale-[0.99]",
                          meetingType === "online"
                            ? "border-[#1E3F20] bg-[#EAF2EA] shadow-sm"
                            : "border-gray-100 bg-[#FCFBF8] hover:border-[#BFCFBE]",
                        ].join(" ")}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={[
                              "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-500",
                              meetingType === "online"
                                ? "bg-[#1E3F20] text-white"
                                : "bg-white text-gray-500 shadow-sm",
                            ].join(" ")}
                          >
                            <VideoIcon />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-extrabold">Online</p>

                              {meetingType === "online" && (
                                <span className="rounded-full bg-white px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-[#1E3F20]">
                                  Dipilih
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs leading-5 text-gray-500">
                              Google Meet atau video call.
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* OFFLINE */}

                      <button
                        type="button"
                        onClick={() => setMeetingType("offline")}
                        className={[
                          "group rounded-2xl border p-4 text-left",
                          "transition-all duration-500",
                          "hover:-translate-y-1 hover:shadow-md",
                          "active:scale-[0.99]",
                          meetingType === "offline"
                            ? "border-[#1E3F20] bg-[#EAF2EA] shadow-sm"
                            : "border-gray-100 bg-[#FCFBF8] hover:border-[#BFCFBE]",
                        ].join(" ")}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={[
                              "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-500",
                              meetingType === "offline"
                                ? "bg-[#1E3F20] text-white"
                                : "bg-white text-gray-500 shadow-sm",
                            ].join(" ")}
                          >
                            <LocationIcon />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-extrabold">Offline</p>

                              {meetingType === "offline" && (
                                <span className="rounded-full bg-white px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-[#1E3F20]">
                                  Dipilih
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs leading-5 text-gray-500">
                              Bertemu langsung di lokasi yang disepakati.
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* LOCATION */}

                  {meetingType === "offline" && (
                    <Reveal delay={0}>
                      <div className="rounded-2xl border border-[#DCE7DA] bg-[#F5F8F3] p-4">
                        <label
                          htmlFor="location"
                          className="mb-2 block text-sm font-bold text-[#2C1E16]"
                        >
                          Lokasi pertemuan
                        </label>

                        <input
                          id="location"
                          type="text"
                          value={meetingLocation}
                          onChange={(event) =>
                            setMeetingLocation(event.target.value)
                          }
                          placeholder="Contoh: Career Cafe Denpasar"
                          maxLength={255}
                          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-[#2C1E16] outline-none transition-all duration-500 placeholder:text-gray-400 focus:border-[#1E3F20] focus:ring-4 focus:ring-[#1E3F20]/10"
                        />
                      </div>
                    </Reveal>
                  )}

                  {/* ERROR */}

                  {bookingError && (
                    <Reveal delay={0}>
                      <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white font-extrabold text-red-600 shadow-sm">
                          !
                        </div>

                        <div>
                          <p className="font-bold">
                            Periksa kembali data booking
                          </p>

                          <p className="mt-0.5 leading-6">{bookingError}</p>
                        </div>
                      </div>
                    </Reveal>
                  )}

                  {/* SUBMIT */}

                  <button
                    type="button"
                    onClick={handleBooking}
                    disabled={bookingLoading}
                    className="group relative flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#1E3F20] px-6 py-4 text-sm font-extrabold text-white shadow-lg transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-700 group-hover:translate-x-full" />

                    {bookingLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Memproses booking...
                      </>
                    ) : (
                      <>
                        Ajukan Booking Sesi
                        <ArrowRightIcon className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] leading-5 text-gray-400">
                    Setelah diajukan, booking akan masuk ke status pending dan
                    menunggu konfirmasi mentor.
                  </p>
                </div>
              </div>
            </Reveal>
          </section>

          {/* =================================================
              RIGHT
              NON STICKY
          ================================================== */}

          <aside className="h-fit">
            <Reveal delay={200}>
              <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:shadow-lg">
                <div className="relative overflow-hidden bg-[#1E3F20] p-6 text-white">
                  <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

                  <div className="relative">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
                      Ringkasan Booking
                    </p>

                    <h3 className="mt-3 text-xl font-extrabold">
                      {mentor?.name || "Mentor"}
                    </h3>

                    <p className="mt-1 text-sm text-white/70">
                      {mentor?.profile?.job_title || "Professional Mentor"}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="space-y-3">
                    {/* DATE */}

                    <div
                      className={[
                        "rounded-2xl border p-4 transition-all duration-700",
                        selectedDate
                          ? "border-[#DCE7DA] bg-[#F5F8F3]"
                          : "border-gray-100 bg-[#FCFBF8]",
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#EAF2EA] text-[#1E3F20]">
                          <CalendarIcon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                            Tanggal
                          </p>

                          <p className="mt-1 text-sm font-extrabold text-[#2C1E16]">
                            {selectedDate
                              ? formatDateLong(selectedDate)
                              : "Belum dipilih"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* TIME */}

                    <div
                      className={[
                        "rounded-2xl border p-4 transition-all duration-700",
                        selectedSlot
                          ? "border-[#DCE7DA] bg-[#F5F8F3]"
                          : "border-gray-100 bg-[#FCFBF8]",
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#EAF2EA] text-[#1E3F20]">
                          <ClockIcon className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                            Waktu
                          </p>

                          <p className="mt-1 text-sm font-extrabold text-[#2C1E16]">
                            {selectedSlot
                              ? `${formatTime(
                                  selectedSlot.start_time,
                                )} – ${formatTime(selectedSlot.end_time)}`
                              : "Belum dipilih"}
                          </p>

                          {selectedSlot && (
                            <p className="mt-1 text-[10px] font-semibold text-[#1E3F20]">
                              45 menit
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* DURATION */}

                    <div className="rounded-2xl border border-gray-100 bg-[#FCFBF8] p-4 transition-all duration-500 hover:-translate-y-0.5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#F3EEE7] text-[#8A6A47]">
                          <ClockIcon className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                            Durasi
                          </p>

                          <p className="mt-1 text-sm font-extrabold text-[#2C1E16]">
                            45 menit
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* MEETING */}

                    <div className="rounded-2xl border border-gray-100 bg-[#FCFBF8] p-4 transition-all duration-500 hover:-translate-y-0.5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#F3EEE7] text-[#8A6A47]">
                          {meetingType === "online" ? (
                            <VideoIcon className="h-4 w-4" />
                          ) : (
                            <LocationIcon className="h-4 w-4" />
                          )}
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                            Pertemuan
                          </p>

                          <p className="mt-1 text-sm font-extrabold capitalize text-[#2C1E16]">
                            {meetingType}
                          </p>

                          {meetingType === "offline" && meetingLocation && (
                            <p className="mt-1 line-clamp-2 text-[10px] font-semibold leading-4 text-gray-500">
                              {meetingLocation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STATUS */}

                  <div className="mt-6 rounded-2xl border border-[#E8E1D7] bg-[#FBF9F5] p-4 transition-all duration-700">
                    <div className="flex items-start gap-3">
                      <div
                        className={[
                          "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-700",
                          selectedSlot
                            ? "bg-[#1E3F20] text-white"
                            : "bg-[#E8E2D8] text-gray-400",
                        ].join(" ")}
                      >
                        {selectedSlot ? (
                          <CheckIcon className="h-4 w-4" />
                        ) : (
                          <CalendarIcon className="h-4 w-4" />
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-bold text-[#2C1E16]">
                          {selectedSlot
                            ? "Waktu sudah dipilih"
                            : "Pilih waktu terlebih dahulu"}
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-gray-500">
                          {selectedSlot
                            ? "Lanjutkan dengan mengisi detail konsultasi di bawah."
                            : "Pilih salah satu slot tersedia agar booking dapat diajukan."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* INFO */}

                  <div className="mt-6 border-t border-gray-100 pt-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[#EAF2EA] text-[#1E3F20]">
                        <CheckIcon className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-[#2C1E16]">
                          Booking akan masuk ke mentor
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-gray-500">
                          Setelah diajukan, status sesi menjadi{" "}
                          <span className="font-bold text-[#2C1E16]">
                            pending
                          </span>{" "}
                          sampai mentor melakukan konfirmasi.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </aside>
        </div>
      </main>

      <Footer />

      {/* =====================================================
          SUCCESS MODAL
      ====================================================== */}

      {successModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm"
          onClick={closeSuccessModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-success-title"
            aria-describedby="booking-success-description"
            className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative px-6 pb-7 pt-9 text-center sm:px-8">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-[#1E3F20]" />

              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#EAF2EA]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1E3F20] text-white shadow-xl">
                  <CheckIcon className="h-8 w-8" />
                </div>
              </div>

              <div className="mt-6">
                <span className="inline-flex items-center rounded-full bg-[#EAF2EA] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1E3F20]">
                  Booking berhasil
                </span>

                <h2
                  id="booking-success-title"
                  className="mt-3 text-2xl font-extrabold tracking-tight text-[#2C1E16]"
                >
                  Permintaan berhasil diajukan!
                </h2>

                <p
                  id="booking-success-description"
                  className="mt-2 text-sm leading-6 text-gray-500"
                >
                  Booking kamu sudah diterima oleh sistem dan sekarang menunggu
                  konfirmasi dari mentor.
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-gray-100 bg-[#FCFBF8] p-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#EAF2EA] text-[#1E3F20]">
                    <UserIcon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      Mentor
                    </p>

                    <p className="mt-0.5 truncate text-sm font-extrabold text-[#2C1E16]">
                      {successModal.mentorName}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-white p-3.5">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-[#1E3F20]" />

                      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        Tanggal
                      </p>
                    </div>

                    <p className="mt-2 text-xs font-extrabold leading-5 text-[#2C1E16]">
                      {formatDateLong(successModal.date)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-white p-3.5">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-[#1E3F20]" />

                      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        Waktu
                      </p>
                    </div>

                    <p className="mt-2 text-xs font-extrabold leading-5 text-[#2C1E16]">
                      {formatTime(successModal.startTime)} –{" "}
                      {formatTime(successModal.endTime)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={closeSuccessModal}
                  className="flex-1 cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition-all duration-500 hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-sm active:scale-[0.98]"
                >
                  Tetap di Halaman
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/mentors")}
                  className="group flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1E3F20] px-4 py-3 text-sm font-bold text-white transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-lg active:scale-[0.98]"
                >
                  Lihat Mentor
                  <ArrowRightIcon className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PAGE WRAPPER
========================================================= */

export default function SchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FCFBF8]">
          <Navbar />

          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="mx-auto h-10 w-52 animate-pulse rounded-xl bg-gray-200" />

            <div className="mx-auto mt-4 h-4 w-96 max-w-full animate-pulse rounded-lg bg-gray-200" />
          </div>

          <Footer />
        </div>
      }
    >
      <SchedulePageContent />
    </Suspense>
  );
}
