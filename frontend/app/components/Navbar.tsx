"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [userName, setUserName] = useState("Pengguna");
  const [userRole, setUserRole] = useState("mentee");
  const [profileImage, setProfileImage] = useState("");

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUserData = () => {
      const storedName = localStorage.getItem("user_name") || "Pengguna";

      const storedRole = localStorage.getItem("user_role") || "mentee";

      const storedProfileImage = localStorage.getItem("profile_image") || "";

      setUserName(storedName);
      setUserRole(storedRole);
      setProfileImage(storedProfileImage);
    };

    loadUserData();

    window.addEventListener("storage", loadUserData);

    return () => {
      window.removeEventListener("storage", loadUserData);
    };
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOpenLogoutModal = () => {
    setIsProfileOpen(false);
    setIsLogoutModalOpen(true);
  };

  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_email");
    localStorage.removeItem("profile_image");
    localStorage.removeItem("cover_image");

    setIsLogoutModalOpen(false);
    setIsProfileOpen(false);

    router.push("/login");
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Mentor",
      href: "/mentors",
    },
    {
      label: "Jobs",
      href: "/jobs",
    },
    {
      label: "Community",
      href: "/community",
    },
    {
      label: "Schedule",
      href: "/schedule",
    },
  ];

  const initial = userName.trim().charAt(0).toUpperCase() || "P";

  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 md:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-extrabold tracking-tight text-[#1E3F20]"
        >
          Career Cafe
        </Link>

        {/* Desktop menu */}
        <div className="hidden items-center gap-8 text-sm font-semibold text-gray-600 md:flex">
          {menuItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  active
                    ? "font-bold text-[#1E3F20]"
                    : "text-gray-600 hover:text-[#1E3F20]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((value) => !value)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#1E3F20] text-sm font-bold text-white shadow-sm transition-all hover:scale-105 hover:bg-[#152e17] focus:outline-none focus:ring-2 focus:ring-[#1E3F20]/30"
            aria-label="Buka menu profil"
            aria-expanded={isProfileOpen}
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Foto profil"
                className="h-full w-full object-cover"
              />
            ) : (
              initial
            )}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-14 w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
              {/* User info */}
              <div className="border-b border-gray-100 bg-[#FCFBF8] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1E3F20] text-base font-bold text-white">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Foto profil"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initial
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-bold text-[#2C1E16]">
                      {userName}
                    </p>

                    <p className="mt-0.5 truncate text-xs capitalize text-gray-500">
                      {userRole}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu */}
              <div className="p-2">
                {/* Profil */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push("/profile");
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-[#F7F4EC] hover:text-[#1E3F20]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8E2D4] text-[#1E3F20]">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />

                      <path
                        d="M4.5 20C5.5 16.5 8.1 14.5 12 14.5C15.9 14.5 18.5 16.5 19.5 20"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>

                  <span>Profil</span>
                </button>

                {/* Keluar */}
                <button
                  type="button"
                  onClick={handleOpenLogoutModal}
                  className="mt-1 flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-[#F7F4EC] hover:text-[#1E3F20]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1EDE5] text-[#6B6259]">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 5H6C5.44772 5 5 5.44772 5 5.5V18.5C5 19.0523 5.44772 19.5 5.5 19.5H10"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <path
                        d="M14 8L18 12L14 16"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M18 12H9"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>

                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-6 backdrop-blur-[2px]"
          onClick={handleCancelLogout}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            aria-describedby="logout-description"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl md:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0E8] text-[#1E3F20]">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 5H6C5.44772 5 5 5.44772 5 5.5V18.5C5 19.0523 5.44772 19.5 5.5 19.5H10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                <path
                  d="M14 8L18 12L14 16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M18 12H9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Title */}
            <h2
              id="logout-title"
              className="mt-5 text-2xl font-extrabold text-[#2C1E16]"
            >
              Konfirmasi Keluar
            </h2>

            {/* Description */}
            <p
              id="logout-description"
              className="mt-2 text-sm leading-6 text-gray-500"
            >
              Apakah kamu yakin ingin keluar dari akun Career Cafe?
            </p>

            {/* Buttons */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCancelLogout}
                className="cursor-pointer rounded-xl border border-[#DDD7CA] bg-white px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-[#F8F6F1]"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="cursor-pointer rounded-xl bg-[#1E3F20] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#152e17]"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
