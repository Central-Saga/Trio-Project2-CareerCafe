"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MentorsPage() {
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
        localStorage.removeItem("user_role");
        router.push("/login");
    };

    // Data daftar mentor profesional
    const mentors = [
        {
            id: 1,
            name: "Rian Pratama, S.Kom.",
            role: "Senior Fullstack Engineer",
            company: "TechBali Denpasar",
            rating: "4.9",
            reviews: 120,
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
            expertise: ["Laravel", "Next.js", "PostgreSQL"],
        },
        {
            id: 2,
            name: "Putu Ayu Lestari",
            role: "Lead UI/UX Designer",
            company: "KriyaBali Digital",
            rating: "5.0",
            reviews: 95,
            image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
            expertise: ["Figma", "User Research", "Design Systems"],
        },
        {
            id: 3,
            name: "Gede Hendra Kusuma",
            role: "Product Manager & Mentor",
            company: "Career Cafe Corp",
            rating: "4.8",
            reviews: 110,
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
            expertise: ["Product Strategy", "Agile", "Business Canvas"],
        },
        {
            id: 4,
            name: "Komang Sinta Dewi",
            role: "Digital Marketing Specialist",
            company: "Bali Creative Hub",
            rating: "4.9",
            reviews: 88,
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
            expertise: ["Social Media", "SEO", "Content Marketing"],
        },
    ];

    return (
        <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
            {/* NAVBAR */}
            <nav className="bg-white border-b border-gray-100 px-8 py-3.5 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center">
                    <span className="font-extrabold text-xl text-[#1E3F20] tracking-tight">
                        Career Cafe
                    </span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600 absolute left-1/2 -translate-x-1/2">
                    <a href="/jobs" className="hover:text-[#1E3F20] transition-colors">Home</a>
                    <a href="/mentors" className="text-[#1E3F20]">Mentor</a>
                    <a href="#" className="hover:text-[#1E3F20] transition-colors">Community</a>
                    <a href="#" className="hover:text-[#1E3F20] transition-colors">Schedule</a>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 p-1 rounded-full shadow-sm">
                        <div className="w-7 h-7 bg-[#1E3F20] text-white rounded-full flex items-center justify-center font-bold text-xs" title={userName}>
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
                <div className="mb-10 text-center max-w-2xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2C1E16] mb-3">
                        Temukan Mentor Profesionalmu
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Pilih mentor berpengalaman di bidangnya untuk mendiskusikan portofolio, persiapan wawancara, dan pengembangan karier.
                    </p>
                </div>

                {/* GRID DAFTAR MENTOR */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {mentors.map((mentor) => (
                        <div key={mentor.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                            <div>
                                <div className="h-52 bg-gray-200 bg-cover bg-center relative" style={{ backgroundImage: `url('${mentor.image}')` }}>
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-[#2C1E16] shadow-sm flex items-center gap-1">
                                        <span>★</span> {mentor.rating} <span className="text-gray-400 font-normal">({mentor.reviews})</span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-[#2C1E16] text-lg mb-0.5">{mentor.name}</h3>
                                    <p className="text-xs font-semibold text-[#1E3F20] mb-1">{mentor.role}</p>
                                    <p className="text-xs text-gray-500 mb-4">{mentor.company}</p>

                                    <div className="flex flex-wrap gap-1.5 mb-5">
                                        {mentor.expertise.map((skill, index) => (
                                            <span key={index} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 pt-0">
                                <button
                                    onClick={() => router.push(`/mentors/${mentor.id}`)}
                                    className="w-full bg-[#1E3F20] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#152e17] transition-all shadow-sm"
                                >
                                    Lihat Profil & Jadwal
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}