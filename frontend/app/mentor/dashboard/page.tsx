"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MentorDashboardPage() {
    const router = useRouter();
    const [mentorName, setMentorName] = useState("Mentor Profesional");

    useEffect(() => {
        // Bisa disesuaikan dengan data login mentor yang tersimpan
        const storedName = localStorage.getItem("user_name");
        if (storedName) {
            setMentorName(storedName);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_name");
        router.push("/login");
    };

    // Data tiruan sesi konsultasi mentee yang masuk ke mentor
    const [sessions, setSessions] = useState([
        {
            id: 1,
            menteeName: "I Nyoman Trio",
            topic: "Konsultasi Portofolio Frontend & Next.js",
            schedule: "25 September 2026, 14:00 WITA",
            status: "Menunggu Konfirmasi",
        },
        {
            id: 2,
            menteeName: "Putu Dian",
            topic: "Bedah CV & Persiapan Interview Kerja",
            schedule: "26 September 2026, 10:00 WITA",
            status: "Disetujui",
        },
    ]);

    const handleAccept = (id: number) => {
        setSessions(sessions.map(s => s.id === id ? { ...s, status: "Disetujui" } : s));
    };

    const handleReject = (id: number) => {
        setSessions(sessions.map(s => s.id === id ? { ...s, status: "Ditolak" } : s));
    };

    return (
        <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
            {/* NAVBAR MENTOR */}
            <nav className="bg-white border-b border-gray-100 px-8 py-3.5 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center">
                    <span className="font-extrabold text-xl text-[#1E3F20] tracking-tight">
                        Career Cafe <span className="text-xs bg-[#1E3F20]/10 text-[#1E3F20] px-2 py-0.5 rounded-md ml-2">Panel Mentor</span>
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 p-1 rounded-full shadow-sm">
                        <div className="w-7 h-7 bg-[#1E3F20] text-white rounded-full flex items-center justify-center font-bold text-xs">
                            {mentorName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-[#2C1E16] px-1">{mentorName}</span>
                        <button
                            onClick={handleLogout}
                            className="text-xs font-bold text-red-600 hover:text-red-700 px-2 py-0.5 transition-colors border-l border-gray-200"
                        >
                            Keluar
                        </button>
                    </div>
                </div>
            </nav>

            {/* KONTEN UTAMA DASHBOARD MENTOR */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Banner Sapaan */}
                <div className="bg-[#1E3F20] text-white rounded-3xl p-8 mb-10 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold mb-2">Selamat Datang, {mentorName}!</h1>
                        <p className="text-gray-200 text-sm max-w-xl">
                            Kelola jadwal bimbingan dan bantu para mentee meraih karier impian mereka langsung dari panel profesional Anda.
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center">
                        <span className="block text-2xl font-extrabold">14 Sesi</span>
                        <span className="text-xs text-gray-200">Total Bimbingan Bulan Ini</span>
                    </div>
                </div>

                {/* Tabel Daftar Sesi Mentee */}
                <section className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-[#2C1E16]">Permintaan & Jadwal Sesi Mentee</h2>
                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                            {sessions.length} Jadwal Aktif
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="py-3 px-4">Nama Mentee</th>
                                    <th className="py-3 px-4">Topik Konsultasi</th>
                                    <th className="py-3 px-4">Waktu Jadwal</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {sessions.map((session) => (
                                    <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-4 font-bold text-[#2C1E16]">{session.menteeName}</td>
                                        <td className="py-4 px-4 text-gray-600">{session.topic}</td>
                                        <td className="py-4 px-4 text-gray-500 text-xs">{session.schedule}</td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${session.status === "Disetujui"
                                                    ? "bg-green-100 text-green-700"
                                                    : session.status === "Ditolak"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                {session.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            {session.status === "Menunggu Konfirmasi" ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleAccept(session.id)}
                                                        className="bg-[#1E3F20] text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-[#152e17] transition-all"
                                                    >
                                                        Terima
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(session.id)}
                                                        className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-red-100 transition-all"
                                                    >
                                                        Tolak
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 font-medium">Selesai / Terproses</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}