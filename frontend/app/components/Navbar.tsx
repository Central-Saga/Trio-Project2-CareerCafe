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
    // {
    //   // label: "Schedule",
    //   // href: "/schedule",
    // },
    {
      label: "Schedule-history",
      href: "/schedule-history",
    },
    {
      label: "My Applications",
      href: "/applications",
    },
  ];

  const initial = userName.trim().charAt(0).toUpperCase() || "P";

  return (
    <>
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white">
        <div className="relative mx-auto flex h-[78px] w-full max-w-[1500px] items-center px-8">
          {/* =================================================
              LOGO
          ================================================== */}

          <Link
            href="/"
            className="group shrink-0 text-xl font-extrabold tracking-tight text-[#1E3F20]"
          >
            <span className="transition-colors duration-300 group-hover:text-[#152e17]">
              Career Cafe
            </span>
          </Link>

          {/* =================================================
              DESKTOP CENTER MENU
          ================================================== */}

          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
            <div className="flex items-center gap-8 whitespace-nowrap text-sm font-semibold">
              {menuItems.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative py-1"
                  >
                    <span
                      className={[
                        "transition-colors duration-300",
                        active
                          ? "font-bold text-[#1E3F20]"
                          : "text-gray-600 group-hover:text-[#1E3F20]",
                      ].join(" ")}
                    >
                      {item.label}
                    </span>

                    <span
                      className={[
                        "absolute -bottom-1 left-0 h-[2px] rounded-full bg-[#1E3F20]",
                        "transition-all duration-300 ease-out",
                        active
                          ? "w-full opacity-100"
                          : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100",
                      ].join(" ")}
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================== */}

          <div className="ml-auto flex items-center gap-4">
            {/* =================================================
                BECOME A MENTOR
            ================================================== */}

            <Link
              href="/become-mentor"
              className={[
                "rounded-xl border border-[#1E3F20]",
                "bg-white px-5 py-2.5",
                "text-sm font-bold text-[#1E3F20]",
                "whitespace-nowrap",
                "transition-all duration-300",
                "hover:-translate-y-0.5",
                "hover:bg-[#F4F2ED]",
                "hover:shadow-sm",
              ].join(" ")}
            >
              Become a Mentor
            </Link>

            {/* =================================================
                PROFILE
            ================================================== */}

            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((value) => !value)}
                className={[
                  "flex h-10 w-10 items-center justify-center",
                  "overflow-hidden rounded-full",
                  "bg-[#1E3F20]",
                  "text-sm font-bold text-white shadow-sm",
                  "transition-all duration-300",
                  "hover:scale-105 hover:bg-[#152e17]",
                  "focus:outline-none",
                  "focus:ring-2 focus:ring-[#1E3F20]/30",
                  isProfileOpen ? "scale-105 ring-2 ring-[#1E3F20]/20" : "",
                ].join(" ")}
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

              {/* =================================================
                  PROFILE DROPDOWN
              ================================================== */}

              <div
                className={[
                  "absolute right-0 top-14 z-50 w-72 origin-top-right",
                  "overflow-hidden rounded-2xl",
                  "border border-gray-100 bg-white shadow-xl",
                  "transition-all duration-300 ease-out",
                  isProfileOpen
                    ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none -translate-y-2 scale-95 opacity-0",
                ].join(" ")}
              >
                {/* User Information */}

                <div className="border-b border-gray-100 bg-[#FCFBF8] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1E3F20] text-base font-bold text-white">
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

                {/* Dropdown Menu */}

                <div className="p-2">
                  {/* Profil */}

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push("/profile");
                    }}
                    className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-[#F4F2ED] hover:text-[#1E3F20]"
                  >
                    Profil Saya
                  </button>

                  {/* My Applications */}

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push("/applications");
                    }}
                    className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-[#F4F2ED] hover:text-[#1E3F20]"
                  >
                    My Applications
                  </button>

                  {/* Become a Mentor */}

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push("/become-mentor");
                    }}
                    className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-[#F4F2ED] hover:text-[#1E3F20]"
                  >
                    Become a Mentor
                  </button>

                  {/* Mentor Dashboard */}

                  {userRole === "mentor" && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        router.push("/mentor/dashboard");
                      }}
                      className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-[#F4F2ED] hover:text-[#1E3F20]"
                    >
                      Dashboard Mentor
                    </button>
                  )}

                  {/* Admin Review */}

                  {userRole === "admin" && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        router.push("/admin/mentor-applications");
                      }}
                      className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-[#F4F2ED] hover:text-[#1E3F20]"
                    >
                      Admin Review
                    </button>
                  )}

                  <div className="my-2 h-px bg-gray-100" />

                  {/* Logout */}

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    Keluar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            MOBILE NAVIGATION
        ====================================================== */}

        <div className="border-t border-gray-100 px-6 py-4 lg:hidden">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-semibold">
            {menuItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "font-bold text-[#1E3F20]"
                      : "text-gray-600 hover:text-[#1E3F20]"
                  }
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Become a Mentor */}

            <Link href="/become-mentor" className="font-bold text-[#1E3F20]">
              Become a Mentor
            </Link>
          </div>
        </div>
      </nav>

      {/* =====================================================
          LOGOUT MODAL
      ====================================================== */}

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="px-6 pb-2 pt-7 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 5H6C4.89543 5 4 5.89543 4 7V17C4 18.1046 4.89543 19 6 19H10"
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

              <h2 className="text-xl font-extrabold text-[#2C1E16]">
                Keluar dari akun?
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Kamu akan keluar dari akun Career Cafe dan perlu login kembali
                untuk mengakses akunmu.
              </p>
            </div>

            <div className="flex gap-3 px-6 pb-6 pt-6">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition-all duration-300 hover:bg-gray-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 rounded-xl bg-[#1E3F20] px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152e17]"
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
