"use client";

export default function Footer() {
  return (
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
  );
}
