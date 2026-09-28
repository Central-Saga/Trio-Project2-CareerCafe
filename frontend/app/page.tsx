import Link from "next/link";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

type JobListing = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
};

type Mentor = {
  id: number;
  name: string;
  role: string;
  company: string;
  rating: string;
  image: string;
  expertise: string[];
};

const jobListings: JobListing[] = [
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

const mentors: Mentor[] = [
  {
    id: 1,
    name: "Rian Pratama, S.Kom.",
    role: "Senior Fullstack Engineer",
    company: "TechBali Denpasar",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85",
    expertise: ["Laravel", "Next.js", "PostgreSQL"],
  },
  {
    id: 2,
    name: "Putu Ayu Lestari",
    role: "Lead UI/UX Designer",
    company: "KriyaBali Digital",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85",
    expertise: ["Figma", "User Research", "Design Systems"],
  },
  {
    id: 3,
    name: "Gede Hendra Kusuma",
    role: "Product Manager & Mentor",
    company: "Career Cafe Corp",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=85",
    expertise: ["Product Strategy", "Agile", "Business Canvas"],
  },
  {
    id: 4,
    name: "Komang Sinta Dewi",
    role: "Digital Marketing Specialist",
    company: "Bali Creative Hub",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85",
    expertise: ["Social Media", "SEO", "Content Marketing"],
  },
];

const heroImages = {
  consultation:
    "https://48603975.fs1.hubspotusercontent-na1.net/hubfs/48603975/AI-Generated%20Media/Images/Cozy%20Coffee%20Shop%20Conversation%20with%20Warm%20Lighting-1.png",

  mentor:
    "https://s3.eu-north-1.amazonaws.com/cdn-site.mediaplanet.com/app/uploads/sites/114/2025/10/23100920/vicky-1761228546-GettyImages-1731803248-576x486.jpg",

  collaboration:
    "https://insight.atlas-mapping.com/hubfs/AI-Generated%20Media/Images/Two%20professionals%20working%20in%20the%20agency%20industry%20collaborating%20on%20some%20work%20in%20a%20casual%20space%20such%20as%20a%20coffee%20shop.jpeg",

  career:
    "https://imageio.forbes.com/specials-images/imageserve/69bc23ff65045f051f753e12/0x0.jpg?fit=bounds&format=jpg&height=900&width=1600",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
      <Navbar />

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative w-full overflow-hidden bg-[#F4EFE8]">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-[#DCE6D8]/60 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[30rem] w-[30rem] rounded-full bg-[#E8D8C7]/50 blur-3xl" />

        <div className="pointer-events-none absolute right-[20%] top-[30%] h-52 w-52 rounded-full bg-white/30 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:px-8 md:py-14 lg:py-16">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
            {/* =================================================
                LEFT HERO
            ================================================== */}
            <div className="lg:col-span-6">
              <div className="cc-reveal mb-5 inline-flex items-center gap-2 py-2 text-xs font-bold text-[#6B6259]">
                <span className="hero-dot h-2 w-2 rounded-full bg-[#1E3F20]" />
                <span>
                  Career growth starts with the right conversation
                </span>
              </div>

              <div
                className="cc-reveal mb-4 flex items-center gap-3"
                style={{ animationDelay: "70ms" }}
              >
                <span className="hero-line h-px w-10 bg-[#1E3F20]/30" />

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A8074]">
                  Career Cafe
                </span>
              </div>

              <h1
                className="cc-reveal max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight text-[#2C1E16] sm:text-5xl lg:text-6xl"
                style={{ animationDelay: "120ms" }}
              >
                Your Career Journey,
                <span className="block text-[#1E3F20]">
                  Better Together
                </span>
              </h1>

              <p
                className="cc-reveal mt-6 max-w-xl text-sm leading-7 text-[#6B6259] sm:text-base lg:text-lg"
                style={{ animationDelay: "180ms" }}
              >
                Dapatkan bimbingan langsung dari mentor berpengalaman, perluas
                jaringan profesional, dan temukan peluang karier terbaikmu di
                Career Cafe.
              </p>

              <div
                className="cc-reveal mt-8 flex flex-col gap-3 sm:flex-row"
                style={{ animationDelay: "240ms" }}
              >
                <Link
                  href="/mentors"
                  className="group inline-flex items-center justify-center gap-3 rounded-xl bg-[#1E3F20] px-7 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152E17] hover:shadow-lg"
                >
                  Mulai Konsultasi

                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <a
                  href="#mentor-section"
                  className="inline-flex items-center justify-center rounded-xl border border-[#D7CEC1] bg-white px-7 py-3.5 text-sm font-bold text-[#2C1E16] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F8F5F0] hover:shadow-md"
                >
                  Pelajari Dulu
                </a>
              </div>

              <div
                className="cc-reveal mt-9 border-t border-[#D8D0C4] pt-6"
                style={{ animationDelay: "300ms" }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8A8074]">
                  Didukung oleh komunitas & industri
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold text-[#9A9187]">
                  <span>INSTIKI</span>

                  <span className="text-[#C8BFB4]">•</span>

                  <span>Sekaa Gong</span>

                  <span className="text-[#C8BFB4]">•</span>

                  <span>Pemuda Bingung</span>

                  <span className="text-[#C8BFB4]">•</span>

                  <span>TechBali</span>
                </div>
              </div>
            </div>

            {/* =================================================
                RIGHT HERO
            ================================================== */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Main consultation */}
                <div
                  className="cc-reveal row-span-2 h-full"
                  style={{ animationDelay: "100ms" }}
                >
                  <Link
                    href="/mentors"
                    className="group relative block min-h-[430px] w-full overflow-hidden rounded-[2rem] bg-gray-200 text-left shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <img
                      src={heroImages.consultation}
                      alt="Konsultasi karier di Career Cafe"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                    <div className="absolute bottom-5 left-5 right-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
                        Career Consultation
                      </p>

                      <h3 className="mt-2 max-w-sm text-xl font-extrabold leading-tight text-white sm:text-2xl">
                        Temukan arah karier yang
                        <span className="block text-white/80">
                          sesuai dengan potensimu.
                        </span>
                      </h3>
                    </div>

                    <span className="absolute right-5 top-5 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-[#1E3F20] opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      →
                    </span>
                  </Link>
                </div>

                {/* Mentor */}
                <div
                  className="cc-reveal"
                  style={{ animationDelay: "160ms" }}
                >
                  <Link
                    href="/mentors/1"
                    className="group relative block min-h-[205px] w-full overflow-hidden rounded-[2rem] bg-gray-200 text-left shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <img
                      src={heroImages.mentor}
                      alt="Mentor profesional"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                        Mentor
                      </p>

                      <p className="mt-1 text-sm font-extrabold text-white">
                        Temukan Mentor Profesional
                      </p>

                      <p className="mt-1 text-[10px] text-white/75">
                        Diskusikan perjalanan kariermu
                      </p>
                    </div>

                    <span className="absolute right-4 top-4 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white/90 text-[#1E3F20] opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      →
                    </span>
                  </Link>
                </div>

                {/* Community */}
                <div
                  className="cc-reveal"
                  style={{ animationDelay: "220ms" }}
                >
                  <Link
                    href="/community"
                    className="group relative block min-h-[205px] w-full overflow-hidden rounded-[2rem] bg-gray-200 text-left shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <img
                      src={heroImages.collaboration}
                      alt="Komunitas dan kolaborasi"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                        Community
                      </p>

                      <p className="mt-1 text-sm font-extrabold text-white">
                        Tumbuh Bersama Komunitas
                      </p>

                      <p className="mt-1 text-[10px] text-white/75">
                        Bangun koneksi dan berbagi pengalaman
                      </p>
                    </div>

                    <span className="absolute right-4 top-4 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white/90 text-[#1E3F20] opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      →
                    </span>
                  </Link>
                </div>
              </div>

              {/* Learn with mentor */}
              <div
                className="cc-reveal"
                style={{ animationDelay: "280ms" }}
              >
                <Link
                  href="/mentors"
                  className="group mt-5 ml-auto flex w-full items-center gap-4 rounded-2xl border border-white/70 bg-white px-5 py-4 text-left shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl sm:max-w-[520px]"
                >
                  <div className="flex flex-shrink-0 -space-x-2">
                    <img
                      src={heroImages.career}
                      alt=""
                      className="h-10 w-10 rounded-full border-2 border-white object-cover"
                      loading="lazy"
                      decoding="async"
                    />

                    <img
                      src={heroImages.mentor}
                      alt=""
                      className="h-10 w-10 rounded-full border-2 border-white object-cover"
                      loading="lazy"
                      decoding="async"
                    />

                    <img
                      src={heroImages.collaboration}
                      alt=""
                      className="h-10 w-10 rounded-full border-2 border-white object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-[#2C1E16]">
                      Belajar bersama mentor
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-gray-500">
                      Temukan peluang dan koneksi baru bersama komunitas
                      profesional.
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <main className="mx-auto max-w-7xl px-6 py-12 md:px-8">
        {/* ===================================================
            JOB SECTION
        ==================================================== */}
        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#8A6A47]">
                Career Opportunity
              </p>

              <h2 className="text-2xl font-bold text-[#2C1E16] md:text-3xl">
                Lowongan Karier Terbaru
              </h2>
            </div>

            <Link
              href="/jobs"
              className="text-sm font-bold text-[#1E3F20] transition-all duration-300 hover:translate-x-1"
            >
              Lihat Semua →
            </Link>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
            {jobListings.map((job, index) => (
              <article
                key={job.id}
                className="cc-card group flex min-h-[230px] flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className="rounded-full bg-[#E8F0E8] px-3 py-1 text-[10px] font-bold text-[#1E3F20]">
                      {job.type}
                    </span>

                    <span className="text-right text-[10px] font-semibold text-gray-400">
                      {job.location}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#2C1E16] transition-colors duration-300 group-hover:text-[#1E3F20]">
                    {job.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {job.company}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-sm font-extrabold text-[#1E3F20]">
                    {job.salary}
                  </span>

                  <Link
                    href={`/jobs/${job.id}`}
                    className="rounded-xl bg-[#1E3F20] px-4 py-2 text-xs font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152E17] hover:shadow-lg"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ===================================================
            MENTOR SECTION
        ==================================================== */}
        <section id="mentor-section" className="scroll-mt-24">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#8A6A47]">
                Meet Your Mentor
              </p>

              <h2 className="text-2xl font-bold text-[#2C1E16] md:text-3xl">
                Mentor Pilihan Kami
              </h2>
            </div>

            <Link
              href="/mentors"
              className="text-sm font-bold text-[#1E3F20] transition-all duration-300 hover:translate-x-1"
            >
              Lihat Semua →
            </Link>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {mentors.map((mentor, index) => (
              <article
                key={mentor.id}
                className="cc-card group flex min-h-[430px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="relative h-52 flex-shrink-0 overflow-hidden bg-gray-200">
                  <img
                    src={mentor.image}
                    alt={mentor.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />

                  <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#2C1E16] shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                    ★ {mentor.rating}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-1 text-lg font-bold text-[#2C1E16]">
                    {mentor.name}
                  </h3>

                  <p className="mt-1 min-h-[32px] text-xs font-semibold leading-4 text-[#1E3F20]">
                    {mentor.role}
                  </p>

                  <p className="mt-1 min-h-[32px] text-xs leading-4 text-gray-500">
                    {mentor.company}
                  </p>

                  <div className="mt-4 min-h-[50px]">
                    <div className="flex flex-wrap gap-1.5">
                      {mentor.expertise.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-600 transition-all duration-300 group-hover:bg-[#F4EFE8]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-5">
                    <Link
                      href={`/mentors/${mentor.id}`}
                      className="block w-full rounded-xl border border-[#1E3F20] bg-white py-2.5 text-center text-xs font-bold text-[#1E3F20] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1E3F20] hover:text-white hover:shadow-md"
                    >
                      Lihat Profil & Jadwal
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />

      {/* =====================================================
          CSS ANIMATION
          Server-side CSS, TANPA React state / useEffect
      ====================================================== */}
      <style>{`
        .cc-reveal {
          opacity: 0;
          animation: ccFadeUp 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .cc-card {
          animation: ccFadeUp 650ms cubic-bezier(0.22, 1, 0.36, 1) 100ms both;
        }

        .hero-dot {
          animation: ccPulse 2.4s ease-in-out infinite;
        }

        .hero-line {
          transform-origin: left center;
          animation: ccLine 650ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes ccFadeUp {
          from {
            opacity: 0;
            transform: translate3d(0, 24px, 0);
          }

          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes ccPulse {
          0%,
          100% {
            opacity: 0.65;
            transform: scale(1);
          }

          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        @keyframes ccLine {
          from {
            opacity: 0;
            transform: scaleX(0);
          }

          to {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cc-reveal,
          .cc-card,
          .hero-dot,
          .hero-line {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
