"use client";

import { useCallback, useEffect, useState } from "react";
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

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const tabs: {
  key: "all" | ApplicationStatus;
  label: string;
}[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function AdminMentorApplicationsPage() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | ApplicationStatus>(
    "pending",
  );

  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

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
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.message || "Gagal mengambil pengajuan mentor.");
        return;
      }

      setApplications(data?.data ?? []);
    } catch {
      setError(
        "Tidak dapat terhubung ke server. Pastikan backend Laravel sedang berjalan.",
      );
    } finally {
      setLoading(false);
    }
  }, [activeTab, token]);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token") || "";
    const storedRole = localStorage.getItem("user_role") || "";

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

  useEffect(() => {
    if (!checkingAuth && token) {
      loadApplications();
    }
  }, [checkingAuth, token, loadApplications]);

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

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.message || "Gagal menyetujui pengajuan mentor.");
        return;
      }

      setSuccess(data?.message || "Pengajuan mentor berhasil disetujui.");

      setSelectedApplication(null);
      await loadApplications();
    } catch {
      setError("Gagal terhubung ke server saat approve.");
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = () => {
    if (!selectedApplication) {
      return;
    }

    setRejectionReason("");
    setRejectModalOpen(true);
  };

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

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.message || "Gagal menolak pengajuan mentor.");
        return;
      }

      setSuccess(data?.message || "Pengajuan mentor berhasil ditolak.");

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

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-[#FCFBF8]">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E7E0D3] border-t-[#1E3F20]" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FCFBF8] px-5 py-8 sm:px-7 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Hero */}
        <section className="overflow-hidden rounded-[30px] bg-[#1E3F20] px-6 py-8 text-white shadow-xl sm:px-8 sm:py-10 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white/80">
                Admin Panel
              </span>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Mentor Applications
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                Review pengajuan mentor dari pengguna sebelum mereka mendapat
                akses sebagai mentor di Career Cafe.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">
                Current Queue
              </p>
              <p className="mt-1 text-3xl font-extrabold">
                {applications.length}
              </p>
            </div>
          </div>
        </section>

        {/* Feedback */}
        {success && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold leading-6 text-emerald-800">
            {success}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold leading-6 text-red-700">
            {error}
          </div>
        )}

        {/* Tabs */}
        <section className="mt-6 rounded-3xl border border-[#E7E0D5] bg-white p-2 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const active = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={[
                    "cursor-pointer rounded-2xl px-5 py-3 text-sm font-extrabold transition-all duration-300",
                    active
                      ? "bg-[#1E3F20] text-white shadow-sm"
                      : "text-gray-500 hover:bg-[#F7F4EC] hover:text-[#1E3F20]",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Applications */}
        <section className="mt-6">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-[#E7E0D5] bg-white">
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E7E0D3] border-t-[#1E3F20]" />

                <p className="mt-4 text-sm font-semibold text-gray-500">
                  Loading applications...
                </p>
              </div>
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#D9D1C3] bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F2EEE6] text-[#1E3F20]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M16 21V19C16 16.7909 14.2091 15 12 15H6C3.79086 15 2 16.7909 2 19V21"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="9"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M19 8V14M16 11H22"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h2 className="mt-5 text-xl font-extrabold text-[#2C1E16]">
                No applications found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Belum ada pengajuan mentor untuk filter yang sedang dipilih.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application, index) => (
                <button
                  key={application.id}
                  type="button"
                  onClick={() => setSelectedApplication(application)}
                  className="group w-full cursor-pointer rounded-3xl border border-[#E7E0D5] bg-white p-5 text-left shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-[#CFC7B8] hover:shadow-lg sm:p-6"
                  style={{
                    animation: `fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${
                      index * 80
                    }ms both`,
                  }}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#E8F0E8] text-lg font-extrabold text-[#1E3F20]">
                        {application.full_name.trim().charAt(0).toUpperCase() ||
                          "U"}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-lg font-extrabold text-[#2C1E16]">
                            {application.full_name}
                          </h2>

                          <StatusBadge status={application.status} />
                        </div>

                        <p className="mt-1 text-sm font-bold text-[#1E3F20]">
                          {application.job_title}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {application.company || "Independent"}{" "}
                          {application.location
                            ? `• ${application.location}`
                            : ""}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <MetaBadge>
                            {application.experience_years} years experience
                          </MetaBadge>

                          {application.industry?.name && (
                            <MetaBadge>{application.industry.name}</MetaBadge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 items-center justify-between gap-4 lg:flex-col lg:items-end">
                      <div className="text-left lg:text-right">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                          Submitted
                        </p>

                        <p className="mt-1 text-sm font-bold text-gray-700">
                          {new Date(application.created_at).toLocaleDateString(
                            "id-ID",
                          )}
                        </p>
                      </div>

                      <span className="text-sm font-extrabold text-[#1E3F20] transition-transform duration-300 group-hover:translate-x-1">
                        Review →
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Detail Modal */}
      {selectedApplication && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-[3px]"
          onClick={() => {
            if (!actionLoading) {
              setSelectedApplication(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[30px] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            style={{
              animation: "fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
            }}
          >
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5 sm:px-7">
              <div className="min-w-0 pr-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-extrabold text-[#2C1E16]">
                    {selectedApplication.full_name}
                  </h2>

                  <StatusBadge status={selectedApplication.status} />
                </div>

                <p className="mt-1 text-sm font-bold text-[#1E3F20]">
                  {selectedApplication.job_title}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedApplication.user?.email || "No email"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                disabled={actionLoading}
                className="cursor-pointer rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed"
                aria-label="Close"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="max-h-[62vh] overflow-y-auto px-6 py-6 sm:px-7">
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>

              <DetailBlock
                title="Professional Bio"
                content={selectedApplication.bio}
              />

              <DetailBlock
                title="Motivation"
                content={selectedApplication.motivation}
              />

              {selectedApplication.status === "rejected" &&
                selectedApplication.rejection_reason && (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">
                    <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-red-500">
                      Rejection Reason
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-red-800">
                      {selectedApplication.rejection_reason}
                    </p>
                  </div>
                )}
            </div>

            {selectedApplication.status === "pending" && (
              <div className="flex flex-col gap-3 border-t border-gray-100 bg-[#FCFBF8] px-6 py-5 sm:flex-row sm:justify-end sm:px-7">
                <button
                  type="button"
                  onClick={openRejectModal}
                  disabled={actionLoading}
                  className="cursor-pointer rounded-2xl border border-red-200 bg-white px-5 py-3.5 text-sm font-extrabold text-red-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reject
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="cursor-pointer rounded-2xl bg-[#1E3F20] px-5 py-3.5 text-sm font-extrabold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152E17] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Approve Mentor"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedApplication && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4 backdrop-blur-[3px]"
          onClick={() => {
            if (!actionLoading) {
              setRejectModalOpen(false);
            }
          }}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
            style={{
              animation: "fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
            }}
          >
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-red-500">
              Reject Application
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-[#2C1E16]">
              Why should this application be rejected?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Berikan alasan yang jelas agar pemohon memahami apa yang perlu
              diperbaiki.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              rows={6}
              maxLength={3000}
              placeholder="Contoh: Profil profesional masih belum cukup lengkap..."
              className="mt-5 w-full resize-none rounded-2xl border border-[#DED7CB] px-4 py-3.5 text-sm leading-7 text-gray-700 outline-none transition placeholder:text-gray-300 focus:border-[#B44A42] focus:ring-4 focus:ring-red-500/10"
            />

            <div className="mt-2 text-right text-xs font-semibold text-gray-400">
              {rejectionReason.length}/3000
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                disabled={actionLoading}
                className="cursor-pointer rounded-2xl border border-[#DDD7CA] bg-white px-5 py-3.5 text-sm font-extrabold text-gray-600 transition hover:bg-[#F8F6F1] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="cursor-pointer rounded-2xl bg-red-600 px-5 py-3.5 text-sm font-extrabold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </main>
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = {
    pending: {
      label: "Pending",
      className: "bg-amber-50 text-amber-700",
    },
    approved: {
      label: "Approved",
      className: "bg-emerald-50 text-emerald-700",
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-50 text-red-700",
    },
  }[status];

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function MetaBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#F4F0E8] px-3 py-1.5 text-xs font-bold text-gray-600">
      {children}
    </span>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F8F6F1] p-4">
      <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-gray-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-bold leading-6 text-[#2C1E16]">
        {value}
      </p>
    </div>
  );
}

function DetailBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-[#E7E0D5] bg-white p-5">
      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-gray-400">
        {title}
      </p>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600">
        {content}
      </p>
    </div>
  );
}
