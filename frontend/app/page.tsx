"use client";

import { useRouter } from "next/navigation";
import Navbar from "./components/Navbar";

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

export default function HomePage() {
  const router = useRouter();

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

  /*
   * GAMBAR HERO
   *
   * Semua URL di bawah menggunakan sumber gambar langsung,
   * bukan images.openai.com yang sebelumnya menyebabkan gambar kosong.
   */
  const heroImages = {
    // Konsultasi di coffee shop
    consultation:
      "https://48603975.fs1.hubspotusercontent-na1.net/hubfs/48603975/AI-Generated%20Media/Images/Cozy%20Coffee%20Shop%20Conversation%20with%20Warm%20Lighting-1.png",

    // Mentor dan mentee sedang berdiskusi
    mentor:
      "https://s3.eu-north-1.amazonaws.com/cdn-site.mediaplanet.com/app/uploads/sites/114/2025/10/23100920/vicky-1761228546-GettyImages-1731803248-576x486.jpg",

    // Kolaborasi / community
    collaboration:
      "https://insight.atlas-mapping.com/hubfs/AI-Generated%20Media/Images/Two%20professionals%20working%20in%20the%20agency%20industry%20collaborating%20on%20some%20work%20in%20a%20casual%20space%20such%20as%20a%20coffee%20shop.jpeg",

    // Foto tambahan untuk avatar kecil
    career:
      "https://imageio.forbes.com/specials-images/imageserve/69bc23ff65045f051f753e12/0x0.jpg?fit=bounds&format=jpg&height=900&width=1600",
  };

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
      {/* =========================
          NAVBAR
      ========================== */}
      <Navbar />

      {/* =========================
          HERO SECTION
      ========================== */}
      <section className="relative w-full overflow-hidden bg-[#F4EFE8]">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-[#DCE6D8]/60 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[30rem] w-[30rem] rounded-full bg-[#E8D8C7]/50 blur-3xl" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:px-8 md:py-14 lg:py-16">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
            {/* =====================
                LEFT CONTENT
            ====================== */}
            <div className="lg:col-span-6">
              {/* Badge */}
              <div className="mb-5 inline-flex items-center gap-2 px-0 py-2 text-xs font-bold text-[#6B6259]">
                <span className="h-2 w-2 rounded-full bg-[#1E3F20]" />

                <span>Career growth starts with the right conversation</span>
              </div>

              {/* Heading */}
              <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight text-[#2C1E16] sm:text-5xl lg:text-6xl">
                Your Career Journey,
                <span className="block text-[#1E3F20]">Better Together</span>
              </h1>

              {/* Description */}
              <p className="mt-6 max-w-xl text-sm leading-7 text-[#6B6259] sm:text-base lg:text-lg">
                Dapatkan bimbingan langsung dari mentor berpengalaman, perluas
                jaringan profesional, dan temukan peluang karier terbaikmu di
                Career Cafe.
              </p>

              {/* Buttons */}
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
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[#D7CEC1] bg-white px-7 py-3.5 text-sm font-bold text-[#2C1E16] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F8F5F0]"
                >
                  Pelajari Dulu
                </button>
              </div>

              {/* Supported */}
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
            </div>

            {/* =====================
                RIGHT PHOTO AREA
            ====================== */}
            <div className="lg:col-span-6">
              {/* PHOTO COLLAGE */}
              <div className="grid grid-cols-2 gap-4">
                {/* =====================
                    MAIN CONSULTATION
                ====================== */}
                <button
                  type="button"
                  onClick={() => router.push("/mentors")}
                  className="group relative row-span-2 min-h-[430px] cursor-pointer overflow-hidden rounded-[2rem] bg-gray-200 text-left shadow-xl"
                >
                  <img
                    src={heroImages.consultation}
                    alt="Konsultasi karier di Career Cafe"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                  <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="max-w-sm text-xl font-extrabold leading-tight text-white sm:text-2xl">
                      Temukan arah karier yang
                      <span className="block text-white/80">
                        sesuai dengan potensimu.
                      </span>
                    </h3>
                  </div>

                  {/* Hover arrow */}
                  <span className="absolute right-5 top-5 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-[#1E3F20] opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    →
                  </span>
                </button>

                {/* =====================
                    MENTOR
                ====================== */}
                <button
                  type="button"
                  onClick={() => router.push("/mentors/1")}
                  className="group relative min-h-[205px] cursor-pointer overflow-hidden rounded-[2rem] bg-gray-200 text-left shadow-lg"
                >
                  <img
                    src={heroImages.mentor}
                    alt="Mentor profesional"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
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

                {/* =====================
                    COMMUNITY
                ====================== */}
                <button
                  type="button"
                  onClick={() => router.push("/community")}
                  className="group relative min-h-[205px] cursor-pointer overflow-hidden rounded-[2rem] bg-gray-200 text-left shadow-lg"
                >
                  <img
                    src={heroImages.collaboration}
                    alt="Komunitas dan kolaborasi"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
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
              </div>

              {/* =========================
                  BELAJAR BERSAMA MENTOR
                  DI BAWAH FOTO
                  TANPA PANAH
              ========================== */}
              <button
                type="button"
                onClick={() => router.push("/mentors")}
                className="group mt-5 ml-auto flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-white/70 bg-white px-5 py-4 text-left shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:max-w-[520px]"
              >
                {/* Avatar */}
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

                {/* Text */}
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
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          JOB SECTION
      ========================== */}
      <main className="mx-auto max-w-7xl px-6 py-12 md:px-8">
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

            <button
              type="button"
              onClick={() => router.push("/jobs")}
              className="cursor-pointer text-sm font-bold text-[#1E3F20] transition hover:translate-x-1"
            >
              Lihat Semua →
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {jobListings.map((job) => (
              <article
                key={job.id}
                className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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

                  <h3 className="text-lg font-bold text-[#2C1E16]">
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
                    className="cursor-pointer rounded-xl bg-[#1E3F20] px-4 py-2 text-xs font-bold text-white transition-all hover:bg-[#152e17]"
                  >
                    Lihat Detail
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* =========================
            MENTOR SECTION
        ========================== */}
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

            <button
              type="button"
              onClick={() => router.push("/mentors")}
              className="cursor-pointer text-sm font-bold text-[#1E3F20] transition hover:translate-x-1"
            >
              Lihat Semua →
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {mentors.map((mentor) => (
              <article
                key={mentor.id}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-gray-200">
                  <img
                    src={mentor.image}
                    alt={mentor.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#2C1E16] shadow-sm backdrop-blur-sm">
                    ★ {mentor.rating}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="line-clamp-1 text-lg font-bold text-[#2C1E16]">
                    {mentor.name}
                  </h3>

                  <p className="mt-1 text-xs font-semibold text-[#1E3F20]">
                    {mentor.role}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">{mentor.company}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {mentor.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(`/mentors/${mentor.id}`)}
                    className="mt-5 w-full cursor-pointer rounded-xl border border-[#1E3F20] bg-white py-2.5 text-xs font-bold text-[#1E3F20] transition-all hover:bg-[#1E3F20] hover:text-white"
                  >
                    Lihat Profil & Jadwal
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* =========================
          FOOTER
      ========================== */}
      <footer className="mt-16 border-t border-[#E9E3D7] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-gray-500 md:flex-row md:items-center md:justify-between md:px-8">
          <p>© 2026 Career Cafe. All rights reserved.</p>

          <div className="flex flex-wrap gap-5">
            <span className="cursor-pointer hover:text-[#1E3F20]">
              Tentang Kami
            </span>

            <span className="cursor-pointer hover:text-[#1E3F20]">Bantuan</span>

            <span className="cursor-pointer hover:text-[#1E3F20]">
              Kebijakan Privasi
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
