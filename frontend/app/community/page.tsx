"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
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
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.08,
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
        transitionDelay: `${delay}ms`,
      }}
      className={[
        "transform-gpu transition-all duration-700 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

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

const popularTopics = [
  "Career",
  "Interview",
  "Laravel",
  "Next.js",
  "Figma",
  "Freelance",
  "Portfolio",
  "Remote Work",
];

const categoryStyles: Record<
  string,
  {
    badge: string;
    avatar: string;
    icon: string;
  }
> = {
  Karier: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    avatar: "bg-emerald-100 text-emerald-700",
    icon: "↗",
  },

  Interview: {
    badge: "bg-sky-50 text-sky-700 border-sky-100",
    avatar: "bg-sky-100 text-sky-700",
    icon: "✓",
  },

  Programming: {
    badge: "bg-violet-50 text-violet-700 border-violet-100",
    avatar: "bg-violet-100 text-violet-700",
    icon: "</>",
  },

  "UI/UX": {
    badge: "bg-pink-50 text-pink-700 border-pink-100",
    avatar: "bg-pink-100 text-pink-700",
    icon: "✦",
  },

  Freelance: {
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    avatar: "bg-amber-100 text-amber-700",
    icon: "$",
  },

  "Tips & Trik": {
    badge: "bg-orange-50 text-orange-700 border-orange-100",
    avatar: "bg-orange-100 text-orange-700",
    icon: "★",
  },
};

export default function CommunityPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>(
    Object.fromEntries(posts.map((post) => [post.id, post.likes])),
  );

  const [copiedPostId, setCopiedPostId] = useState<number | null>(null);

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === "Semua" || post.category === activeCategory;

      const matchesSearch =
        !keyword ||
        post.title.toLowerCase().includes(keyword) ||
        post.content.toLowerCase().includes(keyword) ||
        post.author.toLowerCase().includes(keyword) ||
        post.role.toLowerCase().includes(keyword) ||
        post.category.toLowerCase().includes(keyword);

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const handleLike = (postId: number) => {
    setLikedPosts((current) => {
      const alreadyLiked = current.includes(postId);

      setLikeCounts((counts) => ({
        ...counts,
        [postId]: alreadyLiked
          ? Math.max((counts[postId] ?? 0) - 1, 0)
          : (counts[postId] ?? 0) + 1,
      }));

      return alreadyLiked
        ? current.filter((id) => id !== postId)
        : [...current, postId];
    });
  };

  const handleShare = async (post: Post) => {
    const shareText = `${post.title} — Career Cafe Community`;

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: post.title,
          text: shareText,
          url: window.location.href,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);

        setCopiedPostId(post.id);

        window.setTimeout(() => {
          setCopiedPostId((current) => (current === post.id ? null : current));
        }, 1800);
      }
    } catch {
      // Tidak melakukan apa-apa jika user membatalkan share.
    }
  };

  const handleTopicClick = (topic: string) => {
    setSearch(topic);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
      <Navbar />

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden border-b border-gray-100 bg-white">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#DCE6D8]/70 blur-3xl" />

          <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#E8D8C7]/50 blur-3xl" />

          <div className="absolute right-[30%] top-20 h-36 w-36 rounded-full bg-[#E8F0E8]/60 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-14 sm:py-16 lg:py-20">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              {/* Badge */}
              <span className="inline-flex items-center gap-2 rounded-full border border-[#1E3F20]/10 bg-[#E8F0E8]/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#1E3F20] shadow-sm backdrop-blur">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#1E3F20]" />
                Community Career Cafe
              </span>

              {/* Heading */}
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-[#2C1E16] sm:text-5xl lg:text-6xl">
                Bertumbuh,
                <span className="block text-[#1E3F20]">
                  berbagi, dan terhubung.
                </span>
              </h1>

              {/* Description */}
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base lg:text-lg">
                Tempat untuk bertanya, berbagi pengalaman, menemukan insight
                baru, dan membangun koneksi bersama komunitas Career Cafe.
              </p>
            </div>
          </Reveal>

          {/* =================================================
              SEARCH
          ================================================== */}
          <Reveal delay={120}>
            <div className="mx-auto mt-9 max-w-3xl">
              <div className="group relative">
                <div className="pointer-events-none absolute -inset-1 rounded-[24px] bg-[#1E3F20]/5 opacity-0 blur-xl transition-opacity duration-500 group-focus-within:opacity-100" />

                <div className="relative flex items-center rounded-[22px] border border-gray-200 bg-white p-2 shadow-[0_14px_40px_rgba(44,30,22,0.06)] transition-all duration-300 focus-within:border-[#1E3F20]/30 focus-within:shadow-[0_18px_50px_rgba(30,63,32,0.10)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F7F4EC] text-[#1E3F20]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.04 6.04a7.5 7.5 0 0 0 10.61 10.61Z"
                      />
                    </svg>
                  </div>

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari diskusi, topik, atau pertanyaan..."
                    className="h-12 flex-1 bg-transparent px-4 text-sm text-[#2C1E16] outline-none placeholder:text-gray-400"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="mr-2 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-all duration-300 hover:bg-gray-200 hover:text-gray-600"
                      aria-label="Hapus pencarian"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Reveal>

          {/* =================================================
              QUICK STATS
          ================================================== */}
          <Reveal delay={200}>
            <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-white/85 p-4 text-center shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <p className="text-xl font-extrabold text-[#1E3F20]">2.4K+</p>
                <p className="mt-1 text-[11px] font-semibold text-gray-400">
                  Anggota komunitas
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white/85 p-4 text-center shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <p className="text-xl font-extrabold text-[#1E3F20]">850+</p>
                <p className="mt-1 text-[11px] font-semibold text-gray-400">
                  Diskusi aktif
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white/85 p-4 text-center shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <p className="text-xl font-extrabold text-[#1E3F20]">120+</p>
                <p className="mt-1 text-[11px] font-semibold text-gray-400">
                  Mentor & profesional
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <main className="mx-auto max-w-7xl px-6 py-12 md:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* =================================================
              LEFT
          ================================================== */}
          <div className="lg:col-span-8">
            {/* FILTER */}
            <Reveal>
              <div className="mb-7">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {categories.map((category) => {
                    const active = activeCategory === category;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={[
                          "whitespace-nowrap rounded-full border px-4 py-2.5 text-xs font-bold transition-all duration-300",
                          active
                            ? "border-[#1E3F20] bg-[#1E3F20] text-white shadow-md"
                            : "border-gray-200 bg-white text-gray-600 hover:-translate-y-0.5 hover:border-[#1E3F20]/30 hover:bg-[#1E3F20]/5 hover:text-[#1E3F20]",
                        ].join(" ")}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            {/* SECTION TITLE */}
            <Reveal delay={80}>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#1E3F20]" />

                    <p className="text-[11px] font-extrabold uppercase tracking-[0.17em] text-[#8A6A47]">
                      Community Feed
                    </p>
                  </div>

                  <h2 className="mt-2 text-2xl font-extrabold text-[#2C1E16] sm:text-3xl">
                    Diskusi Terbaru
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Ikuti percakapan dan insight dari komunitas Career Cafe.
                  </p>
                </div>

                <button
                  type="button"
                  className="group hidden items-center gap-2 rounded-xl bg-[#1E3F20] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-md sm:inline-flex"
                >
                  <span className="text-base leading-none transition-transform duration-300 group-hover:rotate-90">
                    +
                  </span>
                  Buat Diskusi
                </button>
              </div>
            </Reveal>

            {/* RESULT INFO */}
            <Reveal delay={120}>
              <div className="mb-5 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-400">
                  Menampilkan{" "}
                  <span className="text-[#2C1E16]">{filteredPosts.length}</span>{" "}
                  diskusi
                </p>

                {(search || activeCategory !== "Semua") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setActiveCategory("Semua");
                    }}
                    className="text-xs font-bold text-[#1E3F20] transition-colors hover:text-[#152e17]"
                  >
                    Reset filter
                  </button>
                )}
              </div>
            </Reveal>

            {/* POSTS */}
            <div className="space-y-5">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post, index) => {
                  const style =
                    categoryStyles[post.category] ?? categoryStyles.Karier;

                  const isLiked = likedPosts.includes(post.id);

                  return (
                    <Reveal key={post.id} delay={Math.min(index * 90, 360)}>
                      <article
                        className={[
                          "group relative overflow-hidden rounded-[26px] border border-gray-100 bg-white p-5 shadow-[0_8px_28px_rgba(44,30,22,0.045)] transition-all duration-300 sm:p-6",
                          "hover:-translate-y-1.5 hover:border-[#1E3F20]/10 hover:shadow-[0_22px_55px_rgba(30,63,32,0.10)]",
                        ].join(" ")}
                      >
                        {/* Top accent */}
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#1E3F20]/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                        {/* AUTHOR */}
                        <div className="flex items-center gap-3">
                          <div
                            className={[
                              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold shadow-sm transition-transform duration-300 group-hover:scale-105",
                              style.avatar,
                            ].join(" ")}
                          >
                            {post.initial}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-bold text-[#2C1E16]">
                              {post.author}
                            </p>

                            <div className="mt-0.5 flex items-center gap-2">
                              <p className="truncate text-xs text-gray-500">
                                {post.role}
                              </p>

                              <span className="h-1 w-1 shrink-0 rounded-full bg-gray-300" />

                              <span className="text-[10px] font-semibold text-gray-400">
                                Member
                              </span>
                            </div>
                          </div>

                          <span
                            className={[
                              "ml-auto hidden rounded-full border px-3 py-1.5 text-[10px] font-bold sm:inline-flex",
                              style.badge,
                            ].join(" ")}
                          >
                            {post.category}
                          </span>
                        </div>

                        {/* CONTENT */}
                        <div className="mt-5">
                          <div className="flex items-start gap-3">
                            <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F7F4EC] text-xs font-bold text-[#1E3F20] sm:flex">
                              {style.icon}
                            </div>

                            <div className="min-w-0">
                              <span
                                className={[
                                  "mb-2 inline-flex rounded-full border px-3 py-1 text-[10px] font-bold sm:hidden",
                                  style.badge,
                                ].join(" ")}
                              >
                                {post.category}
                              </span>

                              <h3 className="text-lg font-extrabold leading-snug text-[#2C1E16] transition-colors duration-300 group-hover:text-[#1E3F20]">
                                {post.title}
                              </h3>

                              <p className="mt-2 text-sm leading-7 text-gray-600">
                                {post.content}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* TAGS */}
                        <div className="mt-5 flex flex-wrap gap-2">
                          {post.category === "Programming" && (
                            <>
                              <span className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-[10px] font-semibold text-gray-500">
                                #Laravel
                              </span>

                              <span className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-[10px] font-semibold text-gray-500">
                                #Nextjs
                              </span>
                            </>
                          )}

                          {post.category === "UI/UX" && (
                            <>
                              <span className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-[10px] font-semibold text-gray-500">
                                #Figma
                              </span>

                              <span className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-[10px] font-semibold text-gray-500">
                                #Design
                              </span>
                            </>
                          )}

                          {post.category === "Karier" && (
                            <>
                              <span className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-[10px] font-semibold text-gray-500">
                                #Portfolio
                              </span>

                              <span className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-[10px] font-semibold text-gray-500">
                                #Career
                              </span>
                            </>
                          )}

                          {post.category === "Freelance" && (
                            <>
                              <span className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-[10px] font-semibold text-gray-500">
                                #Freelance
                              </span>

                              <span className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-[10px] font-semibold text-gray-500">
                                #Client
                              </span>
                            </>
                          )}
                        </div>

                        {/* ACTIONS */}
                        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-5">
                          {/* Like */}
                          <button
                            type="button"
                            onClick={() => handleLike(post.id)}
                            className={[
                              "group/like inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-300",
                              isLiked
                                ? "bg-[#1E3F20]/10 text-[#1E3F20]"
                                : "text-gray-500 hover:bg-[#F7F4EC] hover:text-[#1E3F20]",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "text-base transition-transform duration-300",
                                isLiked
                                  ? "scale-110"
                                  : "group-hover/like:scale-110",
                              ].join(" ")}
                            >
                              {isLiked ? "♥" : "♡"}
                            </span>

                            {likeCounts[post.id] ?? post.likes}

                            <span className="hidden sm:inline">Suka</span>
                          </button>

                          {/* Comment */}
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-gray-500 transition-all duration-300 hover:bg-[#F7F4EC] hover:text-[#1E3F20]"
                          >
                            <span className="text-base">○</span>

                            {post.comments}

                            <span className="hidden sm:inline">Komentar</span>
                          </button>

                          {/* Share */}
                          <button
                            type="button"
                            onClick={() => handleShare(post)}
                            className="ml-auto inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-gray-500 transition-all duration-300 hover:bg-[#F7F4EC] hover:text-[#1E3F20]"
                          >
                            <span className="text-base">↗</span>

                            {copiedPostId === post.id ? "Tersalin" : "Bagikan"}
                          </button>
                        </div>
                      </article>
                    </Reveal>
                  );
                })
              ) : (
                <Reveal>
                  <div className="rounded-[26px] border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F0E8] text-2xl text-[#1E3F20]">
                      ⌕
                    </div>

                    <h3 className="mt-5 text-lg font-extrabold text-[#2C1E16]">
                      Diskusi tidak ditemukan
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                      Coba gunakan kata kunci lain atau pilih kategori yang
                      berbeda.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setActiveCategory("Semua");
                      }}
                      className="mt-6 rounded-xl bg-[#1E3F20] px-5 py-3 text-xs font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-md"
                    >
                      Reset Pencarian
                    </button>
                  </div>
                </Reveal>
              )}
            </div>
          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================== */}
          <aside className="space-y-6 lg:col-span-4">
            {/* CREATE POST */}
            <Reveal delay={100}>
              <div className="group relative overflow-hidden rounded-[28px] bg-[#1E3F20] p-6 text-white shadow-[0_18px_45px_rgba(30,63,32,0.18)]">
                {/* Decorative */}
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg backdrop-blur">
                      +
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
                        Community
                      </p>

                      <p className="text-sm font-bold text-white">
                        Share your thoughts
                      </p>
                    </div>
                  </div>

                  <h3 className="mt-5 text-2xl font-extrabold leading-tight">
                    Punya pertanyaan?
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-white/75">
                    Bagikan pengalaman, pertanyaan, atau insight yang bisa
                    membantu anggota komunitas lainnya.
                  </p>

                  <button
                    type="button"
                    className="group/cta mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-[#1E3F20] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F8F6F1] hover:shadow-md"
                  >
                    Mulai Diskusi
                    <span className="transition-transform duration-300 group-hover/cta:translate-x-1">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </Reveal>

            {/* TOPIC POPULAR */}
            <Reveal delay={160}>
              <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-[0_10px_35px_rgba(44,30,22,0.045)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8A6A47]">
                      Explore
                    </p>

                    <h3 className="mt-1 text-lg font-extrabold text-[#2C1E16]">
                      Topik Populer
                    </h3>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F7F4EC] text-sm text-[#1E3F20]">
                    #
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {popularTopics.map((topic) => {
                    const active = search.toLowerCase() === topic.toLowerCase();

                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => handleTopicClick(topic)}
                        className={[
                          "rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-300",
                          active
                            ? "border-[#1E3F20] bg-[#1E3F20] text-white shadow-sm"
                            : "border-gray-200 bg-[#FCFBF8] text-gray-600 hover:-translate-y-0.5 hover:border-[#1E3F20]/20 hover:bg-[#1E3F20]/5 hover:text-[#1E3F20]",
                        ].join(" ")}
                      >
                        #{topic}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            {/* COMMUNITY RULES */}
            <Reveal delay={220}>
              <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-[0_10px_35px_rgba(44,30,22,0.045)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F0E8] text-[#1E3F20]">
                    ✓
                  </div>

                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8A6A47]">
                      Be kind
                    </p>

                    <h3 className="mt-0.5 text-lg font-extrabold text-[#2C1E16]">
                      Panduan Komunitas
                    </h3>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="group flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8F0E8] text-xs font-extrabold text-[#1E3F20] transition-transform duration-300 group-hover:scale-105">
                      1
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#2C1E16]">
                        Saling menghargai
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Gunakan bahasa yang sopan dan membangun.
                      </p>
                    </div>
                  </div>

                  <div className="group flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8F0E8] text-xs font-extrabold text-[#1E3F20] transition-transform duration-300 group-hover:scale-105">
                      2
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#2C1E16]">
                        Berbagi dengan positif
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Bagikan pengalaman dan informasi yang bermanfaat.
                      </p>
                    </div>
                  </div>

                  <div className="group flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8F0E8] text-xs font-extrabold text-[#1E3F20] transition-transform duration-300 group-hover:scale-105">
                      3
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#2C1E16]">
                        Hindari spam
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Jaga diskusi tetap relevan dengan topik.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* SMALL CTA */}
            <Reveal delay={280}>
              <div className="rounded-[28px] border border-[#D8D0C4] bg-[#F7F4EC] p-6">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8A6A47]">
                  Career Cafe
                </p>

                <h3 className="mt-2 text-xl font-extrabold leading-tight text-[#2C1E16]">
                  Belajar lebih cepat bersama orang lain.
                </h3>

                <p className="mt-2 text-xs leading-6 text-gray-500">
                  Temukan perspektif baru dari mentor, developer, designer, dan
                  profesional lainnya.
                </p>

                <button
                  type="button"
                  className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-[#1E3F20] transition-all duration-300 hover:gap-3"
                >
                  Jelajahi mentor
                  <span>→</span>
                </button>
              </div>
            </Reveal>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
