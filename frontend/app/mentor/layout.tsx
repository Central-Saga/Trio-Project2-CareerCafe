"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Profile = {
  profile_photo?: string | null;
  job_title?: string | null;
  company?: string | null;
};

type NotificationKind = "pending" | "approved" | "cancelled" | "completed";

type MentorSessionNotification = {
  id: number;
  status: string;
  topic?: string | null;
  mentee?: {
    name?: string | null;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type MentorNotification = {
  key: string;
  sessionId: number;
  kind: NotificationKind;
  title: string;
  description: string;
  href: string;
  timestamp?: string | null;
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

const BACKEND_URL = API_URL.replace(/\/api$/, "");

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

/* =========================================================
   HELPERS
========================================================= */

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
    return `${BACKEND_URL}${value}`;
  }

  if (value.startsWith("storage/")) {
    return `${BACKEND_URL}/${value}`;
  }

  return `${BACKEND_URL}/storage/${value}`;
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "M";
}

function getNotificationKey(session: MentorSessionNotification): string | null {
  const status = String(session.status || "").toLowerCase();

  if (
    !(["pending", "approved", "cancelled", "completed"] as string[]).includes(
      status,
    )
  ) {
    return null;
  }

  return `session-${session.id}-${status}`;
}

function isMentorSessionNotification(
  value: unknown,
): value is MentorSessionNotification {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;

  return typeof item.id === "number" && typeof item.status === "string";
}

/* =========================================================
   LAYOUT
========================================================= */

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
  const [logoutOpen, setLogoutOpen] = useState(false);

  const [mentorName, setMentorName] = useState("Mentor Professional");

  const [profile, setProfile] = useState<Profile | null>(null);

  /*
   * Foto sekarang murni berasal dari backend.
   * Tidak lagi memakai localStorage profile_image.
   */
  const [profileImage, setProfileImage] = useState("");

  const [notificationSessions, setNotificationSessions] = useState<
    MentorSessionNotification[]
  >([]);

  const [notificationOpen, setNotificationOpen] = useState(false);

  const [readNotificationKeys, setReadNotificationKeys] = useState<string[]>(
    [],
  );

  const notificationRef = useRef<HTMLDivElement | null>(null);
  const hasNotificationPollStarted = useRef(false);

  /* =========================================================
     LOAD NOTIFICATIONS
  ========================================================= */

  const loadNotifications = useCallback(async () => {
    const token = localStorage.getItem("auth_token") || "";

    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/sessions?per_page=100`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data: unknown = await response.json().catch(() => null);

      const raw =
        data && typeof data === "object" && "data" in data
          ? (data as { data?: unknown }).data
          : data;

      let candidates: unknown[] = [];

      if (Array.isArray(raw)) {
        candidates = raw;
      } else if (raw && typeof raw === "object" && "data" in raw) {
        const nested = (raw as { data?: unknown }).data;

        candidates = Array.isArray(nested) ? nested : [];
      }

      const list = candidates.filter(isMentorSessionNotification);

      setNotificationSessions(list);

      if (!hasNotificationPollStarted.current) {
        const initialReadKeys: string[] = list
          .filter(
            (item: MentorSessionNotification) =>
              String(item.status || "").toLowerCase() !== "pending",
          )
          .map((item: MentorSessionNotification) => getNotificationKey(item))
          .filter(
            (key: string | null): key is string =>
              key !== null && key.length > 0,
          );

        setReadNotificationKeys((current) => {
          const next = Array.from(
            new Set<string>([...current, ...initialReadKeys]),
          ).slice(-100);

          localStorage.setItem(
            "mentor_read_notification_keys",
            JSON.stringify(next),
          );

          return next;
        });

        hasNotificationPollStarted.current = true;
      }
    } catch {
      // Notification error tidak mengganggu workspace.
    }
  }, []);

  /* =========================================================
     LOAD READ NOTIFICATIONS
  ========================================================= */

  useEffect(() => {
    try {
      const savedRaw =
        localStorage.getItem("mentor_read_notification_keys") || "[]";

      const savedUnknown: unknown = JSON.parse(savedRaw);

      if (Array.isArray(savedUnknown)) {
        const saved = savedUnknown.filter(
          (item: unknown): item is string => typeof item === "string",
        );

        setReadNotificationKeys(saved);
      }
    } catch {
      setReadNotificationKeys([]);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 20000);

    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  /* =========================================================
     CLOSE NOTIFICATION OUTSIDE
  ========================================================= */

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (!notificationRef.current?.contains(target)) {
        setNotificationOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /* =========================================================
     NOTIFICATION DATA
  ========================================================= */

  const notifications = useMemo<MentorNotification[]>(() => {
    const build = (
      session: MentorSessionNotification,
    ): MentorNotification | null => {
      const status = String(session.status || "").toLowerCase();

      const menteeName = session.mentee?.name || "Mentee";

      const topic = session.topic || "sesi mentoring";

      const timestamp = session.updated_at || session.created_at || null;

      if (status === "pending") {
        return {
          key: `session-${session.id}-pending`,
          sessionId: session.id,
          kind: "pending",
          title: "Permintaan mentoring baru",
          description: `${menteeName} mengajukan ${topic}.`,
          href: "/mentor/requests",
          timestamp,
        };
      }

      if (status === "approved") {
        return {
          key: `session-${session.id}-approved`,
          sessionId: session.id,
          kind: "approved",
          title: "Sesi disetujui",
          description: `Sesi dengan ${menteeName} sudah disetujui.`,
          href: "/mentor/schedule",
          timestamp,
        };
      }

      if (status === "cancelled") {
        return {
          key: `session-${session.id}-cancelled`,
          sessionId: session.id,
          kind: "cancelled",
          title: "Sesi dibatalkan",
          description: `Sesi dengan ${menteeName} telah dibatalkan.`,
          href: "/mentor/schedule",
          timestamp,
        };
      }

      if (status === "completed") {
        return {
          key: `session-${session.id}-completed`,
          sessionId: session.id,
          kind: "completed",
          title: "Sesi selesai",
          description: `Sesi dengan ${menteeName} telah selesai.`,
          href: "/mentor/sessions",
          timestamp,
        };
      }

      return null;
    };

    return notificationSessions
      .map((item) => build(item))
      .filter(
        (item: MentorNotification | null): item is MentorNotification =>
          item !== null,
      )
      .sort((a: MentorNotification, b: MentorNotification) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;

        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;

        return timeB - timeA;
      })
      .slice(0, 8);
  }, [notificationSessions]);

  const unreadNotifications = useMemo<MentorNotification[]>(() => {
    return notifications.filter(
      (item) => !readNotificationKeys.includes(item.key),
    );
  }, [notifications, readNotificationKeys]);

  const markNotificationRead = (key: string) => {
    setReadNotificationKeys((current: string[]) => {
      if (current.includes(key)) {
        return current;
      }

      const next = [...current, key].slice(-100);

      localStorage.setItem(
        "mentor_read_notification_keys",
        JSON.stringify(next),
      );

      return next;
    });
  };

  const markAllNotificationsRead = () => {
    const next = Array.from(
      new Set<string>([
        ...readNotificationKeys,
        ...notifications.map((item) => item.key),
      ]),
    ).slice(-100);

    setReadNotificationKeys(next);

    localStorage.setItem("mentor_read_notification_keys", JSON.stringify(next));
  };

  const handleNotificationClick = (notification: MentorNotification) => {
    markNotificationRead(notification.key);
    setNotificationOpen(false);
    router.push(notification.href);
  };

  const notificationTime = (value?: string | null) => {
    if (!value) {
      return "Baru saja";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Baru saja";
    }

    const diff = Math.max(0, Date.now() - date.getTime());

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
      return "Baru saja";
    }

    if (minutes < 60) {
      return `${minutes} mnt lalu`;
    }

    if (hours < 24) {
      return `${hours} jam lalu`;
    }

    if (days < 7) {
      return `${days} hari lalu`;
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
    }).format(date);
  };

  /* =========================================================
     LOAD MENTOR PROFILE
  ========================================================= */

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

    if (storedName) {
      setMentorName(storedName);
    }

    try {
      const [meResponse, profileResponse] = await Promise.all([
        fetch(`${API_URL}/me`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }),

        fetch(`${API_URL}/profile`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }),
      ]);

      const meData: unknown = await meResponse.json().catch(() => null);

      const profileData: unknown = await profileResponse
        .json()
        .catch(() => null);

      /* -------------------------------------------------------
         USER
      ------------------------------------------------------- */

      if (meResponse.ok) {
        const user =
          meData && typeof meData === "object" && "data" in meData
            ? (meData as { data?: unknown }).data
            : meData;

        if (
          user &&
          typeof user === "object" &&
          "name" in user &&
          typeof (user as { name?: unknown }).name === "string"
        ) {
          const name = (user as { name: string }).name;

          setMentorName(name);

          localStorage.setItem("user_name", name);
        }
      }

      /* -------------------------------------------------------
         PROFILE

         Backend:
         data.profile.profile_photo
      ------------------------------------------------------- */

      if (profileResponse.ok) {
        const resolvedData =
          profileData &&
          typeof profileData === "object" &&
          "data" in profileData
            ? (profileData as { data?: unknown }).data
            : profileData;

        if (resolvedData && typeof resolvedData === "object") {
          const profileEnvelope = resolvedData as {
            name?: string | null;
            profile?: Profile | null;
          };

          const nextProfile = profileEnvelope.profile ?? null;

          setProfile(nextProfile);

          /*
           * Sumber foto hanya backend.
           * Tidak menyimpan profile_image lagi.
           */
          if (nextProfile?.profile_photo) {
            setProfileImage(resolveImageUrl(nextProfile.profile_photo));
          } else {
            setProfileImage("");
          }

          if (profileEnvelope.name) {
            setMentorName(profileEnvelope.name);

            localStorage.setItem("user_name", profileEnvelope.name);
          }
        } else {
          setProfile(null);
          setProfileImage("");
        }
      }
    } catch {
      // Gunakan state yang sudah tersedia.
    } finally {
      setCheckingAuth(false);
    }
  }, [router]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  /*
   * Penting:
   * Mentor Profile mengirim event setelah foto/profil disimpan.
   * Layout langsung membaca ulang dari backend.
   */
  useEffect(() => {
    const handleProfileUpdated = () => {
      void loadProfile();
    };

    window.addEventListener("mentor-profile-updated", handleProfileUpdated);

    return () => {
      window.removeEventListener(
        "mentor-profile-updated",
        handleProfileUpdated,
      );
    };
  }, [loadProfile]);

  /* =========================================================
     SIDEBAR
  ========================================================= */

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
    setCollapsed((current: boolean) => {
      const next = !current;

      localStorage.setItem("mentor_sidebar_collapsed", String(next));

      return next;
    });
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const performLogout = () => {
    [
      "auth_token",
      "token",
      "user_name",
      "user_role",
      "user_email",
      "user_id",
    ].forEach((key: string) => {
      localStorage.removeItem(key);
    });

    /*
     * Tidak ada profile_image yang dihapus karena
     * foto mentor tidak lagi disimpan di localStorage.
     *
     * Foto tetap aman di backend/database.
     */

    router.push("/login");
  };

  const handleLogout = () => {
    setLogoutOpen(true);
  };

  const cancelLogout = () => {
    setLogoutOpen(false);
  };

  const confirmLogout = () => {
    setLogoutOpen(false);
    performLogout();
  };

  const isActive = (href: string) => {
    if (href === "/mentor/dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  /* =========================================================
     AUTH LOADING
  ========================================================= */

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FCF8]">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#1B5E20] text-white shadow-lg">
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

          <div className="mx-auto mt-5 h-1.5 w-24 overflow-hidden rounded-full bg-[#E6EFE6]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#4CAF50]" />
          </div>

          <p className="mt-4 text-xs font-bold text-[#66806A]">
            Preparing mentor workspace...
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FCF8] text-[#243B27]">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#DCEBDD] bg-[#E6F4EA]",
          "transition-[width,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          collapsed ? "w-[78px]" : "w-[238px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div
          className={[
            "relative shrink-0 border-b border-[#CBE6C8]",
            collapsed ? "px-3 pb-5 pt-5" : "px-4 pb-5 pt-5",
          ].join(" ")}
        >
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
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#B9D8B6] bg-white text-[#5C6F5F] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F8FCF8] hover:text-[#1B5E20] hover:shadow-md"
            >
              <ChevronIcon direction={collapsed ? "right" : "left"} />
            </button>
          </div>

          <div className={collapsed ? "mt-5" : "mt-6"}>
            <Link
              href="/mentor/profile"
              title={collapsed ? mentorName : undefined}
              className="group flex flex-col items-center text-center"
            >
              <div
                className={[
                  "overflow-hidden rounded-full border-[3px] border-white bg-[#1B5E20] text-white shadow-[0_10px_24px_rgba(27,94,32,.17)] transition-all duration-300",
                  "group-hover:scale-105 group-hover:shadow-[0_14px_30px_rgba(27,94,32,.22)]",
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
                  <p className="truncate text-xs font-black text-[#243A27]">
                    {mentorName}
                  </p>

                  <p className="mt-1 truncate text-[9px] font-semibold text-[#7D9580]">
                    {profile?.job_title || "Mentor Professional"}
                  </p>

                  {profile?.company && (
                    <p className="mt-0.5 truncate text-[8px] font-medium text-[#9AB19D]">
                      {profile.company}
                    </p>
                  )}
                </div>
              )}
            </Link>
          </div>
        </div>

        <div
          className={[
            "flex-1 overflow-hidden",
            collapsed ? "px-2 py-5" : "px-3 py-5",
          ].join(" ")}
        >
          {!collapsed && (
            <div className="mb-2 px-2 text-[8px] font-black uppercase tracking-[0.2em] text-[#91A794]">
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

        <div
          className={[
            "shrink-0 border-t border-[#CBE6C8]",
            collapsed ? "p-3" : "p-4",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Sign out" : undefined}
            className={[
              "group flex w-full items-center rounded-xl text-[#708873] transition-all duration-300 hover:bg-white/80 hover:text-[#3E7A46]",
              collapsed ? "justify-center p-2" : "gap-3 px-2.5 py-2.5",
            ].join(" ")}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF3E9] transition group-hover:bg-[#E6F4EA]">
              <LogoutIcon />
            </span>

            {!collapsed && <span className="text-xs font-black">Sign out</span>}
          </button>
        </div>
      </aside>

      <main
        className={[
          "min-h-screen transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          collapsed ? "lg:pl-[78px]" : "lg:pl-[238px]",
        ].join(" ")}
      >
        <header className="sticky top-0 z-30 flex h-[72px] items-center border-b border-[#E2ECE3] bg-white/90 px-5 backdrop-blur-xl sm:px-7 lg:px-9">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#DCE7DD] bg-white text-[#536857] shadow-sm transition-all duration-300 hover:bg-[#EFF7EF] hover:text-[#1B5E20] lg:hidden"
              aria-label="Open navigation"
            >
              <MenuIcon />
            </button>

            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#8FA194]">
                Career Cafe
              </p>

              <p className="mt-0.5 text-sm font-black text-[#263B29]">
                Mentor Workspace
              </p>
            </div>
          </div>

          <div className="relative ml-auto" ref={notificationRef}>
            <button
              type="button"
              onClick={() =>
                setNotificationOpen((current: boolean) => !current)
              }
              aria-label={
                unreadNotifications.length > 0
                  ? `Buka notifikasi, ${unreadNotifications.length} belum dibaca`
                  : "Buka notifikasi"
              }
              aria-expanded={notificationOpen}
              className={[
                "group relative flex h-10 w-10 items-center justify-center rounded-full text-[#617564] transition-all duration-300",
                notificationOpen
                  ? "bg-[#E6F4EA] text-[#1B5E20]"
                  : "hover:bg-[#F0F7F0] hover:text-[#1B5E20]",
              ].join(" ")}
            >
              <BellIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-105" />

              {unreadNotifications.length > 0 && (
                <span className="absolute right-0 top-0 flex min-h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-white bg-[#4CAF50] px-1 text-[7px] font-black leading-none text-white shadow-sm">
                  {unreadNotifications.length > 9
                    ? "9+"
                    : unreadNotifications.length}
                </span>
              )}
            </button>

            {notificationOpen && (
              <NotificationPanel
                notifications={notifications}
                readKeys={readNotificationKeys}
                unreadCount={unreadNotifications.length}
                onRead={handleNotificationClick}
                onMarkAllRead={markAllNotificationsRead}
                formatTime={notificationTime}
              />
            )}
          </div>
        </header>

        <div className="min-h-[calc(100vh-72px)]">{children}</div>
      </main>

      {logoutOpen && (
        <LogoutConfirmModal
          mentorName={mentorName}
          onCancel={cancelLogout}
          onConfirm={confirmLogout}
        />
      )}

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
          background: rgba(76, 175, 80, 0.22);
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
      icon: active ? "bg-[#1B5E20] text-white" : "bg-[#DCEBDD] text-[#1B5E20]",
      active: "bg-white text-[#1B5E20] shadow-[0_7px_20px_rgba(27,94,32,.08)]",
      inactive: "text-[#607363] hover:bg-white/70 hover:text-[#263B28]",
    },

    amber: {
      icon: active ? "bg-[#4CAF50] text-white" : "bg-[#E6F4EA] text-[#3F7A45]",
      active: "bg-white text-[#356C3B] shadow-[0_7px_20px_rgba(76,175,80,.08)]",
      inactive: "text-[#607363] hover:bg-white/70 hover:text-[#263B28]",
    },

    blue: {
      icon: active ? "bg-[#4B8D52] text-white" : "bg-[#E6F4EA] text-[#4B8D52]",
      active: "bg-white text-[#3F7747] shadow-[0_7px_20px_rgba(75,141,82,.08)]",
      inactive: "text-[#607363] hover:bg-white/70 hover:text-[#263B28]",
    },

    lavender: {
      icon: active ? "bg-[#5D8B61] text-white" : "bg-[#EAF4EA] text-[#527A58]",
      active: "bg-white text-[#3D6842] shadow-[0_7px_20px_rgba(93,139,97,.08)]",
      inactive: "text-[#607363] hover:bg-white/70 hover:text-[#263B28]",
    },

    teal: {
      icon: active ? "bg-[#4E8F58] text-white" : "bg-[#E4F1E5] text-[#467C4E]",
      active: "bg-white text-[#3D7045] shadow-[0_7px_20px_rgba(78,143,88,.08)]",
      inactive: "text-[#607363] hover:bg-white/70 hover:text-[#263B28]",
    },

    coral: {
      icon: active ? "bg-[#4CAF50] text-white" : "bg-[#EAF4EA] text-[#3E7A46]",
      active: "bg-white text-[#3E7A46] shadow-[0_7px_20px_rgba(76,175,80,.08)]",
      inactive: "text-[#607363] hover:bg-white/70 hover:text-[#263B28]",
    },

    cream: {
      icon: "bg-[#EEF6EE] text-[#657667]",
      active: "bg-white text-[#3B4F3D] shadow-[0_7px_20px_rgba(39,69,42,.05)]",
      inactive: "text-[#607363] hover:bg-white/70 hover:text-[#263B28]",
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
   NOTIFICATION PANEL
========================================================= */

function NotificationPanel({
  notifications,
  readKeys,
  unreadCount,
  onRead,
  onMarkAllRead,
  formatTime,
}: {
  notifications: MentorNotification[];
  readKeys: string[];
  unreadCount: number;
  onRead: (notification: MentorNotification) => void;
  onMarkAllRead: () => void;
  formatTime: (value?: string | null) => string;
}) {
  return (
    <div className="mentor-scale absolute right-0 top-[50px] z-50 w-[min(390px,calc(100vw-24px))] origin-top-right overflow-hidden rounded-[22px] border border-[#DCE7DD] bg-white shadow-[0_24px_70px_rgba(39,69,42,.14)]">
      <div className="border-b border-[#E2ECE3] bg-[#FAFEFA] px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#849687]">
              Mentor Workspace
            </p>

            <div className="mt-1 flex items-center gap-2">
              <h3 className="text-sm font-black text-[#263B29]">Notifikasi</h3>

              {unreadCount > 0 && (
                <span className="rounded-full bg-[#EAF4EA] px-2 py-1 text-[8px] font-black text-[#3E7A46]">
                  {unreadCount} baru
                </span>
              )}
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="cursor-pointer whitespace-nowrap rounded-lg px-2 py-1.5 text-[9px] font-extrabold text-[#5D8061] transition hover:bg-[#EAF4EA] hover:text-[#1B5E20]"
            >
              Tandai semua dibaca
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[430px] overflow-y-auto p-2">
        {notifications.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDF6ED] text-[#66806A]">
              <BellIcon />
            </div>

            <p className="mt-4 text-xs font-black text-[#293B2B]">
              Belum ada notifikasi
            </p>

            <p className="mx-auto mt-2 max-w-[250px] text-[10px] leading-5 text-[#849985]">
              Permintaan baru dan perubahan sesi akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notification: MentorNotification) => {
              const isUnread = !readKeys.includes(notification.key);

              return (
                <button
                  key={notification.key}
                  type="button"
                  onClick={() => onRead(notification)}
                  className={[
                    "group flex w-full cursor-pointer items-start gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200 hover:bg-[#EEF6EE]",
                    isUnread ? "bg-[#F5FAF5]" : "",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-black",
                      notification.kind === "pending"
                        ? "bg-[#E6F4EA] text-[#3F7A45]"
                        : notification.kind === "approved"
                          ? "bg-[#DCEBDD] text-[#1B5E20]"
                          : notification.kind === "cancelled"
                            ? "bg-[#EAF4EA] text-[#3E7A46]"
                            : "bg-[#E6F4EA] text-[#3F7747]",
                    ].join(" ")}
                  >
                    {notification.kind === "pending" ? (
                      <RequestIcon />
                    ) : notification.kind === "approved" ? (
                      <CalendarIcon />
                    ) : notification.kind === "cancelled" ? (
                      <span className="text-xs">×</span>
                    ) : (
                      <SessionIcon />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-[11px] font-black text-[#293B2B]">
                        {notification.title}
                      </span>

                      {isUnread && (
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4CAF50]" />
                      )}
                    </span>

                    <span className="mt-1 block text-[10px] leading-5 text-[#718773]">
                      {notification.description}
                    </span>

                    <span className="mt-1.5 block text-[8px] font-bold uppercase tracking-[0.08em] text-[#96A999]">
                      {formatTime(notification.timestamp)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   LOGOUT MODAL
========================================================= */

function LogoutConfirmModal({
  mentorName,
  onCancel,
  onConfirm,
}: {
  mentorName: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#1D2B1F]/35 p-4 backdrop-blur-md">
      <button
        type="button"
        aria-label="Close logout confirmation"
        onClick={onCancel}
        className="absolute inset-0 cursor-default"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        className="mentor-scale relative z-10 w-full max-w-[420px] overflow-hidden rounded-[28px] border border-[#DDEADD] bg-[#F8FCF8] shadow-[0_35px_100px_rgba(39,69,42,.22)]"
      >
        <div className="h-1.5 w-full bg-[#2E7D32]" />

        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E7F3E8] text-[#2E7D32]">
              <LogoutIcon />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#8FA194]">
                Mentor Workspace
              </p>

              <h2
                id="logout-title"
                className="mt-1.5 text-xl font-black tracking-[-0.04em] text-[#263A28]"
              >
                Yakin ingin keluar?
              </h2>

              <p className="mt-2 text-xs font-medium leading-6 text-[#6D8170]">
                Kamu sedang login sebagai{" "}
                <span className="font-black text-[#3A513D]">{mentorName}</span>
                .
                <br />
                Setelah keluar, kamu perlu login kembali untuk membuka Mentor
                Workspace.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#E2ECE2] bg-[#F0F8F0] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-[#4CAF50]" />

              <p className="text-[10px] font-bold text-[#6D816F]">
                Sesi login kamu akan diakhiri di perangkat ini.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="cursor-pointer rounded-xl border border-[#DCEADD] bg-white px-5 py-3 text-[10px] font-black text-[#607565] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#EDF6EE] hover:text-[#4A7852]"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2E7D32] px-5 py-3 text-[10px] font-black text-white shadow-[0_10px_24px_rgba(76,175,80,.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2B6E32]"
            >
              <LogoutIcon />
              Ya, Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
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

function BellIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M18 9.5C18 6.19 15.76 4 12 4C8.24 4 6 6.19 6 9.5C6 14 4.5 15.5 4 17H20C19.5 15.5 18 14 18 9.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 20C10.1 20.67 10.93 21 12 21C13.07 21 13.9 20.67 14.5 20"
        stroke="currentColor"
        strokeWidth="1.7"
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
