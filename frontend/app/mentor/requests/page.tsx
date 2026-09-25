"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type Session = {
  id: number;
  topic: string;
  duration?: number | null;
  status: string;
  message?: string | null;
  meeting_link?: string | null;
  created_at?: string | null;
  mentee?: {
    id: number;
    name: string;
    email?: string | null;
    profile?: {
      profile_photo?: string | null;
      job_title?: string | null;
      company?: string | null;
      location?: string | null;
    } | null;
  } | null;
  booked_slot?: {
    id?: number;
    date?: string;
    start_time?: string;
    end_time?: string;
  } | null;
  bookedSlot?: {
    id?: number;
    date?: string;
    start_time?: string;
    end_time?: string;
  } | null;
};

type TabKey = "all" | "pending" | "approved" | "completed" | "cancelled";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const BACKEND_URL = API_URL.replace(/\/api$/, "");

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
    key: "completed",
    label: "Completed",
  },
  {
    key: "cancelled",
    label: "Cancelled",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getSlot(session: Session) {
  return session.booked_slot ?? session.bookedSlot ?? null;
}

function parseDate(session: Session) {
  const slot = getSlot(session);

  if (!slot) {
    return null;
  }

  if (slot.date && slot.start_time) {
    const date = new Date(`${slot.date}T${slot.start_time}`);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
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
    return `${BACKEND_URL}${value}`;
  }

  if (value.startsWith("storage/")) {
    return `${BACKEND_URL}/${value}`;
  }

  return `${BACKEND_URL}/storage/${value}`;
}

function getInitial(name?: string | null) {
  return name?.trim().charAt(0).toUpperCase() || "M";
}

function formatRequestDate(session: Session) {
  const date = parseDate(session);

  if (!date) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(time?: string) {
  return time ? time.slice(0, 5) : "--:--";
}

function formatRelativeDate(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diff = Date.now() - date.getTime();

  const minutes = Math.floor(diff / 60000);

  const hours = Math.floor(diff / 3600000);

  const days = Math.floor(diff / 86400000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function isCancelledStatus(status: string) {
  return ["cancelled", "rejected", "expired"].includes(status.toLowerCase());
}

function statusLabel(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return "Pending";

    case "approved":
      return "Approved";

    case "completed":
      return "Completed";

    case "rejected":
      return "Rejected";

    case "cancelled":
      return "Cancelled";

    case "expired":
      return "Expired";

    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

function statusClass(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return "border-[#F1DCA8] bg-[#FFF6E4] text-[#AA6C1C]";

    case "approved":
      return "border-[#CDE4D1] bg-[#EDF7EF] text-[#4E7B56]";

    case "completed":
      return "border-[#CFE0F4] bg-[#EEF5FC] text-[#4E75A4]";

    case "rejected":
      return "border-[#F0D0CC] bg-[#FDF0EE] text-[#B35850]";

    case "cancelled":
    case "expired":
      return "border-[#E4E0DB] bg-[#F6F3EF] text-[#81776F]";

    default:
      return "border-[#E4E0DB] bg-[#F6F3EF] text-[#81776F]";
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function MentorRequestsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  const [activeTab, setActiveTab] = useState<TabKey>("pending");

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [selectedRequest, setSelectedRequest] = useState<Session | null>(null);

  /* =======================================================
     LOAD SESSIONS
  ======================================================== */

  const loadSessions = useCallback(async () => {
    const token = localStorage.getItem("auth_token") || "";

    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/sessions?per_page=100`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.message || "Unable to load mentor requests.");

        return;
      }

      const raw = data?.data ?? data;

      const list: Session[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : [];

      setSessions(list);

      setSelectedRequest((current) => {
        if (!current) {
          return null;
        }

        return list.find((item) => item.id === current.id) ?? null;
      });
    } catch {
      setError("Unable to connect to the Laravel backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  /* =======================================================
     FILTER
  ======================================================== */

  const filteredSessions = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => {
      const dateA = parseDate(a)?.getTime() ?? 0;

      const dateB = parseDate(b)?.getTime() ?? 0;

      return dateA - dateB;
    });

    if (activeTab === "all") {
      return sorted;
    }

    if (activeTab === "cancelled") {
      return sorted.filter((session) => isCancelledStatus(session.status));
    }

    return sorted.filter((session) => session.status === activeTab);
  }, [activeTab, sessions]);

  /* =======================================================
     COUNTS
  ======================================================== */

  const counts = useMemo(() => {
    const pending = sessions.filter(
      (session) => session.status === "pending",
    ).length;

    const approved = sessions.filter(
      (session) => session.status === "approved",
    ).length;

    const completed = sessions.filter(
      (session) => session.status === "completed",
    ).length;

    return {
      all: sessions.length,
      pending,
      approved,
      completed,
    };
  }, [sessions]);

  /* =======================================================
     ACTION
  ======================================================== */

  const handleAction = async (
    session: Session,
    action: "approve" | "reject",
  ) => {
    const menteeName = session.mentee?.name || "this mentee";

    const message =
      action === "approve"
        ? `Approve the mentoring request from ${menteeName}?`
        : `Reject the mentoring request from ${menteeName}?`;

    if (!window.confirm(message)) {
      return;
    }

    const token = localStorage.getItem("auth_token") || "";

    if (!token) {
      setError("Your session has expired. Please log in again.");

      return;
    }

    setActionLoading(session.id);

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/sessions/${session.id}/${action}`,
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
        setError(data?.message || `Unable to ${action} the request.`);

        return;
      }

      setSuccess(
        action === "approve"
          ? "Mentoring request approved successfully."
          : "Mentoring request rejected successfully.",
      );

      setSelectedRequest(null);

      await loadSessions();
    } catch {
      setError("Unable to connect to the Laravel backend.");
    } finally {
      setActionLoading(null);
    }
  };

  /* =======================================================
     RENDER
  ======================================================== */

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#FFFDFC] px-5 pb-14 pt-7 sm:px-7 lg:px-9 xl:px-10">
      <div className="mx-auto max-w-[1420px]">
        {/* ==================================================
            HEADER
        ================================================== */}
        <section className="mentor-reveal flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#AAA097]">
              Mentor workspace
            </p>

            <h1 className="mt-1.5 text-[36px] font-black tracking-[-0.06em] text-[#302923] sm:text-[42px]">
              Mentoring requests
            </h1>

            <p className="mt-1.5 max-w-[620px] text-xs font-medium leading-5 text-[#968C84]">
              Review incoming requests, check session details, and manage your
              mentoring queue.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-[#E8E1DA] bg-white px-4 py-2.5 shadow-sm">
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[#AAA097]">
                Total
              </p>

              <p className="mt-0.5 text-lg font-black tracking-[-0.03em] text-[#332B25]">
                {counts.all}
              </p>
            </div>

            <div className="rounded-xl bg-[#FFF3D8] px-4 py-2.5">
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[#B17A29]">
                Pending
              </p>

              <p className="mt-0.5 text-lg font-black tracking-[-0.03em] text-[#A96919]">
                {counts.pending}
              </p>
            </div>
          </div>
        </section>

        {/* ==================================================
            METRICS
        ================================================== */}
        <section className="mentor-reveal mentor-delay-1 mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <RequestMetric
            label="All requests"
            value={counts.all}
            icon={<GridIcon />}
            tone="green"
          />

          <RequestMetric
            label="Pending review"
            value={counts.pending}
            icon={<PendingIcon />}
            tone="amber"
          />

          <RequestMetric
            label="Approved"
            value={counts.approved}
            icon={<ApprovedIcon />}
            tone="blue"
          />

          <RequestMetric
            label="Completed"
            value={counts.completed}
            icon={<CompletedIcon />}
            tone="teal"
          />
        </section>

        {/* ==================================================
            SUCCESS
        ================================================== */}
        {success && (
          <div className="mentor-reveal mt-5 flex items-center gap-3 rounded-2xl border border-[#D0E7D4] bg-[#F0F8F1] px-4 py-3.5 text-xs font-bold text-[#4E7955] shadow-sm">
            <SuccessIcon />

            <span>{success}</span>
          </div>
        )}

        {/* ==================================================
            ERROR
        ================================================== */}
        {error && (
          <div className="mentor-reveal mt-5 flex items-center gap-3 rounded-2xl border border-[#F0D3CF] bg-[#FDF1EF] px-4 py-3.5 text-xs font-bold text-[#B4544B] shadow-sm">
            <ErrorIcon />

            <span>{error}</span>
          </div>
        )}

        {/* ==================================================
            MAIN REQUEST AREA
        ================================================== */}
        <section
          className="mentor-reveal mentor-delay-2 mt-5 overflow-hidden rounded-[28px] border border-[#E9E4DE] bg-white shadow-[0_16px_38px_rgba(53,39,29,.045)]"
          style={{
            animationDelay: "140ms",
          }}
        >
          {/* =================================================
              TABS
          ================================================== */}
          <div className="border-b border-[#EEE9E3] px-4 py-3 sm:px-5">
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map((tab) => {
                const active = activeTab === tab.key;

                const count =
                  tab.key === "all"
                    ? counts.all
                    : tab.key === "pending"
                      ? counts.pending
                      : tab.key === "approved"
                        ? counts.approved
                        : tab.key === "completed"
                          ? counts.completed
                          : sessions.filter((session) =>
                              isCancelledStatus(session.status),
                            ).length;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={[
                      "flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2.5 text-[10px] font-black transition-all duration-300",
                      active
                        ? "bg-[#607E64] text-white shadow-[0_8px_20px_rgba(96,126,100,.16)]"
                        : "text-[#837971] hover:bg-[#F7F3EE] hover:text-[#55765B]",
                    ].join(" ")}
                  >
                    <span>{tab.label}</span>

                    <span
                      className={[
                        "rounded-full px-1.5 py-0.5 text-[8px]",
                        active
                          ? "bg-white/20 text-white"
                          : "bg-[#F1ECE6] text-[#958B83]",
                      ].join(" ")}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* =================================================
              REQUEST LIST
          ================================================== */}
          {loading ? (
            <LoadingState />
          ) : filteredSessions.length === 0 ? (
            <EmptyState activeTab={activeTab} />
          ) : (
            <div className="divide-y divide-[#F1ECE7]">
              {filteredSessions.map((session, index) => (
                <RequestRow
                  key={session.id}
                  session={session}
                  index={index}
                  actionLoading={actionLoading}
                  onSelect={() => setSelectedRequest(session)}
                  onAction={handleAction}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ==================================================
          DETAIL MODAL
      ================================================== */}
      {selectedRequest && (
        <RequestModal
          session={selectedRequest}
          actionLoading={actionLoading}
          onClose={() => setSelectedRequest(null)}
          onAction={handleAction}
        />
      )}
    </main>
  );
}

/* =========================================================
   REQUEST ROW
========================================================= */

function RequestRow({
  session,
  index,
  actionLoading,
  onSelect,
  onAction,
}: {
  session: Session;
  index: number;
  actionLoading: number | null;
  onSelect: () => void;
  onAction: (session: Session, action: "approve" | "reject") => void;
}) {
  const slot = getSlot(session);

  const photo = session.mentee?.profile?.profile_photo
    ? resolveImageUrl(session.mentee.profile.profile_photo)
    : "";

  const isPending = session.status === "pending";

  return (
    <article
      className="mentor-reveal group px-5 py-5 transition duration-300 hover:bg-[#FCFAF7] sm:px-6"
      style={{
        animationDelay: `${120 + index * 55}ms`,
      }}
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        {/* =================================================
            LEFT
        ================================================== */}
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 cursor-pointer items-start gap-4 text-left"
        >
          {/* AVATAR */}
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#E9F0E8] text-sm font-black text-[#57755B]">
            {photo ? (
              <img
                src={photo}
                alt={session.mentee?.name || "Mentee"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{getInitial(session.mentee?.name)}</span>
            )}

            {isPending && (
              <span className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#D99A43]" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            {/* NAME */}
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-sm font-black text-[#322A24] sm:text-[15px]">
                {session.mentee?.name || "Unknown mentee"}
              </h2>

              <StatusBadge status={session.status} />
            </div>

            {/* TOPIC */}
            <p className="mt-1 text-xs font-black text-[#5A795F]">
              {session.topic || "Career mentoring"}
            </p>

            {/* ROLE */}
            <p className="mt-1 truncate text-[9px] font-semibold text-[#9C928A]">
              {session.mentee?.profile?.job_title ||
                session.mentee?.email ||
                "Career Cafe mentee"}

              {session.mentee?.profile?.company
                ? ` · ${session.mentee.profile.company}`
                : ""}
            </p>

            {/* META */}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[9px] font-bold text-[#9A9189]">
              <span className="inline-flex items-center gap-1.5">
                <CalendarMiniIcon />

                {formatRequestDate(session)}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <ClockMiniIcon />

                {formatTime(slot?.start_time)}

                {" – "}

                {formatTime(slot?.end_time)}

                {" WITA"}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <DurationIcon />
                {session.duration || 45} min
              </span>
            </div>
          </div>
        </button>

        {/* =================================================
            ACTIONS
        ================================================== */}
        <div className="flex shrink-0 items-center gap-2 xl:justify-end">
          <span className="hidden text-[9px] font-bold text-[#A59B93] md:block">
            {formatRelativeDate(session.created_at)}
          </span>

          {isPending ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onAction(session, "reject")}
                disabled={actionLoading === session.id}
                className="cursor-pointer rounded-xl border border-[#F0D4CF] bg-[#FDF2EF] px-3.5 py-2.5 text-[9px] font-black text-[#B65A51] transition duration-300 hover:-translate-y-0.5 hover:bg-[#FBE8E4] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reject
              </button>

              <button
                type="button"
                onClick={() => onAction(session, "approve")}
                disabled={actionLoading === session.id}
                className="cursor-pointer rounded-xl bg-[#607E64] px-4 py-2.5 text-[9px] font-black text-white shadow-[0_8px_18px_rgba(96,126,100,.14)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#547259] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading === session.id ? "Processing..." : "Approve"}
              </button>
            </div>
          ) : session.status === "approved" && session.meeting_link ? (
            <a
              href={session.meeting_link}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-[#EAF2FA] px-4 py-2.5 text-[9px] font-black text-[#4B73A4] transition duration-300 hover:-translate-y-0.5 hover:bg-[#DFEBF8]"
            >
              Join meeting
            </a>
          ) : (
            <button
              type="button"
              onClick={onSelect}
              className="cursor-pointer rounded-xl bg-[#F5F1EC] px-3.5 py-2.5 text-[9px] font-black text-[#766C64] transition duration-300 hover:bg-[#EEE8E0] hover:text-[#55765B]"
            >
              Details
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   DETAIL MODAL
========================================================= */

function RequestModal({
  session,
  actionLoading,
  onClose,
  onAction,
}: {
  session: Session;
  actionLoading: number | null;
  onClose: () => void;
  onAction: (session: Session, action: "approve" | "reject") => void;
}) {
  const slot = getSlot(session);

  const photo = session.mentee?.profile?.profile_photo
    ? resolveImageUrl(session.mentee.profile.profile_photo)
    : "";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2C241F]/30 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close request details"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-[580px] overflow-y-auto rounded-[28px] border border-[#E7E1DA] bg-[#FFFDFC] shadow-[0_30px_80px_rgba(44,30,22,.18)]">
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-[#EEE9E3] p-6">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#AAA097]">
              Request details
            </p>

            <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-[#342B25]">
              Mentoring request
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-[#F4F0EB] text-[#7D736B] transition hover:bg-[#EDE7DF] hover:text-[#4F7056]"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* PROFILE */}
        <div className="p-6">
          <div className="flex items-center gap-4 rounded-[20px] bg-[#F6F3EE] p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#E8F0E8] text-base font-black text-[#55765B]">
              {photo ? (
                <img
                  src={photo}
                  alt={session.mentee?.name || "Mentee"}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitial(session.mentee?.name)
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-base font-black text-[#372E28]">
                  {session.mentee?.name || "Unknown mentee"}
                </h3>

                <StatusBadge status={session.status} />
              </div>

              <p className="mt-1 truncate text-[9px] font-semibold text-[#978D85]">
                {session.mentee?.profile?.job_title ||
                  session.mentee?.email ||
                  "Career Cafe mentee"}
              </p>

              {session.mentee?.profile?.company && (
                <p className="mt-0.5 truncate text-[8px] font-medium text-[#A69D95]">
                  {session.mentee.profile.company}
                </p>
              )}
            </div>
          </div>

          {/* TOPIC */}
          <div className="mt-5">
            <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#AAA097]">
              Requested session
            </p>

            <h3 className="mt-2 text-lg font-black text-[#3A312B]">
              {session.topic || "Career mentoring"}
            </h3>
          </div>

          {/* DETAILS */}
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <DetailBox
              label="Date"
              value={formatRequestDate(session)}
              icon={<CalendarMiniIcon />}
            />

            <DetailBox
              label="Time"
              value={`${formatTime(slot?.start_time)} – ${formatTime(
                slot?.end_time,
              )}`}
              icon={<ClockMiniIcon />}
            />

            <DetailBox
              label="Duration"
              value={`${session.duration || 45} min`}
              icon={<DurationIcon />}
            />
          </div>

          {/* MESSAGE */}
          <div className="mt-5 rounded-[20px] border border-[#EEE8E1] bg-white p-4">
            <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#AAA097]">
              Message from mentee
            </p>

            <p className="mt-2 text-xs font-medium leading-6 text-[#6F665F]">
              {session.message || "No message was included with this request."}
            </p>
          </div>

          {/* ACTION */}
          {session.status === "pending" && (
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => onAction(session, "reject")}
                disabled={actionLoading === session.id}
                className="flex-1 cursor-pointer rounded-xl border border-[#EFCFC9] bg-[#FDF1EF] px-4 py-3 text-[10px] font-black text-[#B45950] transition hover:bg-[#F9E8E4] disabled:opacity-50"
              >
                Reject request
              </button>

              <button
                type="button"
                onClick={() => onAction(session, "approve")}
                disabled={actionLoading === session.id}
                className="flex-1 cursor-pointer rounded-xl bg-[#607E64] px-4 py-3 text-[10px] font-black text-white shadow-[0_10px_22px_rgba(96,126,100,.14)] transition hover:-translate-y-0.5 hover:bg-[#547259] disabled:opacity-50"
              >
                {actionLoading === session.id
                  ? "Processing..."
                  : "Approve request"}
              </button>
            </div>
          )}

          {session.status === "approved" && session.meeting_link && (
            <a
              href={session.meeting_link}
              target="_blank"
              rel="noreferrer"
              className="mt-5 flex items-center justify-center rounded-xl bg-[#EAF2FA] px-4 py-3 text-[10px] font-black text-[#4B73A4] transition hover:bg-[#DFEBF8]"
            >
              Join meeting
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL BOX
========================================================= */

function DetailBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[18px] border border-[#EEE8E1] bg-[#FBF9F6] p-3">
      <div className="flex items-center gap-2 text-[#6A806D]">
        {icon}

        <span className="text-[8px] font-black uppercase tracking-[0.1em] text-[#AAA097]">
          {label}
        </span>
      </div>

      <p className="mt-2 text-[10px] font-black text-[#4B4038]">{value}</p>
    </div>
  );
}

/* =========================================================
   METRIC
========================================================= */

function RequestMetric({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  tone: "green" | "amber" | "blue" | "teal";
}) {
  const tones = {
    green: "bg-[#EAF1E9] text-[#55765B]",

    amber: "bg-[#FFF0D6] text-[#B36E1C]",

    blue: "bg-[#EAF2FB] text-[#4D77AC]",

    teal: "bg-[#E5F2F0] text-[#3D807D]",
  };

  return (
    <div className="rounded-[20px] border border-[#ECE7E1] bg-white p-4 shadow-[0_10px_24px_rgba(53,39,29,.035)]">
      <div className="flex items-center gap-3">
        <span
          className={[
            "flex h-9 w-9 items-center justify-center rounded-xl",
            tones[tone],
          ].join(" ")}
        >
          {icon}
        </span>

        <div className="min-w-0">
          <p className="truncate text-[8px] font-black uppercase tracking-[0.13em] text-[#AAA097]">
            {label}
          </p>

          <p className="mt-0.5 text-xl font-black tracking-[-0.04em] text-[#342B25]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-2.5 py-1 text-[7px] font-black",
        statusClass(status),
      ].join(" ")}
    >
      {statusLabel(status)}
    </span>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="space-y-0">
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-4 border-b border-[#F1ECE7] px-5 py-6 sm:px-6"
        >
          <div className="h-12 w-12 rounded-2xl bg-[#E9E4DE]" />

          <div className="min-w-0 flex-1">
            <div className="h-3.5 w-48 rounded bg-[#E9E4DE]" />

            <div className="mt-2 h-2.5 w-32 rounded bg-[#EFEAE5]" />

            <div className="mt-3 h-2 w-64 max-w-full rounded bg-[#F1ECE7]" />
          </div>

          <div className="h-9 w-24 rounded-xl bg-[#EAE5DF]" />
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({ activeTab }: { activeTab: TabKey }) {
  const label =
    activeTab === "all"
      ? "No requests yet"
      : activeTab === "cancelled"
        ? "No cancelled requests"
        : `No ${activeTab} requests`;

  const description =
    activeTab === "pending"
      ? "New mentoring requests from mentees will appear here."
      : "There are no requests matching the selected filter.";

  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#F1ECE6] text-[#668069]">
        <InboxIcon />
      </div>

      <h2 className="mt-4 text-xl font-black tracking-[-0.03em] text-[#382F29]">
        {label}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-xs font-medium leading-6 text-[#9A9189]">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   ICONS
========================================================= */

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1.4"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <rect
        x="14"
        y="4"
        width="6"
        height="6"
        rx="1.4"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <rect
        x="4"
        y="14"
        width="6"
        height="6"
        rx="1.4"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <rect
        x="14"
        y="14"
        width="6"
        height="6"
        rx="1.4"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />

      <path
        d="M12 7V12L15 14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ApprovedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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

function CompletedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect
        x="3.5"
        y="5"
        width="17"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M7.5 9.5H16.5M7.5 13H14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarMiniIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
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

function ClockMiniIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
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

function DurationIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 4H18M6 20H18M8 4C8 7.5 10 9 12 12C10 15 8 16.5 8 20M16 4C16 7.5 14 9 12 12C14 15 16 16.5 16 20"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />

      <path
        d="M8 12L10.8 15L16.5 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />

      <path
        d="M12 7.5V13.5M12 17H12.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 6.5C4 5.67 4.67 5 5.5 5H18.5C19.33 5 20 5.67 20 6.5V17.5C20 18.33 19.33 19 18.5 19H5.5C4.67 19 4 18.33 4 17.5V6.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      <path
        d="M4 14H8L9.5 16H14.5L16 14H20"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
