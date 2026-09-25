"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { ReactNode } from "react";

type Session = {
  id: number;
  topic: string;
  duration?: number | null;
  meeting_type?: string | null;
  meeting_link?: string | null;
  status: string;

  mentee?: {
    name: string;
    profile?: {
      profile_photo?: string | null;
      job_title?: string | null;
    } | null;
  } | null;

  booked_slot?: {
    date?: string;
    start_time?: string;
    end_time?: string;
  } | null;

  bookedSlot?: {
    date?: string;
    start_time?: string;
    end_time?: string;
  } | null;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const EASE = [0.22, 1, 0.36, 1] as const;

function getSlot(session: Session) {
  return session.booked_slot ?? session.bookedSlot ?? null;
}

function parseDate(session: Session) {
  const slot = getSlot(session);

  if (!slot?.date || !slot.start_time) {
    return null;
  }

  const date = new Date(`${slot.date}T${slot.start_time}`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTime(value?: string | null) {
  return value ? value.slice(0, 5) : "--:--";
}

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

export default function MentorSchedulePage() {
  const shouldReduceMotion = useReducedMotion();

  const [sessions, setSessions] = useState<Session[]>([]);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [month, setMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSessions = useCallback(async () => {
    const token = localStorage.getItem("auth_token") || "";

    if (!token) {
      setError("Your session has expired. Please sign in again.");

      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/sessions?per_page=50`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.message || "Unable to load your schedule right now.");

        setSessions([]);

        return;
      }

      setSessions(data?.data ?? []);
    } catch {
      setError("Unable to connect to the Laravel backend.");

      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const calendarCells = useMemo(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    const firstDay = new Date(year, monthIndex, 1);

    const lastDay = new Date(year, monthIndex + 1, 0);

    const cells: {
      key: string;
      day: number;
      current: boolean;
      date: Date;
    }[] = [];

    const firstWeekday = firstDay.getDay();

    for (let index = firstWeekday - 1; index >= 0; index--) {
      const date = new Date(year, monthIndex, -index);

      cells.push({
        key: `prev-${date.toISOString()}`,
        day: date.getDate(),
        current: false,
        date,
      });
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, monthIndex, day);

      cells.push({
        key: `current-${date.toISOString()}`,
        day,
        current: true,
        date,
      });
    }

    let nextDay = 1;

    while (cells.length % 7 !== 0) {
      const date = new Date(year, monthIndex + 1, nextDay);

      cells.push({
        key: `next-${date.toISOString()}`,
        day: date.getDate(),
        current: false,
        date,
      });

      nextDay += 1;
    }

    return cells;
  }, [month]);

  const sessionDates = useMemo(() => {
    const map = new Map<string, Session[]>();

    sessions.forEach((session) => {
      if (!["pending", "approved"].includes(session.status)) {
        return;
      }

      const date = getSlot(session)?.date;

      if (!date) {
        return;
      }

      const current = map.get(date) ?? [];

      current.push(session);

      map.set(date, current);
    });

    return map;
  }, [sessions]);

  const selectedDateKey = `${selectedDate.getFullYear()}-${String(
    selectedDate.getMonth() + 1,
  ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  const selectedSessions = useMemo(() => {
    return [...(sessionDates.get(selectedDateKey) ?? [])].sort(
      (a, b) => (parseDate(a)?.getTime() ?? 0) - (parseDate(b)?.getTime() ?? 0),
    );
  }, [selectedDateKey, sessionDates]);

  const upcoming = useMemo(() => {
    const current = Date.now();

    return [...sessions]
      .filter((session) => {
        const date = parseDate(session);

        return (
          date &&
          date.getTime() >= current &&
          ["pending", "approved"].includes(session.status)
        );
      })
      .sort(
        (a, b) =>
          (parseDate(a)?.getTime() ?? 0) - (parseDate(b)?.getTime() ?? 0),
      )
      .slice(0, 6);
  }, [sessions]);

  const changeMonth = (offset: number) => {
    setMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  const goToDate = (date: Date) => {
    setSelectedDate(date);

    if (
      date.getMonth() !== month.getMonth() ||
      date.getFullYear() !== month.getFullYear()
    ) {
      setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const handleToday = () => {
    const today = new Date();

    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));

    setSelectedDate(today);
  };

  /*
   * =========================================================
   * LOADING
   * =========================================================
   *
   * Tidak ada Navbar utama di sini karena halaman ini
   * sudah berada di Mentor Workspace.
   */

  if (loading) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-[#FCFBF8] text-[#2C1E16]">
        <LoadingPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FCFBF8] text-[#2C1E16]">
      <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-7 xl:px-10">
        {/* =================================================
            HERO
        ================================================== */}

        <motion.section
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 22,
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
          className="rounded-[30px] border border-[#DDE6F0] bg-gradient-to-br from-[#EFF6FD] via-white to-[#F5F1FB] p-6 shadow-[0_15px_40px_rgba(69,119,184,0.06)] sm:p-8"
        >
          <motion.span
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
            transition={{
              delay: 0.08,
              duration: 0.5,
              ease: EASE,
            }}
            className="inline-flex rounded-full bg-[#E8F1FB] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#4476B7]"
          >
            Mentor Schedule
          </motion.span>

          <motion.h1
            initial={
              shouldReduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 12,
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
              delay: 0.14,
              duration: 0.62,
              ease: EASE,
            }}
            className="mt-4 text-3xl font-extrabold tracking-tight text-[#2C1E16]"
          >
            Your mentoring calendar
          </motion.h1>

          <motion.p
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
              delay: 0.19,
              duration: 0.58,
              ease: EASE,
            }}
            className="mt-3 max-w-2xl text-sm leading-7 text-gray-500"
          >
            See your upcoming appointments and quickly jump between dates.
          </motion.p>
        </motion.section>

        {/* =================================================
            ERROR
        ================================================== */}

        <AnimatePresence initial={false} mode="wait">
          {error && (
            <motion.div
              key={error}
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: -10,
                      scale: 0.99,
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
                      y: -6,
                      scale: 0.99,
                    }
              }
              transition={{
                duration: 0.42,
                ease: EASE,
              }}
              className="mt-5 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <motion.span
                  initial={
                    shouldReduceMotion
                      ? false
                      : {
                          scale: 0.8,
                          opacity: 0,
                        }
                  }
                  animate={
                    shouldReduceMotion
                      ? undefined
                      : {
                          scale: 1,
                          opacity: 1,
                        }
                  }
                  transition={{
                    delay: 0.08,
                    duration: 0.35,
                    ease: EASE,
                  }}
                  className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white text-red-500 shadow-sm"
                >
                  <AlertIcon />
                </motion.span>

                <span className="leading-6">{error}</span>
              </div>

              <motion.button
                type="button"
                onClick={loadSessions}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        y: -1,
                        scale: 1.015,
                      }
                }
                whileTap={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: 0.97,
                      }
                }
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 28,
                }}
                className="self-start rounded-xl border border-red-200 bg-white px-3.5 py-2 text-[11px] font-extrabold text-red-600 shadow-sm transition-colors hover:bg-red-100 sm:self-auto"
              >
                Try again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            CALENDAR + SELECTED DATE
        ================================================== */}

        <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_0.8fr]">
          {/* CALENDAR */}

          <motion.section
            initial={
              shouldReduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 28,
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
              delay: 0.1,
              duration: 0.72,
              ease: EASE,
            }}
            className="rounded-[30px] border border-[#E2E1DD] bg-white p-6 shadow-[0_12px_32px_rgba(44,30,22,0.035)] sm:p-7"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-gray-400">
                  Calendar
                </p>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.h2
                    key={`${month.getFullYear()}-${month.getMonth()}`}
                    initial={
                      shouldReduceMotion
                        ? false
                        : {
                            opacity: 0,
                            y: 7,
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
                            y: -7,
                          }
                    }
                    transition={{
                      duration: 0.28,
                      ease: EASE,
                    }}
                    className="mt-2 text-2xl font-extrabold text-[#2C1E16]"
                  >
                    {new Intl.DateTimeFormat("en-US", {
                      month: "long",
                      year: "numeric",
                    }).format(month)}
                  </motion.h2>
                </AnimatePresence>
              </div>

              <div className="flex gap-2">
                <CalendarNavButton
                  label="Previous month"
                  onClick={() => changeMonth(-1)}
                  icon={<ChevronIcon direction="left" />}
                  shouldReduceMotion={shouldReduceMotion}
                />

                <motion.button
                  type="button"
                  onClick={handleToday}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: -1,
                          scale: 1.015,
                        }
                  }
                  whileTap={
                    shouldReduceMotion
                      ? undefined
                      : {
                          scale: 0.96,
                        }
                  }
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 26,
                  }}
                  className="rounded-xl bg-[#EEF5FC] px-3 py-2 text-[10px] font-extrabold text-[#4476B7] transition-colors hover:bg-[#E2EFFB]"
                >
                  Today
                </motion.button>

                <CalendarNavButton
                  label="Next month"
                  onClick={() => changeMonth(1)}
                  icon={<ChevronIcon direction="right" />}
                  shouldReduceMotion={shouldReduceMotion}
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-1.5">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-[9px] font-extrabold tracking-[0.08em] text-gray-400"
                >
                  {day}
                </div>
              ))}

              {calendarCells.map((cell, index) => {
                const key = `${cell.date.getFullYear()}-${String(
                  cell.date.getMonth() + 1,
                ).padStart(2, "0")}-${String(cell.date.getDate()).padStart(
                  2,
                  "0",
                )}`;

                const count = sessionDates.get(key)?.length ?? 0;

                const active = key === selectedDateKey;

                return (
                  <motion.button
                    type="button"
                    key={`${cell.key}-${index}`}
                    onClick={() => goToDate(cell.date)}
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : {
                            scale: 1.045,
                            y: -1,
                          }
                    }
                    whileTap={
                      shouldReduceMotion
                        ? undefined
                        : {
                            scale: 0.94,
                          }
                    }
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 24,
                    }}
                    className="relative flex aspect-square cursor-pointer items-center justify-center rounded-xl text-xs font-bold outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#4577B8]/30"
                  >
                    <motion.span
                      animate={
                        shouldReduceMotion
                          ? undefined
                          : active
                            ? {
                                scale: [0.92, 1.04, 1],
                              }
                            : {
                                scale: 1,
                              }
                      }
                      transition={{
                        duration: 0.34,
                        ease: EASE,
                      }}
                      className={[
                        "absolute inset-0 rounded-xl",
                        active
                          ? "bg-[#4577B8] shadow-[0_8px_18px_rgba(69,119,184,0.22)]"
                          : "hover:bg-[#F4F7FA]",
                      ].join(" ")}
                    />

                    <span
                      className={[
                        "relative z-10",
                        cell.current ? "text-gray-700" : "text-gray-300",
                        active ? "text-white" : "",
                      ].join(" ")}
                    >
                      {cell.day}
                    </span>

                    <AnimatePresence initial={false}>
                      {count > 0 && (
                        <motion.span
                          initial={
                            shouldReduceMotion
                              ? false
                              : {
                                  opacity: 0,
                                  scale: 0,
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
                          exit={
                            shouldReduceMotion
                              ? undefined
                              : {
                                  opacity: 0,
                                  scale: 0,
                                }
                          }
                          transition={{
                            duration: 0.25,
                            ease: EASE,
                          }}
                          className={[
                            "absolute bottom-1 z-20 rounded-full",
                            count > 2 ? "h-1.5 w-1.5" : "h-1 w-1",
                            active ? "bg-white" : "bg-[#D28B4E]",
                          ].join(" ")}
                        />
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-[10px] font-bold text-gray-400">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#D28B4E]" />
                Session
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#4577B8]" />
                Selected
              </div>
            </div>
          </motion.section>

          {/* SELECTED DAY */}

          <motion.section
            initial={
              shouldReduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 30,
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
              delay: 0.18,
              duration: 0.72,
              ease: EASE,
            }}
            className="rounded-[30px] border border-[#E2E1DD] bg-white p-6 shadow-[0_12px_32px_rgba(44,30,22,0.035)] sm:p-7"
          >
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-gray-400">
              Selected Day
            </p>

            <AnimatePresence mode="wait" initial={false}>
              <motion.h2
                key={selectedDateKey}
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
                        y: -8,
                      }
                }
                transition={{
                  duration: 0.3,
                  ease: EASE,
                }}
                className="mt-2 text-2xl font-extrabold text-[#2C1E16]"
              >
                {new Intl.DateTimeFormat("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                }).format(selectedDate)}
              </motion.h2>
            </AnimatePresence>

            <div className="mt-6 space-y-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {selectedSessions.length === 0 ? (
                  <motion.div
                    key="empty-selected"
                    initial={
                      shouldReduceMotion
                        ? false
                        : {
                            opacity: 0,
                            y: 10,
                            scale: 0.985,
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
                            y: -8,
                            scale: 0.985,
                          }
                    }
                    transition={{
                      duration: 0.38,
                      ease: EASE,
                    }}
                    className="rounded-2xl border border-dashed border-[#DDD8CC] bg-[#FCFBF8] px-5 py-10 text-center"
                  >
                    <motion.div
                      animate={
                        shouldReduceMotion
                          ? undefined
                          : {
                              y: [0, -4, 0],
                            }
                      }
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0EEE8] text-[#4577B8]"
                    >
                      <CalendarIcon />
                    </motion.div>

                    <h3 className="mt-4 text-lg font-extrabold text-[#2C1E16]">
                      No sessions
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      Nothing is scheduled on this date.
                    </p>
                  </motion.div>
                ) : (
                  selectedSessions.map((session, index) => (
                    <ScheduleCard
                      key={session.id}
                      session={session}
                      delay={index * 60}
                      shouldReduceMotion={shouldReduceMotion}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        </div>

        {/* =================================================
            UPCOMING
        ================================================== */}

        <motion.section
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 32,
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
            delay: 0.25,
            duration: 0.75,
            ease: EASE,
          }}
          className="mt-7 rounded-[30px] border border-[#E2E1DD] bg-white p-6 shadow-[0_12px_32px_rgba(44,30,22,0.035)] sm:p-7"
        >
          <div className="mb-6">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-gray-400">
              Agenda
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-[#2C1E16]">
              Upcoming schedule
            </h2>
          </div>

          <AnimatePresence mode="popLayout" initial={false}>
            {upcoming.length === 0 ? (
              <motion.div
                key="empty-upcoming"
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
                exit={
                  shouldReduceMotion
                    ? undefined
                    : {
                        opacity: 0,
                        y: -8,
                      }
                }
                transition={{
                  duration: 0.4,
                  ease: EASE,
                }}
                className="rounded-2xl bg-[#FCFBF8] p-8 text-center text-sm font-semibold text-gray-500"
              >
                No upcoming sessions.
              </motion.div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {upcoming.map((session, index) => (
                  <ScheduleCard
                    key={session.id}
                    session={session}
                    delay={index * 55}
                    shouldReduceMotion={shouldReduceMotion}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.section>
      </main>
    </div>
  );
}

function ScheduleCard({
  session,
  delay = 0,
  shouldReduceMotion,
}: {
  session: Session;
  delay?: number;
  shouldReduceMotion: boolean | null;
}) {
  return (
    <motion.div
      layout="position"
      initial={
        shouldReduceMotion
          ? false
          : {
              opacity: 0,
              y: 12,
              scale: 0.985,
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
              y: -10,
              scale: 0.985,
            }
      }
      transition={{
        opacity: {
          duration: 0.34,
          delay: delay / 1000,
          ease: EASE,
        },
        y: {
          duration: 0.48,
          delay: delay / 1000,
          ease: EASE,
        },
        scale: {
          duration: 0.48,
          delay: delay / 1000,
          ease: EASE,
        },
        layout: {
          duration: 0.38,
          ease: EASE,
        },
      }}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: -3,
              scale: 1.008,
              transition: {
                type: "spring",
                stiffness: 340,
                damping: 24,
              },
            }
      }
      whileTap={
        shouldReduceMotion
          ? undefined
          : {
              scale: 0.992,
              transition: {
                type: "spring",
                stiffness: 420,
                damping: 28,
              },
            }
      }
      className="group rounded-2xl border border-[#ECE9E2] bg-[#FCFBF8] p-4 shadow-[0_4px_14px_rgba(44,30,22,0.015)] transition-colors duration-300 hover:bg-white hover:shadow-[0_12px_24px_rgba(44,30,22,0.07)]"
    >
      <div className="flex items-start gap-3">
        <motion.div
          whileHover={
            shouldReduceMotion
              ? undefined
              : {
                  scale: 1.05,
                  rotate: -1.5,
                }
          }
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 24,
          }}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#4577B8] text-sm font-extrabold text-white"
        >
          {session.mentee?.profile?.profile_photo ? (
            <img
              src={resolveImageUrl(session.mentee.profile.profile_photo)}
              alt={session.mentee.name}
              className="h-full w-full object-cover"
            />
          ) : (
            session.mentee?.name?.charAt(0).toUpperCase() || "M"
          )}
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-sm font-extrabold text-[#2C1E16]">
              {session.mentee?.name || "Unknown mentee"}
            </h3>

            <StatusBadge status={session.status} />
          </div>

          <p className="mt-1 line-clamp-2 text-sm font-bold text-[#1E3F20]">
            {session.topic}
          </p>

          <p className="mt-3 text-xs font-bold text-gray-400">
            {formatTime(getSlot(session)?.start_time)} -{" "}
            {formatTime(getSlot(session)?.end_time)} WITA
          </p>

          <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold text-gray-400">
            {session.duration && <span>{session.duration} minutes</span>}

            {session.meeting_type && <span>{session.meeting_type}</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-[#FFF2D9] text-[#A76815]",
    approved: "bg-[#E5F4EB] text-[#2A8254]",
    completed: "bg-[#E8F0E8] text-[#1E3F20]",
  };

  return (
    <motion.span
      initial={{
        opacity: 0,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 0.25,
        ease: EASE,
      }}
      className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold ${
        styles[status] || "bg-gray-100 text-gray-500"
      }`}
    >
      {status}
    </motion.span>
  );
}

function CalendarNavButton({
  label,
  onClick,
  icon,
  shouldReduceMotion,
}: {
  label: string;
  onClick: () => void;
  icon: ReactNode;
  shouldReduceMotion: boolean | null;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: -1,
              scale: 1.04,
            }
      }
      whileTap={
        shouldReduceMotion
          ? undefined
          : {
              scale: 0.92,
            }
      }
      transition={{
        type: "spring",
        stiffness: 420,
        damping: 26,
      }}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#E8E5DE] text-gray-500 outline-none transition-colors duration-200 hover:bg-[#F7F5EF] focus-visible:ring-2 focus-visible:ring-[#4577B8]/20"
    >
      {icon}
    </motion.button>
  );
}

function LoadingPage() {
  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center justify-center">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.94,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 0.45,
          ease: EASE,
        }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            ease: "linear",
          }}
          className="h-10 w-10 rounded-full border-4 border-[#DDE4DB] border-t-[#4577B8]"
        />

        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.15,
            duration: 0.35,
          }}
          className="mt-4 text-xs font-bold text-gray-400"
        >
          Loading your schedule...
        </motion.p>
      </motion.div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d={
          direction === "left"
            ? "M14.5 6L8.5 12L14.5 18"
            : "M9.5 6L15.5 12L9.5 18"
        }
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
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 8V13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <circle cx="12" cy="16.5" r="1" fill="currentColor" />

      <path
        d="M10.3 4.7L3.9 16C3.2 17.2 4.1 18.7 5.5 18.7H18.5C19.9 18.7 20.8 17.2 20.1 16L13.7 4.7C13 3.5 11 3.5 10.3 4.7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
