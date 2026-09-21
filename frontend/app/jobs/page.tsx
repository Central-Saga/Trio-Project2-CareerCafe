"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Pengguna");

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    if (name) {
      setUserName(name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_name");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans text-[#2C1E16]">
      {/* NAVBAR */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/jobs")}
          >
            <img
              src="/image/logo.png"
              alt="Logo Career Cafe"
              className="h-10 w-auto mix-blend-multiply"
            />
            <span className="font-extrabold text-xl text-[#2C1E16]">
              Career Cafe
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
            <span className="text-[#1E3F20] border-b-2 border-[#1E3F20] pb-1 cursor-pointer">
              Home
            </span>
            <span className="hover:text-[#1E3F20] cursor-pointer transition-colors">
              Mentor
            </span>
            <span className="hover:text-[#1E3F20] cursor-pointer transition-colors">
              Community
            </span>
            <span className="hover:text-[#1E3F20] cursor-pointer transition-colors">
              Schedule
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative hidden xl:block w-64">
            <input
              type="text"
              placeholder="Search mentor, skill, or topic..."
              className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] rounded-full border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#1E3F20]"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 text-gray-400 absolute left-3 top-2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-600 hover:text-[#1E3F20] relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-9 h-9 bg-[#1E3F20] text-white rounded-full flex items-center justify-center font-bold text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-[#2C1E16]">
                  {userName}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-[10px] text-red-600 hover:underline font-semibold"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* KONTEN UTAMA DASHBOARD */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* HERO BANNER */}
        <div className="relative rounded-[2.5rem] overflow-hidden shadow-lg mb-14 min-h-[460px] bg-[#F5EFEB] border border-stone-200/60 flex flex-col lg:flex-row items-center justify-between">
          {/* SISI KIRI: Teks & Tombol */}
          <div className="w-full lg:w-[55%] p-10 lg:p-14 flex flex-col justify-center relative z-10">
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight leading-tight text-[#2C1E16]">
              Your Career Journey, Better Together
            </h1>
            <p className="text-[#6B5A52] text-sm lg:text-base leading-relaxed mb-6">
              Dapatkan bimbingan langsung dari mentor berpengalaman, perluas
              jaringan, dan temukan peluang karier terbaikmu.
            </p>

            <div className="mb-8">
              <button className="bg-[#E07A5F] text-white font-semibold px-7 py-3.5 rounded-xl shadow-md hover:bg-[#c9684e] transition-all duration-300 text-sm flex items-center gap-2">
                Jelajahi Mentor &rarr;
              </button>
            </div>

            {/* Fitur Ikon di Bawah */}
            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-[#2C1E16]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1E3F20]/10 flex items-center justify-center text-[#1E3F20]">
                  ✓
                </div>
                <span>Mentor Berkualitas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1E3F20]/10 flex items-center justify-center text-[#1E3F20]">
                  ♥
                </div>
                <span>Jadwal Fleksibel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1E3F20]/10 flex items-center justify-center text-[#1E3F20]">
                  ☕
                </div>
                <span>Komunitas Aktif</span>
              </div>
            </div>
          </div>

          {/* SISI KANAN: Gambar Barista Diperbesar */}
          <div className="w-full lg:w-[45%] h-full flex items-center justify-center relative overflow-hidden p-4">
            <img
              src="/image/barista.png"
              alt="Barista Career Cafe"
              className="max-h-[420px] w-auto object-contain mix-blend-multiply scale-125 translate-x-4"
            />
          </div>
        </div>

        {/* SECTION: MENTOR PILIHAN KAMI */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#2C1E16]">
              Mentor Pilihan Kami
            </h2>
            <span className="text-sm font-semibold text-[#1E3F20] hover:underline cursor-pointer">
              Lihat Semua &rarr;
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative">
              <button className="absolute top-6 right-6 text-gray-400 hover:text-[#1E3F20]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                  />
                </svg>
              </button>
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop"
                alt="Sarah Wijaya"
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h3 className="font-bold text-base text-[#2C1E16]">
                Sarah Wijaya
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Product Manager at Tokopedia
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mb-4">
                ★ 4.9 <span className="text-gray-400 font-normal">(124)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] bg-[#FAF7F2] text-[#1E3F20] font-semibold px-2.5 py-1 rounded-md">
                  Product
                </span>
                <span className="text-[10px] bg-[#FAF7F2] text-[#1E3F20] font-semibold px-2.5 py-1 rounded-md">
                  Tech
                </span>
                <span className="text-[10px] bg-[#FAF7F2] text-[#1E3F20] font-semibold px-2.5 py-1 rounded-md">
                  Startup
                </span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative">
              <button className="absolute top-6 right-6 text-gray-400 hover:text-[#1E3F20]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                  />
                </svg>
              </button>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop"
                alt="Andi Pratama"
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h3 className="font-bold text-base text-[#2C1E16]">
                Andi Pratama
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Software Engineer at Google
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mb-4">
                ★ 4.8 <span className="text-gray-400 font-normal">(98)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] bg-[#FAF7F2] text-[#1E3F20] font-semibold px-2.5 py-1 rounded-md">
                  Frontend
                </span>
                <span className="text-[10px] bg-[#FAF7F2] text-[#1E3F20] font-semibold px-2.5 py-1 rounded-md">
                  Backend
                </span>
                <span className="text-[10px] bg-[#FAF7F2] text-[#1E3F20] font-semibold px-2.5 py-1 rounded-md">
                  Tech
                </span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative">
              <button className="absolute top-6 right-6 text-gray-400 hover:text-[#1E3F20]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                  />
                </svg>
              </button>
              <img
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop"
                alt="Maya Sari"
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h3 className="font-bold text-base text-[#2C1E16]">Maya Sari</h3>
              <p className="text-xs text-gray-500 mb-2">
                Marketing Manager at Unilever
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mb-4">
                ★ 4.7 <span className="text-gray-400 font-normal">(76)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] bg-[#FAF7F2] text-[#1E3F20] font-semibold px-2.5 py-1 rounded-md">
                  Marketing
                </span>
                <span className="text-[10px] bg-[#FAF7F2] text-[#1E3F20] font-semibold px-2.5 py-1 rounded-md">
                  Branding
                </span>
                <span className="text-[10px] bg-[#FAF7F2] text-[#1E3F20] font-semibold px-2.5 py-1 rounded-md">
                  Business
                </span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative">
              <button className="absolute top-6 right-6 text-gray-400 hover:text-[#1E3F20]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                  />
                </svg>
              </button>
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop"
                alt="Budi Santoso"
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h3 className="font-bold text-base text-[#2C1E16]">
                Budi Santoso
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Data Scientist at Grab
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mb-4">
                ★ 4.8 <span className="text-gray-400 font-normal">(112)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] bg-[#FAF7F2] text-[#1E3F20] font-semibold px-2.5 py-1 rounded-md">
                  Data
                </span>
                <span className="text-[10px] bg-[#FAF7F2] text-[#1E3F20] font-semibold px-2.5 py-1 rounded-md">
                  Analytics
                </span>
                <span className="text-[10px] bg-[#FAF7F2] text-[#1E3F20] font-semibold px-2.5 py-1 rounded-md">
                  AI
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
