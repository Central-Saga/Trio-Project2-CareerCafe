"use client";

import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

export default function JobsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
      {/* NAVBAR */}
      <Navbar />

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Peluang Karier
          </h1>

          <p className="text-gray-600 text-base sm:text-lg">
            Temukan lowongan pekerjaan dan peluang karier yang sesuai dengan
            keahlianmu.
          </p>
        </div>

        {/* JOB CARD */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
            {/* COMPANY ICON */}
            <div className="w-12 h-12 bg-[#1E3F20] text-white rounded-xl flex items-center justify-center font-bold mb-5">
              T
            </div>

            {/* JOB TITLE */}
            <h2 className="text-xl font-bold text-[#2C1E16]">
              Fullstack Developer
            </h2>

            {/* COMPANY */}
            <p className="text-sm text-[#1E3F20] font-semibold mt-2">
              TechBali
            </p>

            {/* LOCATION */}
            <p className="text-sm text-gray-500 mt-1">Denpasar, Bali</p>

            {/* SKILLS */}
            <div className="flex gap-2 mt-5 flex-wrap">
              <span className="text-xs bg-gray-100 px-3 py-1 rounded-lg">
                Laravel
              </span>

              <span className="text-xs bg-gray-100 px-3 py-1 rounded-lg">
                Next.js
              </span>

              <span className="text-xs bg-gray-100 px-3 py-1 rounded-lg">
                PostgreSQL
              </span>
            </div>

            {/* BUTTON */}
            <button
              type="button"
              onClick={() => router.push("/jobs/1")}
              className="w-full mt-6 bg-[#1E3F20] text-white py-3 rounded-xl text-sm font-bold hover:bg-[#152e17] transition-all"
            >
              Lihat Lowongan
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
