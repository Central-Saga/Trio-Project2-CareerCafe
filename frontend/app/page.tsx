"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  reviews: number;
  image: string;
  expertise: string[];
};

/* =========================================================
   SHARED REVEAL
   Gaya dibuat seperti halaman Mentor:
   opacity + translateY + ease-out
========================================================= */

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
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
        rootMargin: "0px 0px -20px 0px",
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
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/* =========================================================
   HERO REVEAL
   Sama persis feel-nya dengan Reveal biasa,
   hanya dimulai saat Home pertama kali dibuka.
========================================================= */

function HeroReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setVisible(true);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      style={{
        transitionDelay: `${delay}ms`,
      }}
      className={[
        "transform-gpu transition-all duration-700 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();

  /* =======================================================
     JOBS
  ======================================================= */

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

  /* =======================================================
     MENTORS
  ======================================================= */

  const mentors: Mentor[] = [
    {
      id: 1,
      name: "Rian Pratama, S.Kom.",
      role: "Senior Fullstack Engineer",
      company: "TechBali Denpasar",
      rating: "4.9",
      reviews: 120,
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
      reviews: 95,
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
      reviews: 110,
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
      reviews: 88,
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85",
      expertise: ["Social Media", "SEO", "Content Marketing"],
    },
  ];

  /* =======================================================
     HERO IMAGES
  ======================================================= */

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

  /* =======================================================
     SCROLL TO MENTORS
  ======================================================= */

  const scrollToMentors = () => {
    const section = document.getElementById("mentor-section");

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <Navbar />

      {/* =====================================================
          HERO SECTION
      ====================================================== */}

      <section className="relative w-full overflow-hidden bg-[#F4EFE8]">
        {/* Background decoration */}
        <div className="hero-blob hero-blob-one pointer-events-none absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-[#DCE6D8]/60 blur-3xl" />

        <div className="hero-blob hero-blob-two pointer-events-none absolute -bottom-40 -left-40 h-[30rem] w-[30rem] rounded-full bg-[#E8D8C7]/50 blur-3xl" />

        <div className="hero-blob hero-blob-three pointer-events-none absolute right-[20%] top-[30%] h-52 w-52 rounded-full bg-white/30 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:px-8 md:py-14 lg:py-16">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
            {/* =================================================
                LEFT HERO
            ================================================== */}

            <div className="lg:col-span-6">
              {/* Badge */}
              <HeroReveal delay={0}>
                <div className="mb-5 inline-flex items-center gap-2 px-0 py-2 text-xs font-bold text-[#6B6259]">
                  <span className="hero-dot h-2 w-2 rounded-full bg-[#1E3F20]" />

                  <span>Career growth starts with the right conversation</span>
                </div>
              </HeroReveal>

              {/* Label */}
              <HeroReveal delay={40}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="hero-line h-px w-10 bg-[#1E3F20]/30" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A8074]">
                    Career Cafe
                  </span>
                </div>
              </HeroReveal>

              {/* Heading */}
              <HeroReveal delay={80}>
                <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight text-[#2C1E16] sm:text-5xl lg:text-6xl">
                  Your Career Journey,
                  <span className="block text-[#1E3F20]">Better Together</span>
                </h1>
              </HeroReveal>

              {/* Description */}
              <HeroReveal delay={130}>
                <p className="mt-6 max-w-xl text-sm leading-7 text-[#6B6259] sm:text-base lg:text-lg">
                  Dapatkan bimbingan langsung dari mentor berpengalaman, perluas
                  jaringan profesional, dan temukan peluang karier terbaikmu di
                  Career Cafe.
                </p>
              </HeroReveal>

              {/* Buttons */}
              <HeroReveal delay={180}>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => router.push("/mentors")}
                    className="group inline-flex cursor-pointer items-center justify-center gap-3 rounded-xl bg-[#1E3F20] px-7 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-lg"
                  >
                    Mulai Konsultasi
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={scrollToMentors}
                    className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[#D7CEC1] bg-white px-7 py-3.5 text-sm font-bold text-[#2C1E16] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F8F5F0] hover:shadow-md"
                  >
                    Pelajari Dulu
                  </button>
                </div>
              </HeroReveal>

              {/* Supported */}
              <HeroReveal delay={230}>
                <div className="mt-9 border-t border-[#D8D0C4] pt-6">
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
              </HeroReveal>
            </div>

            {/* =================================================
                RIGHT HERO
            ================================================== */}

            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-4">
                {/* =================================================
                    MAIN CONSULTATION
                ================================================== */}

                <HeroReveal delay={80} className="row-span-2 h-full">
                  <button
                    type="button"
                    onClick={() => router.push("/mentors")}
                    className="group relative min-h-[430px] w-full cursor-pointer overflow-hidden rounded-[2rem] bg-gray-200 text-left shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <img
                      src={heroImages.consultation}
                      alt="Konsultasi karier di Career Cafe"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
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
                  </button>
                </HeroReveal>

                {/* =================================================
                    MENTOR IMAGE
                ================================================== */}

                <HeroReveal delay={130}>
                  <button
                    type="button"
                    onClick={() => router.push("/mentors/1")}
                    className="group relative min-h-[205px] w-full cursor-pointer overflow-hidden rounded-[2rem] bg-gray-200 text-left shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <img
                      src={heroImages.mentor}
                      alt="Mentor profesional"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
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
                  </button>
                </HeroReveal>

                {/* =================================================
                    COMMUNITY IMAGE
                ================================================== */}

                <HeroReveal delay={180}>
                  <button
                    type="button"
                    onClick={() => router.push("/community")}
                    className="group relative min-h-[205px] w-full cursor-pointer overflow-hidden rounded-[2rem] bg-gray-200 text-left shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <img
                      src={heroImages.collaboration}
                      alt="Komunitas dan kolaborasi"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
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
                  </button>
                </HeroReveal>
              </div>

              {/* =================================================
                  LEARN WITH MENTOR
              ================================================== */}

              <HeroReveal delay={230}>
                <button
                  type="button"
                  onClick={() => router.push("/mentors")}
                  className="group mt-5 ml-auto flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-white/70 bg-white px-5 py-4 text-left shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl sm:max-w-[520px]"
                >
                  <div className="flex flex-shrink-0 -space-x-2">
                    <img
                      src={heroImages.career}
                      alt=""
                      className="h-10 w-10 rounded-full border-2 border-white object-cover"
                    />

                    <img
                      src={heroImages.mentor}
                      alt=""
                      className="h-10 w-10 rounded-full border-2 border-white object-cover"
                    />

                    <img
                      src={heroImages.collaboration}
                      alt=""
                      className="h-10 w-10 rounded-full border-2 border-white object-cover"
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
                </button>
              </HeroReveal>
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
          <Reveal>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#8A6A47]">
                  Career Opportunity
                </p>

                <h2 className="text-2xl font-bold text-[#2C1E16] md:text-3xl">
                  Lowongan Karier Terbaru
                </h2>
              </div>

              <button
                type="button"
                onClick={() => router.push("/jobs")}
                className="cursor-pointer text-sm font-bold text-[#1E3F20] transition-all duration-300 hover:translate-x-1"
              >
                Lihat Semua →
              </button>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
            {jobListings.map((job, index) => (
              <Reveal key={job.id} delay={index * 80} className="h-full">
                <article className="group flex h-full min-h-[230px] flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
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

                    <p className="mt-1 text-sm text-gray-500">{job.company}</p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-sm font-extrabold text-[#1E3F20]">
                      {job.salary}
                    </span>

                    <button
                      type="button"
                      onClick={() => router.push(`/jobs/${job.id}`)}
                      className="cursor-pointer rounded-xl bg-[#1E3F20] px-4 py-2 text-xs font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-lg"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ===================================================
            MENTOR SECTION
        ==================================================== */}

        <section id="mentor-section" className="scroll-mt-24">
          <Reveal>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#8A6A47]">
                  Meet Your Mentor
                </p>

                <h2 className="text-2xl font-bold text-[#2C1E16] md:text-3xl">
                  Mentor Pilihan Kami
                </h2>
              </div>

              <button
                type="button"
                onClick={() => router.push("/mentors")}
                className="cursor-pointer text-sm font-bold text-[#1E3F20] transition-all duration-300 hover:translate-x-1"
              >
                Lihat Semua →
              </button>
            </div>
          </Reveal>

          {/* =================================================
              MENTOR GRID
              Semua card dipaksa memiliki tinggi yang sama
          ================================================== */}

          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {mentors.map((mentor, index) => (
              <Reveal key={mentor.id} delay={index * 70} className="h-full">
                <article className="group flex h-full min-h-[430px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  {/* Image */}
                  <div className="relative h-52 flex-shrink-0 overflow-hidden bg-gray-200">
                    <img
                      src={mentor.image}
                      alt={mentor.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#2C1E16] shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                      ★ {mentor.rating}
                    </div>
                  </div>

                  {/* Content */}
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

                    {/* Skills */}
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

                    {/* Button always aligned */}
                    <div className="mt-auto pt-5">
                      <button
                        type="button"
                        onClick={() => router.push(`/mentors/${mentor.id}`)}
                        className="w-full cursor-pointer rounded-xl border border-[#1E3F20] bg-white py-2.5 text-xs font-bold text-[#1E3F20] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1E3F20] hover:text-white hover:shadow-md"
                      >
                        Lihat Profil & Jadwal
                      </button>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <Footer />

      {/* =====================================================
          ANIMATION STYLES
      ====================================================== */}

      <style jsx>{`
        /* ==================================================
           HERO BLOBS
           Sangat pelan agar tidak mengganggu reveal
        ================================================== */

        .hero-blob {
          will-change: transform;
        }

        .hero-blob-one {
          animation: heroBlobOne 11s ease-in-out infinite;
        }

        .hero-blob-two {
          animation: heroBlobTwo 13s ease-in-out infinite;
        }

        .hero-blob-three {
          animation: heroBlobThree 10s ease-in-out infinite;
        }

        @keyframes heroBlobOne {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(-10px, 10px, 0);
          }
        }

        @keyframes heroBlobTwo {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(10px, -8px, 0);
          }
        }

        @keyframes heroBlobThree {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(-8px, 8px, 0);
          }
        }

        /* ==================================================
           HERO DOT
        ================================================== */

        .hero-dot {
          animation: heroDotPulse 2.4s ease-in-out infinite;
          will-change: transform, opacity;
        }

        @keyframes heroDotPulse {
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

        /* ==================================================
           SMALL LINE
        ================================================== */

        .hero-line {
          transform-origin: left center;
          animation: heroLine 650ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes heroLine {
          0% {
            opacity: 0;
            transform: scaleX(0);
          }

          100% {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        /* ==================================================
           REDUCED MOTION
        ================================================== */

        @media (prefers-reduced-motion: reduce) {
          .hero-dot,
          .hero-line,
          .hero-blob {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
