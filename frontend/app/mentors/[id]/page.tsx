"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

type Skill = {
  id: number;
  name: string;
};

type Industry = {
  id: number;
  name: string;
  description?: string | null;
};

type MentorProfile = {
  id: number;
  user_id: number;
  industry_id: number | null;
  profile_photo: string | null;
  bio: string | null;
  location: string | null;
  job_title: string | null;
  company: string | null;
  experience_years: number | null;
  education: string | null;
  linkedin_url: string | null;
  timezone: string | null;
  avg_rating: string | number;
  total_reviews: number;
  industry: Industry | null;
};

type Mentee = {
  id: number;
  name: string;
};

type Feedback = {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string | null;
  mentee: Mentee | null;
};

type Availability = {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

type Mentor = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  completed_sessions_count: number;
  profile: MentorProfile | null;
  skills: Skill[];
  availabilities: Availability[];
  mentor_feedbacks: Feedback[];
};

type ApiResponse = {
  success: boolean;
  message: string;
  data: Mentor;
};

const dayNames: Record<number, string> = {
  0: "Minggu",
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
};

function formatTime(time: string) {
  if (!time) return "-";

  return time.slice(0, 5);
}

function formatDate(date: string | null) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function MentorDetailPage() {
  const router = useRouter();
  const params = useParams();

  const mentorId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? (params.id[0] ?? "")
        : "";

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!mentorId) return;

    const fetchMentor = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://127.0.0.1:8000/api/mentors/${mentorId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          },
        );

        const result: ApiResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil detail mentor.");
        }

        setMentor(result.data);
      } catch (err) {
        console.error("Gagal mengambil detail mentor:", err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Terjadi kesalahan saat mengambil detail mentor.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMentor();
  }, [mentorId]);

  const handleBooking = () => {
    if (!mentor) return;

    router.push(`/schedule?mentor_id=${mentor.id}`);
  };

  /* -------------------------------------------------------------------------- */
  /* LOADING                                                                    */
  /* -------------------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
        <Navbar />

        <main className="max-w-6xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
          <button
            onClick={() => router.back()}
            className="text-sm font-bold text-gray-500 hover:text-[#1E3F20] transition-colors mb-8"
          >
            ← Kembali
          </button>

          <div className="grid lg:grid-cols-12 gap-8 animate-pulse">
            <div className="lg:col-span-5">
              <div className="h-[520px] bg-gray-200 rounded-3xl" />
            </div>

            <div className="lg:col-span-7 space-y-5">
              <div className="h-5 bg-gray-200 rounded w-32" />
              <div className="h-12 bg-gray-200 rounded w-4/5" />
              <div className="h-5 bg-gray-200 rounded w-2/5" />
              <div className="h-5 bg-gray-200 rounded w-1/3" />

              <div className="h-32 bg-gray-200 rounded-2xl mt-8" />
              <div className="h-40 bg-gray-200 rounded-2xl" />
              <div className="h-14 bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* ERROR                                                                      */
  /* -------------------------------------------------------------------------- */

  if (error || !mentor) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
        <Navbar />

        <main className="max-w-4xl mx-auto px-6 sm:px-8 py-16">
          <button
            onClick={() => router.back()}
            className="text-sm font-bold text-gray-500 hover:text-[#1E3F20] transition-colors mb-8"
          >
            ← Kembali
          </button>

          <div className="bg-white border border-red-200 rounded-3xl p-10 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center text-2xl font-bold">
              !
            </div>

            <h1 className="text-2xl font-extrabold mt-5">
              Mentor tidak ditemukan
            </h1>

            <p className="text-sm text-gray-500 mt-2 max-w-lg mx-auto">
              {error || "Data mentor tidak tersedia."}
            </p>

            <button
              onClick={() => router.push("/mentors")}
              className="mt-6 bg-[#1E3F20] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#152e17] transition-colors"
            >
              Kembali ke Daftar Mentor
            </button>
          </div>
        </main>
      </div>
    );
  }

  const profile = mentor.profile;

  const rating = Number(profile?.avg_rating || 0);
  const reviews = Number(profile?.total_reviews || 0);

  const image =
    profile?.profile_photo ||
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85";

  const availability =
    mentor.availabilities?.filter((item) => item.is_active) || [];

  const feedbacks = mentor.mentor_feedbacks || [];

  return (
    <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
      <Navbar />

      {/* ---------------------------------------------------------------------- */}
      {/* HERO                                                                   */}
      {/* ---------------------------------------------------------------------- */}

      <section className="bg-[#F4EFE8] border-b border-[#E9E1D7]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10 sm:py-14">
          <button
            onClick={() => router.back()}
            className="text-sm font-bold text-gray-500 hover:text-[#1E3F20] transition-colors mb-8"
          >
            ← Kembali ke Mentor
          </button>

          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* FOTO */}
            <div className="lg:col-span-5">
              <div className="relative h-[420px] sm:h-[500px] lg:h-full min-h-[500px] overflow-hidden rounded-3xl bg-[#E8DED3] shadow-lg">
                <img
                  src={image}
                  alt={mentor.name}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="absolute left-5 bottom-5">
                  <span className="inline-flex items-center rounded-full bg-white/95 backdrop-blur-sm px-4 py-2 text-xs font-bold text-[#1E3F20]">
                    {profile?.industry?.name || "Professional"}
                  </span>
                </div>
              </div>
            </div>

            {/* INFORMASI */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-7 sm:p-9 shadow-sm border border-white">
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="inline-flex items-center rounded-full bg-[#1E3F20]/10 px-3 py-1.5 text-[11px] font-bold text-[#1E3F20]">
                  Mentor Aktif
                </span>

                {profile?.location && (
                  <span className="inline-flex items-center rounded-full bg-[#F4EFE8] px-3 py-1.5 text-[11px] font-bold text-gray-600">
                    {profile.location}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
                {mentor.name}
              </h1>

              <p className="text-base sm:text-lg font-bold text-[#1E3F20] mt-3">
                {profile?.job_title || "Mentor Career"}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {profile?.company || "Career Cafe"}
              </p>

              {/* RATING */}
              <div className="flex flex-wrap items-center gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <span className="text-xl text-amber-500">★</span>

                  <span className="text-lg font-extrabold">
                    {rating.toFixed(1)}
                  </span>

                  <span className="text-sm text-gray-400">
                    ({reviews} review)
                  </span>
                </div>

                <div className="w-px h-5 bg-gray-200" />

                <div className="text-sm text-gray-500">
                  <span className="font-bold text-[#2C1E16]">
                    {mentor.completed_sessions_count}
                  </span>{" "}
                  sesi selesai
                </div>
              </div>

              {/* QUICK INFO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
                <div className="bg-[#FAF7F2] rounded-2xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Pengalaman
                  </p>

                  <p className="text-sm font-extrabold mt-1">
                    {profile?.experience_years ?? 0} tahun
                  </p>
                </div>

                <div className="bg-[#FAF7F2] rounded-2xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Pendidikan
                  </p>

                  <p className="text-sm font-extrabold mt-1">
                    {profile?.education || "-"}
                  </p>
                </div>

                <div className="bg-[#FAF7F2] rounded-2xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Sesi
                  </p>

                  <p className="text-sm font-extrabold mt-1">Coffee Chat</p>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                  <div>
                    <p className="text-xs text-gray-400">Biaya konsultasi</p>

                    <p className="text-lg font-extrabold text-[#1E3F20]">
                      Gratis
                    </p>
                  </div>

                  <button
                    onClick={handleBooking}
                    className="w-full sm:w-auto bg-[#1E3F20] text-white px-7 py-3.5 rounded-xl text-sm font-bold hover:bg-[#152e17] hover:scale-[1.01] transition-all shadow-md"
                  >
                    Jadwalkan Sesi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* MAIN CONTENT                                                           */}
      {/* ---------------------------------------------------------------------- */}

      <main className="max-w-6xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-8">
            {/* ABOUT */}
            <section className="bg-white border border-gray-100 rounded-3xl p-7 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#1E3F20]/10 text-[#1E3F20] flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-3-9.75h6M12 7.5v5.25l3 1.75"
                    />
                  </svg>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold">
                  Tentang Mentor
                </h2>
              </div>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {profile?.bio ||
                  "Mentor profesional yang siap membantu perjalanan kariermu."}
              </p>
            </section>

            {/* SKILLS */}
            <section className="bg-white border border-gray-100 rounded-3xl p-7 sm:p-8 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-extrabold mb-5">
                Keahlian & Topik
              </h2>

              {mentor.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {mentor.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="bg-[#F4EFE8] text-[#1E3F20] px-4 py-2.5 rounded-xl text-xs font-bold"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  Belum ada keahlian yang ditambahkan.
                </p>
              )}
            </section>

            {/* AVAILABILITY */}
            <section className="bg-white border border-gray-100 rounded-3xl p-7 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold">
                    Jadwal Tersedia
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Waktu yang tersedia untuk konsultasi.
                  </p>
                </div>
              </div>

              {availability.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {availability.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-100 bg-[#FAF7F2] rounded-2xl p-4"
                    >
                      <p className="text-sm font-extrabold text-[#2C1E16]">
                        {dayNames[item.day_of_week] || "Hari"}
                      </p>

                      <p className="text-sm font-semibold text-[#1E3F20] mt-1">
                        {formatTime(item.start_time)} -{" "}
                        {formatTime(item.end_time)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-[#FAF7F2] p-5">
                  <p className="text-sm text-gray-500">
                    Jadwal mentor belum tersedia.
                  </p>
                </div>
              )}
            </section>

            {/* FEEDBACK */}
            <section className="bg-white border border-gray-100 rounded-3xl p-7 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold">
                    Ulasan Mentor
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Pengalaman dari mentee yang pernah berkonsultasi.
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xl font-extrabold">
                    {rating.toFixed(1)}
                  </div>

                  <div className="text-xs text-amber-500">★★★★★</div>
                </div>
              </div>

              {feedbacks.length > 0 ? (
                <div className="space-y-4">
                  {feedbacks.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="border-t border-gray-100 pt-5 first:border-t-0 first:pt-0"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#1E3F20] text-white flex items-center justify-center text-xs font-extrabold">
                            {feedback.mentee?.name?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </div>

                          <div>
                            <p className="text-sm font-extrabold">
                              {feedback.mentee?.name || "Pengguna"}
                            </p>

                            {feedback.created_at && (
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                {formatDate(feedback.created_at)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-amber-500 font-bold whitespace-nowrap">
                          {"★".repeat(
                            Math.min(
                              5,
                              Math.max(0, Number(feedback.rating) || 0),
                            ),
                          )}
                        </div>
                      </div>

                      {feedback.comment && (
                        <p className="text-sm text-gray-600 leading-relaxed mt-4">
                          {feedback.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-[#FAF7F2] p-5 text-center">
                  <p className="text-sm text-gray-500">
                    Belum ada ulasan untuk mentor ini.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-5">
              {/* PROFILE SUMMARY */}
              <div className="bg-[#1E3F20] text-white rounded-3xl p-7 shadow-lg">
                <span className="text-[11px] uppercase tracking-wider font-bold text-white/60">
                  Mentor Career Cafe
                </span>

                <h3 className="text-2xl font-extrabold mt-3 leading-tight">
                  Siap mulai konsultasi?
                </h3>

                <p className="text-sm text-white/70 leading-relaxed mt-3">
                  Pilih jadwal yang sesuai dan mulai diskusi langsung bersama
                  mentor.
                </p>

                <button
                  onClick={handleBooking}
                  className="w-full mt-6 bg-white text-[#1E3F20] py-3.5 rounded-xl text-sm font-bold hover:bg-[#F4EFE8] transition-colors"
                >
                  Jadwalkan Sesi
                </button>
              </div>

              {/* CONTACT */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <h3 className="font-extrabold text-lg mb-4">Informasi</h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Lokasi
                    </p>

                    <p className="text-sm font-semibold mt-1">
                      {profile?.location || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Industri
                    </p>

                    <p className="text-sm font-semibold mt-1">
                      {profile?.industry?.name || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Zona Waktu
                    </p>

                    <p className="text-sm font-semibold mt-1">
                      {profile?.timezone || "-"}
                    </p>
                  </div>

                  {profile?.linkedin_url && (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-[#1E3F20] hover:underline"
                    >
                      LinkedIn
                      <span>↗</span>
                    </a>
                  )}
                </div>
              </div>

              {/* NOTICE */}
              <div className="bg-[#F4EFE8] rounded-3xl p-6">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-[#1E3F20] flex items-center justify-center font-bold">
                    ☕
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold">Coffee Chat</h3>

                    <p className="text-xs text-gray-600 leading-relaxed mt-1">
                      Sesi konsultasi dirancang untuk berdiskusi santai mengenai
                      karier, skill, dan pengalaman profesional.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-[#FCFBF8]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-extrabold text-[#1E3F20] text-lg">
                Career Cafe
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Temukan arah kariermu bersama mentor.
              </p>
            </div>

            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} Career Cafe
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
