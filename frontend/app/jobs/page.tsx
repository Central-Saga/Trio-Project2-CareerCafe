"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function JobsPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Pengguna");

  useEffect(() => {
    const storedName = localStorage.getItem("user_name");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_name");
    router.push("/login");
  };

  const jobListings = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "TechBali Denpasar",
      location: "Denpasar, Bali (Hybrid)",
      type: "Full-time",
      salary: "Rp 6jt - 9jt",
    },
    {
      id: 2,
      title: "UI/UX Designer",
      company: "KriyaBali Digital",
      location: "Remote",
      type: "Contract",
      salary: "Rp 5jt - 7jt",
    },
    {
      id: 3,
      title: "Laravel Backend Engineer",
      company: "Career Cafe Corp",
      location: "Badung, Bali",
      type: "Full-time",
      salary: "Rp 7jt - 10jt",
    },
  ];

  const mentors = [
    {
      id: 1,
      name: "Rian Pratama, S.Kom.",
      role: "Senior Fullstack Engineer",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2,
      name: "Putu Ayu Lestari",
      role: "Lead UI/UX Designer",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      name: "Gede Hendra Kusuma",
      role: "Product Manager & Mentor",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 4,
      name: "Komang Sinta Dewi",
      role: "Digital Marketing Specialist",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-100 px-8 py-3.5 flex items-center justify-between relative sticky top-0 z-50">
        <div className="flex items-center">
          <span className="font-extrabold text-xl text-[#1E3F20] tracking-tight">
            Career Cafe
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600 absolute left-1/2 -translate-x-1/2">
          <a href="/jobs" className="text-[#1E3F20]">Home</a>
          <a href="#" className="hover:text-[#1E3F20] transition-colors">Mentor</a>
          <a href="#" className="hover:text-[#1E3F20] transition-colors">Community</a>
          <a href="#" className="hover:text-[#1E3F20] transition-colors">Schedule</a>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center w-56 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 shadow-sm">
            <span className="text-gray-400 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Cari mentor..."
              className="w-full text-xs text-[#2C1E16] focus:outline-none bg-transparent"
            />
          </div>

          <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 p-1 rounded-full shadow-sm">
            <div
              className="w-7 h-7 bg-[#1E3F20] text-white rounded-full flex items-center justify-center font-bold text-xs"
              title={userName}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-red-600 hover:text-red-700 px-2 py-0.5 transition-colors"
              title="Keluar Akun"
            >
              Keluar
            </button>
          </div>
        </div>
      </nav>

      {/* KONTEN UTAMA */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-[#2C1E16] leading-tight">
              Your Career Journey, <span className="text-[#1E3F20]">Better Together</span>
            </h1>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-lg">
              Dapatkan bimbingan langsung dari mentor berpengalaman, perluas jaringan profesional, dan temukan peluang karier terbaikmu di Career Cafe.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button className="bg-[#1E3F20] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#152e17] transition-all shadow-md hover:scale-[1.02]">
                Mulai Konsultasi &rarr;
              </button>
              <button className="bg-white border border-gray-200 text-[#2C1E16] px-6 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm">
                Pelajari Dulu
              </button>
            </div>

            <div className="pt-8 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Didukung oleh Komunitas & Industri
              </p>
              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-400 opacity-70">
                <span>INSTIKI</span>
                <span>•</span>
                <span>Sekaa Gong</span>
                <span>•</span>
                <span>Pemuda Bingung</span>
                <span>•</span>
                <span>TechBali</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4 relative">
            <div className="bg-[#1E3F20] text-white p-6 rounded-3xl shadow-lg flex flex-col justify-between">
              <div className="flex -space-x-2 overflow-hidden mb-4">
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-300 text-center text-xs leading-8 font-bold text-gray-800">T</div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-400 text-center text-xs leading-8 font-bold text-gray-800">N</div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-500 text-center text-xs leading-8 font-bold text-white">B</div>
              </div>
              <div>
                <h3 className="text-3xl font-extrabold mb-1">124K+</h3>
                <p className="text-xs text-gray-200 opacity-90">Profesional & mentee telah bergabung</p>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-lg h-64 bg-cover bg-center" style={{ backgroundImage: "url('/image/herosection.png')" }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <span className="text-white text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                  Sesi Aktif 98%
                </span>
              </div>
            </div>

            <div className="bg-[#2C1E16] text-white p-6 rounded-3xl shadow-lg flex flex-col justify-center">
              <h3 className="text-2xl font-extrabold text-[#A3B18B] mb-1">14K</h3>
              <p className="text-xs text-gray-300">Sesi mentoring sukses diselesaikan</p>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex flex-col justify-center">
              <h3 className="text-2xl font-extrabold text-[#1E3F20] mb-1">5,8K</h3>
              <p className="text-xs text-gray-500">Karier impian berhasil diraih</p>
            </div>
          </div>
        </div>

        {/* SECTION: Lowongan Karier Terbaru (Terhubung ke /jobs/[id]) */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#2C1E16]">Lowongan Karier Terbaru</h2>
            <a href="#" className="text-sm font-bold text-[#1E3F20] hover:underline">
              Lihat Semua &rarr;
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {jobListings.map((job) => (
              <div key={job.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold bg-[#1E3F20]/10 text-[#1E3F20] px-3 py-1 rounded-full">
                      {job.type}
                    </span>
                    <span className="text-xs font-semibold text-gray-400">{job.location}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#2C1E16] mb-1">{job.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{job.company}</p>
                </div>
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-[#1E3F20]">{job.salary}</span>
                  <a
                    href={`/jobs/${job.id}`}
                    className="bg-[#1E3F20] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#152e17] transition-all"
                  >
                    Lihat Detail
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: Mentor Pilihan Kami */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#2C1E16]">Mentor Pilihan Kami</h2>
            <a href="#" className="text-sm font-bold text-[#1E3F20] hover:underline">
              Lihat Semua &rarr;
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mentors.map((mentor) => (
              <div key={mentor.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="h-48 bg-gray-200 bg-cover bg-center" style={{ backgroundImage: `url('${mentor.image}')` }}></div>
                <div className="p-4">
                  <h3 className="font-bold text-[#2C1E16] text-lg">{mentor.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">{mentor.role}</p>
                  <button className="w-full border border-[#1E3F20] text-[#1E3F20] py-2 rounded-xl text-xs font-bold hover:bg-[#1E3F20] hover:text-white transition-all">
                    Jadwalkan Sesi
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}