"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

type Availability = {
  id: number;
  day_of_week: number;
  start_time?: string;
  end_time?: string;
  is_active?: boolean;
};

type DaySchedule = {
  day_of_week: number;
  label: string;
  enabled: boolean;
  start_time: string;
  end_time: string;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function normalizeTime(value?: string) {
  if (!value) {
    return "09:00";
  }

  return value.slice(0, 5);
}

const defaultSchedule: DaySchedule[] =
  DAYS.map((label, day_of_week) => ({
    day_of_week,
    label,
    enabled: false,
    start_time: "09:00",
    end_time: "17:00",
  }));

export default function MentorAvailabilityPage() {
  const [schedule, setSchedule] = useState<
    DaySchedule[]
  >(defaultSchedule);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAvailability = useCallback(
    async () => {
      const token =
        localStorage.getItem("auth_token") || "";

      const mentorId = localStorage.getItem(
        "user_id",
      );

      if (!token) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        /*
         * Try to read user id from /me when
         * user_id isn't stored.
         */
        let resolvedMentorId = mentorId;

        if (!resolvedMentorId) {
          const meResponse = await fetch(
            `${API_URL}/me`,
            {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const meData = await meResponse
            .json()
            .catch(() => null);

          if (meResponse.ok) {
            const user =
              meData?.data ?? meData;

            if (user?.id) {
              resolvedMentorId = String(user.id);
              localStorage.setItem(
                "user_id",
                resolvedMentorId,
              );
            }
          }
        }

        if (!resolvedMentorId) {
          setError(
            "Unable to determine mentor account.",
          );
          return;
        }

        const response = await fetch(
          `${API_URL}/mentors/${resolvedMentorId}/availability`,
          {
            headers: {
              Accept: "application/json",
            },
          },
        );

        const data = await response
          .json()
          .catch(() => null);

        if (!response.ok) {
          setError(
            data?.message ||
              "Unable to load availability.",
          );
          return;
        }

        const active =
          (data?.data ?? []) as Availability[];

        const nextSchedule =
          defaultSchedule.map((day) => {
            const existing = active.find(
              (item) =>
                Number(item.day_of_week) ===
                day.day_of_week,
            );

            if (!existing) {
              return day;
            }

            return {
              ...day,
              enabled: true,
              start_time: normalizeTime(
                existing.start_time,
              ),
              end_time: normalizeTime(
                existing.end_time,
              ),
            };
          });

        setSchedule(nextSchedule);
      } catch {
        setError(
          "Unable to connect to the Laravel backend.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const updateDay = (
    dayIndex: number,
    patch: Partial<DaySchedule>,
  ) => {
    setSchedule((current) =>
      current.map((item, index) =>
        index === dayIndex
          ? { ...item, ...patch }
          : item,
      ),
    );
  };

  const saveAvailability = async () => {
    const token =
      localStorage.getItem("auth_token") || "";

    if (!token) {
      return;
    }

    setError("");
    setSuccess("");

    for (const day of schedule) {
      if (!day.enabled) {
        continue;
      }

      if (day.start_time >= day.end_time) {
        setError(
          `${day.label}: end time must be later than start time.`,
        );
        return;
      }
    }

    setSaving(true);

    try {
      const availabilities = schedule
        .filter((day) => day.enabled)
        .map((day) => ({
          day_of_week: day.day_of_week,
          start_time: day.start_time,
          end_time: day.end_time,
        }));

      const response = await fetch(
        `${API_URL}/availability`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            availabilities,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        setError(
          data?.message ||
            "Unable to save availability.",
        );
        return;
      }

      setSuccess(
        data?.message ||
          "Availability successfully updated.",
      );

      await loadAvailability();
    } catch {
      setError(
        "Unable to connect to the Laravel backend.",
      );
    } finally {
      setSaving(false);
    }
  };

  const activeDays = schedule.filter(
    (day) => day.enabled,
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-76px)] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E5DEED] border-t-[#8B6FB5]" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-7 sm:px-7 xl:px-10">
      <section className="mentor-reveal rounded-[30px] border border-[#E4DBEF] bg-gradient-to-br from-[#F5F0FB] via-white to-[#F6F8FD] p-6 shadow-[0_15px_40px_rgba(139,111,181,0.06)] sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-[#F0EAF8] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#7B5AA8]">
              Availability
            </span>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#2C1E16]">
              Set your mentoring hours
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500">
              Choose the days and hours when mentees can
              book your time.
            </p>
          </div>

          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-gray-400">
              Active days
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[#8B6FB5]">
              {activeDays}
            </p>
          </div>
        </div>
      </section>

      {success && (
        <div className="mentor-reveal mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">
          {success}
        </div>
      )}

      {error && (
        <div className="mentor-reveal mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <section className="mt-7 rounded-[30px] border border-[#E4E2DD] bg-white p-5 shadow-[0_12px_32px_rgba(44,30,22,0.035)] sm:p-7">
        <div className="mb-6">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-gray-400">
            Weekly Template
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-[#2C1E16]">
            Weekly availability
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Your backend will automatically generate
            concrete 45-minute booking slots for the
            following four weeks.
          </p>
        </div>

        <div className="space-y-3">
          {schedule.map((day, index) => (
            <div
              key={day.day_of_week}
              className="mentor-reveal rounded-2xl border border-[#ECE9E3] bg-[#FCFBF8] p-4 transition-all duration-400 hover:border-[#DDD5E8] hover:shadow-sm"
              style={{
                animationDelay: `${index * 70}ms`,
              }}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      updateDay(index, {
                        enabled: !day.enabled,
                      })
                    }
                    className={[
                      "flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl font-bold transition-all duration-300",
                      day.enabled
                        ? "bg-[#8B6FB5] text-white shadow-md"
                        : "bg-[#F0EEE8] text-gray-400",
                    ].join(" ")}
                    aria-label={`Toggle ${day.label}`}
                  >
                    {day.label.slice(0, 2)}
                  </button>

                  <div>
                    <p className="text-sm font-extrabold text-[#2C1E16]">
                      {day.label}
                    </p>

                    <p className="mt-0.5 text-[11px] font-semibold text-gray-400">
                      {day.enabled
                        ? "Available for booking"
                        : "Unavailable"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div>
                    <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.1em] text-gray-400">
                      Start
                    </label>

                    <input
                      type="time"
                      value={day.start_time}
                      onChange={(event) =>
                        updateDay(index, {
                          start_time:
                            event.target.value,
                        })
                      }
                      disabled={!day.enabled}
                      className="rounded-xl border border-[#DDD9D0] bg-white px-3 py-2.5 text-sm font-bold text-gray-700 outline-none transition focus:border-[#8B6FB5] focus:ring-4 focus:ring-[#8B6FB5]/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.1em] text-gray-400">
                      End
                    </label>

                    <input
                      type="time"
                      value={day.end_time}
                      onChange={(event) =>
                        updateDay(index, {
                          end_time:
                            event.target.value,
                        })
                      }
                      disabled={!day.enabled}
                      className="rounded-xl border border-[#DDD9D0] bg-white px-3 py-2.5 text-sm font-bold text-gray-700 outline-none transition focus:border-[#8B6FB5] focus:ring-4 focus:ring-[#8B6FB5]/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-col gap-3 rounded-2xl bg-[#F7F2FB] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-[#2C1E16]">
              Ready to publish your availability?
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Existing weekly templates will be replaced
              by these settings.
            </p>
          </div>

          <button
            type="button"
            onClick={saveAvailability}
            disabled={saving}
            className="cursor-pointer rounded-xl bg-[#8B6FB5] px-5 py-3 text-xs font-extrabold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#795DA5] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Availability"}
          </button>
        </div>
      </section>
    </main>
  );
}