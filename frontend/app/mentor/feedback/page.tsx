"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Feedback = {
  id: number;
  rating: number;
  comment?: string | null;
  created_at?: string;
  mentee?: {
    id: number;
    name: string;
    profile?: {
      profile_photo?: string | null;
    } | null;
  } | null;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

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

export default function MentorFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  const [mentorId, setMentorId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFeedback = useCallback(async () => {
    const token = localStorage.getItem("auth_token") || "";

    if (!token) {
      return;
    }

    try {
      const meResponse = await fetch(`${API_URL}/me`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const meData = await meResponse.json().catch(() => null);

      if (!meResponse.ok) {
        setError(meData?.message || "Unable to load mentor account.");
        return;
      }

      const user = meData?.data ?? meData;

      const id = Number(user?.id);

      if (!id) {
        setError("Unable to determine mentor account.");
        return;
      }

      setMentorId(id);

      const response = await fetch(`${API_URL}/mentors/${id}/feedbacks`, {
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.message || "Unable to load mentor feedback.");
        return;
      }

      setFeedbacks(data?.data ?? []);
    } catch {
      setError("Unable to connect to the Laravel backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const average = useMemo(() => {
    if (!feedbacks.length) {
      return 0;
    }

    return (
      feedbacks.reduce((sum, item) => sum + Number(item.rating), 0) /
      feedbacks.length
    );
  }, [feedbacks]);

  const distribution = useMemo(() => {
    const result = [0, 0, 0, 0, 0];

    feedbacks.forEach((item) => {
      const rating = Number(item.rating);

      if (rating >= 1 && rating <= 5) {
        result[rating - 1] += 1;
      }
    });

    return result;
  }, [feedbacks]);

  const highestCount = Math.max(...distribution, 1);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-76px)] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#F3E1DE] border-t-[#D26C61]" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-[1300px] px-5 py-7 sm:px-7 xl:px-10">
      <section className="mentor-reveal rounded-[30px] border border-[#F0DDD9] bg-gradient-to-br from-[#FFF5F2] via-white to-[#F7F0FB] p-6 shadow-[0_15px_40px_rgba(210,108,97,0.05)] sm:p-8">
        <span className="inline-flex rounded-full bg-[#FBECE8] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#BE5D52]">
          Mentor Feedback
        </span>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#2C1E16]">
          Your mentoring impact
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500">
          Review the feedback mentees have shared after completed mentoring
          sessions.
        </p>
      </section>

      {error && (
        <div className="mentor-reveal mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="mt-7 grid gap-7 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="mentor-reveal rounded-[30px] border border-[#E6E2DC] bg-white p-6 shadow-[0_12px_32px_rgba(44,30,22,0.035)] sm:p-7">
          <div className="flex items-end gap-4">
            <div>
              <p className="text-5xl font-extrabold tracking-tight text-[#2C1E16]">
                {average.toFixed(1)}
              </p>

              <div className="mt-2 flex gap-0.5 text-[#D8953C]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} filled={average >= star - 0.5} />
                ))}
              </div>

              <p className="mt-2 text-xs font-bold text-gray-400">
                Based on {feedbacks.length} review
                {feedbacks.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = distribution[rating - 1];

              const percentage = feedbacks.length
                ? Math.round((count / feedbacks.length) * 100)
                : 0;

              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="w-7 text-xs font-extrabold text-gray-500">
                    {rating}
                  </span>

                  <StarIcon filled />

                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F1EFE8]">
                    <div
                      className="h-full rounded-full bg-[#D8953C] transition-all duration-700"
                      style={{
                        width: `${Math.max(percentage, count ? 4 : 0)}%`,
                      }}
                    />
                  </div>

                  <span className="w-9 text-right text-xs font-bold text-gray-400">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section
          className="mentor-reveal rounded-[30px] border border-[#E6E2DC] bg-white p-6 shadow-[0_12px_32px_rgba(44,30,22,0.035)] sm:p-7"
          style={{ animationDelay: "120ms" }}
        >
          <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-gray-400">
            Distribution
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-[#2C1E16]">
            Rating overview
          </h2>

          <div className="mt-6 space-y-4">
            {[5, 4, 3, 2, 1].map((rating, index) => {
              const count = distribution[rating - 1];

              return (
                <div
                  key={rating}
                  className="mentor-reveal"
                  style={{
                    animationDelay: `${180 + index * 60}ms`,
                  }}
                >
                  <div className="mb-2 flex items-center justify-between text-xs font-bold text-gray-500">
                    <span>{rating} stars</span>

                    <span>{count} reviews</span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-[#F1EFE8]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#D8953C] to-[#E6BD78] transition-all duration-700"
                      style={{
                        width: `${(count / highestCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section
        className="mentor-reveal mt-7 rounded-[30px] border border-[#E2E1DD] bg-white shadow-[0_12px_32px_rgba(44,30,22,0.035)]"
        style={{ animationDelay: "180ms" }}
      >
        <div className="border-b border-[#ECEAE4] px-6 py-6 sm:px-7">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-gray-400">
            Mentee Reviews
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-[#2C1E16]">
            What mentees are saying
          </h2>
        </div>

        {feedbacks.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7EFEA] text-[#D26C61]">
              <StarIcon filled />
            </div>

            <h3 className="mt-5 text-xl font-extrabold text-[#2C1E16]">
              No feedback yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Feedback will appear here after mentees complete sessions and
              submit reviews.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0EEE8]">
            {feedbacks.map((feedback, index) => (
              <article
                key={feedback.id}
                className="mentor-reveal p-6 sm:p-7"
                style={{
                  animationDelay: `${220 + index * 80}ms`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#D26C61] text-sm font-extrabold text-white">
                    {feedback.mentee?.profile?.profile_photo ? (
                      <img
                        src={resolveImageUrl(
                          feedback.mentee.profile.profile_photo,
                        )}
                        alt={feedback.mentee.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      feedback.mentee?.name?.charAt(0).toUpperCase() || "M"
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-extrabold text-[#2C1E16]">
                          {feedback.mentee?.name || "Career Cafe Mentee"}
                        </p>

                        <div className="mt-1 flex gap-0.5 text-[#D8953C]">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                              key={star}
                              filled={Number(feedback.rating) >= star}
                            />
                          ))}
                        </div>
                      </div>

                      {feedback.created_at && (
                        <span className="text-[10px] font-bold text-gray-400">
                          {new Intl.DateTimeFormat("id-ID").format(
                            new Date(feedback.created_at),
                          )}
                        </span>
                      )}
                    </div>

                    {feedback.comment ? (
                      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                        “{feedback.comment}”
                      </p>
                    ) : (
                      <p className="mt-4 text-sm italic text-gray-400">
                        No written comment.
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="mt-6 text-center text-xs font-semibold text-gray-400">
        Mentor ID: {mentorId ?? "—"}
      </div>
    </main>
  );
}

function StarIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
    >
      <path
        d="M12 3.8L14.48 8.82L20.02 9.63L16.01 13.54L16.96 19.06L12 16.45L7.04 19.06L7.99 13.54L3.98 9.63L9.52 8.82L12 3.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
