"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== passwordConfirmation) {
      setError("Konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.message || "Terjadi kesalahan saat pendaftaran.";
        if (data.errors) {
          const firstKey = Object.keys(data.errors)[0];
          if (firstKey && data.errors[firstKey][0]) {
            errorMessage = data.errors[firstKey][0];
          }
        }
        throw new Error(errorMessage);
      }

      const userName = data.user?.name || data.name || name || "Pengguna";

      if (data.access_token) {
        localStorage.setItem("auth_token", data.access_token);
      }
      localStorage.setItem("user_name", userName);

      // Langsung pindah halaman tanpa alert() yang jelek
      router.push("/jobs");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#FCFBF8] font-sans text-[#2C1E16] overflow-hidden relative transition-all duration-700">
      {/* SISI KIRI: Gambar Latar Belakang & Informasi */}
      <div
        className="relative hidden lg:flex lg:w-1/2 bg-cover bg-center overflow-hidden items-center"
        style={{ backgroundImage: "url('/image/cafe.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#FCFBF8] via-[#FCFBF8]/80 to-transparent"></div>

        <div className="relative z-10 flex flex-col px-12 xl:px-20 -mt-8 justify-center h-full">
          <div className="-mb-6">
            <img
              src="/image/logo.png"
              alt="Logo Career Cafe"
              className="h-56 w-auto mix-blend-multiply -ml-6"
            />
          </div>

          <h1 className="text-5xl xl:text-6xl font-extrabold text-[#2C1E16] leading-tight mb-6">
            Mulai Perjalanan,
            <br />
            Temukan Mentor,
            <br />
            Gapai Impianmu
          </h1>

          <p className="text-[#2C1E16] text-lg max-w-md mb-10 opacity-80 leading-relaxed">
            Bergabunglah dengan Career Cafe sekarang dan temukan komunitas
            profesional yang siap mendukung pertumbuhan kariermu.
          </p>

          <div className="flex gap-6 xl:gap-10">
            <div className="flex flex-col gap-2">
              <div className="w-10 h-10 bg-[#1E3F20]/10 rounded-full flex items-center justify-center text-[#1E3F20]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v-.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-[#2C1E16]">
                Mentor<br />Profesional
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="w-10 h-10 bg-[#1E3F20]/10 rounded-full flex items-center justify-center text-[#1E3F20]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-[#2C1E16]">
                Sesi Konsultasi<br />Fleksibel
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="w-10 h-10 bg-[#1E3F20]/10 rounded-full flex items-center justify-center text-[#1E3F20]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-[#2C1E16]">
                Dukungan<br />Komunitas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SISI KANAN: Form Register */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center relative p-8 sm:p-12 xl:p-20 bg-white min-h-screen overflow-hidden">
        <div className="absolute top-10 right-10 text-sm hidden sm:block z-10">
          Sudah punya akun?{" "}
          <a href="/login" className="font-bold text-[#1E3F20] hover:underline transition-colors">
            Masuk di sini &rarr;
          </a>
        </div>

        <div className="w-full max-w-md mx-auto relative z-10">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 text-center border border-red-100">
              {error}
            </div>
          )}

          <h2 className="text-3xl font-bold text-[#2C1E16] mb-2">
            Buat Akun Baru
          </h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Daftar sekarang untuk mulai berkonsultasi dengan mentor profesional.
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#2C1E16] mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap Anda"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E3F20]/30 focus:border-[#1E3F20] transition-all bg-white text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2C1E16] mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E3F20]/30 focus:border-[#1E3F20] transition-all bg-white text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2C1E16] mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E3F20]/30 focus:border-[#1E3F20] transition-all bg-white text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2C1E16] mb-1">
                Konfirmasi Password
              </label>
              <input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Masukkan ulang password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E3F20]/30 focus:border-[#1E3F20] transition-all bg-white text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1E3F20] text-white py-3.5 rounded-xl font-bold hover:bg-[#152e17] transition-all duration-300 shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 mt-2 hover:scale-[1.01]"
            >
              {loading ? "Memproses..." : "Daftar Sekarang"}
              {!loading && <span>&rarr;</span>}
            </button>
          </form>

          <div className="my-5 flex items-center justify-center gap-3">
            <span className="h-px w-full bg-gray-200"></span>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              atau
            </span>
            <span className="h-px w-full bg-gray-200"></span>
          </div>

          <button className="w-full bg-white border border-gray-200 text-[#2C1E16] py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-3 text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Lanjut dengan Google
          </button>
        </div>
      </div>
    </div>
  );
}