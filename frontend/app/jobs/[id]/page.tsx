"use client";

import { useParams, useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  skills: string[];
  description: string;
  salary: string;
};

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();

  const jobId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? (params.id[0] ?? "1")
        : "1";

  const jobs: Record<string, Job> = {
    "1": {
      id: 1,
      title: "Fullstack Developer",
      company: "TechBali",
      location: "Denpasar, Bali",
      type: "Full Time",
      skills: ["Laravel", "Next.js", "PostgreSQL"],
      description:
        "Mengembangkan aplikasi web menggunakan teknologi frontend dan backend modern. Posisi ini cocok untuk developer yang memiliki pengalaman dalam membangun aplikasi web dan memahami arsitektur backend serta frontend.",
      salary: "Rp 6jt - 9jt",
    },

    "2": {
      id: 2,
      title: "UI/UX Designer",
      company: "KriyaBali Digital",
      location: "Denpasar, Bali",
      type: "Full Time",
      skills: ["Figma", "UI Design", "UX Research"],
      description:
        "Merancang pengalaman pengguna dan antarmuka digital yang mudah digunakan, menarik, dan sesuai dengan kebutuhan pengguna.",
      salary: "Rp 5jt - 7jt",
    },

    "3": {
      id: 3,
      title: "Product Manager",
      company: "Career Cafe Corp",
      location: "Bali / Remote",
      type: "Hybrid",
      skills: ["Product Strategy", "Agile", "Business"],
      description:
        "Mengelola pengembangan produk digital dari tahap ide, riset pengguna, penyusunan strategi produk, hingga proses peluncuran.",
      salary: "Rp 8jt - 12jt",
    },
  };

  const job = jobs[jobId] ?? jobs["1"];

  const handleApply = () => {
    alert(
      `Lamaran untuk posisi ${job.title} di ${job.company} berhasil diajukan.`,
    );
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
      {/* NAVBAR */}
      <Navbar />

      {/* CONTENT */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* BACK BUTTON */}
        <button
          type="button"
          onClick={() => router.push("/jobs")}
          className="text-sm font-bold text-[#1E3F20] hover:underline mb-8 bg-transparent border-none cursor-pointer"
        >
          ← Kembali ke Lowongan
        </button>

        {/* DETAIL CARD */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <span className="inline-block text-xs font-bold bg-green-50 text-[#1E3F20] px-3 py-1 rounded-full mb-3">
                {job.type}
              </span>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2C1E16]">
                {job.title}
              </h1>

              <p className="text-[#1E3F20] font-semibold mt-2">{job.company}</p>

              <p className="text-sm text-gray-500 mt-1">{job.location}</p>
            </div>

            {/* SALARY */}
            <div className="bg-[#FCFBF8] rounded-2xl px-5 py-4 min-w-[180px]">
              <p className="text-xs text-gray-500 mb-1">Perkiraan Gaji</p>

              <p className="font-extrabold text-[#1E3F20]">{job.salary}</p>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-3">Tentang Posisi</h2>

            <p className="text-gray-600 text-sm leading-relaxed">
              {job.description}
            </p>
          </div>

          {/* SKILLS */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-3">Keahlian yang Dibutuhkan</h2>

            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-sm bg-gray-100 text-[#2C1E16] px-4 py-2 rounded-lg font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* APPLY */}
          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleApply}
              className="bg-[#1E3F20] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#152e17] transition-all cursor-pointer border-none"
            >
              Lamar Sekarang →
            </button>

            <button
              type="button"
              onClick={() => router.push("/jobs")}
              className="bg-white border border-gray-200 text-[#2C1E16] px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all cursor-pointer"
            >
              Lihat Lowongan Lain
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-extrabold text-[#1E3F20]">Career Cafe</p>

            <p className="text-sm text-gray-500 mt-1">
              Temukan peluang karier dan berkembang bersama mentor profesional.
            </p>
          </div>

          <p className="text-xs text-gray-400">
            © 2026 Career Cafe. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
