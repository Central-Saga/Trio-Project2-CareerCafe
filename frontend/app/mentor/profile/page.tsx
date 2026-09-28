"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";

type MentorProfile = {
  id?: number;
  user_id?: number;
  profile_photo?: string | null;
  cover_photo?: string | null;
  job_title?: string | null;
  company?: string | null;
  location?: string | null;
  experience_years?: number | null;
  education?: string | null;
  bio?: string | null;
  linkedin_url?: string | null;
  timezone?: string | null;
  avg_rating?: number | string | null;
  total_reviews?: number | null;
};

type MentorSkill = {
  id: number;
  name: string;
};

type MentorUser = {
  id?: number;
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

type ProfileResponse = {
  id?: number;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  profile?: MentorProfile | null;
  skills?: MentorSkill[];
};

type EditForm = {
  name: string;
  job_title: string;
  company: string;
  location: string;
  experience_years: string;
  education: string;
  bio: string;
  linkedin_url: string;
  timezone: string;
  skills: string[];
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const BACKEND_URL = API_URL.replace(/\/api$/, "");

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

function getInitial(name?: string | null) {
  return name?.trim().charAt(0).toUpperCase() || "M";
}

function formatRating(value?: number | string | null) {
  const rating = Number(value ?? 0);

  return Number.isFinite(rating) && rating > 0 ? rating.toFixed(1) : "—";
}

function localStorageSafeName() {
  if (typeof window === "undefined") {
    return "Mentor Professional";
  }

  return localStorage.getItem("user_name") || "Mentor Professional";
}

function notifyMentorProfileUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("mentor-profile-updated"));
  }
}

/* =========================================================
   ICONS
========================================================= */

function ProfileIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 20C5.9 16.4 8.2 14.6 12 14.6C15.8 14.6 18.1 16.4 19 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="7"
        width="17"
        height="12.5"
        rx="2.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 7V5.5C8 4.67 8.67 4 9.5 4H14.5C15.33 4 16 4.67 16 5.5V7"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M3.5 11H20.5M10 14H14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 20V5.5C5 4.67 5.67 4 6.5 4H14.5C15.33 4 16 4.67 16 5.5V20"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M16 9H18.5C19.33 9 20 9.67 20 10.5V20"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 8H11M8 11.5H11M8 15H11M18 13H20M18 16H20M3.5 20H21"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M19 10.3C19 15.1 12 21 12 21S5 15.1 5 10.3a7 7 0 1 1 14 0Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle
        cx="12"
        cy="10.3"
        r="2.3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function GraduationIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 9L12 4.5L20.5 9L12 13.5L3.5 9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M7 11V16C9.8 18.1 14.2 18.1 17 16V11M20.5 9V14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3.8L14.48 8.82L20.02 9.63L16.01 13.54L16.96 19.06L12 16.45L7.04 19.06L7.99 13.54L3.98 9.63L9.52 8.82L12 3.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 13.8L14.2 9.6M8.2 16.8L6.8 18.2C5.26 19.74 2.76 19.74 1.22 18.2C-.32 16.66-.32 14.16 1.22 12.62L5.22 8.62C6.76 7.08 9.26 7.08 10.8 8.62"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M13.2 15.38C14.74 16.92 17.24 16.92 18.78 15.38L22.78 11.38C24.32 9.84 24.32 7.34 22.78 5.8C21.24 4.26 18.74 4.26 17.2 5.8L15.8 7.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14.5 6L8.5 12L14.5 18"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 20H8L19 9C20.1 7.9 20.1 6.1 19 5C17.9 3.9 16.1 3.9 15 5L4 16V20Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 10.5V16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M12 7.5H12.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 7.5C4 6.67 4.67 6 5.5 6H8L9.4 4H14.6L16 6H18.5C19.33 6 20 6.67 20 7.5V18C20 18.83 19.33 19.5 18.5 19.5H5.5C4.67 19.5 4 18.83 4 18V7.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12.5"
        r="3.4"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 7H19M9 7V4.5H15V7M8 10V17M12 10V17M16 10V17M6 7L7 20H17L18 7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#EEE8E1] bg-[#FBF9F6] px-4 py-3.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#617A65] shadow-sm">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[#AAA097]">
          {label}
        </p>

        <p className="mt-1 text-xs font-black leading-5 text-[#42372F]">
          {value || "Belum diisi"}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function MentorProfilePage() {
  const router = useRouter();

  const [mentor, setMentor] = useState<MentorUser | null>(null);
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [skills, setSkills] = useState<MentorSkill[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [removeCurrentPhoto, setRemoveCurrentPhoto] = useState(false);

  const [newSkill, setNewSkill] = useState("");

  const [form, setForm] = useState<EditForm>({
    name: "",
    job_title: "",
    company: "",
    location: "",
    experience_years: "",
    education: "",
    bio: "",
    linkedin_url: "",
    timezone: "",
    skills: [],
  });

  /* =========================================================
     LOAD PROFILE
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
      setMentor({
        name: storedName,
        role: "mentor",
      });
    }

    setLoading(true);
    setError("");

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
         /ME
      ------------------------------------------------------- */

      if (meResponse.ok) {
        const rawMe =
          meData && typeof meData === "object" && "data" in meData
            ? (meData as { data?: unknown }).data
            : meData;

        if (rawMe && typeof rawMe === "object") {
          const userData = rawMe as MentorUser;

          setMentor(userData);

          if (userData.name) {
            localStorage.setItem("user_name", userData.name);
          }
        }
      }

      /* -------------------------------------------------------
         /PROFILE
      ------------------------------------------------------- */

      if (profileResponse.ok) {
        const rawProfileResponse =
          profileData &&
          typeof profileData === "object" &&
          "data" in profileData
            ? (profileData as { data?: unknown }).data
            : profileData;

        if (rawProfileResponse && typeof rawProfileResponse === "object") {
          const responseData = rawProfileResponse as ProfileResponse;

          setProfile(responseData.profile ?? null);

          setSkills(
            Array.isArray(responseData.skills) ? responseData.skills : [],
          );

          if (responseData.name) {
            setMentor({
              id: responseData.id,
              name: responseData.name,
              email: responseData.email,
              role: responseData.role,
            });

            localStorage.setItem("user_name", responseData.name);
          }
        } else {
          setProfile(null);
          setSkills([]);
        }
      } else {
        const message =
          profileData &&
          typeof profileData === "object" &&
          "message" in profileData
            ? String(
                (
                  profileData as {
                    message?: unknown;
                  }
                ).message ?? "",
              )
            : "";

        setError(message || "Profil mentor tidak dapat dimuat.");
      }
    } catch {
      setError("Tidak dapat terhubung ke Laravel backend.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  /* =========================================================
     OPEN EDITOR
  ========================================================= */

  const openEditor = () => {
    setError("");
    setSuccess("");

    setForm({
      name: mentor?.name || "",
      job_title: profile?.job_title || "",
      company: profile?.company || "",
      location: profile?.location || "",
      experience_years:
        profile?.experience_years != null
          ? String(profile.experience_years)
          : "",
      education: profile?.education || "",
      bio: profile?.bio || "",
      linkedin_url: profile?.linkedin_url || "",
      timezone: profile?.timezone || "Asia/Jakarta",
      skills: skills.map((skill) => skill.name),
    });

    setSelectedPhoto(null);
    setPhotoPreview(resolveImageUrl(profile?.profile_photo));
    setRemoveCurrentPhoto(false);
    setNewSkill("");
    setEditing(true);
  };

  /* =========================================================
     CLOSE EDITOR
  ========================================================= */

  const closeEditor = () => {
    if (saving) {
      return;
    }

    setEditing(false);
    setSelectedPhoto(null);
    setPhotoPreview("");
    setRemoveCurrentPhoto(false);
    setNewSkill("");
    setError("");
  };

  /* =========================================================
     UPDATE FIELD
  ========================================================= */

  const updateField = (field: keyof EditForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /* =========================================================
     PHOTO CHANGE
  ========================================================= */

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("File foto harus berupa gambar.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran foto maksimal 2 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setSelectedPhoto(file);
    setRemoveCurrentPhoto(false);

    const localUrl = URL.createObjectURL(file);
    setPhotoPreview(localUrl);
  };

  /* =========================================================
     REMOVE PHOTO
  ========================================================= */

  const handleRemovePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview("");
    setRemoveCurrentPhoto(true);
    setError("");
  };

  /* =========================================================
     ADD SKILL
  ========================================================= */

  const addSkill = () => {
    const skill = newSkill.trim();

    if (!skill) {
      return;
    }

    if (skill.length > 50) {
      setError("Nama skill maksimal 50 karakter.");
      return;
    }

    const exists = form.skills.some(
      (item) => item.toLowerCase() === skill.toLowerCase(),
    );

    if (exists) {
      setError("Skill tersebut sudah ditambahkan.");
      return;
    }

    if (form.skills.length >= 20) {
      setError("Maksimal 20 skill dapat ditambahkan.");
      return;
    }

    setForm((current) => ({
      ...current,
      skills: [...current.skills, skill],
    }));

    setNewSkill("");
    setError("");
  };

  /* =========================================================
     REMOVE SKILL
  ========================================================= */

  const removeSkill = (index: number) => {
    setForm((current) => ({
      ...current,
      skills: current.skills.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  const handleSave = async () => {
    const token = localStorage.getItem("auth_token") || "";

    if (!token) {
      router.replace("/login");
      return;
    }

    const name = form.name.trim();

    if (!name) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    const experienceValue = form.experience_years.trim()
      ? Number(form.experience_years)
      : null;

    if (
      experienceValue !== null &&
      (!Number.isInteger(experienceValue) ||
        experienceValue < 0 ||
        experienceValue > 60)
    ) {
      setError("Pengalaman harus berupa angka antara 0 sampai 60 tahun.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      /* -------------------------------------------------------
         UPDATE PROFILE DATA
      ------------------------------------------------------- */

      const profileResponse = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          job_title: form.job_title.trim() || null,
          company: form.company.trim() || null,
          location: form.location.trim() || null,
          experience_years: experienceValue,
          education: form.education.trim() || null,
          bio: form.bio.trim() || null,
          linkedin_url: form.linkedin_url.trim() || null,
          timezone: form.timezone.trim() || "Asia/Jakarta",
          skills: form.skills,
        }),
      });

      const profileResult = await profileResponse.json().catch(() => null);

      if (!profileResponse.ok) {
        setError(profileResult?.message || "Profil gagal diperbarui.");
        return;
      }

      /* -------------------------------------------------------
         UPLOAD FOTO BARU
      ------------------------------------------------------- */

      if (selectedPhoto) {
        const photoForm = new FormData();

        photoForm.append("photo", selectedPhoto);

        const photoResponse = await fetch(`${API_URL}/profile/photo`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: photoForm,
        });

        const photoResult = await photoResponse.json().catch(() => null);

        if (!photoResponse.ok) {
          await loadProfile();
          notifyMentorProfileUpdated();

          setError(
            photoResult?.message ||
              "Profil berhasil disimpan, tetapi foto profil gagal diunggah.",
          );

          return;
        }
      } else if (removeCurrentPhoto) {
        /* -----------------------------------------------------
           DELETE FOTO
        ----------------------------------------------------- */

        const deletePhotoResponse = await fetch(`${API_URL}/profile/photo`, {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const deleteResult = await deletePhotoResponse.json().catch(() => null);

        if (!deletePhotoResponse.ok) {
          await loadProfile();
          notifyMentorProfileUpdated();

          setError(
            deleteResult?.message ||
              "Profil berhasil disimpan, tetapi foto gagal dihapus.",
          );

          return;
        }
      }

      /* -------------------------------------------------------
         UPDATE LOCAL USER NAME ONLY
      ------------------------------------------------------- */

      localStorage.setItem("user_name", name);

      /* -------------------------------------------------------
         REFRESH FROM BACKEND
      ------------------------------------------------------- */

      await loadProfile();

      /*
       * Beri tahu MentorLayout bahwa profile berubah.
       * Jadi sidebar/avatar/navbar ikut refresh.
       */
      notifyMentorProfileUpdated();

      setEditing(false);
      setSelectedPhoto(null);
      setPhotoPreview("");
      setRemoveCurrentPhoto(false);
      setNewSkill("");

      setSuccess("Profil mentor berhasil diperbarui.");

      window.setTimeout(() => {
        setSuccess("");
      }, 3500);
    } catch {
      setError("Tidak dapat terhubung ke Laravel backend.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DISPLAY DATA
  ========================================================= */

  const mentorName = mentor?.name || localStorageSafeName();

  const profileImage = resolveImageUrl(profile?.profile_photo);

  const rating = formatRating(profile?.avg_rating);
  const reviews = profile?.total_reviews ?? 0;

  const initials = useMemo(() => getInitial(mentorName), [mentorName]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#FFFDFC] px-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1E9] text-[#1E3F20]">
            <ProfileIcon className="h-6 w-6" />
          </div>

          <div className="mx-auto mt-5 h-1.5 w-24 overflow-hidden rounded-full bg-[#EAE5DF]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#D8953C]" />
          </div>

          <p className="mt-4 text-xs font-bold text-[#8B8178]">
            Preparing mentor profile...
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-[calc(100vh-72px)] bg-[#FFFDFC] px-5 pb-16 pt-7 sm:px-7 lg:px-9 xl:px-10">
        <div className="mx-auto max-w-[1120px]">
          <section className="mentor-reveal rounded-[32px] border border-[#E9E2DB] bg-white shadow-[0_22px_65px_rgba(53,39,29,.06)]">
            <div className="relative overflow-hidden rounded-[32px] bg-[#F3EAE0] px-6 py-7 sm:px-8 sm:py-8">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/35 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-[#DCE6D8]/55 blur-3xl" />

              <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <Link
                    href="/mentor/dashboard"
                    className="inline-flex items-center gap-1.5 text-[10px] font-black text-[#6A756B] transition hover:-translate-x-0.5 hover:text-[#1E3F20]"
                  >
                    <ChevronLeftIcon />
                    Kembali ke dashboard
                  </Link>

                  <p className="mt-6 text-[9px] font-black uppercase tracking-[0.2em] text-[#9A9086]">
                    Mentor profile
                  </p>

                  <h1 className="mt-1.5 text-[34px] font-black tracking-[-0.055em] text-[#302823] sm:text-[42px]">
                    Profil Mentor
                  </h1>

                  <p className="mt-2 max-w-xl text-xs font-medium leading-6 text-[#7E746C] sm:text-sm">
                    Kelola informasi profesional, skills, dan foto profil kamu
                    langsung dari Mentor Workspace.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#D1DDCE] bg-white/75 px-3.5 py-2 text-[9px] font-black text-[#55705A] backdrop-blur-sm">
                    <span className="h-2 w-2 rounded-full bg-[#6F9774]" />
                    Mentor account
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[280px_1fr]">
              <aside className="rounded-[28px] border border-[#ECE6E0] bg-[#FBF9F6] p-6 text-center">
                <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-[30px] border-4 border-white bg-[#1E3F20] text-3xl font-black text-white shadow-[0_16px_36px_rgba(30,63,32,.16)]">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={mentorName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>

                <h2 className="mt-5 truncate text-lg font-black text-[#332A24]">
                  {mentorName}
                </h2>

                <p className="mt-1 text-xs font-semibold text-[#607A64]">
                  {profile?.job_title || "Mentor Professional"}
                </p>

                {profile?.company && (
                  <p className="mt-1 text-[10px] font-medium text-[#968C84]">
                    {profile.company}
                  </p>
                )}

                <div className="mt-6 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-white px-3 py-3 shadow-sm">
                    <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[#AAA097]">
                      Rating
                    </p>

                    <div className="mt-1 flex items-center justify-center gap-1 text-sm font-black text-[#8A682E]">
                      <StarIcon />
                      {rating}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white px-3 py-3 shadow-sm">
                    <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[#AAA097]">
                      Reviews
                    </p>

                    <p className="mt-1 text-sm font-black text-[#332A24]">
                      {reviews}
                    </p>
                  </div>
                </div>

                {profile?.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E3F20] px-4 py-3 text-[10px] font-black text-white transition hover:-translate-y-0.5 hover:bg-[#173219]"
                  >
                    <LinkIcon />
                    LinkedIn Profile
                  </a>
                )}
              </aside>

              <div className="min-w-0">
                {error && !editing && (
                  <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#F0D0CC] bg-[#FDF0EE] px-4 py-3.5 text-xs font-bold text-[#B4544B]">
                    <InfoIcon />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#D5E6D2] bg-[#F0F7EE] px-4 py-3.5 text-xs font-bold text-[#56745B]">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#DDEDD9] text-[11px]">
                      ✓
                    </span>
                    <span>{success}</span>
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#AAA097]">
                      Professional overview
                    </p>

                    <h2 className="mt-1 text-xl font-black text-[#352C26]">
                      Tentang kamu sebagai mentor
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-[#EAF1E9] px-3.5 py-2.5 text-[9px] font-black text-[#55765B]">
                      <ProfileIcon className="h-4 w-4" />
                      Mentor Workspace
                    </div>

                    <button
                      type="button"
                      onClick={openEditor}
                      aria-label="Edit profil mentor"
                      title="Edit profil mentor"
                      className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#E5DED6] bg-white text-[#756B63] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D8953C] hover:bg-[#FFF8EE] hover:text-[#C98228] hover:shadow-md active:translate-y-0"
                    >
                      <EditIcon />
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <DetailRow
                    icon={<BriefcaseIcon />}
                    label="Jabatan"
                    value={profile?.job_title || ""}
                  />

                  <DetailRow
                    icon={<BuildingIcon />}
                    label="Perusahaan"
                    value={profile?.company || ""}
                  />

                  <DetailRow
                    icon={<LocationIcon />}
                    label="Lokasi"
                    value={profile?.location || ""}
                  />

                  <DetailRow
                    icon={<GraduationIcon />}
                    label="Pendidikan"
                    value={profile?.education || ""}
                  />

                  <DetailRow
                    icon={<BriefcaseIcon />}
                    label="Pengalaman"
                    value={
                      profile?.experience_years != null
                        ? `${profile.experience_years} tahun`
                        : ""
                    }
                  />

                  <DetailRow
                    icon={<LocationIcon />}
                    label="Timezone"
                    value={profile?.timezone || ""}
                  />
                </div>

                <div className="mt-5 rounded-[24px] border border-[#ECE6E0] bg-white p-5 shadow-sm sm:p-6">
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[#AAA097]">
                    Skills mentor
                  </p>

                  {skills.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill.id}
                          className="rounded-full border border-[#DDE8DB] bg-[#F2F7F0] px-3.5 py-2 text-[10px] font-black text-[#58715C]"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-7 text-[#6E655E]">
                      Belum ada skill mentor yang ditambahkan.
                    </p>
                  )}
                </div>

                <div className="mt-5 rounded-[24px] border border-[#ECE6E0] bg-white p-5 shadow-sm sm:p-6">
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[#AAA097]">
                    Bio mentor
                  </p>

                  <p className="mt-3 text-sm leading-7 text-[#6E655E]">
                    {profile?.bio || "Belum ada bio mentor yang diisi."}
                  </p>
                </div>

                <div className="mt-5 rounded-[24px] border border-[#F0E3C8] bg-[#FFF9ED] p-5 shadow-sm sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#9A7130] shadow-sm">
                      <StarIcon />
                    </span>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#987039]">
                        Mentor rating
                      </p>

                      <p className="mt-1 text-sm font-black text-[#59432A]">
                        {rating === "—"
                          ? "Belum ada rating"
                          : `${rating} / 5.0`}
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-[#8B7962]">
                        {reviews > 0
                          ? `Berdasarkan ${reviews} ulasan dari mentee.`
                          : "Rating akan muncul setelah mentee memberikan ulasan pada sesi yang telah selesai."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Link
                    href="/mentor/dashboard"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E4DDD6] bg-white px-5 py-3 text-[10px] font-black text-[#756B63] transition hover:bg-[#F8F5F0] hover:text-[#1E3F20]"
                  >
                    <ChevronLeftIcon />
                    Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {editing && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#241D18]/45 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              closeEditor();
            }
          }}
        >
          <div className="relative flex max-h-[92vh] w-full max-w-[760px] flex-col overflow-hidden rounded-[30px] border border-[#E9E1D8] bg-[#FFFDFC] shadow-[0_30px_90px_rgba(35,25,18,.22)]">
            <div className="flex shrink-0 items-start justify-between border-b border-[#EEE7E0] bg-[#F7F1E9] px-6 py-5 sm:px-7">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#A1968B]">
                  Mentor Workspace
                </p>

                <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-[#372E27]">
                  Edit Profil Mentor
                </h2>

                <p className="mt-1 text-[11px] font-medium leading-5 text-[#7D736B]">
                  Perbarui informasi profil mentor kamu.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditor}
                disabled={saving}
                aria-label="Tutup editor"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white text-[#80756C] shadow-sm transition hover:bg-[#EFE9E1] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XIcon />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-6 sm:px-7">
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#F0D0CC] bg-[#FDF0EE] px-4 py-3.5 text-xs font-bold text-[#B4544B]">
                  <InfoIcon />
                  <span>{error}</span>
                </div>
              )}

              <div className="rounded-[24px] border border-[#EDE6DF] bg-[#FBF9F6] p-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="relative mx-auto shrink-0 sm:mx-0">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[30px] border-4 border-white bg-[#1E3F20] text-3xl font-black text-white shadow-[0_12px_30px_rgba(30,63,32,.14)]">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Preview foto profil"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitial(form.name)
                      )}
                    </div>

                    <label
                      htmlFor="mentor-profile-photo"
                      className="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border-4 border-[#FBF9F6] bg-[#D8953C] text-white shadow-[0_8px_18px_rgba(216,149,60,.25)] transition hover:scale-105 hover:bg-[#C98228]"
                      title="Ganti foto profil"
                    >
                      <CameraIcon />
                    </label>

                    <input
                      id="mentor-profile-photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#AAA097]">
                      Foto profil
                    </p>

                    <h3 className="mt-1 text-sm font-black text-[#40362F]">
                      Gunakan foto profesional
                    </h3>

                    <p className="mt-1 text-[11px] leading-5 text-[#81766E]">
                      JPG, PNG, atau WEBP. Ukuran maksimal 2 MB.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <label
                        htmlFor="mentor-profile-photo"
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1E3F20] px-3.5 py-2.5 text-[9px] font-black text-white transition hover:bg-[#173219]"
                      >
                        <CameraIcon />
                        Pilih Foto
                      </label>

                      {(photoPreview || profileImage) && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#EBCDC8] bg-[#FDF2F0] px-3.5 py-2.5 text-[9px] font-black text-[#B45B51] transition hover:bg-[#FAE8E5]"
                        >
                          <TrashIcon />
                          Hapus Foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.12em] text-[#8F847B]">
                    Nama lengkap
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    maxLength={255}
                    className="mt-2 h-12 w-full rounded-2xl border border-[#E4DDD6] bg-white px-4 text-sm font-semibold text-[#3C332D] outline-none transition placeholder:text-[#B7ADA4] focus:border-[#9DB19F] focus:ring-4 focus:ring-[#EAF1E9]"
                    placeholder="Nama lengkap"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.12em] text-[#8F847B]">
                    Jabatan
                  </label>

                  <input
                    type="text"
                    value={form.job_title}
                    onChange={(event) =>
                      updateField("job_title", event.target.value)
                    }
                    maxLength={255}
                    className="mt-2 h-12 w-full rounded-2xl border border-[#E4DDD6] bg-white px-4 text-sm font-semibold text-[#3C332D] outline-none transition placeholder:text-[#B7ADA4] focus:border-[#9DB19F] focus:ring-4 focus:ring-[#EAF1E9]"
                    placeholder="Contoh: Senior Frontend Developer"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.12em] text-[#8F847B]">
                    Perusahaan
                  </label>

                  <input
                    type="text"
                    value={form.company}
                    onChange={(event) =>
                      updateField("company", event.target.value)
                    }
                    maxLength={255}
                    className="mt-2 h-12 w-full rounded-2xl border border-[#E4DDD6] bg-white px-4 text-sm font-semibold text-[#3C332D] outline-none transition placeholder:text-[#B7ADA4] focus:border-[#9DB19F] focus:ring-4 focus:ring-[#EAF1E9]"
                    placeholder="Contoh: Tokopedia"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.12em] text-[#8F847B]">
                    Lokasi
                  </label>

                  <input
                    type="text"
                    value={form.location}
                    onChange={(event) =>
                      updateField("location", event.target.value)
                    }
                    maxLength={255}
                    className="mt-2 h-12 w-full rounded-2xl border border-[#E4DDD6] bg-white px-4 text-sm font-semibold text-[#3C332D] outline-none transition placeholder:text-[#B7ADA4] focus:border-[#9DB19F] focus:ring-4 focus:ring-[#EAF1E9]"
                    placeholder="Contoh: Bali, Indonesia"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.12em] text-[#8F847B]">
                    Pengalaman (tahun)
                  </label>

                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={form.experience_years}
                    onChange={(event) =>
                      updateField("experience_years", event.target.value)
                    }
                    className="mt-2 h-12 w-full rounded-2xl border border-[#E4DDD6] bg-white px-4 text-sm font-semibold text-[#3C332D] outline-none transition placeholder:text-[#B7ADA4] focus:border-[#9DB19F] focus:ring-4 focus:ring-[#EAF1E9]"
                    placeholder="Contoh: 5"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.12em] text-[#8F847B]">
                    Pendidikan
                  </label>

                  <input
                    type="text"
                    value={form.education}
                    onChange={(event) =>
                      updateField("education", event.target.value)
                    }
                    maxLength={255}
                    className="mt-2 h-12 w-full rounded-2xl border border-[#E4DDD6] bg-white px-4 text-sm font-semibold text-[#3C332D] outline-none transition placeholder:text-[#B7ADA4] focus:border-[#9DB19F] focus:ring-4 focus:ring-[#EAF1E9]"
                    placeholder="Contoh: S1 Informatika"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.12em] text-[#8F847B]">
                    Timezone
                  </label>

                  <input
                    type="text"
                    value={form.timezone}
                    onChange={(event) =>
                      updateField("timezone", event.target.value)
                    }
                    maxLength={100}
                    className="mt-2 h-12 w-full rounded-2xl border border-[#E4DDD6] bg-white px-4 text-sm font-semibold text-[#3C332D] outline-none transition placeholder:text-[#B7ADA4] focus:border-[#9DB19F] focus:ring-4 focus:ring-[#EAF1E9]"
                    placeholder="Asia/Jakarta"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.12em] text-[#8F847B]">
                    LinkedIn
                  </label>

                  <input
                    type="url"
                    value={form.linkedin_url}
                    onChange={(event) =>
                      updateField("linkedin_url", event.target.value)
                    }
                    maxLength={255}
                    className="mt-2 h-12 w-full rounded-2xl border border-[#E4DDD6] bg-white px-4 text-sm font-semibold text-[#3C332D] outline-none transition placeholder:text-[#B7ADA4] focus:border-[#9DB19F] focus:ring-4 focus:ring-[#EAF1E9]"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.12em] text-[#8F847B]">
                    Bio
                  </label>

                  <textarea
                    value={form.bio}
                    onChange={(event) => updateField("bio", event.target.value)}
                    maxLength={1000}
                    rows={5}
                    className="mt-2 w-full resize-y rounded-2xl border border-[#E4DDD6] bg-white px-4 py-3.5 text-sm font-medium leading-6 text-[#3C332D] outline-none transition placeholder:text-[#B7ADA4] focus:border-[#9DB19F] focus:ring-4 focus:ring-[#EAF1E9]"
                    placeholder="Ceritakan pengalaman, keahlian, dan fokus mentoring kamu..."
                  />

                  <div className="mt-1 flex justify-end">
                    <span className="text-[9px] font-medium text-[#A49A92]">
                      {form.bio.length}/1000
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.12em] text-[#8F847B]">
                    Skills
                  </label>

                  <div className="mt-2 rounded-2xl border border-[#E4DDD6] bg-white p-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(event) => setNewSkill(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addSkill();
                          }
                        }}
                        maxLength={50}
                        className="h-11 min-w-0 flex-1 rounded-xl border border-[#E7E0D8] bg-[#FBF9F6] px-3.5 text-sm font-semibold text-[#3C332D] outline-none transition placeholder:text-[#B7ADA4] focus:border-[#9DB19F] focus:ring-4 focus:ring-[#EAF1E9]"
                        placeholder="Tambah skill, lalu tekan Enter"
                      />

                      <button
                        type="button"
                        onClick={addSkill}
                        className="cursor-pointer rounded-xl bg-[#1E3F20] px-4 py-2 text-[9px] font-black text-white transition hover:bg-[#173219]"
                      >
                        Tambah
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {form.skills.map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="inline-flex items-center gap-2 rounded-full border border-[#DDE8DB] bg-[#F2F7F0] px-3 py-2 text-[10px] font-black text-[#58715C]"
                        >
                          {skill}

                          <button
                            type="button"
                            onClick={() => removeSkill(index)}
                            aria-label={`Hapus skill ${skill}`}
                            className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-white text-[#7C8F7E] transition hover:bg-[#E2ECDD] hover:text-[#435746]"
                          >
                            <XIcon />
                          </button>
                        </span>
                      ))}

                      {form.skills.length === 0 && (
                        <p className="text-[11px] font-medium text-[#9A9088]">
                          Belum ada skill.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[#EEE7E0] bg-white px-6 py-4 sm:flex-row sm:justify-end sm:px-7">
              <button
                type="button"
                onClick={closeEditor}
                disabled={saving}
                className="cursor-pointer rounded-2xl border border-[#E3DCD4] bg-white px-5 py-3 text-[10px] font-black text-[#756B63] transition hover:bg-[#F7F3EE] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#1E3F20] px-6 py-3 text-[10px] font-black text-white shadow-[0_10px_22px_rgba(30,63,32,.14)] transition hover:-translate-y-0.5 hover:bg-[#173219] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <EditIcon />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
