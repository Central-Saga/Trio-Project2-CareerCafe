"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

type User = {
  id?: number;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  status?: string | null;
};

type Profile = {
  profile_photo?: string | null;
  job_title?: string | null;
  company?: string | null;
  location?: string | null;
  timezone?: string | null;
  bio?: string | null;
};

type SettingsState = {
  emailNotifications: boolean;
  sessionNotifications: boolean;
  applicationNotifications: boolean;
  weeklySummary: boolean;
  compactMode: boolean;
};

const DEFAULT_SETTINGS: SettingsState = {
  emailNotifications: true,
  sessionNotifications: true,
  applicationNotifications: true,
  weeklySummary: false,
  compactMode: false,
};

export default function AdminSettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [settings, setSettings] =
    useState<SettingsState>(DEFAULT_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const loadAccount = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("user_role");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (role !== "admin") {
      router.replace("/");
      return;
    }

    try {
      setLoading(true);
      setError("");

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

      if (meResponse.status === 401 || profileResponse.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_name");
        localStorage.removeItem("user_role");

        router.replace("/login");
        return;
      }

      const meData = await meResponse.json().catch(() => null);
      const profileData = await profileResponse.json().catch(() => null);

      if (meResponse.ok) {
        const account = meData?.data?.user ?? meData?.user ?? meData?.data;

        if (account) {
          setUser(account);
        }
      }

      if (profileResponse.ok) {
        const accountProfile =
          profileData?.data?.profile ??
          profileData?.profile ??
          profileData?.data;

        if (accountProfile) {
          setProfile(accountProfile);
        }
      }
    } catch {
      setError("Unable to connect to the Laravel backend.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const storedSettings = localStorage.getItem("admin_settings");

    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);

        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
        });
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    }

    void loadAccount();
  }, [loadAccount]);

  function updateSetting<K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSuccess("");
  }

  function saveSettings() {
    try {
      setSaving(true);
      setSuccess("");
      setError("");

      localStorage.setItem("admin_settings", JSON.stringify(settings));

      window.dispatchEvent(
        new CustomEvent("admin-settings-updated", {
          detail: settings,
        }),
      );

      setTimeout(() => {
        setSaving(false);
        setSuccess("Pengaturan berhasil disimpan.");
      }, 350);
    } catch {
      setSaving(false);
      setError("Pengaturan gagal disimpan.");
    }
  }

  function resetSettings() {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem(
      "admin_settings",
      JSON.stringify(DEFAULT_SETTINGS),
    );
    setSuccess("Pengaturan dikembalikan ke pengaturan awal.");
    setError("");
  }

  function getInitial(name?: string | null) {
    return name?.trim().charAt(0).toUpperCase() || "A";
  }

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
      return `${API_URL.replace(/\/api$/, "")}${value}`;
    }

    if (value.startsWith("storage/")) {
      return `${API_URL.replace(/\/api$/, "")}/${value}`;
    }

    return `${API_URL.replace(
      /\/api$/,
      "",
    )}/storage/${value.replace(/^storage\//, "")}`;
  }

  const displayName =
    user?.name ||
    localStorage.getItem("user_name") ||
    "Administrator";

  const displayEmail = user?.email || "admin@careercafe.test";
  const displayRole = user?.role || "admin";

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#F3EAE0] px-4 py-6 text-[#302823] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* HERO */}
        <section className="admin-reveal rounded-[28px] border border-[#E6DDD2] bg-white p-6 shadow-[0_18px_50px_rgba(73,55,39,.06)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              {profile?.profile_photo ? (
                <img
                  src={resolveImageUrl(profile.profile_photo)}
                  alt={displayName}
                  className="h-16 w-16 rounded-[20px] object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-[#F1E9F7] text-xl font-black text-[#78658A] shadow-sm">
                  {getInitial(displayName)}
                </div>
              )}

              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A19890]">
                  Admin Workspace
                </p>

                <h1 className="mt-1 truncate text-2xl font-black tracking-[-0.04em] text-[#302823] sm:text-3xl">
                  Settings
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#857A71]">
                  Kelola preferensi akun, notifikasi, dan pengalaman penggunaan
                  dashboard admin Career Cafe.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/admin/profile"
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[#E6DED6] bg-white px-4 py-2.5 text-xs font-black text-[#6F665F] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FAF8F5] hover:text-[#302823]"
              >
                Edit Profile
              </Link>

              <button
                type="button"
                onClick={saveSettings}
                disabled={saving}
                className="cursor-pointer rounded-xl bg-[#1E3F20] px-5 py-2.5 text-xs font-black text-white shadow-[0_10px_24px_rgba(30,63,32,.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#173218] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan Pengaturan"}
              </button>
            </div>
          </div>
        </section>

        {/* STATUS */}
        {(success || error) && (
          <div className="mt-5 admin-reveal">
            {success && (
              <div className="flex items-center gap-3 rounded-2xl border border-[#D5E7D7] bg-[#EEF8F0] px-4 py-3 text-sm font-bold text-[#4D7452]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm shadow-sm">
                  ✓
                </span>
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 rounded-2xl border border-[#E9CFCA] bg-[#FFF4F2] px-4 py-3 text-sm font-bold text-[#A95C53]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm shadow-sm">
                  !
                </span>
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* CONTENT */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* LEFT */}
          <div className="space-y-6">
            {/* ACCOUNT */}
            <section className="admin-reveal rounded-[26px] border border-[#E6DDD2] bg-white shadow-[0_18px_50px_rgba(73,55,39,.05)]">
              <div className="border-b border-[#EEE8E1] px-6 py-5 sm:px-7">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A19890]">
                  Account
                </p>

                <h2 className="mt-1 text-lg font-black text-[#302823]">
                  Informasi Akun
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#8E847B]">
                  Informasi akun yang sedang digunakan untuk mengakses admin
                  workspace.
                </p>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-7">
                <InfoCard
                  label="Nama"
                  value={loading ? "Loading..." : displayName}
                  accent="green"
                />

                <InfoCard
                  label="Email"
                  value={loading ? "Loading..." : displayEmail}
                  accent="lavender"
                />

                <InfoCard
                  label="Role"
                  value={displayRole}
                  accent="blue"
                />

                <InfoCard
                  label="Status"
                  value={user?.status || "active"}
                  accent="amber"
                />

                <InfoCard
                  label="Jabatan"
                  value={profile?.job_title || "Administrator"}
                  accent="coral"
                />

                <InfoCard
                  label="Lokasi"
                  value={profile?.location || "Belum diatur"}
                  accent="teal"
                />
              </div>

              <div className="px-6 pb-6 sm:px-7 sm:pb-7">
                <div className="flex flex-col gap-4 rounded-2xl border border-[#E9E1D8] bg-[#FBF8F4] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black text-[#3B312B]">
                      Kelola profil administrator
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-[#8E837A]">
                      Ubah nama, foto profil, bio, lokasi, atau data profil
                      lainnya dari halaman profile.
                    </p>
                  </div>

                  <Link
                    href="/admin/profile"
                    className="inline-flex w-fit cursor-pointer items-center justify-center rounded-xl bg-white px-4 py-2.5 text-[10px] font-black text-[#627C66] shadow-sm ring-1 ring-[#E7DFD6] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F7FAF5]"
                  >
                    Buka Profile →
                  </Link>
                </div>
              </div>
            </section>

            {/* NOTIFICATIONS */}
            <section className="admin-reveal rounded-[26px] border border-[#E6DDD2] bg-white shadow-[0_18px_50px_rgba(73,55,39,.05)]">
              <div className="border-b border-[#EEE8E1] px-6 py-5 sm:px-7">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A19890]">
                  Notifications
                </p>

                <h2 className="mt-1 text-lg font-black text-[#302823]">
                  Preferensi Notifikasi
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#8E847B]">
                  Atur jenis informasi yang ingin ditampilkan atau dipantau
                  pada workspace admin.
                </p>
              </div>

              <div className="divide-y divide-[#F0EAE4]">
                <SettingRow
                  title="Notifikasi Email"
                  description="Mengizinkan preferensi notifikasi email untuk aktivitas akun."
                  checked={settings.emailNotifications}
                  onChange={(value) =>
                    updateSetting("emailNotifications", value)
                  }
                  accent="green"
                />

                <SettingRow
                  title="Session Notifications"
                  description="Pantau perubahan dan aktivitas pada mentoring sessions."
                  checked={settings.sessionNotifications}
                  onChange={(value) =>
                    updateSetting("sessionNotifications", value)
                  }
                  accent="teal"
                />

                <SettingRow
                  title="Application Notifications"
                  description="Pantau pengajuan mentor baru dan perubahan status review."
                  checked={settings.applicationNotifications}
                  onChange={(value) =>
                    updateSetting("applicationNotifications", value)
                  }
                  accent="amber"
                />

                <SettingRow
                  title="Weekly Summary"
                  description="Simpan preferensi untuk menerima ringkasan aktivitas mingguan."
                  checked={settings.weeklySummary}
                  onChange={(value) =>
                    updateSetting("weeklySummary", value)
                  }
                  accent="lavender"
                />
              </div>
            </section>

            {/* DISPLAY */}
            <section className="admin-reveal rounded-[26px] border border-[#E6DDD2] bg-white shadow-[0_18px_50px_rgba(73,55,39,.05)]">
              <div className="border-b border-[#EEE8E1] px-6 py-5 sm:px-7">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A19890]">
                  Appearance
                </p>

                <h2 className="mt-1 text-lg font-black text-[#302823]">
                  Tampilan Workspace
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#8E847B]">
                  Preferensi tampilan ini tersimpan di browser yang sedang
                  digunakan.
                </p>
              </div>

              <div className="p-6 sm:p-7">
                <SettingRow
                  title="Compact Mode"
                  description="Gunakan jarak dan elemen yang lebih rapat pada area pengaturan."
                  checked={settings.compactMode}
                  onChange={(value) => updateSetting("compactMode", value)}
                  accent="blue"
                />
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <aside className="space-y-6">
            {/* SUMMARY */}
            <section className="admin-reveal rounded-[26px] border border-[#E6DDD2] bg-[#FCFAF6] p-6 shadow-[0_18px_50px_rgba(73,55,39,.04)]">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A19890]">
                Workspace Status
              </p>

              <h2 className="mt-1 text-lg font-black text-[#302823]">
                Ringkasan Pengaturan
              </h2>

              <div className="mt-5 space-y-3">
                <StatusCard
                  icon={<ShieldIcon />}
                  title="Admin Access"
                  value="Active"
                  tone="green"
                />

                <StatusCard
                  icon={<BellIcon />}
                  title="Notifications"
                  value={
                    [
                      settings.emailNotifications,
                      settings.sessionNotifications,
                      settings.applicationNotifications,
                      settings.weeklySummary,
                    ].filter(Boolean).length + " aktif"
                  }
                  tone="coral"
                />

                <StatusCard
                  icon={<MonitorIcon />}
                  title="Workspace Mode"
                  value={settings.compactMode ? "Compact" : "Comfortable"}
                  tone="blue"
                />
              </div>
            </section>

            {/* SECURITY */}
            <section className="admin-reveal rounded-[26px] border border-[#E6DDD2] bg-white p-6 shadow-[0_18px_50px_rgba(73,55,39,.05)]">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F4EEF8] text-[#78658A]">
                  <ShieldIcon size={18} />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#A19890]">
                    Security
                  </p>

                  <h2 className="mt-1 text-base font-black text-[#302823]">
                    Keamanan Akun
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-[#8E837A]">
                    Untuk perubahan password atau data autentikasi, gunakan
                    alur akun yang sudah tersedia.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[#E8E0D8] bg-[#FBF8F5] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#A19890]">
                  Login Account
                </p>

                <p className="mt-2 break-all text-xs font-bold text-[#4B423B]">
                  {displayEmail}
                </p>

                <Link
                  href="/admin/profile"
                  className="mt-4 inline-flex cursor-pointer text-xs font-black text-[#5D7962] transition hover:text-[#1E3F20]"
                >
                  Buka pengaturan profil →
                </Link>
              </div>
            </section>

            {/* RESET */}
            <section className="admin-reveal rounded-[26px] border border-[#E9E0D7] bg-[#FFFDFC] p-6 shadow-[0_18px_50px_rgba(73,55,39,.04)]">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1DE] text-[#B8782E]">
                  <RefreshIcon size={18} />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#A19890]">
                    Preferences
                  </p>

                  <h2 className="mt-1 text-base font-black text-[#302823]">
                    Reset Pengaturan
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-[#8E837A]">
                    Kembalikan seluruh preferensi browser ke nilai default.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={resetSettings}
                className="mt-5 w-full cursor-pointer rounded-xl border border-[#E5D8CA] bg-white px-4 py-3 text-xs font-black text-[#80634D] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FFF8F0]"
              >
                Reset ke Default
              </button>
            </section>

            {/* HELP */}
            <section className="admin-reveal rounded-[26px] border border-[#DDE5DD] bg-[#F5F9F4] p-6">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#708172]">
                Career Cafe
              </p>

              <h2 className="mt-1 text-base font-black text-[#304130]">
                Admin Workspace
              </h2>

              <p className="mt-2 text-xs leading-5 text-[#708071]">
                Pengaturan lokal disimpan pada browser ini. Perubahan data
                profil tetap dilakukan melalui halaman profile.
              </p>

              <div className="mt-4 h-px bg-[#DCE5DC]" />

              <p className="mt-4 text-[10px] font-bold text-[#7B887C]">
                Timezone
              </p>

              <p className="mt-1 text-xs font-black text-[#4F624F]">
                {profile?.timezone || "Asia/Jakarta"}
              </p>
            </section>
          </aside>
        </div>
      </div>

      <style jsx global>{`
        @keyframes adminSettingsFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.992);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .admin-reveal {
          animation: adminSettingsFadeUp 0.75s
            cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .admin-reveal:nth-child(2) {
          animation-delay: 0.06s;
        }

        .admin-reveal:nth-child(3) {
          animation-delay: 0.12s;
        }

        .admin-reveal:nth-child(4) {
          animation-delay: 0.18s;
        }

        button,
        a {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "green" | "lavender" | "blue" | "amber" | "coral" | "teal";
}) {
  const styles = {
    green: {
      wrapper: "bg-[#F4F8F3] border-[#DFEBDD]",
      dot: "bg-[#668069]",
      label: "text-[#718272]",
    },
    lavender: {
      wrapper: "bg-[#F7F3FA] border-[#E8DFEE]",
      dot: "bg-[#85719A]",
      label: "text-[#82768D]",
    },
    blue: {
      wrapper: "bg-[#F2F6FA] border-[#DCE7F0]",
      dot: "bg-[#6984A1]",
      label: "text-[#748396]",
    },
    amber: {
      wrapper: "bg-[#FFF8EA] border-[#F1E4C8]",
      dot: "bg-[#C18A43]",
      label: "text-[#95805E]",
    },
    coral: {
      wrapper: "bg-[#FFF5F3] border-[#F0DDD9]",
      dot: "bg-[#C8756A]",
      label: "text-[#987872]",
    },
    teal: {
      wrapper: "bg-[#F0F8F7] border-[#D9EBE8]",
      dot: "bg-[#5E8A83]",
      label: "text-[#738C88]",
    },
  } as const;

  const style = styles[accent];

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm ${style.wrapper}`}
    >
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${style.dot}`} />

        <p
          className={`text-[9px] font-black uppercase tracking-[0.14em] ${style.label}`}
        >
          {label}
        </p>
      </div>

      <p className="mt-2 truncate text-sm font-black text-[#3E352E]">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   SETTING ROW
========================================================= */

function SettingRow({
  title,
  description,
  checked,
  onChange,
  accent,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  accent: "green" | "amber" | "blue" | "lavender" | "teal";
}) {
  const accentClasses = {
    green: "bg-[#E8F1E8]",
    amber: "bg-[#FFF1D9]",
    blue: "bg-[#EAF1F8]",
    lavender: "bg-[#F1EAF6]",
    teal: "bg-[#E6F2F0]",
  } as const;

  return (
    <div className="flex gap-4 px-6 py-5 transition-all duration-300 hover:bg-[#FCFAF7] sm:px-7">
      <div
        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accentClasses[accent]}`}
      >
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            checked ? "bg-[#5C7A62]" : "bg-[#B5ADA5]"
          }`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-[#3A3029]">{title}</p>

        <p className="mt-1 max-w-2xl text-xs leading-5 text-[#8D8279]">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          "relative mt-1 h-7 w-12 shrink-0 cursor-pointer rounded-full p-1 transition-all duration-300",
          checked
            ? "bg-[#607E64] shadow-[0_6px_16px_rgba(96,126,100,.16)]"
            : "bg-[#D8D1CA]",
        ].join(" ")}
      >
        <span
          className={[
            "block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300",
            checked ? "translate-x-5" : "translate-x-0",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

/* =========================================================
   STATUS CARD
========================================================= */

function StatusCard({
  icon,
  title,
  value,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  tone: "green" | "coral" | "blue";
}) {
  const styles = {
    green: {
      wrapper: "border-[#DDE8DE] bg-[#F4F8F3]",
      icon: "bg-[#E7F0E7] text-[#5B755F]",
    },
    coral: {
      wrapper: "border-[#F0DFDB] bg-[#FFF7F5]",
      icon: "bg-[#F8EAE7] text-[#B8655D]",
    },
    blue: {
      wrapper: "border-[#DDE7F0] bg-[#F4F8FC]",
      icon: "bg-[#E8F0F7] text-[#627F9C]",
    },
  } as const;

  const style = styles[tone];

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-3.5 ${style.wrapper}`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#91877E]">
          {title}
        </p>

        <p className="mt-1 truncate text-xs font-black text-[#423931]">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   ICONS
========================================================= */

function ShieldIcon({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3.5 19 6v5.2c0 4.7-2.9 7.9-7 9.3-4.1-1.4-7-4.6-7-9.3V6l7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m8.8 12.2 2.1 2.1 4.4-4.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellIcon({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 10a6 6 0 0 0-12 0c0 7-3 7-3 8.5h18C21 17 18 17 18 10Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M10 21h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MonitorIcon({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M8 21h8M12 17v4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RefreshIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 11a8 8 0 0 0-14.8-4L3 10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M3 5v5h5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M4 13a8 8 0 0 0 14.8 4L21 14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M21 19v-5h-5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
