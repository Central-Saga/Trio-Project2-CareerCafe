"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useState } from "react";

type Profile = {
  profile_photo?: string | null;
  job_title?: string | null;
  company?: string | null;
};

type Accent =
  | "green"
  | "amber"
  | "blue"
  | "lavender"
  | "teal"
  | "coral"
  | "cream";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const navItems = [
  {
    label: "Dashboard",
    href: "/mentor/dashboard",
    accent: "green" as const,
    icon: <DashboardIcon />,
  },
  {
    label: "Requests",
    href: "/mentor/requests",
    accent: "amber" as const,
    icon: <RequestIcon />,
  },
  {
    label: "Schedule",
    href: "/mentor/schedule",
    accent: "blue" as const,
    icon: <CalendarIcon />,
  },
  {
    label: "Availability",
    href: "/mentor/availability",
    accent: "lavender" as const,
    icon: <ClockIcon />,
  },
  {
    label: "Sessions",
    href: "/mentor/sessions",
    accent: "teal" as const,
    icon: <SessionIcon />,
  },
  {
    label: "Feedback",
    href: "/mentor/feedback",
    accent: "coral" as const,
    icon: <StarIcon />,
  },
];

function resolveImageUrl(value?: string | null) {
  if (!value) {
    return "";
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return `http://127.0.0.1:8000${value}`;
  }

  if (value.startsWith("storage/")) {
    return `http://127.0.0.1:8000/${value}`;
  }

  return `http://127.0.0.1:8000/storage/${value}`;
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "M";
}

export default function MentorLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [mentorName, setMentorName] = useState("Mentor Profesional");

  const [profile, setProfile] = useState<Profile | null>(null);

  const [profileImage, setProfileImage] = useState("");

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem("auth_token") || "";

    if (!token) {
      router.replace("/login");
      return;
    }

    const role = localStorage.getItem("user_role") || "";

    if (role !== "mentor") {
      router.replace("/");
      return;
    }

    const storedName = localStorage.getItem("user_name") || "";

    const storedImage = localStorage.getItem("profile_image") || "";

    if (storedName) {
      setMentorName(storedName);
    }

    if (storedImage) {
      setProfileImage(storedImage);
    }

    try {
      const [meResponse, profileResponse] = await Promise.all([
        fetch(`${API_URL}/me`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_URL}/profile`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const meData = await meResponse.json().catch(() => null);

      const profileData = await profileResponse.json().catch(() => null);

      if (meResponse.ok) {
        const user = meData?.data ?? meData;

        if (user?.name) {
          setMentorName(user.name);
          localStorage.setItem("user_name", user.name);
        }
      }

      if (profileResponse.ok) {
        const resolvedProfile = profileData?.data ?? profileData;

        setProfile(resolvedProfile ?? null);

        if (resolvedProfile?.profile_photo) {
          const image = resolveImageUrl(resolvedProfile.profile_photo);

          setProfileImage(image);

          localStorage.setItem("profile_image", image);
        }
      }
    } catch {
      // Gunakan fallback localStorage.
    } finally {
      setCheckingAuth(false);
    }
  }, [router]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    const saved = localStorage.getItem("mentor_sidebar_collapsed");

    if (saved === "true") {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;

      localStorage.setItem("mentor_sidebar_collapsed", String(next));

      return next;
    });
  };

  const handleLogout = () => {
    [
      "auth_token",
      "token",
      "user_name",
      "user_role",
      "user_email",
      "profile_image",
      "cover_image",
      "user_id",
    ].forEach((key) => {
      localStorage.removeItem(key);
    });

    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/mentor/dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFDFC]">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#1E3F20] text-white shadow-lg">
            {profileImage ? (
              <img
                src={profileImage}
                alt={mentorName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg font-black">
                {getInitial(mentorName)}
              </span>
            )}
          </div>

          <div className="mx-auto mt-5 h-1.5 w-24 overflow-hidden rounded-full bg-[#EAE5DF]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#D8953C]" />
          </div>

          <p className="mt-4 text-xs font-bold text-[#8B8178]">
            Preparing mentor workspace...
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDFC] text-[#2F2722]">
      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#E9E1D8] bg-[#F3EAE0]",
          "transition-[width,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          collapsed ? "w-[78px]" : "w-[238px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* ===================================================
            SIDEBAR TOP
        ==================================================== */}

        <div
          className={[
            "relative shrink-0 border-b border-[#E4D9CE]",
            collapsed ? "px-3 pb-5 pt-5" : "px-4 pb-5 pt-5",
          ].join(" ")}
        >
          {/* COLLAPSE BUTTON */}

          <div
            className={[
              "flex",
              collapsed ? "justify-center" : "justify-end",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={[
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#DFD3C7] bg-white text-[#746A62] shadow-sm transition-all duration-300",
                "hover:-translate-y-0.5 hover:bg-[#FEFCFA] hover:text-[#1E3F20] hover:shadow-md",
                collapsed ? "mr-0" : "mr-0.5",
              ].join(" ")}
            >
              <ChevronIcon direction={collapsed ? "right" : "left"} />
            </button>
          </div>

          {/* PROFILE */}

          <div className={collapsed ? "mt-5" : "mt-6"}>
            <Link
              href="/profile"
              title={collapsed ? mentorName : undefined}
              className="group flex flex-col items-center text-center"
            >
              <div
                className={[
                  "overflow-hidden rounded-full border-[3px] border-white bg-[#1E3F20] text-white shadow-[0_10px_24px_rgba(30,63,32,.17)] transition-all duration-300",
                  "group-hover:scale-105 group-hover:shadow-[0_14px_30px_rgba(30,63,32,.22)]",
                  collapsed ? "h-12 w-12" : "h-[68px] w-[68px]",
                ].join(" ")}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={mentorName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-black">
                    {getInitial(mentorName)}
                  </div>
                )}
              </div>

              {!collapsed && (
                <div className="mt-3 w-full px-1">
                  <p className="truncate text-xs font-black text-[#382E28]">
                    {mentorName}
                  </p>

                  <p className="mt-1 truncate text-[9px] font-semibold text-[#968A80]">
                    {profile?.job_title || "Mentor Professional"}
                  </p>

                  {profile?.company && (
                    <p className="mt-0.5 truncate text-[8px] font-medium text-[#ADA096]">
                      {profile.company}
                    </p>
                  )}
                </div>
              )}
            </Link>
          </div>
        </div>

        {/* ===================================================
            WORKSPACE NAVIGATION
        ==================================================== */}

        <div
          className={[
            "flex-1 overflow-hidden",
            collapsed ? "px-2 py-5" : "px-3 py-5",
          ].join(" ")}
        >
          {!collapsed && (
            <div className="mb-2 px-2 text-[8px] font-black uppercase tracking-[0.2em] text-[#A3988E]">
              Workspace
            </div>
          )}

          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <SidebarLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(item.href)}
                accent={item.accent}
                collapsed={collapsed}
              />
            ))}
          </nav>
        </div>

        {/* ===================================================
            LOGOUT
        ==================================================== */}

        <div
          className={[
            "shrink-0 border-t border-[#E4D9CE]",
            collapsed ? "p-3" : "p-4",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Sign out" : undefined}
            className={[
              "group flex w-full items-center rounded-xl text-[#8E8379] transition-all duration-300 hover:bg-white/80 hover:text-[#B95349]",
              collapsed ? "justify-center p-2" : "gap-3 px-2.5 py-2.5",
            ].join(" ")}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F8F0E8] transition group-hover:bg-[#FBECE8]">
              <LogoutIcon />
            </span>

            {!collapsed && <span className="text-xs font-black">Sign out</span>}
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main
        className={[
          "min-h-screen transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          collapsed ? "lg:pl-[78px]" : "lg:pl-[238px]",
        ].join(" ")}
      >
        {/* ===================================================
            TOPBAR
        ==================================================== */}

        <header className="sticky top-0 z-30 flex h-[72px] items-center border-b border-[#EEE8E2] bg-white/90 px-5 backdrop-blur-xl sm:px-7 lg:px-9">
          <div className="flex items-center gap-3">
            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E7E0D9] bg-white text-[#5D554E] shadow-sm transition-all duration-300 hover:bg-[#F8F5F1] hover:text-[#1E3F20] lg:hidden"
              aria-label="Open navigation"
            >
              <MenuIcon />
            </button>

            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#AAA097]">
                Career Cafe
              </p>

              <p className="mt-0.5 text-sm font-black text-[#302823]">
                Mentor Workspace
              </p>
            </div>
          </div>
        </header>

        {/* PAGE */}

        <div className="min-h-[calc(100vh-72px)]">{children}</div>
      </main>

      {/* =====================================================
          GLOBAL ANIMATIONS
      ====================================================== */}

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        @keyframes mentorFadeUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.992);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes mentorFadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes mentorScaleIn {
          from {
            opacity: 0;
            transform: scale(0.97);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .mentor-reveal {
          animation: mentorFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .mentor-fade {
          animation: mentorFadeIn 0.7s ease-out both;
        }

        .mentor-scale {
          animation: mentorScaleIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .mentor-delay-1 {
          animation-delay: 0.06s;
        }

        .mentor-delay-2 {
          animation-delay: 0.12s;
        }

        .mentor-delay-3 {
          animation-delay: 0.18s;
        }

        .mentor-delay-4 {
          animation-delay: 0.24s;
        }

        ::selection {
          background: rgba(216, 149, 60, 0.22);
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   SIDEBAR LINK
========================================================= */

function SidebarLink({
  href,
  label,
  icon,
  active,
  accent,
  collapsed,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  accent: Accent;
  collapsed: boolean;
}) {
  const accents: Record<
    Accent,
    {
      icon: string;
      active: string;
      inactive: string;
    }
  > = {
    green: {
      icon: active ? "bg-[#1E3F20] text-white" : "bg-[#E6EFE5] text-[#1E3F20]",
      active: "bg-white text-[#1E3F20] shadow-[0_7px_20px_rgba(30,63,32,.08)]",
      inactive: "text-[#766D65] hover:bg-white/70 hover:text-[#302923]",
    },

    amber: {
      icon: active ? "bg-[#D8953C] text-white" : "bg-[#FFF0D4] text-[#B76C19]",
      active:
        "bg-white text-[#9A621B] shadow-[0_7px_20px_rgba(216,149,60,.08)]",
      inactive: "text-[#766D65] hover:bg-white/70 hover:text-[#302923]",
    },

    blue: {
      icon: active ? "bg-[#4577B8] text-white" : "bg-[#E8F1FB] text-[#4577B8]",
      active:
        "bg-white text-[#35679F] shadow-[0_7px_20px_rgba(69,119,184,.08)]",
      inactive: "text-[#766D65] hover:bg-white/70 hover:text-[#302923]",
    },

    lavender: {
      icon: active ? "bg-[#8B6FB5] text-white" : "bg-[#F0E9F8] text-[#7A5CA7]",
      active:
        "bg-white text-[#704E9A] shadow-[0_7px_20px_rgba(139,111,181,.08)]",
      inactive: "text-[#766D65] hover:bg-white/70 hover:text-[#302923]",
    },

    teal: {
      icon: active ? "bg-[#3E8D8B] text-white" : "bg-[#E3F2F1] text-[#377E7D]",
      active:
        "bg-white text-[#327775] shadow-[0_7px_20px_rgba(62,141,139,.08)]",
      inactive: "text-[#766D65] hover:bg-white/70 hover:text-[#302923]",
    },

    coral: {
      icon: active ? "bg-[#D26C61] text-white" : "bg-[#F9E8E4] text-[#BE5D52]",
      active:
        "bg-white text-[#B95349] shadow-[0_7px_20px_rgba(210,108,97,.08)]",
      inactive: "text-[#766D65] hover:bg-white/70 hover:text-[#302923]",
    },

    cream: {
      icon: "bg-[#F6EFE7] text-[#6D675D]",
      active: "bg-white text-[#48443E] shadow-[0_7px_20px_rgba(44,30,22,.05)]",
      inactive: "text-[#766D65] hover:bg-white/70 hover:text-[#302923]",
    },
  };

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={[
        "group flex items-center rounded-[14px] border border-transparent transition-all duration-300",
        collapsed ? "justify-center px-2 py-2" : "gap-2.5 px-2.5 py-2",
        active ? accents[accent].active : accents[accent].inactive,
      ].join(" ")}
    >
      <span
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] transition-all duration-300 group-hover:scale-105",
          accents[accent].icon,
        ].join(" ")}
      >
        {icon}
      </span>

      <span
        className={[
          "whitespace-nowrap text-[11px] font-black transition-all duration-300",
          collapsed
            ? "pointer-events-none w-0 translate-x-[-6px] overflow-hidden opacity-0"
            : "opacity-100",
        ].join(" ")}
      >
        {label}
      </span>

      {!collapsed && active && (
        <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-65" />
      )}
    </Link>
  );
}

/* =========================================================
   ICONS
========================================================= */

function DashboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function RequestIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />

      <path
        d="M3.5 19C4.3 15.7 6.1 14.2 9 14.2C11.9 14.2 13.7 15.7 14.5 19"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M18 8V14M15 11H21"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M7 3V7M17 3V7M3 10H21"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />

      <path
        d="M12 7V12L15.5 14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SessionIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M8 21H16M12 19V21"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3.8L14.48 8.82L20.02 9.63L16.01 13.54L16.96 19.06L12 16.45L7.04 19.06L7.99 13.54L3.98 9.63L9.52 8.82L12 3.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7H20M4 12H20M4 17H20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  const path =
    direction === "left" ? "M14.5 6L8.5 12L14.5 18" : "M9.5 6L15.5 12L9.5 18";

  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
