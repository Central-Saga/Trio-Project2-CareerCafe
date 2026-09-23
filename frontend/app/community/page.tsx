"use client";

import Navbar from "../components/Navbar";

type Post = {
  id: number;
  author: string;
  role: string;
  initial: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
};

export default function CommunityPage() {
  const categories = [
    "Semua",
    "Karier",
    "Interview",
    "Programming",
    "UI/UX",
    "Freelance",
    "Tips & Trik",
  ];

  const posts: Post[] = [
    {
      id: 1,
      author: "Andi Saputra",
      role: "Frontend Developer",
      initial: "A",
      title: "Tips mempersiapkan portfolio untuk interview",
      content:
        "Ada yang punya tips menyusun portfolio agar lebih menarik ketika melamar sebagai frontend developer?",
      category: "Karier",
      likes: 24,
      comments: 8,
    },
    {
      id: 2,
      author: "Dewi Lestari",
      role: "UI/UX Designer",
      initial: "D",
      title: "Tools yang paling sering digunakan untuk UI/UX",
      content:
        "Menurut teman-teman, tools apa saja yang paling penting dikuasai oleh pemula yang ingin masuk ke bidang UI/UX?",
      category: "UI/UX",
      likes: 31,
      comments: 12,
    },
    {
      id: 3,
      author: "Budi Pratama",
      role: "Fullstack Developer",
      initial: "B",
      title: "Belajar Laravel dan Next.js dari nol",
      content:
        "Saya sedang mulai belajar Laravel dan Next.js. Ada rekomendasi roadmap belajar yang cocok untuk pemula?",
      category: "Programming",
      likes: 18,
      comments: 6,
    },
    {
      id: 4,
      author: "Sinta Ayu",
      role: "Freelance Designer",
      initial: "S",
      title: "Bagaimana mendapatkan client pertama?",
      content:
        "Untuk teman-teman yang sudah freelance, bagaimana cara mendapatkan client pertama tanpa pengalaman yang panjang?",
      category: "Freelance",
      likes: 27,
      comments: 10,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO */}
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-14 sm:py-16">
          <div className="max-w-3xl">
            <span className="inline-block bg-[#1E3F20]/10 text-[#1E3F20] px-4 py-2 rounded-full text-xs font-bold mb-4">
              Community
            </span>

            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-[#2C1E16]">
              Berkembang dan Bertukar Pikiran
              <span className="text-[#1E3F20]"> Bersama</span>
            </h1>

            <p className="mt-5 text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl">
              Tempat untuk berbagi pengalaman, bertanya, berdiskusi, dan
              belajar bersama komunitas Career Cafe.
            </p>
          </div>

          {/* SEARCH */}
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari diskusi, topik, atau pertanyaan..."
                className="w-full rounded-2xl border border-gray-200 bg-[#FCFBF8] px-5 py-4 pr-12 text-sm text-[#2C1E16] outline-none transition-all focus:border-[#1E3F20] focus:ring-2 focus:ring-[#1E3F20]/10"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.7}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.04 6.04a7.5 7.5 0 0 0 10.61 10.61Z"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-8">
            {/* FILTER */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
              {categories.map((category, index) => (
                <button
                  key={category}
                  type="button"
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    index === 0
                      ? "bg-[#1E3F20] text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-[#1E3F20] hover:text-[#1E3F20]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* SECTION TITLE */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#2C1E16]">
                  Diskusi Terbaru
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Ikuti percakapan dari komunitas Career Cafe.
                </p>
              </div>

              <button
                type="button"
                className="hidden sm:inline-flex bg-[#1E3F20] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#152e17] transition-all"
              >
                + Buat Diskusi
              </button>
            </div>

            {/* POSTS */}
            <div className="space-y-5">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
                >
                  {/* AUTHOR */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#1E3F20] text-white flex items-center justify-center font-bold">
                      {post.initial}
                    </div>

                    <div>
                      <p className="font-bold text-[#2C1E16]">
                        {post.author}
                      </p>

                      <p className="text-xs text-gray-500">
                        {post.role}
                      </p>
                    </div>

                    <span className="ml-auto bg-[#1E3F20]/10 text-[#1E3F20] px-3 py-1 rounded-full text-[10px] font-bold">
                      {post.category}
                    </span>
                  </div>

                  {/* POST CONTENT */}
                  <div className="mt-5">
                    <h3 className="text-lg font-bold text-[#2C1E16]">
                      {post.title}
                    </h3>

                    <p className="text-sm text-gray-600 leading-relaxed mt-2">
                      {post.content}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-6 mt-5 pt-5 border-t border-gray-100">
                    <button
                      type="button"
                      className="text-xs font-semibold text-gray-500 hover:text-[#1E3F20] transition-colors"
                    >
                      ♡ {post.likes} Suka
                    </button>

                    <button
                      type="button"
                      className="text-xs font-semibold text-gray-500 hover:text-[#1E3F20] transition-colors"
                    >
                      ○ {post.comments} Komentar
                    </button>

                    <button
                      type="button"
                      className="ml-auto text-xs font-semibold text-gray-500 hover:text-[#1E3F20] transition-colors"
                    >
                      Bagikan
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="lg:col-span-4 space-y-6">
            {/* CREATE POST */}
            <div className="bg-[#1E3F20] text-white rounded-3xl p-6 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                Community
              </span>

              <h3 className="text-2xl font-extrabold mt-2">
                Punya pertanyaan?
              </h3>

              <p className="text-sm leading-relaxed text-white/80 mt-3">
                Bagikan pengalaman atau pertanyaanmu dan dapatkan masukan dari
                anggota komunitas lainnya.
              </p>

              <button
                type="button"
                className="mt-6 bg-white text-[#1E3F20] px-5 py-3 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all"
              >
                Mulai Diskusi
              </button>
            </div>

            {/* POPULAR TOPICS */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#2C1E16]">
                Topik Populer
              </h3>

              <div className="flex flex-wrap gap-2 mt-5">
                {[
                  "Career",
                  "Interview",
                  "Laravel",
                  "Next.js",
                  "Figma",
                  "Freelance",
                  "Portfolio",
                  "Remote Work",
                ].map((topic) => (
                  <span
                    key={topic}
                    className="bg-[#FCFBF8] border border-gray-200 px-3 py-2 rounded-xl text-xs font-semibold text-gray-600"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            </div>

            {/* COMMUNITY RULES */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#2C1E16]">
                Panduan Komunitas
              </h3>

              <div className="space-y-4 mt-5">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1E3F20]/10 text-[#1E3F20] flex items-center justify-center font-bold text-xs">
                    1
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      Saling menghargai
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Gunakan bahasa yang sopan dan membangun.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1E3F20]/10 text-[#1E3F20] flex items-center justify-center font-bold text-xs">
                    2
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      Berbagi dengan positif
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Berikan pengalaman dan informasi yang bermanfaat.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1E3F20]/10 text-[#1E3F20] flex items-center justify-center font-bold text-xs">
                    3
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      Hindari spam
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Jaga diskusi tetap relevan dengan topik.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-extrabold text-[#1E3F20]">
              Career Cafe
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Belajar, berdiskusi, dan berkembang bersama.
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