// GANTI SELURUH ISI:
// frontend/app/mentors/page.tsx

"use client";

import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

export default function MentorsPage() {
  const router = useRouter();

  // Data daftar mentor profesional
  const mentors = [
    {
      id: 1,
      name: "Rian Pratama, S.Kom.",
      role: "Senior Fullstack Engineer",
      company: "TechBali Denpasar",
      rating: "4.9",
      reviews: 120,
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      expertise: ["Laravel", "Next.js", "PostgreSQL"],
    },
    {
      id: 2,
      name: "Putu Ayu Lestari",
      role: "Lead UI/UX Designer",
      company: "KriyaBali Digital",
      rating: "5.0",
      reviews: 95,
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
      expertise: ["Figma", "User Research", "Design Systems"],
    },
    {
      id: 3,
      name: "Gede Hendra Kusuma",
      role: "Product Manager & Mentor",
      company: "Career Cafe Corp",
      rating: "4.8",
      reviews: 110,
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
      expertise: ["Product Strategy", "Agile", "Business Canvas"],
    },
    {
      id: 4,
      name: "Komang Sinta Dewi",
      role: "Digital Marketing Specialist",
      company: "Bali Creative Hub",
      rating: "4.9",
      reviews: 88,
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
      expertise: ["Social Media", "SEO", "Content Marketing"],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
      {/* SHARED NAVBAR */}
      <Navbar />

      {/* KONTEN UTAMA */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h1 className="mb-3 text-3xl font-extrabold text-[#2C1E16] sm:text-4xl">
            Temukan Mentor Profesionalmu
          </h1>

          <p className="text-sm text-gray-600 sm:text-base">
            Pilih mentor berpengalaman di bidangnya untuk mendiskusikan
            portofolio, persiapan wawancara, dan pengembangan karier.
          </p>
        </div>

        {/* GRID DAFTAR MENTOR */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {mentors.map((mentor) => (
            <div
              key={mentor.id}
              className="flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <div
                  className="relative h-52 bg-gray-200 bg-cover bg-center"
                  style={{ backgroundImage: `url('${mentor.image}')` }}
                >
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-[#2C1E16] shadow-sm backdrop-blur-md">
                    <span>★</span>

                    {mentor.rating}

                    <span className="font-normal text-gray-400">
                      ({mentor.reviews})
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="mb-0.5 text-lg font-bold text-[#2C1E16]">
                    {mentor.name}
                  </h3>

                  <p className="mb-1 text-xs font-semibold text-[#1E3F20]">
                    {mentor.role}
                  </p>

                  <p className="mb-4 text-xs text-gray-500">{mentor.company}</p>

                  <div className="mb-5 flex flex-wrap gap-1.5">
                    {mentor.expertise.map((skill, index) => (
                      <span
                        key={`${mentor.id}-${skill}-${index}`}
                        className="rounded-lg bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => router.push(`/mentors/${mentor.id}`)}
                  className="w-full rounded-xl bg-[#1E3F20] py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#152e17] hover:-translate-y-0.5"
                >
                  Lihat Profil & Jadwal
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
