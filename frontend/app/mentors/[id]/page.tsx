"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const EASE = [0.22, 1, 0.36, 1] as const;

type MeetingType = "online" | "offline";

type Skill = {
  id: number;
  name: string;
};

type Industry = {
  id: number;
  name: string;
  description?: string | null;
};

type MentorFeedback = {
  id: number;
  session_id: number;
  mentor_id: number;
  mentee_id: number;
  rating: number;
  comment?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  mentee?: {
    id: number;
    name: string;
  } | null;
};

type MentorProfile = {
  id?: number;
  user_id?: number;
  industry_id?: number | null;
  profile_photo?: string | null;
  cover_photo?: string | null;
  bio?: string | null;
  location?: string | null;
  job_title?: string | null;
  company?: string | null;
  experience_years?: number | null;
  education?: string | null;
  linkedin_url?: string | null;
  timezone?: string | null;
  avg_rating?: string | number | null;
  total_reviews?: number | null;
  industry?: Industry | null;
};

type Mentor = {
  id: number;
  name: string;
  email?: string | null;
  role?: string | null;
  status?: string | null;
  completed_sessions_count?: number;
  profile?: MentorProfile | null;
  skills?: Skill[];
  availabilities?: Availability[];
  mentor_feedbacks?: MentorFeedback[];
};

type Availability = {
  id: number;
  mentor_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

type BookedSlot = {
  id: number;
  mentor_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  availability_id?: number | null;
};

type MentorDetailResponse = {
  success: boolean;
  message?: string;
  data?: Mentor;
};

type SlotResponse = {
  success: boolean;
  message?: string;
  data?: BookedSlot[];
};

/* ============================================================
   DAYS & MONTHS
============================================================ */

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* ============================================================
   FORMAT TIME
============================================================ */

function formatTime(value?: string | null) {
  if (!value) {
    return "--:--";
  }

  return value.slice(0, 5);
}

/* ============================================================
   RESOLVE IMAGE URL
============================================================ */

function resolveImageUrl(value?: string | null) {
  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/")) {
    return `http://127.0.0.1:8000${value}`;
  }

  return `http://127.0.0.1:8000/storage/${value.replace(/^storage\//, "")}`;
}

/* ============================================================
   FORMAT LONG DATE
============================================================ */

function formatLongDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ============================================================
   FORMAT COMPACT DATE
============================================================ */

function formatCompactDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

/* ============================================================
   INITIAL
============================================================ */

function getInitial(name?: string | null) {
  return (name?.trim()?.charAt(0) || "M").toUpperCase();
}

/* ============================================================
   DATE KEY
============================================================ */

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function dateToKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
}

/* ============================================================
   STAR ROW
============================================================ */

function StarRow({
  rating,
  size = "text-sm",
}: {
  rating: number;
  size?: string;
}) {
  return (
    <div
      className={`flex items-center gap-0.5 ${size}`}
      aria-label={`Rating ${rating} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < Math.round(rating);

        return (
          <span
            key={index}
            className={filled ? "text-[#D8A94A]" : "text-[#DDD6CD]"}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

/* ============================================================
   ICONS
============================================================ */

function IconBriefcase({ size = 16 }: { size?: number }) {
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
        y="7"
        width="18"
        height="13"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 7V5.5C8 4.67 8.67 4 9.5 4H14.5C15.33 4 16 4.67 16 5.5V7"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M3 12H21" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconCalendar({ size = 16 }: { size?: number }) {
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
        y="4.5"
        width="18"
        height="17"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7 2.75V6.5M17 2.75V6.5M3 9.5H21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconX({ size = 19 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClock({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8.75"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 7.5V12L15 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconVideo({ size = 18 }: { size?: number }) {
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
        y="6"
        width="12"
        height="12"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M15 10L20 7.5V16.5L15 14V10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPin({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 10.5C20 15.5 12 21 12 21S4 15.5 4 10.5A8 8 0 1 1 20 10.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="10.5"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function IconGraduation({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 9.5L12 4L21 9.5L12 15L3 9.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7 12V16.2C7 17.3 9.24 19 12 19C14.76 19 17 17.3 17 16.2V12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M21 10V15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ============================================================
   SKILL LOGO
============================================================ */

function SkillLogo({ name }: { name: string }) {
  const normalized = name.trim().toLowerCase();

  if (normalized === "figma") {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8.2 3.5H12V9.6H8.2A3.05 3.05 0 0 1 5.15 6.55 3.05 3.05 0 0 1 8.2 3.5Z"
          fill="#F24E1E"
        />
        <path
          d="M12 3.5H15.8A3.05 3.05 0 0 1 18.85 6.55 3.05 3.05 0 0 1 15.8 9.6H12V3.5Z"
          fill="#FF7262"
        />
        <path
          d="M8.2 9.6H12V15.7H8.2A3.05 3.05 0 0 1 5.15 12.65 3.05 3.05 0 0 1 8.2 9.6Z"
          fill="#A259FF"
        />
        <path
          d="M12 9.6H15.8A3.05 3.05 0 0 1 18.85 12.65 3.05 3.05 0 0 1 15.8 15.7H12V9.6Z"
          fill="#1ABCFE"
        />
        <path d="M8.2 15.7H12V19.75A3.05 3.05 0 1 1 8.2 15.7Z" fill="#0ACF83" />
      </svg>
    );
  }

  if (normalized === "next.js" || normalized === "nextjs") {
    return (
      <span className="text-[13px] font-black tracking-[-0.08em] text-[#111111]">
        N
      </span>
    );
  }

  if (normalized === "react" || normalized === "react.js") {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="1.8" fill="#61DAFB" />
        <ellipse
          cx="12"
          cy="12"
          rx="9"
          ry="3.7"
          stroke="#61DAFB"
          strokeWidth="1.5"
        />
        <ellipse
          cx="12"
          cy="12"
          rx="9"
          ry="3.7"
          transform="rotate(60 12 12)"
          stroke="#61DAFB"
          strokeWidth="1.5"
        />
        <ellipse
          cx="12"
          cy="12"
          rx="9"
          ry="3.7"
          transform="rotate(120 12 12)"
          stroke="#61DAFB"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (normalized === "laravel") {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3.5 16.8 8 13.9l4 2.5 4-2.5 4.5 2.9"
          stroke="#FF2D20"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 7.3 12 4.8l4 2.5v4.1l-4 2.5-4-2.5V7.3Z"
          stroke="#FF2D20"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M12 4.8v4.1l4 2.5"
          stroke="#FF2D20"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (normalized.includes("postgres")) {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M7 6.5C7 4.85 9.24 4 12 4s5 .85 5 2.5v6.1c0 2.25-2.2 3.4-4.2 3.7v2.2"
          stroke="#336791"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M7 6.5c0 1.65 2.24 2.5 5 2.5s5-.85 5-2.5"
          stroke="#336791"
          strokeWidth="1.6"
        />
        <path
          d="M9.2 16.1c-.3 1.2-1.2 2-2.3 2.4"
          stroke="#336791"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (normalized === "docker") {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3.5 14.3c1.6-4.9 4.8-7.3 9.3-7.3 3.1 0 5.5 1.2 7.2 3.5"
          stroke="#2496ED"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M5 14.3h14.5c-.8 3-2.9 4.7-6.4 4.7H8.8c-2.1 0-3.5-.8-4.2-2.4"
          stroke="#2496ED"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 8h2v2H8V8Zm3 0h2v2h-2V8Zm-3 3h2v2H8v-2Zm3 0h2v2h-2v-2Z"
          fill="#2496ED"
        />
      </svg>
    );
  }

  if (normalized === "typescript") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-[#3178C6] text-[10px] font-black text-white">
        TS
      </span>
    );
  }

  if (normalized === "javascript" || normalized === "javascript.js") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-[#F7DF1E] text-[9px] font-black text-[#111111]">
        JS
      </span>
    );
  }

  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "S";

  return (
    <span className="text-[9px] font-black text-[#55765B]">{initials}</span>
  );
}

/* ============================================================
   FADE SECTION
============================================================ */

function FadeSection({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? false
          : {
              opacity: 0,
              y: 24,
              scale: 0.992,
            }
      }
      whileInView={
        shouldReduceMotion
          ? undefined
          : {
              opacity: 1,
              y: 0,
              scale: 1,
            }
      }
      viewport={{
        once: true,
        amount: 0.08,
      }}
      transition={{
        duration: 0.72,
        delay,
        ease: EASE,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function MentorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const shouldReduceMotion = useReducedMotion();

  const mentorId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? (params.id[0] ?? "")
        : "";

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [slots, setSlots] = useState<BookedSlot[]>([]);
  const [userRole, setUserRole] = useState("");

  const [loadingMentor, setLoadingMentor] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(true);

  const [pageError, setPageError] = useState("");
  const [slotError, setSlotError] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();

    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<BookedSlot | null>(null);

  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [meetingType, setMeetingType] = useState<MeetingType>("online");
  const [meetingLocation, setMeetingLocation] = useState("");

  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [errorOpen, setErrorOpen] = useState(false);
  const [bookingError, setBookingError] = useState("");

  /* ============================================================
     LOAD MENTOR
  ============================================================ */

  const loadMentor = useCallback(async () => {
    if (!mentorId) {
      setPageError("Invalid mentor ID.");
      setLoadingMentor(false);
      return;
    }

    setLoadingMentor(true);
    setPageError("");

    try {
      const response = await fetch(`${API_BASE_URL}/mentors/${mentorId}`, {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const data: MentorDetailResponse = await response.json().catch(() => ({
        success: false,
        message: "Invalid server response.",
      }));

      if (!response.ok || !data.success || !data.data) {
        throw new Error(data.message || "Mentor data could not be loaded.");
      }

      setMentor(data.data);
    } catch (error) {
      setMentor(null);

      setPageError(
        error instanceof Error
          ? error.message
          : "Failed to load mentor profile.",
      );
    } finally {
      setLoadingMentor(false);
    }
  }, [mentorId]);

  /* ============================================================
     LOAD SLOTS
  ============================================================ */

  const loadSlots = useCallback(async () => {
    if (!mentorId) {
      return;
    }

    setLoadingSlots(true);
    setSlotError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/mentors/${mentorId}/slots`,
        {
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        },
      );

      const data: SlotResponse = await response.json().catch(() => ({
        success: false,
        message: "Invalid server response.",
      }));

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Mentor availability could not be loaded.",
        );
      }

      const availableSlots = (data.data ?? [])
        .filter((slot) => slot.status === "available")
        .sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);

          if (dateCompare !== 0) {
            return dateCompare;
          }

          return a.start_time.localeCompare(b.start_time);
        });

      setSlots(availableSlots);

      setSelectedDate((current) => {
        if (current && availableSlots.some((slot) => slot.date === current)) {
          return current;
        }

        return availableSlots[0]?.date ?? "";
      });
    } catch (error) {
      setSlots([]);

      setSlotError(
        error instanceof Error
          ? error.message
          : "Failed to load mentor schedule.",
      );
    } finally {
      setLoadingSlots(false);
    }
  }, [mentorId]);

  /* ============================================================
     LOAD USER ROLE
  ============================================================ */

  useEffect(() => {
    const storedRole = localStorage.getItem("user_role");

    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    loadMentor();
    loadSlots();
  }, [loadMentor, loadSlots]);

  /* ============================================================
     AVAILABLE DATES
  ============================================================ */

  const availableDates = useMemo(
    () => Array.from(new Set(slots.map((slot) => slot.date))),
    [slots],
  );

  const availableDateSet = useMemo(
    () => new Set(availableDates),
    [availableDates],
  );

  /* ============================================================
     SELECTED DATE SLOTS
  ============================================================ */

  const selectedDateSlots = useMemo(() => {
    return slots
      .filter((slot) => slot.date === selectedDate)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [slots, selectedDate]);

  /* ============================================================
     UPCOMING DATES
  ============================================================ */

  const upcomingDates = useMemo(
    () => availableDates.slice(0, 8),
    [availableDates],
  );

  /* ============================================================
     RATING
  ============================================================ */

  const rating = Number(mentor?.profile?.avg_rating ?? 0);

  const reviewCount = mentor?.profile?.total_reviews ?? 0;

  /* ============================================================
     IMAGES
  ============================================================ */

  const profileImage = resolveImageUrl(mentor?.profile?.profile_photo);

  const coverImage = resolveImageUrl(mentor?.profile?.cover_photo);

  /* ============================================================
     FEEDBACK
  ============================================================ */

  const mentorFeedbacks = useMemo(() => {
    return [...(mentor?.mentor_feedbacks ?? [])]
      .sort((a, b) => {
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;

        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;

        return bDate - aDate;
      })
      .slice(0, 6);
  }, [mentor?.mentor_feedbacks]);

  /* ============================================================
     CALENDAR
  ============================================================ */

  const calendarCells = useMemo(() => {
    const year = calendarMonth.getFullYear();

    const month = calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<{
      key: string;
      day?: number;
      date?: string;
      available: boolean;
    }> = [];

    for (let index = 0; index < firstDay; index += 1) {
      cells.push({
        key: `empty-${year}-${month}-${index}`,
        available: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);

      const key = dateToKey(date);

      cells.push({
        key,
        day,
        date: key,
        available: availableDateSet.has(key),
      });
    }

    return cells;
  }, [calendarMonth, availableDateSet]);

  /* ============================================================
     MOVE CALENDAR
  ============================================================ */

  const moveCalendarMonth = (direction: number) => {
    setCalendarMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + direction, 1),
    );
  };

  /* ============================================================
     JUMP TO AVAILABLE DATE
  ============================================================ */

  const jumpToAvailableDate = (date: string) => {
    setSelectedDate(date);

    const target = new Date(`${date}T00:00:00`);

    if (!Number.isNaN(target.getTime())) {
      setCalendarMonth(new Date(target.getFullYear(), target.getMonth(), 1));
    }
  };

  /* ============================================================
     OPEN BOOKING
  ============================================================ */

  const handleOpenBooking = (slot?: BookedSlot) => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (userRole === "mentor") {
      setBookingError("Mentor accounts cannot book sessions as a mentee.");

      setErrorOpen(true);

      return;
    }

    if (slot && slot.status !== "available") {
      setBookingError(
        "This slot is no longer available. Please choose another slot.",
      );

      setErrorOpen(true);

      return;
    }

    const activeSlot = slot ?? selectedDateSlots[0];

    if (!activeSlot) {
      setBookingError("Please select an available date and time first.");

      setErrorOpen(true);

      return;
    }

    setSelectedSlot(activeSlot);
    setTopic("");
    setMessage("");
    setMeetingType("online");
    setMeetingLocation("");
    setBookingError("");
    setBookingOpen(true);
  };

  /* ============================================================
     CLOSE BOOKING MODAL
  ============================================================ */

  const closeBookingModal = () => {
    if (bookingSubmitting) {
      return;
    }

    setBookingOpen(false);
    setSelectedSlot(null);
    setTopic("");
    setMessage("");
    setMeetingLocation("");
  };

  /* ============================================================
     SUBMIT BOOKING
  ============================================================ */

  const handleBookingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedSlot || !mentor) {
      return;
    }

    const token = localStorage.getItem("auth_token");

    if (!token) {
      router.push("/login");
      return;
    }

    const cleanTopic = topic.trim();
    const cleanMessage = message.trim();
    const cleanLocation = meetingLocation.trim();

    if (!cleanTopic) {
      setBookingError("The consultation topic is required.");

      setErrorOpen(true);

      return;
    }

    if (!cleanMessage) {
      setBookingError("The message for the mentor is required.");

      setErrorOpen(true);

      return;
    }

    if (meetingType === "offline" && !cleanLocation) {
      setBookingError("A meeting location is required for an offline session.");

      setErrorOpen(true);

      return;
    }

    setBookingSubmitting(true);
    setBookingError("");

    try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          booked_slot_id: selectedSlot.id,
          topic: cleanTopic,
          message: cleanMessage,
          duration: 45,
          meeting_type: meetingType,
          meeting_link:
            meetingType === "online" ? "https://meet.google.com" : null,
          meeting_location: meetingType === "offline" ? cleanLocation : null,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        const fieldError =
          data?.errors?.booked_slot_id?.[0] ||
          data?.errors?.topic?.[0] ||
          data?.errors?.message?.[0] ||
          data?.errors?.meeting_type?.[0];

        throw new Error(
          fieldError || data?.message || "Session booking failed.",
        );
      }

      setBookingOpen(false);
      setSelectedSlot(null);

      setSuccessMessage(
        data?.message ||
          "Your consultation request has been sent to the mentor successfully.",
      );

      setSuccessOpen(true);

      setTopic("");
      setMessage("");
      setMeetingType("online");
      setMeetingLocation("");

      await loadSlots();
    } catch (error) {
      setBookingError(
        error instanceof Error
          ? error.message
          : "An error occurred while submitting the booking.",
      );

      setErrorOpen(true);
    } finally {
      setBookingSubmitting(false);
    }
  };

  /* ============================================================
     GO TO SCHEDULE
  ============================================================ */

  const goToSchedule = () => {
    setSuccessOpen(false);
    router.push("/schedule-history");
  };

  /* ============================================================
     LOADING STATE
  ============================================================ */

  if (loadingMentor) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-[#FCFBF8] text-[#2C1E16]">
        <Navbar />

        <main className="mx-auto max-w-[1280px] px-5 py-10 sm:px-8 lg:px-10">
          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 24,
                  }
            }
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    opacity: 1,
                    y: 0,
                  }
            }
            transition={{
              duration: 0.7,
              ease: EASE,
            }}
            className="space-y-5"
          >
            <div className="h-5 w-48 animate-pulse rounded bg-[#EDE8E1]" />

            <div className="overflow-hidden rounded-[32px] border border-[#E9E2D8] bg-white shadow-sm">
              <div className="h-48 animate-pulse bg-[#EFEAE3]" />

              <div className="grid gap-7 p-7 md:grid-cols-[230px_1fr]">
                <div className="h-64 animate-pulse rounded-3xl bg-[#F0ECE6]" />

                <div className="space-y-4">
                  <div className="h-8 w-3/4 animate-pulse rounded bg-[#EFEAE3]" />

                  <div className="h-5 w-1/2 animate-pulse rounded bg-[#F2EEE8]" />

                  <div className="h-24 w-full animate-pulse rounded-2xl bg-[#F7F4EF]" />
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  /* ============================================================
     MENTOR NOT FOUND
  ============================================================ */

  if (!mentor) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] text-[#2C1E16]">
        <Navbar />

        <main className="mx-auto max-w-[800px] px-5 py-24 text-center sm:px-8">
          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 20,
                    scale: 0.96,
                  }
            }
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }
            }
            transition={{
              duration: 0.72,
              ease: EASE,
            }}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F4EBE6] text-[#A25F52]">
              !
            </div>

            <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
              Mentor not found
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
              {pageError ||
                "The mentor profile you are looking for is unavailable or no longer active."}
            </p>

            <button
              type="button"
              onClick={() => router.push("/mentors")}
              className="mt-7 rounded-2xl bg-[#1E3F20] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#1E3F20]/10 transition hover:-translate-y-0.5 hover:bg-[#162F18]"
            >
              View All Mentors
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  /* ============================================================
     MAIN
  ============================================================ */

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FCFBF8] font-sans text-[#2C1E16]">
      <Navbar />

      <motion.main
        initial={
          shouldReduceMotion
            ? false
            : {
                opacity: 0,
                y: 18,
              }
        }
        animate={
          shouldReduceMotion
            ? undefined
            : {
                opacity: 1,
                y: 0,
              }
        }
        transition={{
          delay: 0.12,
          duration: 0.7,
          ease: EASE,
        }}
        className="mx-auto max-w-[1280px] px-5 pb-16 pt-7 sm:px-8 lg:px-10"
      >
        {/* ========================================================
            BACK BUTTON
        ======================================================== */}

        <motion.button
          type="button"
          onClick={() => router.push("/mentors")}
          whileHover={
            shouldReduceMotion
              ? undefined
              : {
                  x: -2,
                }
          }
          whileTap={
            shouldReduceMotion
              ? undefined
              : {
                  scale: 0.98,
                }
          }
          className="mb-5 inline-flex cursor-pointer items-center gap-2 border-none bg-transparent text-xs font-extrabold text-[#6E665D] transition-colors hover:text-[#1E3F20]"
        >
          ← Back to Mentor List
        </motion.button>

        {/* ========================================================
            HERO / PROFILE
        ======================================================== */}

        <FadeSection>
          <section className="overflow-hidden rounded-[34px] border border-[#E7DFD5] bg-white shadow-[0_20px_70px_rgba(65,48,32,0.07)]">
            <div
              className="relative h-48 overflow-hidden bg-[#EAE4DD] sm:h-56"
              style={
                coverImage
                  ? {
                      backgroundImage: `linear-gradient(90deg, rgba(44,30,22,.56), rgba(44,30,22,.12)), url("${coverImage}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              {!coverImage && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.85),transparent_35%),linear-gradient(135deg,#ECE5DC,#DDE8DA)]" />
              )}

              <motion.div
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        opacity: 0,
                        x: -16,
                      }
                }
                whileInView={
                  shouldReduceMotion
                    ? undefined
                    : {
                        opacity: 1,
                        x: 0,
                      }
                }
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.65,
                  ease: EASE,
                }}
                className="absolute inset-x-0 bottom-0 p-6 sm:p-8"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-[#D9EBCB]" />
                  Professional Mentor
                </div>
              </motion.div>
            </div>

            <div className="relative z-10 -mt-8 grid gap-8 rounded-t-[28px] bg-white px-6 py-7 sm:-mt-9 sm:px-8 md:-mt-10 md:grid-cols-[230px_1fr] lg:grid-cols-[250px_1fr]">
              {/* ====================================================
                  PROFILE PHOTO
              ==================================================== */}

              <motion.div
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 24,
                        scale: 0.97,
                      }
                }
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }
                }
                transition={{
                  delay: 0.18,
                  duration: 0.7,
                  ease: EASE,
                }}
                className="md:-mt-24 md:relative md:z-10"
              >
                <div className="overflow-hidden rounded-[28px] border-8 border-white bg-[#ECE6DE] shadow-[0_18px_40px_rgba(44,30,22,0.14)]">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={mentor.name}
                      className="aspect-[4/5] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[4/5] items-center justify-center bg-[#E8E1D8] text-6xl font-black text-[#7D7062]">
                      {getInitial(mentor.name)}
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-2xl border border-[#EAE3DB] bg-[#FBF9F5] p-4 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9B9187]">
                    Mentor Rating
                  </p>

                  <div className="mt-2 flex items-center justify-center gap-2">
                    <StarRow rating={rating} />

                    <span className="text-sm font-black text-[#2C1E16]">
                      {rating ? rating.toFixed(1) : "0.0"}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-[#8D847B]">
                    {reviewCount} reviews
                  </p>
                </div>
              </motion.div>

              {/* ====================================================
                  PROFILE INFORMATION
              ==================================================== */}

              <motion.div
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 20,
                      }
                }
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        opacity: 1,
                        y: 0,
                      }
                }
                transition={{
                  delay: 0.26,
                  duration: 0.7,
                  ease: EASE,
                }}
                className="min-w-0 pt-1 md:pt-3"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-3xl font-black tracking-tight text-[#2C1E16] sm:text-4xl">
                      {mentor.name}
                    </h1>

                    <p className="mt-2 text-sm font-semibold text-[#6D655D]">
                      {mentor.profile?.job_title || "Professional Mentor"}

                      {mentor.profile?.company
                        ? ` at ${mentor.profile.company}`
                        : ""}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {mentor.profile?.location && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F1EC] px-3 py-1.5 text-xs font-bold text-[#6D655D]">
                          <IconPin size={14} />
                          {mentor.profile.location}
                        </span>
                      )}

                      {mentor.profile?.industry?.name && (
                        <span className="rounded-full bg-[#EAF2E8] px-3 py-1.5 text-xs font-bold text-[#365B38]">
                          {mentor.profile.industry.name}
                        </span>
                      )}

                      {mentor.profile?.timezone && (
                        <span className="rounded-full bg-[#F3EEF8] px-3 py-1.5 text-xs font-bold text-[#70527F]">
                          {mentor.profile.timezone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ==================================================
                      SKILLS
                  ================================================== */}

                  <motion.div
                    initial={
                      shouldReduceMotion
                        ? false
                        : {
                            opacity: 0,
                            y: 10,
                            scale: 0.98,
                          }
                    }
                    animate={
                      shouldReduceMotion
                        ? undefined
                        : {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                          }
                    }
                    transition={{
                      delay: 0.34,
                      duration: 0.55,
                      ease: EASE,
                    }}
                    className="w-full shrink-0 lg:w-[360px]"
                  >
                    <div className="rounded-[24px] border border-[#E3ECDD] bg-[#F7FAF5] p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#7B9178]">
                            Mentor Expertise
                          </p>

                          <p className="mt-1 text-xs font-semibold text-[#5F6F60]">
                            Skills covered during sessions
                          </p>
                        </div>

                        <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-black text-[#6F806D] shadow-sm">
                          {mentor.skills?.length ?? 0} skills
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {(mentor.skills ?? []).length > 0 ? (
                          mentor.skills?.map((skill, index) => (
                            <motion.div
                              key={skill.id}
                              initial={
                                shouldReduceMotion
                                  ? false
                                  : {
                                      opacity: 0,
                                      y: 7,
                                      scale: 0.96,
                                    }
                              }
                              animate={
                                shouldReduceMotion
                                  ? undefined
                                  : {
                                      opacity: 1,
                                      y: 0,
                                      scale: 1,
                                    }
                              }
                              transition={{
                                duration: 0.38,
                                delay: 0.36 + index * 0.045,
                                ease: EASE,
                              }}
                              whileHover={
                                shouldReduceMotion
                                  ? undefined
                                  : {
                                      y: -2,
                                      scale: 1.02,
                                    }
                              }
                              className="inline-flex items-center gap-2 rounded-2xl border border-white bg-white px-3 py-2 text-xs font-extrabold text-[#2C1E16] shadow-sm"
                            >
                              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#F5F2ED]">
                                <SkillLogo name={skill.name} />
                              </span>

                              <span>{skill.name}</span>
                            </motion.div>
                          ))
                        ) : (
                          <span className="text-xs font-semibold text-[#8C9589]">
                            No skills have been added yet.
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* ==================================================
                    ABOUT
                ================================================== */}

                <div className="mt-7">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9B9187]">
                    About the Mentor
                  </p>

                  <p className="mt-2 max-w-4xl text-sm leading-7 text-[#6B635C]">
                    {mentor.profile?.bio ||
                      "This mentor has not added a profile description yet."}
                  </p>
                </div>

                {/* ==================================================
                    STATS
                ================================================== */}

                <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      label: "Experience",
                      value: `${mentor.profile?.experience_years ?? 0} years`,
                      icon: <IconBriefcase size={16} />,
                    },
                    {
                      label: "Education",
                      value: mentor.profile?.education || "-",
                      icon: <IconGraduation size={16} />,
                    },
                    {
                      label: "Completed Sessions",
                      value: mentor.completed_sessions_count ?? 0,
                      icon: <IconCalendar size={16} />,
                    },
                    {
                      label: "Duration",
                      value: "45 minutes",
                      icon: <IconClock size={16} />,
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={
                        shouldReduceMotion
                          ? false
                          : {
                              opacity: 0,
                              y: 12,
                            }
                      }
                      whileInView={
                        shouldReduceMotion
                          ? undefined
                          : {
                              opacity: 1,
                              y: 0,
                            }
                      }
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        duration: 0.48,
                        delay: index * 0.06,
                        ease: EASE,
                      }}
                      whileHover={
                        shouldReduceMotion
                          ? undefined
                          : {
                              y: -3,
                            }
                      }
                      className="rounded-2xl border border-[#ECE5DD] bg-[#FCFBF8] p-4 transition-shadow duration-300 hover:shadow-md"
                    >
                      <div className="flex items-center gap-2 text-[#7B7064]">
                        <span className="rounded-xl bg-[#F2EEE8] p-2">
                          {item.icon}
                        </span>

                        <span className="text-[10px] font-black uppercase tracking-[0.12em]">
                          {item.label}
                        </span>
                      </div>

                      <p className="mt-3 truncate text-lg font-black text-[#2C1E16]">
                        {item.value}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        </FadeSection>

        {/* ========================================================
            AVAILABILITY + BOOKING
        ======================================================== */}

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <FadeSection delay={0.06}>
            <div className="rounded-[30px] border border-[#E7DFD5] bg-white p-6 shadow-[0_12px_45px_rgba(65,48,32,0.055)] sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9B9187]">
                    Availability
                  </p>

                  <h2 className="mt-1 text-2xl font-black tracking-tight">
                    Choose a consultation date
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-[#81776D]">
                    Only dates with available time slots can be selected.
                  </p>
                </div>

                <div className="rounded-full bg-[#F4F8F1] px-3 py-1.5 text-[10px] font-black text-[#456C47]">
                  {availableDates.length} days available
                </div>
              </div>

              {loadingSlots ? (
                <div className="mt-7 space-y-3">
                  <div className="h-12 animate-pulse rounded-2xl bg-[#F2EEE8]" />

                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {Array.from({
                      length: 14,
                    }).map((_, index) => (
                      <div
                        key={index}
                        className="h-16 animate-pulse rounded-2xl bg-[#F5F2ED]"
                      />
                    ))}
                  </div>
                </div>
              ) : slotError ? (
                <motion.div
                  initial={
                    shouldReduceMotion
                      ? false
                      : {
                          opacity: 0,
                          y: 10,
                        }
                  }
                  animate={
                    shouldReduceMotion
                      ? undefined
                      : {
                          opacity: 1,
                          y: 0,
                        }
                  }
                  transition={{
                    duration: 0.45,
                    ease: EASE,
                  }}
                  className="mt-7 rounded-2xl border border-[#EBD9D5] bg-[#FFF7F5] p-5"
                >
                  <p className="text-sm font-extrabold text-[#945B52]">
                    Schedule could not be loaded
                  </p>

                  <p className="mt-1 text-xs leading-6 text-[#946F69]">
                    {slotError}
                  </p>

                  <button
                    type="button"
                    onClick={loadSlots}
                    className="mt-3 rounded-xl bg-[#1E3F20] px-4 py-2.5 text-xs font-extrabold text-white"
                  >
                    Try Again
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* ==================================================
                      CALENDAR HEADER
                  ================================================== */}

                  <div className="mt-7 flex items-center justify-between rounded-2xl border border-[#ECE5DD] bg-[#FCFBF8] p-2">
                    <button
                      type="button"
                      onClick={() => moveCalendarMonth(-1)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6DED5] bg-white text-[#655E57] transition hover:bg-[#F5F2ED]"
                      aria-label="Previous month"
                    >
                      ←
                    </button>

                    <div className="text-center">
                      <p className="text-sm font-black text-[#2C1E16]">
                        {MONTH_NAMES[calendarMonth.getMonth()]}{" "}
                        {calendarMonth.getFullYear()}
                      </p>

                      <p className="text-[10px] font-semibold text-[#9B9187]">
                        Select an available date
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => moveCalendarMonth(1)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6DED5] bg-white text-[#655E57] transition hover:bg-[#F5F2ED]"
                      aria-label="Next month"
                    >
                      →
                    </button>
                  </div>

                  {/* ==================================================
                      UPCOMING DATES
                  ================================================== */}

                  {upcomingDates.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-black text-[#665D55]">
                        Upcoming availability
                      </p>

                      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                        {upcomingDates.map((date) => {
                          const active = date === selectedDate;

                          return (
                            <motion.button
                              key={date}
                              type="button"
                              onClick={() => jumpToAvailableDate(date)}
                              whileHover={
                                shouldReduceMotion
                                  ? undefined
                                  : {
                                      y: -2,
                                    }
                              }
                              whileTap={
                                shouldReduceMotion
                                  ? undefined
                                  : {
                                      scale: 0.97,
                                    }
                              }
                              className={[
                                "shrink-0 rounded-2xl border px-3.5 py-2.5 text-left transition-all",
                                active
                                  ? "border-[#1E3F20] bg-[#1E3F20] text-white shadow-md"
                                  : "border-[#E6DED5] bg-white text-[#5F5850] hover:border-[#C8D4C6] hover:bg-[#F7FAF5]",
                              ].join(" ")}
                            >
                              <span className="block text-[10px] font-black uppercase tracking-wide">
                                {new Date(
                                  `${date}T00:00:00`,
                                ).toLocaleDateString("en-US", {
                                  weekday: "short",
                                })}
                              </span>

                              <span className="mt-0.5 block text-xs font-extrabold">
                                {formatCompactDate(date)}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ==================================================
                      CALENDAR
                  ================================================== */}

                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`${calendarMonth.getFullYear()}-${calendarMonth.getMonth()}`}
                      initial={
                        shouldReduceMotion
                          ? false
                          : {
                              opacity: 0,
                              x: 8,
                            }
                      }
                      animate={
                        shouldReduceMotion
                          ? undefined
                          : {
                              opacity: 1,
                              x: 0,
                            }
                      }
                      transition={{
                        duration: 0.32,
                        ease: EASE,
                      }}
                      className="mt-5 grid grid-cols-7 gap-1.5"
                    >
                      {DAY_NAMES.map((day) => (
                        <div
                          key={day}
                          className="py-2 text-center text-[10px] font-black uppercase tracking-wide text-[#A09890]"
                        >
                          {day.slice(0, 3)}
                        </div>
                      ))}

                      {calendarCells.map((cell) => {
                        if (!cell.day || !cell.date) {
                          return (
                            <div key={cell.key} className="h-16 rounded-2xl" />
                          );
                        }

                        const isSelected = cell.date === selectedDate;

                        return (
                          <motion.button
                            key={cell.key}
                            type="button"
                            disabled={!cell.available}
                            onClick={() => {
                              if (cell.available) {
                                setSelectedDate(cell.date ?? "");
                              }
                            }}
                            whileHover={
                              cell.available && !shouldReduceMotion
                                ? {
                                    y: -2,
                                    scale: 1.01,
                                  }
                                : undefined
                            }
                            whileTap={
                              cell.available && !shouldReduceMotion
                                ? {
                                    scale: 0.97,
                                  }
                                : undefined
                            }
                            className={[
                              "relative flex h-16 flex-col items-center justify-center rounded-2xl border text-xs transition-all",
                              cell.available
                                ? isSelected
                                  ? "border-[#1E3F20] bg-[#1E3F20] text-white shadow-lg shadow-[#1E3F20]/10"
                                  : "cursor-pointer border-[#DDE8DA] bg-[#F4F8F1] text-[#375C39] hover:border-[#BFD1BC] hover:bg-[#EDF5EA]"
                                : "cursor-not-allowed border-transparent bg-transparent text-[#CBC4BC]",
                            ].join(" ")}
                          >
                            <span className="text-sm font-black">
                              {cell.day}
                            </span>

                            {cell.available && (
                              <span
                                className={[
                                  "mt-1 text-[8px] font-black uppercase tracking-wider",
                                  isSelected
                                    ? "text-[#DDEFD9]"
                                    : "text-[#658267]",
                                ].join(" ")}
                              >
                                Available
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>

                  {/* ==================================================
                      TIME SLOTS
                  ================================================== */}

                  <motion.div
                    layout
                    className="mt-7 border-t border-[#EEE7DF] pt-6"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-black text-[#5C554E]">
                          {selectedDate
                            ? formatLongDate(selectedDate)
                            : "Select a date"}
                        </p>

                        <p className="mt-1 text-[11px] text-[#968C82]">
                          {selectedDateSlots.length} available slots
                        </p>
                      </div>

                      {selectedDate && (
                        <div className="rounded-full bg-[#F5F1EB] px-3 py-1.5 text-[10px] font-black text-[#776D64]">
                          45 minutes / session
                        </div>
                      )}
                    </div>

                    <AnimatePresence mode="wait">
                      {selectedDateSlots.length > 0 ? (
                        <motion.div
                          key="slots"
                          initial={
                            shouldReduceMotion
                              ? false
                              : {
                                  opacity: 0,
                                  y: 8,
                                }
                          }
                          animate={
                            shouldReduceMotion
                              ? undefined
                              : {
                                  opacity: 1,
                                  y: 0,
                                }
                          }
                          exit={
                            shouldReduceMotion
                              ? undefined
                              : {
                                  opacity: 0,
                                  y: -4,
                                }
                          }
                          transition={{
                            duration: 0.4,
                            ease: EASE,
                          }}
                          className="mt-4 grid gap-2.5 sm:grid-cols-2"
                        >
                          {selectedDateSlots.map((slot, index) => (
                            <motion.button
                              key={slot.id}
                              type="button"
                              onClick={() => handleOpenBooking(slot)}
                              initial={
                                shouldReduceMotion
                                  ? false
                                  : {
                                      opacity: 0,
                                      y: 10,
                                    }
                              }
                              animate={
                                shouldReduceMotion
                                  ? undefined
                                  : {
                                      opacity: 1,
                                      y: 0,
                                    }
                              }
                              transition={{
                                duration: 0.35,
                                delay: index * 0.04,
                                ease: EASE,
                              }}
                              whileHover={
                                shouldReduceMotion
                                  ? undefined
                                  : {
                                      y: -3,
                                    }
                              }
                              whileTap={
                                shouldReduceMotion
                                  ? undefined
                                  : {
                                      scale: 0.985,
                                    }
                              }
                              className="group flex items-center justify-between rounded-2xl border border-[#DFE8DD] bg-[#F8FBF7] px-4 py-3.5 text-left transition-all hover:border-[#BFD0BC] hover:bg-[#F1F7EF] hover:shadow-md"
                            >
                              <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-white p-2.5 text-[#467049] shadow-sm">
                                  <IconClock size={16} />
                                </div>

                                <div>
                                  <p className="text-sm font-black text-[#2C1E16]">
                                    {formatTime(slot.start_time)} —{" "}
                                    {formatTime(slot.end_time)}
                                  </p>

                                  <p className="mt-0.5 text-[10px] font-bold text-[#7D736A]">
                                    Slot #{slot.id}
                                  </p>
                                </div>
                              </div>

                              <span className="text-lg font-black text-[#738E74] transition-transform duration-300 group-hover:translate-x-0.5">
                                →
                              </span>
                            </motion.button>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty"
                          initial={
                            shouldReduceMotion
                              ? false
                              : {
                                  opacity: 0,
                                  y: 8,
                                }
                          }
                          animate={
                            shouldReduceMotion
                              ? undefined
                              : {
                                  opacity: 1,
                                  y: 0,
                                }
                          }
                          className="mt-4 rounded-2xl border border-dashed border-[#DED6CD] bg-[#FCFBF8] px-5 py-8 text-center"
                        >
                          <p className="text-sm font-extrabold text-[#665E56]">
                            No slots available on this date
                          </p>

                          <p className="mt-1 text-xs text-[#948A80]">
                            Choose another available date highlighted in green.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </>
              )}
            </div>
          </FadeSection>

          {/* ==========================================================
              BOOKING CTA + WEEKLY SCHEDULE
          ========================================================== */}

          <div className="space-y-8">
            <FadeSection delay={0.12}>
              <div className="rounded-[30px] border border-[#E7DFD5] bg-white p-6 shadow-[0_12px_45px_rgba(65,48,32,0.055)] sm:p-7">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9B9187]">
                  Weekly Schedule
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-tight">
                  Regular availability
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#81776D]">
                  The mentor&apos;s recurring weekly schedule.
                </p>

                <div className="mt-5 space-y-2.5">
                  {(mentor.availabilities ?? [])
                    .filter((item) => item.is_active)
                    .sort((a, b) => a.day_of_week - b.day_of_week)
                    .map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={
                          shouldReduceMotion
                            ? false
                            : {
                                opacity: 0,
                                x: 14,
                              }
                        }
                        whileInView={
                          shouldReduceMotion
                            ? undefined
                            : {
                                opacity: 1,
                                x: 0,
                              }
                        }
                        viewport={{
                          once: true,
                        }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.04,
                          ease: EASE,
                        }}
                        className="flex items-center justify-between rounded-2xl border border-[#ECE5DD] bg-[#FCFBF8] px-4 py-3"
                      >
                        <div>
                          <p className="text-xs font-black text-[#3C352F]">
                            {DAY_NAMES[item.day_of_week]}
                          </p>
                        </div>

                        <span className="rounded-full bg-[#F4F8F1] px-3 py-1.5 text-[10px] font-black text-[#527054]">
                          {formatTime(item.start_time)} —{" "}
                          {formatTime(item.end_time)}
                        </span>
                      </motion.div>
                    ))}

                  {(mentor.availabilities ?? []).filter(
                    (item) => item.is_active,
                  ).length === 0 && (
                    <div className="rounded-2xl border border-dashed border-[#DED6CD] px-5 py-7 text-center">
                      <p className="text-sm font-extrabold text-[#665E56]">
                        Weekly schedule not available yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </FadeSection>

            <FadeSection delay={0.18}>
              <motion.div
                className="px-1 py-1"
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        y: -1,
                      }
                }
              >
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6F8A64]">
                  Consultation Session
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight text-[#2F2A24]">
                  Ready to talk with {mentor.name.split(" ")[0]}?
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#665E56]">
                  Choose an available slot and send a consultation request. The
                  mentor will receive your request for confirmation.
                </p>

                <motion.button
                  type="button"
                  onClick={() => handleOpenBooking()}
                  disabled={
                    loadingSlots ||
                    selectedDateSlots.length === 0 ||
                    userRole === "mentor"
                  }
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: -2,
                          scale: 1.01,
                        }
                  }
                  whileTap={
                    shouldReduceMotion
                      ? undefined
                      : {
                          scale: 0.98,
                        }
                  }
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 28,
                  }}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E3F20] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-[#1E3F20]/10 transition-colors hover:bg-[#162F18] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <IconCalendar size={17} />

                  {userRole === "mentor"
                    ? "Booking for Mentees Only"
                    : "Schedule a Session"}
                </motion.button>

                {selectedDateSlots.length === 0 &&
                  !loadingSlots &&
                  userRole !== "mentor" && (
                    <p className="mt-2 text-center text-[10px] font-semibold text-[#8B8177]">
                      Select a date with available slots first.
                    </p>
                  )}
              </motion.div>
            </FadeSection>
          </div>
        </section>

        {/* ========================================================
            FEEDBACK
        ======================================================== */}

        <FadeSection delay={0.08}>
          <section className="mt-8 rounded-[30px] border border-[#E7DFD5] bg-white p-6 shadow-[0_12px_45px_rgba(65,48,32,0.055)] sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9B9187]">
                  Feedback
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-tight">
                  What mentees say
                </h2>
              </div>

              <div className="rounded-2xl bg-[#FFF9EA] px-4 py-3">
                <div className="flex items-center gap-2">
                  <StarRow rating={rating} />

                  <span className="text-sm font-black">
                    {rating ? rating.toFixed(1) : "0.0"}
                  </span>
                </div>

                <p className="mt-1 text-[10px] font-bold text-[#9C8460]">
                  Based on {reviewCount} reviews
                </p>
              </div>
            </div>

            {mentorFeedbacks.length > 0 ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {mentorFeedbacks.map((feedback, index) => (
                  <motion.article
                    key={feedback.id}
                    initial={
                      shouldReduceMotion
                        ? false
                        : {
                            opacity: 0,
                            y: 16,
                          }
                    }
                    whileInView={
                      shouldReduceMotion
                        ? undefined
                        : {
                            opacity: 1,
                            y: 0,
                          }
                    }
                    viewport={{
                      once: true,
                      amount: 0.15,
                    }}
                    transition={{
                      duration: 0.48,
                      delay: index * 0.06,
                      ease: EASE,
                    }}
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : {
                            y: -3,
                          }
                    }
                    className="rounded-2xl border border-[#ECE5DD] bg-[#FCFBF8] p-5 transition-shadow duration-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF2E8] text-xs font-black text-[#456A47]">
                          {getInitial(feedback.mentee?.name)}
                        </div>

                        <div>
                          <p className="text-xs font-black text-[#3C352F]">
                            {feedback.mentee?.name || "Mentee"}
                          </p>

                          <p className="mt-0.5 text-[10px] font-semibold text-[#9B9187]">
                            {feedback.created_at
                              ? new Date(
                                  feedback.created_at,
                                ).toLocaleDateString("en-US", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Review"}
                          </p>
                        </div>
                      </div>

                      <StarRow rating={feedback.rating} size="text-xs" />
                    </div>

                    <p className="mt-4 text-sm leading-6 text-[#6C645D]">
                      {feedback.comment
                        ? `"${feedback.comment}"`
                        : "This mentee provided a rating without a comment."}
                    </p>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-[#DED6CD] px-5 py-9 text-center">
                <p className="text-sm font-extrabold text-[#665E56]">
                  No feedback yet
                </p>

                <p className="mt-1 text-xs text-[#948A80]">
                  Mentee reviews will appear here after completed sessions.
                </p>
              </div>
            )}
          </section>
        </FadeSection>
      </motion.main>

      {/* ========================================================
          BOOKING MODAL
      ======================================================== */}

      <AnimatePresence>
        {bookingOpen && selectedSlot && (
          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : {
                    opacity: 0,
                  }
            }
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    opacity: 1,
                  }
            }
            exit={
              shouldReduceMotion
                ? undefined
                : {
                    opacity: 0,
                  }
            }
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[#2C1E16]/45 p-4 backdrop-blur-sm"
          >
            <div className="absolute inset-0" onClick={closeBookingModal} />

            <motion.form
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 26,
                      scale: 0.96,
                    }
              }
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }
              }
              exit={
                shouldReduceMotion
                  ? undefined
                  : {
                      opacity: 0,
                      y: 14,
                      scale: 0.98,
                    }
              }
              transition={{
                duration: 0.52,
                ease: EASE,
              }}
              onSubmit={handleBookingSubmit}
              className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-white/60 bg-[#FFFDFC] p-6 shadow-[0_30px_100px_rgba(44,30,22,0.24)] sm:p-8"
            >
              <button
                type="button"
                onClick={closeBookingModal}
                disabled={bookingSubmitting}
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border border-[#E7DFD5] bg-white text-[#6E665D] transition hover:bg-[#F7F3EE] disabled:opacity-50"
                aria-label="Close"
              >
                <IconX size={17} />
              </button>

              <div className="pr-12">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9B9187]">
                  Consultation Session Booking
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-tight text-[#2C1E16]">
                  Schedule a session with {mentor.name}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#81776D]">
                  Fill in the information below so the mentor can better
                  understand your consultation needs.
                </p>
              </div>

              {/* ==================================================
                  SELECTED SLOT SUMMARY
              ================================================== */}

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "Date",
                    value: formatCompactDate(selectedSlot.date),
                  },
                  {
                    label: "Time",
                    value: `${formatTime(
                      selectedSlot.start_time,
                    )} — ${formatTime(selectedSlot.end_time)}`,
                  },
                  {
                    label: "Duration",
                    value: "45 minutes",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-[#DFE8DD] bg-[#F4F8F1] p-4"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#789075]">
                      {item.label}
                    </p>

                    <p className="mt-2 text-xs font-black text-[#2C1E16]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* ==================================================
                  FORM
              ================================================== */}

              <div className="mt-6 space-y-5">
                {/* TOPIC */}

                <div>
                  <label
                    htmlFor="topic"
                    className="mb-2 block text-xs font-black text-[#50483F]"
                  >
                    Consultation topic
                  </label>

                  <input
                    id="topic"
                    type="text"
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    maxLength={255}
                    placeholder="Example: Frontend portfolio review"
                    className="w-full rounded-2xl border border-[#DED6CD] bg-white px-4 py-3.5 text-sm text-[#2C1E16] outline-none transition focus:border-[#9BB398] focus:ring-4 focus:ring-[#DCE8D9]"
                    disabled={bookingSubmitting}
                  />

                  <p className="mt-1.5 text-right text-[10px] font-semibold text-[#9B9187]">
                    {topic.length}/255
                  </p>
                </div>

                {/* MESSAGE */}

                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-xs font-black text-[#50483F]"
                  >
                    Message for the mentor
                  </label>

                  <textarea
                    id="message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    maxLength={2000}
                    rows={5}
                    placeholder="Tell the mentor what you would like to discuss..."
                    className="w-full resize-none rounded-2xl border border-[#DED6CD] bg-white px-4 py-3.5 text-sm leading-6 text-[#2C1E16] outline-none transition focus:border-[#9BB398] focus:ring-4 focus:ring-[#DCE8D9]"
                    disabled={bookingSubmitting}
                  />

                  <p className="mt-1.5 text-right text-[10px] font-semibold text-[#9B9187]">
                    {message.length}/2000
                  </p>
                </div>

                {/* MEETING TYPE */}

                <div>
                  <p className="mb-2 text-xs font-black text-[#50483F]">
                    Session format
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* ONLINE */}

                    <motion.button
                      type="button"
                      onClick={() => setMeetingType("online")}
                      disabled={bookingSubmitting}
                      whileTap={
                        shouldReduceMotion
                          ? undefined
                          : {
                              scale: 0.985,
                            }
                      }
                      className={[
                        "rounded-2xl border p-4 text-left transition-all",
                        meetingType === "online"
                          ? "border-[#A9C3A7] bg-[#F1F7EF] shadow-sm"
                          : "border-[#DED6CD] bg-white hover:border-[#CFC5B9] hover:bg-[#FCFAF7]",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={[
                            "rounded-xl p-2.5",
                            meetingType === "online"
                              ? "bg-[#E0EDDD] text-[#3F6842]"
                              : "bg-[#F2EEE8] text-[#756C63]",
                          ].join(" ")}
                        >
                          <IconVideo size={17} />
                        </div>

                        <div>
                          <p className="text-xs font-black">Online</p>

                          <p className="mt-1 text-[10px] text-[#8C8278]">
                            Google Meet
                          </p>
                        </div>
                      </div>
                    </motion.button>

                    {/* OFFLINE */}

                    <motion.button
                      type="button"
                      onClick={() => setMeetingType("offline")}
                      disabled={bookingSubmitting}
                      whileTap={
                        shouldReduceMotion
                          ? undefined
                          : {
                              scale: 0.985,
                            }
                      }
                      className={[
                        "rounded-2xl border p-4 text-left transition-all",
                        meetingType === "offline"
                          ? "border-[#D7C3B0] bg-[#FBF4ED] shadow-sm"
                          : "border-[#DED6CD] bg-white hover:border-[#CFC5B9] hover:bg-[#FCFAF7]",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={[
                            "rounded-xl p-2.5",
                            meetingType === "offline"
                              ? "bg-[#F3E6D9] text-[#815F41]"
                              : "bg-[#F2EEE8] text-[#756C63]",
                          ].join(" ")}
                        >
                          <IconPin size={17} />
                        </div>

                        <div>
                          <p className="text-xs font-black">Offline</p>

                          <p className="mt-1 text-[10px] text-[#8C8278]">
                            Meet in person
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* OFFLINE LOCATION */}

                {meetingType === "offline" && (
                  <motion.div
                    initial={
                      shouldReduceMotion
                        ? false
                        : {
                            opacity: 0,
                            height: 0,
                          }
                    }
                    animate={
                      shouldReduceMotion
                        ? undefined
                        : {
                            opacity: 1,
                            height: "auto",
                          }
                    }
                    transition={{
                      duration: 0.35,
                      ease: EASE,
                    }}
                  >
                    <label
                      htmlFor="meetingLocation"
                      className="mb-2 block text-xs font-black text-[#50483F]"
                    >
                      Meeting location
                    </label>

                    <input
                      id="meetingLocation"
                      type="text"
                      value={meetingLocation}
                      onChange={(event) =>
                        setMeetingLocation(event.target.value)
                      }
                      maxLength={255}
                      placeholder="Example: Coffee shop / office / agreed location"
                      className="w-full rounded-2xl border border-[#DED6CD] bg-white px-4 py-3.5 text-sm text-[#2C1E16] outline-none transition focus:border-[#C9A985] focus:ring-4 focus:ring-[#F1E3D4]"
                      disabled={bookingSubmitting}
                    />
                  </motion.div>
                )}
              </div>

              {/* ==================================================
                  ACTIONS
              ================================================== */}

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#EEE7DF] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeBookingModal}
                  disabled={bookingSubmitting}
                  className="rounded-2xl border border-[#DED6CD] bg-white px-5 py-3.5 text-sm font-extrabold text-[#645C54] transition hover:bg-[#F8F5F0] disabled:opacity-50"
                >
                  Cancel
                </button>

                <motion.button
                  type="submit"
                  disabled={
                    bookingSubmitting ||
                    !topic.trim() ||
                    !message.trim() ||
                    (meetingType === "offline" && !meetingLocation.trim())
                  }
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: -2,
                        }
                  }
                  whileTap={
                    shouldReduceMotion
                      ? undefined
                      : {
                          scale: 0.985,
                        }
                  }
                  className="rounded-2xl bg-[#1E3F20] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[#1E3F20]/10 transition hover:bg-[#162F18] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {bookingSubmitting
                    ? "Sending Request..."
                    : "Send Booking Request →"}
                </motion.button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          SUCCESS MODAL
      ======================================================== */}

      <AnimatePresence>
        {successOpen && (
          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : {
                    opacity: 0,
                  }
            }
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    opacity: 1,
                  }
            }
            exit={
              shouldReduceMotion
                ? undefined
                : {
                    opacity: 0,
                  }
            }
            className="fixed inset-0 z-[130] flex items-center justify-center bg-[#2C1E16]/40 p-4 backdrop-blur-sm"
          >
            <div
              className="absolute inset-0"
              onClick={() => setSuccessOpen(false)}
            />

            <motion.div
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 24,
                      scale: 0.96,
                    }
              }
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }
              }
              exit={
                shouldReduceMotion
                  ? undefined
                  : {
                      opacity: 0,
                      y: 12,
                      scale: 0.98,
                    }
              }
              transition={{
                duration: 0.48,
                ease: EASE,
              }}
              className="relative w-full max-w-md rounded-[30px] border border-white bg-[#FFFDFC] p-7 text-center shadow-[0_30px_100px_rgba(44,30,22,0.22)]"
            >
              <motion.div
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        opacity: 0,
                        scale: 0.75,
                        rotate: -8,
                      }
                }
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        opacity: 1,
                        scale: 1,
                        rotate: 0,
                      }
                }
                transition={{
                  delay: 0.08,
                  duration: 0.5,
                  ease: EASE,
                }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E7F1E4] text-2xl font-black text-[#3F6941] shadow-inner"
              >
                ✓
              </motion.div>

              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-[#789075]">
                Booking Successful
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-[#2C1E16]">
                Request sent successfully
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#756C63]">
                {successMessage}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSuccessOpen(false)}
                  className="rounded-2xl border border-[#DED6CD] bg-white px-4 py-3.5 text-sm font-extrabold text-[#655D55] transition hover:bg-[#F8F5F0]"
                >
                  Stay on Mentor
                </button>

                <motion.button
                  type="button"
                  onClick={goToSchedule}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: -2,
                        }
                  }
                  whileTap={
                    shouldReduceMotion
                      ? undefined
                      : {
                          scale: 0.98,
                        }
                  }
                  className="rounded-2xl bg-[#1E3F20] px-4 py-3.5 text-sm font-black text-white transition hover:bg-[#162F18]"
                >
                  View Schedule →
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          ERROR MODAL
      ======================================================== */}

      <AnimatePresence>
        {errorOpen && (
          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : {
                    opacity: 0,
                  }
            }
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    opacity: 1,
                  }
            }
            exit={
              shouldReduceMotion
                ? undefined
                : {
                    opacity: 0,
                  }
            }
            className="fixed inset-0 z-[140] flex items-center justify-center bg-[#2C1E16]/40 p-4 backdrop-blur-sm"
          >
            <div
              className="absolute inset-0"
              onClick={() => setErrorOpen(false)}
            />

            <motion.div
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 22,
                      scale: 0.96,
                    }
              }
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }
              }
              exit={
                shouldReduceMotion
                  ? undefined
                  : {
                      opacity: 0,
                      y: 10,
                      scale: 0.98,
                    }
              }
              transition={{
                duration: 0.45,
                ease: EASE,
              }}
              className="relative w-full max-w-md rounded-[30px] border border-white bg-[#FFFDFC] p-7 text-center shadow-[0_30px_100px_rgba(44,30,22,0.22)]"
            >
              <motion.div
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        opacity: 0,
                        scale: 0.8,
                      }
                }
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        opacity: 1,
                        scale: 1,
                      }
                }
                transition={{
                  duration: 0.4,
                  ease: EASE,
                }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF0ED] text-2xl font-black text-[#A35B50]"
              >
                !
              </motion.div>

              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-[#A35B50]">
                Unable to Continue
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-[#2C1E16]">
                Something went wrong
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#756C63]">
                {bookingError}
              </p>

              <motion.button
                type="button"
                onClick={() => setErrorOpen(false)}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        y: -2,
                      }
                }
                whileTap={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: 0.98,
                      }
                }
                className="mt-6 w-full rounded-2xl bg-[#1E3F20] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#162F18]"
              >
                Got It
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
