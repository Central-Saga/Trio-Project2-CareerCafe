"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";

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

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

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

        const response = await fetch(
          `http://127.0.0.1:8000/api/mentors/${mentorId}`,
          {
            signal: controller.signal,
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Data mentor gagal ditemukan.");
        }

        setMentor(data.data);
      } catch (err) {
        if ((err as Error).name === "AbortError") {
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
        `http://127.0.0.1:8000/api/mentors/${mentorId}/slots?from=${from}&to=${to}`,
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Jadwal mentor gagal dimuat.");
      }

      const fetchedSlots: Slot[] = Array.isArray(data.data) ? data.data : [];

      setSlots(fetchedSlots);

      const stillAvailable = fetchedSlots.some(
        (slot) => slot.id === selectedSlotId && slot.status === "available",
      );

      if (!stillAvailable) {
        setSelectedSlotId(null);
      }
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

  const selectedDateSlots = useMemo(() => {
    return slots.filter(
      (slot) => slot.date === selectedDate && slot.status === "available",
    );
  }, [slots, selectedDate]);

  const selectedSlot = useMemo(() => {
    return slots.find((slot) => slot.id === selectedSlotId) ?? null;
  }, [slots, selectedSlotId]);

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

      const response = await fetch("http://127.0.0.1:8000/api/sessions", {
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

  if (loadingMentor) {
    return (
      <div className="min-h-screen bg-[#FCFBF8]">
        <Navbar />

        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="animate-pulse">
            <div className="h-8 w-64 rounded-lg bg-gray-200 mb-3" />
            <div className="h-4 w-96 max-w-full rounded-lg bg-gray-200 mb-10" />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
              <div className="space-y-6">
                <div className="h-32 rounded-3xl bg-white border border-gray-100" />
                <div className="h-48 rounded-3xl bg-white border border-gray-100" />
                <div className="h-96 rounded-3xl bg-white border border-gray-100" />
              </div>

              <div className="h-96 rounded-3xl bg-white border border-gray-100" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error && !mentor) {
    return (
      <div className="min-h-screen bg-[#FCFBF8]">
        <Navbar />

        <main className="max-w-3xl mx-auto px-6 py-20">
          <div className="bg-white border border-red-100 rounded-3xl p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7"
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

            <h1 className="text-2xl font-extrabold text-[#2C1E16] mb-2">
              Jadwal tidak dapat dimuat
            </h1>

            <p className="text-sm text-gray-500 mb-6">{error}</p>

            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center rounded-xl bg-[#1E3F20] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#173119]"
            >
              Kembali
            </button>
          </div>
        </main>
      </div>
    );
  }

  const rating =
    mentor?.profile?.avg_rating !== null &&
    mentor?.profile?.avg_rating !== undefined
      ? Number(mentor.profile.avg_rating).toFixed(1)
      : "0.0";

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-[#2C1E16]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* HEADER */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#1E3F20] transition mb-5"
          >
            <span>←</span>
            Kembali ke profil mentor
          </button>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF2EA] px-3 py-1.5 text-xs font-bold text-[#1E3F20] mb-3">
                <span className="h-2 w-2 rounded-full bg-[#1E3F20]" />
                Jadwalkan Coffee Chat
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Pilih waktu konsultasi
              </h1>

              <p className="mt-2 max-w-2xl text-sm sm:text-base text-gray-500">
                Pilih jadwal yang sesuai, lalu ceritakan apa yang ingin kamu
                konsultasikan dengan mentor.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8">
          {/* LEFT */}
          <section className="space-y-6">
            {/* MENTOR CARD */}
            <div className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-2xl bg-[#EAF2EA] flex-shrink-0">
                  {mentor?.profile?.profile_photo ? (
                    <img
                      src={mentor.profile.profile_photo}
                      alt={mentor.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xl font-extrabold text-[#1E3F20]">
                      {mentor?.name?.charAt(0).toUpperCase() || "M"}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-extrabold truncate">
                    {mentor?.name}
                  </h2>

                  <p className="text-sm font-semibold text-[#1E3F20]">
                    {mentor?.profile?.job_title || "Professional Mentor"}
                  </p>

                  <p className="text-xs text-gray-500 mt-0.5">
                    {mentor?.profile?.company || "Career Cafe Mentor"}
                  </p>
                </div>

                <div className="ml-auto hidden sm:flex items-center gap-1.5 rounded-full bg-[#FFF8E6] px-3 py-1.5">
                  <span className="text-yellow-500 text-sm">★</span>
                  <span className="text-sm font-extrabold">{rating}</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl bg-[#FAF7F2] p-3">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    Rating
                  </p>
                  <p className="mt-1 text-sm font-extrabold">{rating}/5</p>
                </div>

                <div className="rounded-2xl bg-[#FAF7F2] p-3">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    Review
                  </p>
                  <p className="mt-1 text-sm font-extrabold">
                    {mentor?.profile?.total_reviews ?? 0}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAF7F2] p-3">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    Pengalaman
                  </p>
                  <p className="mt-1 text-sm font-extrabold">
                    {mentor?.profile?.experience_years ?? 0} tahun
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAF7F2] p-3">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    Lokasi
                  </p>
                  <p className="mt-1 text-sm font-extrabold truncate">
                    {mentor?.profile?.location || "Indonesia"}
                  </p>
                </div>
              </div>
            </div>

            {/* DATE PICKER */}
            <div className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-extrabold">1. Pilih tanggal</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Pilih salah satu hari yang tersedia.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {dates.map((date) => {
                  const active = selectedDate === date.iso;

                  const count = slots.filter(
                    (slot) =>
                      slot.date === date.iso && slot.status === "available",
                  ).length;

                  return (
                    <button
                      key={date.iso}
                      onClick={() => {
                        setSelectedDate(date.iso);
                        setSelectedSlotId(null);
                        setBookingError("");
                      }}
                      className={`rounded-2xl border p-3 text-left transition-all ${
                        active
                          ? "border-[#1E3F20] bg-[#1E3F20] text-white shadow-md"
                          : "border-gray-100 bg-[#FCFBF8] hover:border-[#AFC1B0] hover:bg-[#F5F7F2]"
                      }`}
                    >
                      <p
                        className={`text-xs font-semibold ${
                          active ? "text-white/80" : "text-gray-400"
                        }`}
                      >
                        {date.dayName}
                      </p>

                      <p className="mt-1 text-xl font-extrabold">
                        {date.dayNumber}
                      </p>

                      <p
                        className={`text-xs font-semibold ${
                          active ? "text-white/80" : "text-gray-500"
                        }`}
                      >
                        {date.monthName}
                      </p>

                      <p
                        className={`mt-3 text-[10px] font-bold ${
                          active
                            ? "text-white/80"
                            : count > 0
                              ? "text-[#1E3F20]"
                              : "text-gray-400"
                        }`}
                      >
                        {count > 0
                          ? `${count} slot tersedia`
                          : "Tidak tersedia"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TIME SLOTS */}
            <div className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-extrabold">2. Pilih waktu</h2>

                <p className="text-sm text-gray-500 mt-1">
                  {selectedDate
                    ? formatDateLong(selectedDate)
                    : "Pilih tanggal terlebih dahulu"}
                </p>
              </div>

              {loadingSlots ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-14 rounded-2xl bg-gray-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : selectedDateSlots.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FCFBF8] p-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.7}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>

                  <p className="text-sm font-bold text-gray-700">
                    Belum ada slot tersedia
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    Silakan pilih tanggal lainnya.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {selectedDateSlots.map((slot) => {
                    const active = selectedSlotId === slot.id;

                    return (
                      <button
                        key={slot.id}
                        onClick={() => {
                          setSelectedSlotId(slot.id);
                          setBookingError("");
                        }}
                        className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                          active
                            ? "border-[#1E3F20] bg-[#EAF2EA] shadow-sm"
                            : "border-gray-100 bg-[#FCFBF8] hover:border-[#AFC1B0] hover:bg-[#F7F9F5]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-xs font-semibold ${
                              active ? "text-[#1E3F20]" : "text-gray-400"
                            }`}
                          >
                            45 menit
                          </span>

                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              active ? "bg-[#1E3F20]" : "bg-green-500"
                            }`}
                          />
                        </div>

                        <p
                          className={`mt-2 text-base font-extrabold ${
                            active ? "text-[#1E3F20]" : "text-[#2C1E16]"
                          }`}
                        >
                          {formatTime(slot.start_time)} –{" "}
                          {formatTime(slot.end_time)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* FORM */}
            <div className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-extrabold">3. Detail konsultasi</h2>

                <p className="text-sm text-gray-500 mt-1">
                  Ceritakan kebutuhanmu supaya mentor bisa mempersiapkan sesi
                  dengan lebih baik.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="topic"
                    className="block text-sm font-bold mb-2"
                  >
                    Topik konsultasi
                  </label>

                  <input
                    id="topic"
                    type="text"
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    placeholder="Contoh: Persiapan interview frontend developer"
                    maxLength={255}
                    className="w-full rounded-2xl border border-gray-200 bg-[#FCFBF8] px-4 py-3.5 text-sm outline-none transition focus:border-[#1E3F20] focus:ring-4 focus:ring-[#1E3F20]/10"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <label
                      htmlFor="message"
                      className="block text-sm font-bold"
                    >
                      Pesan untuk mentor
                    </label>

                    <span className="text-[11px] font-semibold text-gray-400">
                      {message.length}/500
                    </span>
                  </div>

                  <textarea
                    id="message"
                    value={message}
                    onChange={(event) => {
                      setMessage(event.target.value.slice(0, 500));
                    }}
                    rows={5}
                    placeholder="Ceritakan apa yang sedang kamu hadapi atau apa yang ingin kamu tanyakan..."
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-[#FCFBF8] px-4 py-3.5 text-sm outline-none transition focus:border-[#1E3F20] focus:ring-4 focus:ring-[#1E3F20]/10"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold mb-2">Format pertemuan</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setMeetingType("online");
                        setMeetingLocation("");
                      }}
                      className={`rounded-2xl border p-4 text-left transition ${
                        meetingType === "online"
                          ? "border-[#1E3F20] bg-[#EAF2EA]"
                          : "border-gray-100 bg-[#FCFBF8] hover:border-[#AFC1B0]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            meetingType === "online"
                              ? "bg-[#1E3F20] text-white"
                              : "bg-white text-gray-500 border border-gray-100"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.7}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h6a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </div>

                        <div>
                          <p className="text-sm font-extrabold">Online</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Google Meet / video call
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMeetingType("offline")}
                      className={`rounded-2xl border p-4 text-left transition ${
                        meetingType === "offline"
                          ? "border-[#1E3F20] bg-[#EAF2EA]"
                          : "border-gray-100 bg-[#FCFBF8] hover:border-[#AFC1B0]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            meetingType === "offline"
                              ? "bg-[#1E3F20] text-white"
                              : "bg-white text-gray-500 border border-gray-100"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.7}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z"
                            />
                            <circle cx="12" cy="11" r="2.5" />
                          </svg>
                        </div>

                        <div>
                          <p className="text-sm font-extrabold">Offline</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Bertemu langsung
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {meetingType === "offline" && (
                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-bold mb-2"
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
                      className="w-full rounded-2xl border border-gray-200 bg-[#FCFBF8] px-4 py-3.5 text-sm outline-none transition focus:border-[#1E3F20] focus:ring-4 focus:ring-[#1E3F20]/10"
                    />
                  </div>
                )}

                {bookingError && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {bookingError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleBooking}
                  disabled={bookingLoading}
                  className="w-full rounded-2xl bg-[#1E3F20] px-6 py-4 text-sm font-extrabold text-white shadow-md transition hover:bg-[#173119] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {bookingLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Memproses booking...
                    </span>
                  ) : (
                    "Ajukan Booking Sesi"
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT / SUMMARY */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                Ringkasan Booking
              </p>

              <div className="mt-5">
                <h3 className="text-lg font-extrabold">
                  {mentor?.name || "Mentor"}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {mentor?.profile?.job_title || "Professional Mentor"}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl bg-[#FCFBF8] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                    Tanggal
                  </p>
                  <p className="mt-1 text-sm font-extrabold">
                    {selectedDate
                      ? formatDateLong(selectedDate)
                      : "Belum dipilih"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FCFBF8] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                    Waktu
                  </p>
                  <p className="mt-1 text-sm font-extrabold">
                    {selectedSlot
                      ? `${formatTime(selectedSlot.start_time)} – ${formatTime(selectedSlot.end_time)}`
                      : "Belum dipilih"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FCFBF8] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                    Durasi
                  </p>
                  <p className="mt-1 text-sm font-extrabold">45 menit</p>
                </div>

                <div className="rounded-2xl bg-[#FCFBF8] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                    Pertemuan
                  </p>
                  <p className="mt-1 text-sm font-extrabold capitalize">
                    {meetingType}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-[#EAF2EA] text-[#1E3F20]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M12 21a9 9 0 100-18 9 9 0 000 18z"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#2C1E16]">
                      Booking akan masuk ke mentor
                    </p>

                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Setelah diajukan, status sesi menjadi{" "}
                      <span className="font-bold">pending</span> sampai mentor
                      melakukan konfirmasi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* SUCCESS MODAL */}
      {successModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm"
          onClick={closeSuccessModal}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative px-6 pt-8 pb-6 text-center sm:px-8">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-[#1E3F20]" />

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#EAF2EA]">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1E3F20] text-white shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              <div className="mt-5">
                <span className="inline-flex items-center rounded-full bg-[#EAF2EA] px-3 py-1 text-[11px] font-extrabold text-[#1E3F20]">
                  BOOKING BERHASIL
                </span>

                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#2C1E16]">
                  Permintaan berhasil diajukan!
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Booking kamu sudah diterima oleh sistem dan sekarang menunggu
                  konfirmasi dari mentor.
                </p>
              </div>

              <div className="mt-6 rounded-2xl bg-[#FCFBF8] p-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2EA] text-[#1E3F20]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75a17.933 17.933 0 01-7.5-1.632z"
                      />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                      Mentor
                    </p>

                    <p className="mt-0.5 truncate text-sm font-extrabold text-[#2C1E16]">
                      {successModal.mentorName}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white p-3 border border-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      Tanggal
                    </p>

                    <p className="mt-1 text-xs font-extrabold text-[#2C1E16]">
                      {formatDateLong(successModal.date)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3 border border-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      Waktu
                    </p>

                    <p className="mt-1 text-xs font-extrabold text-[#2C1E16]">
                      {formatTime(successModal.startTime)} –{" "}
                      {formatTime(successModal.endTime)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={closeSuccessModal}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  Tetap di Halaman
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/mentors")}
                  className="flex-1 rounded-xl bg-[#1E3F20] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#173119]"
                >
                  Lihat Mentor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCFBF8]" />}>
      <SchedulePageContent />
    </Suspense>
  );
}
