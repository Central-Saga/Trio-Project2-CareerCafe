"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type ApplicationStatus = "pending" | "approved" | "rejected";

type Application = {
  id: number;
  full_name: string;
  job_title: string;
  company: string | null;
  location: string | null;
  experience_years: number;
  education: string | null;
  industry_id: number | null;
  bio: string;
  motivation: string;
  linkedin_url: string | null;
  skills: number[] | null;
  status: ApplicationStatus;
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;

  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
  } | null;

  industry?: {
    id: number;
    name: string;
  } | null;

  reviewer?: {
    id: number;
    name: string;
    email: string;
  } | null;
};

type TabKey = "all" | ApplicationStatus;

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const tabs: {
  key: TabKey;
  label: string;
}[] = [
  {
    key: "all",
    label: "All",
  },
  {
    key: "pending",
    label: "Pending",
  },
  {
    key: "approved",
    label: "Approved",
  },
  {
    key: "rejected",
    label: "Rejected",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitial(name?: string | null) {
  return name?.trim().charAt(0).toUpperCase() || "U";
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminMentorApplicationsPage() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [applications, setApplications] = useState<Application[]>([]);

  const [activeTab, setActiveTab] = useState<TabKey>("pending");

  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const [rejectionReason, setRejectionReason] = useState("");

  /* =======================================================
     AUTH
  ======================================================= */

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token") || "";

    const storedRole = (localStorage.getItem("user_role") || "").toLowerCase();

    if (!storedToken) {
      router.replace("/login");
      return;
    }

    if (storedRole !== "admin") {
      router.replace("/");
      return;
    }

    setToken(storedToken);
    setCheckingAuth(false);
  }, [router]);

  /* =======================================================
     LOAD APPLICATIONS
  ======================================================= */

  const loadApplications = useCallback(async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params =
        activeTab === "all" ? "" : `?status=${encodeURIComponent(activeTab)}`;

      const response = await fetch(
        `${API_URL}/admin/mentor-applications${params}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        },
      );

      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof (
            data as {
              message?: unknown;
            }
          ).message === "string"
            ? (
                data as {
                  message: string;
                }
              ).message
            : "Gagal mengambil pengajuan mentor.";

        setError(message);
        setApplications([]);
        return;
      }

      const raw =
        data && typeof data === "object" && "data" in data
          ? (
              data as {
                data?: unknown;
              }
            ).data
          : data;

      let result: Application[] = [];

      if (Array.isArray(raw)) {
        result = raw as Application[];
      } else if (
        raw &&
        typeof raw === "object" &&
        "data" in raw &&
        Array.isArray(
          (
            raw as {
              data?: unknown;
            }
          ).data,
        )
      ) {
        result = (
          raw as {
            data: Application[];
          }
        ).data;
      }

      setApplications(result);
    } catch {
      setError(
        "Tidak dapat terhubung ke server. Pastikan backend Laravel sedang berjalan.",
      );
    } finally {
      setLoading(false);
    }
  }, [activeTab, token]);

  useEffect(() => {
    if (!checkingAuth && token) {
      void loadApplications();
    }
  }, [checkingAuth, token, loadApplications]);

  /* =======================================================
     CLEAR FEEDBACK
  ======================================================= */

  useEffect(() => {
    if (!success) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSuccess("");
    }, 5000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [success]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const counts = useMemo(() => {
    return {
      all: applications.length,
      pending: applications.filter((item) => item.status === "pending").length,
      approved: applications.filter((item) => item.status === "approved")
        .length,
      rejected: applications.filter((item) => item.status === "rejected")
        .length,
    };
  }, [applications]);

  /* =======================================================
     APPROVE
  ======================================================= */

  const handleApprove = async () => {
    if (!selectedApplication) {
      return;
    }

    const confirmed = window.confirm(
      `Approve "${selectedApplication.full_name}" sebagai mentor?`,
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/admin/mentor-applications/${selectedApplication.id}/approve`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof (
            data as {
              message?: unknown;
            }
          ).message === "string"
            ? (
                data as {
                  message: string;
                }
              ).message
            : "Gagal menyetujui pengajuan mentor.";

        setError(message);
        return;
      }

      const message =
        data &&
        typeof data === "object" &&
        "message" in data &&
        typeof (
          data as {
            message?: unknown;
          }
        ).message === "string"
          ? (
              data as {
                message: string;
              }
            ).message
          : "Pengajuan mentor berhasil disetujui.";

      setSuccess(message);
      setSelectedApplication(null);

      await loadApplications();
    } catch {
      setError("Gagal terhubung ke server saat approve.");
    } finally {
      setActionLoading(false);
    }
  };

  /* =======================================================
     OPEN REJECT
  ======================================================= */

  const openRejectModal = () => {
    if (!selectedApplication) {
      return;
    }

    setRejectionReason("");
    setRejectModalOpen(true);
  };

  /* =======================================================
     REJECT
  ======================================================= */

  const handleReject = async () => {
    if (!selectedApplication || !rejectionReason.trim()) {
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/admin/mentor-applications/${selectedApplication.id}/reject`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rejection_reason: rejectionReason.trim(),
          }),
        },
      );

      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof (
            data as {
              message?: unknown;
            }
          ).message === "string"
            ? (
                data as {
                  message: string;
                }
              ).message
            : "Gagal menolak pengajuan mentor.";

        setError(message);
        return;
      }

      const message =
        data &&
        typeof data === "object" &&
        "message" in data &&
        typeof (
          data as {
            message?: unknown;
          }
        ).message === "string"
          ? (
              data as {
                message: string;
              }
            ).message
          : "Pengajuan mentor berhasil ditolak.";

      setSuccess(message);

      setRejectModalOpen(false);

      setSelectedApplication(null);

      setRejectionReason("");

      await loadApplications();
    } catch {
      setError("Gagal terhubung ke server saat reject.");
    } finally {
      setActionLoading(false);
    }
  };

  /* =======================================================
     LOADING AUTH
  ======================================================= */

  if (checkingAuth) {
    return (
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#FFFDFC]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#E8DED4] border-t-[#1E3F20]" />

          <p className="mt-4 text-xs font-bold text-[#8B8178]">
            Loading mentor applications...
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes applicationFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.995);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes applicationFadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes applicationScale {
          from {
            opacity: 0;
            transform: scale(0.96);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes applicationSlide {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <main className="min-h-screen bg-[#FFFDFC] px-5 py-7 text-[#2F2722] sm:px-7 lg:px-9">
        <div className="mx-auto max-w-7xl">
          {/* =================================================
              HEADER
          ================================================== */}

          <section
            className="relative overflow-hidden rounded-[28px] bg-[#F3EAE0] px-6 py-7 shadow-[0_12px_35px_rgba(44,30,22,.045)] sm:px-8 sm:py-8"
            style={{
              animation: "applicationFadeUp .65s cubic-bezier(.16,1,.3,1) both",
            }}
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#FFF4D9] opacity-70 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-[#DDEAE0] opacity-50 blur-3xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#A3988E]">
                  Admin Workspace
                </p>

                <h1 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[#342B25] sm:text-3xl">
                  Mentor Applications
                </h1>

                <p className="mt-3 max-w-2xl text-xs font-medium leading-6 text-[#786D64] sm:text-sm">
                  Review pengajuan pengguna yang ingin menjadi mentor sebelum
                  mendapatkan akses ke Mentor Workspace.
                </p>
              </div>

              <Link
                href="/admin/dashboard"
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[10px] font-black text-[#766C64] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:text-[#1E3F20] hover:shadow-md"
              >
                ← Dashboard
              </Link>
            </div>
          </section>

          {/* =================================================
              SUCCESS
          ================================================== */}

          {success && (
            <div
              className="mentor-scale mt-5 rounded-2xl border border-[#DCEBD9] bg-[#F3F8F1] px-5 py-4"
              role="status"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E4F0E1] text-[#1E3F20]">
                  <CheckIcon />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#648066]">
                    Success
                  </p>

                  <p className="mt-1 text-xs font-bold leading-5 text-[#405F42]">
                    {success}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================== */}

          {error && (
            <div
              className="mentor-scale mt-5 rounded-2xl border border-[#F0D4D0] bg-[#FFF5F3] px-5 py-4"
              role="alert"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FCE9E6] text-[#B95349]">
                  <AlertIcon />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#B95349]">
                    Error
                  </p>

                  <p className="mt-1 text-xs font-bold leading-5 text-[#8E4B45]">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              FILTER TABS
          ================================================== */}

          <section
            className="mt-5 rounded-[20px] border border-[#E9E1D8] bg-white p-2 shadow-[0_8px_25px_rgba(44,30,22,.025)]"
            style={{
              animation:
                "applicationFadeUp .65s .06s cubic-bezier(.16,1,.3,1) both",
            }}
          >
            <div className="flex flex-wrap gap-1.5">
              {tabs.map((tab) => {
                const active = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={[
                      "group flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2.5 text-[10px] font-black transition-all duration-300",
                      active
                        ? "bg-[#1E3F20] text-white shadow-sm"
                        : "text-[#847970] hover:bg-[#F7F2ED] hover:text-[#3E352F]",
                    ].join(" ")}
                  >
                    <span>{tab.label}</span>

                    <span
                      className={[
                        "min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[8px]",
                        active
                          ? "bg-white/15 text-white"
                          : "bg-[#F3EEE8] text-[#968A80]",
                      ].join(" ")}
                    >
                      {counts[tab.key]}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* =================================================
              APPLICATION LIST
          ================================================== */}

          <section className="mt-5">
            {loading ? (
              <div className="flex min-h-[380px] items-center justify-center rounded-[24px] border border-[#E9E1D8] bg-white">
                <div className="text-center">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#E8DED4] border-t-[#1E3F20]" />

                  <p className="mt-4 text-xs font-bold text-[#8B8178]">
                    Loading applications...
                  </p>
                </div>
              </div>
            ) : applications.length === 0 ? (
              <EmptyApplications />
            ) : (
              <div className="space-y-3">
                {applications.map((application, index) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    index={index}
                    onClick={() => setSelectedApplication(application)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* =====================================================
          DETAIL MODAL
      ====================================================== */}

      {selectedApplication && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#241D18]/35 px-4 py-5 backdrop-blur-md"
          onClick={() => {
            if (!actionLoading) {
              setSelectedApplication(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-detail-title"
            className="mentor-scale max-h-[92vh] w-full max-w-[820px] overflow-hidden rounded-[28px] border border-[#E8E0D8] bg-[#FFFDFC] shadow-[0_35px_100px_rgba(44,30,22,.22)]"
            onClick={(event) => event.stopPropagation()}
          >
            {/* TOP */}
            <div className="border-b border-[#EEE7E1] bg-[#FFFEFC] px-5 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E6EFE5] text-sm font-black text-[#1E3F20]">
                      {getInitial(selectedApplication.full_name)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2
                          id="application-detail-title"
                          className="text-lg font-black text-[#342B25] sm:text-xl"
                        >
                          {selectedApplication.full_name}
                        </h2>

                        <StatusBadge status={selectedApplication.status} />
                      </div>

                      <p className="mt-0.5 text-[10px] font-bold text-[#6F8A70]">
                        {selectedApplication.job_title}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-[10px] font-medium text-[#948980]">
                    Submitted {formatDate(selectedApplication.created_at)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedApplication(null)}
                  disabled={actionLoading}
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-[#9B9088] transition-all duration-300 hover:bg-[#F6F2ED] hover:text-[#3C342F] disabled:cursor-not-allowed"
                  aria-label="Close"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* CONTENT */}
            <div className="max-h-[62vh] overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoCard
                  label="Company"
                  value={selectedApplication.company || "—"}
                />

                <InfoCard
                  label="Location"
                  value={selectedApplication.location || "—"}
                />

                <InfoCard
                  label="Experience"
                  value={`${selectedApplication.experience_years} years`}
                />

                <InfoCard
                  label="Education"
                  value={selectedApplication.education || "—"}
                />

                <InfoCard
                  label="Industry"
                  value={selectedApplication.industry?.name || "—"}
                />

                <InfoCard
                  label="LinkedIn"
                  value={selectedApplication.linkedin_url || "—"}
                />

                <InfoCard
                  label="Email"
                  value={selectedApplication.user?.email || "—"}
                />

                <InfoCard
                  label="Current User Role"
                  value={selectedApplication.user?.role || "—"}
                />
              </div>

              <DetailBlock
                title="Professional Bio"
                content={selectedApplication.bio || "Belum ada bio."}
              />

              <DetailBlock
                title="Motivation"
                content={
                  selectedApplication.motivation || "Belum ada motivation."
                }
              />

              {selectedApplication.status === "rejected" &&
                selectedApplication.rejection_reason && (
                  <div className="mt-4 rounded-2xl border border-[#F0D4D0] bg-[#FFF4F2] p-5">
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#B95349]">
                      Rejection Reason
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-xs font-medium leading-6 text-[#8B514B]">
                      {selectedApplication.rejection_reason}
                    </p>
                  </div>
                )}
            </div>

            {/* ACTIONS */}
            {selectedApplication.status === "pending" && (
              <div className="border-t border-[#EEE7E1] bg-[#FBF8F4] px-5 py-4 sm:px-7">
                <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={openRejectModal}
                    disabled={actionLoading}
                    className="cursor-pointer rounded-xl border border-[#F0D4D0] bg-white px-5 py-3 text-[10px] font-black text-[#B95349] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FFF5F3] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reject
                  </button>

                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="cursor-pointer rounded-xl bg-[#1E3F20] px-5 py-3 text-[10px] font-black text-white shadow-[0_8px_18px_rgba(30,63,32,.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#173119] hover:shadow-[0_12px_24px_rgba(30,63,32,.17)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoading ? "Processing..." : "Approve Mentor"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          REJECT MODAL
      ====================================================== */}

      {rejectModalOpen && selectedApplication && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#241D18]/40 px-4 py-5 backdrop-blur-md"
          onClick={() => {
            if (!actionLoading) {
              setRejectModalOpen(false);
            }
          }}
        >
          <div
            className="mentor-scale w-full max-w-[500px] overflow-hidden rounded-[28px] border border-[#E8E0D8] bg-[#FFFDFC] shadow-[0_35px_100px_rgba(44,30,22,.22)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="h-1.5 w-full bg-[#B65A51]" />

            <div className="p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FDF0EE] text-[#B65A51]">
                  <AlertIcon />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#B95349]">
                    Reject Application
                  </p>

                  <h2 className="mt-1.5 text-xl font-black tracking-[-0.03em] text-[#342B25]">
                    Tolak pengajuan mentor?
                  </h2>

                  <p className="mt-2 text-xs font-medium leading-6 text-[#7D736B]">
                    Berikan alasan yang jelas untuk{" "}
                    <span className="font-black text-[#493D35]">
                      {selectedApplication.full_name}
                    </span>
                    .
                  </p>
                </div>
              </div>

              <textarea
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                rows={6}
                maxLength={3000}
                placeholder="Contoh: Profil profesional masih belum cukup lengkap..."
                className="mt-5 w-full resize-none rounded-2xl border border-[#E3D9D0] bg-white px-4 py-3.5 text-xs font-medium leading-6 text-[#544A43] outline-none transition-all duration-300 placeholder:text-[#B7ADA4] focus:border-[#B65A51] focus:ring-4 focus:ring-[#B65A51]/10"
              />

              <div className="mt-2 text-right text-[9px] font-bold text-[#AAA097]">
                {rejectionReason.length}/3000
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  disabled={actionLoading}
                  className="cursor-pointer rounded-xl border border-[#E5DED6] bg-white px-5 py-3 text-[10px] font-black text-[#766C64] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F7F3EE] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleReject}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="cursor-pointer rounded-xl bg-[#B65A51] px-5 py-3 text-[10px] font-black text-white shadow-[0_10px_24px_rgba(182,90,81,.15)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#A84D45] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading ? "Rejecting..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   APPLICATION CARD
========================================================= */

function ApplicationCard({
  application,
  index,
  onClick,
}: {
  application: Application;
  index: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full cursor-pointer rounded-[22px] border border-[#E9E1D8] bg-white px-4 py-4 text-left shadow-[0_7px_25px_rgba(44,30,22,.025)] transition-all duration-500 hover:-translate-y-1 hover:border-[#DDD2C7] hover:shadow-[0_18px_40px_rgba(44,30,22,.07)] sm:px-5 sm:py-5"
      style={{
        animation: `applicationFadeUp .55s ${
          index * 50
        }ms cubic-bezier(.16,1,.3,1) both`,
      }}
    >
      <div className="flex items-center gap-4">
        {/* AVATAR */}

        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E6EFE5] text-sm font-black text-[#1E3F20] transition-all duration-300 group-hover:scale-105">
          {getInitial(application.full_name)}
        </div>

        {/* MAIN */}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-sm font-black text-[#382E28] sm:text-[15px]">
              {application.full_name}
            </h2>

            <StatusBadge status={application.status} />
          </div>

          <p className="mt-1 truncate text-[10px] font-black text-[#547156]">
            {application.job_title}
          </p>

          <p className="mt-1 truncate text-[10px] font-medium text-[#9A9088]">
            {application.company || "Independent"}
            {application.location ? ` • ${application.location}` : ""}
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[#F5F0EA] px-2.5 py-1 text-[8px] font-black text-[#786E66]">
              {application.experience_years} years
            </span>

            {application.industry?.name && (
              <span className="rounded-full bg-[#F5F0EA] px-2.5 py-1 text-[8px] font-black text-[#786E66]">
                {application.industry.name}
              </span>
            )}
          </div>
        </div>

        {/* DATE + ARROW */}

        <div className="hidden shrink-0 items-center gap-4 sm:flex">
          <div className="text-right">
            <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[#AEA39A]">
              Submitted
            </p>

            <p className="mt-1 text-[9px] font-black text-[#746A63]">
              {formatDate(application.created_at)}
            </p>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F7F2ED] text-[#9A9088] transition-all duration-300 group-hover:translate-x-1 group-hover:bg-[#EAF2E8] group-hover:text-[#1E3F20]">
            <ArrowIcon />
          </div>
        </div>
      </div>
    </button>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = {
    pending: {
      label: "Pending",
      className: "bg-[#FFF0D4] text-[#B76C19]",
    },

    approved: {
      label: "Approved",
      className: "bg-[#E6EFE5] text-[#1E3F20]",
    },

    rejected: {
      label: "Rejected",
      className: "bg-[#F9E8E4] text-[#B95349]",
    },
  }[status];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-black ${config.className}`}
    >
      {config.label}
    </span>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#EEE7E1] bg-[#FBF8F4] p-4">
      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[#AAA097]">
        {label}
      </p>

      <p className="mt-2 break-words text-xs font-black leading-5 text-[#3C332D]">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   DETAIL BLOCK
========================================================= */

function DetailBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-[#EEE7E1] bg-white p-5">
      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[#AAA097]">
        {title}
      </p>

      <p className="mt-3 whitespace-pre-wrap text-xs font-medium leading-6 text-[#71675F]">
        {content}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyApplications() {
  return (
    <div
      className="rounded-[24px] border border-dashed border-[#DCD2C8] bg-white px-6 py-16 text-center"
      style={{
        animation: "applicationFadeIn .5s ease both",
      }}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F0EA] text-[#7C726A]">
        <EmptyIcon />
      </div>

      <h2 className="mt-4 text-base font-black text-[#3B322C]">
        No applications found
      </h2>

      <p className="mx-auto mt-2 max-w-sm text-xs font-medium leading-5 text-[#9A9088]">
        Belum ada pengajuan mentor untuk filter yang sedang dipilih.
      </p>
    </div>
  );
}

/* =========================================================
   ICONS
========================================================= */

function CheckIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12.5L9.5 17L19 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 4L21 19H3L12 4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M12 9V13"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <circle cx="12" cy="16" r="0.8" fill="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 17L17 7M9 7H17V15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
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
