"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

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

type Mentor = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  completed_sessions_count: number;
  profile: MentorProfile | null;
  skills: Skill[];
};

type ApiResponse = {
  success: boolean;
  message: string;
  data: Mentor[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export default function MentorsPage() {
  const router = useRouter();

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMentors = async (searchValue = "") => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (searchValue.trim()) {
        params.set("search", searchValue.trim());
      }

      params.set("per_page", "20");

      const response = await fetch(
        `http://127.0.0.1:8000/api/mentors?${params.toString()}`,
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
        throw new Error(result.message || "Gagal mengambil data mentor.");
      }

      setMentors(result.data || []);
    } catch (err) {
      console.error("Gagal mengambil mentor:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan saat mengambil data mentor.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchMentors(search);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
      <Navbar />

      {/* HERO */}
      <section className="bg-[#F4EFE8] border-b border-[#E9E1D7]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-14 sm:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-[#1E3F20]/10 px-4 py-2 text-xs font-bold text-[#1E3F20] mb-5">
              MENTOR CAREER CAFE
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-[#2C1E16]">
              Temukan Mentor
              <br />
              untuk Perjalanan Kariermu
            </h1>

            <p className="mt-5 text-sm sm:text-base lg:text-lg text-[#6B5A52] max-w-2xl leading-relaxed">
              Belajar langsung dari profesional berpengalaman, diskusikan
              tantangan kariermu, dan dapatkan perspektif yang lebih jelas untuk
              langkah berikutnya.
            </p>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
        {/* SEARCH */}
        <section className="mb-10">
          <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari mentor, keahlian, perusahaan, atau industri..."
                className="w-full rounded-xl bg-[#FAF7F2] border border-transparent px-5 py-4 pr-12 text-sm text-[#2C1E16] placeholder:text-gray-400 outline-none transition-all focus:border-[#1E3F20]/30 focus:ring-2 focus:ring-[#1E3F20]/10"
              />

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* TITLE */}
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                Mentor Pilihan
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                {loading
                  ? "Sedang mengambil data mentor..."
                  : `${mentors.length} mentor tersedia`}
              </p>
            </div>

            {!loading && search && (
              <button
                onClick={() => setSearch("")}
                className="self-start sm:self-auto text-sm font-bold text-[#1E3F20] hover:underline"
              >
                Hapus pencarian
              </button>
            )}
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                !
              </div>

              <div>
                <h3 className="font-bold text-red-700">
                  Gagal mengambil data mentor
                </h3>

                <p className="text-sm text-red-600 mt-1">{error}</p>

                <button
                  onClick={() => fetchMentors(search)}
                  className="mt-4 bg-[#1E3F20] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#152e17] transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm animate-pulse"
              >
                <div className="h-60 bg-gray-200" />

                <div className="p-5">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-5" />

                  <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-4/5 mb-5" />

                  <div className="flex gap-2 mb-5">
                    <div className="h-7 w-16 bg-gray-200 rounded-lg" />
                    <div className="h-7 w-20 bg-gray-200 rounded-lg" />
                  </div>

                  <div className="h-10 bg-gray-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && mentors.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#F4EFE8] flex items-center justify-center text-[#1E3F20]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.6}
                stroke="currentColor"
                className="w-7 h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>

            <h3 className="text-xl font-bold mt-5">Mentor tidak ditemukan</h3>

            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Coba gunakan kata pencarian lain seperti nama mentor, skill,
              perusahaan, atau industri.
            </p>
          </div>
        )}

        {/* MENTOR CARDS */}
        {!loading && !error && mentors.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mentors.map((mentor) => {
              const profile = mentor.profile;

              const rating = Number(profile?.avg_rating || 0);
              const reviews = Number(profile?.total_reviews || 0);

              const image =
                profile?.profile_photo ||
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80";

              const expertise = mentor.skills?.slice(0, 4) || [];

              return (
                <article
                  key={mentor.id}
                  className="group bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* IMAGE */}
                  <button
                    onClick={() => router.push(`/mentors/${mentor.id}`)}
                    className="block w-full text-left"
                    aria-label={`Lihat profil ${mentor.name}`}
                  >
                    <div className="relative h-60 overflow-hidden bg-[#F4EFE8]">
                      <img
                        src={image}
                        alt={mentor.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />

                      <div className="absolute left-4 bottom-4">
                        <span className="inline-flex items-center rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 text-[11px] font-bold text-[#1E3F20]">
                          {profile?.industry?.name || "Professional"}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* CONTENT */}
                  <div className="p-5">
                    <div className="min-h-[92px]">
                      <h3 className="font-extrabold text-lg leading-snug text-[#2C1E16]">
                        {mentor.name}
                      </h3>

                      <p className="text-xs font-semibold text-[#1E3F20] mt-1">
                        {profile?.job_title || "Mentor Career"}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {profile?.company || "Career Cafe"}
                      </p>
                    </div>

                    {/* RATING */}
                    <div className="flex items-center gap-1.5 mb-4">
                      <span className="text-amber-500 text-sm">★</span>

                      <span className="text-sm font-extrabold text-[#2C1E16]">
                        {rating.toFixed(1)}
                      </span>

                      <span className="text-xs text-gray-400">
                        ({reviews} review)
                      </span>
                    </div>

                    {/* DESCRIPTION */}
                    <p className="text-xs leading-relaxed text-gray-500 line-clamp-3 min-h-[54px]">
                      {profile?.bio ||
                        "Mentor profesional yang siap membantu perjalanan kariermu."}
                    </p>

                    {/* SKILLS */}
                    <div className="flex flex-wrap gap-2 mt-5 min-h-[62px] content-start">
                      {expertise.map((skill) => (
                        <span
                          key={skill.id}
                          className="text-[10px] font-bold bg-[#F4EFE8] text-[#1E3F20] px-2.5 py-1.5 rounded-lg"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>

                    {/* BUTTON */}
                    <button
                      onClick={() => router.push(`/mentors/${mentor.id}`)}
                      className="w-full mt-5 bg-[#1E3F20] text-white py-3 rounded-xl text-xs font-bold hover:bg-[#152e17] transition-all"
                    >
                      Lihat Profil Mentor
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* CTA */}
      <section className="bg-[#1E3F20] text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-14 sm:py-16">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-white/60">
              Career Cafe
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 leading-tight">
              Bingung menentukan langkah karier?
            </h2>

            <p className="text-sm sm:text-base text-white/75 mt-4 max-w-2xl leading-relaxed">
              Temukan mentor yang sesuai dengan bidang dan tujuanmu, lalu mulai
              sesi konsultasi untuk mendapatkan perspektif baru.
            </p>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="mt-7 bg-white text-[#1E3F20] px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#F4EFE8] transition-colors"
            >
              Cari Mentor
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#FCFBF8] border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
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
