"use client";

import Navbar from "../components/Navbar";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

const API_URL = "http://127.0.0.1:8000/api";

type ProfileApiData = {
  id: number;
  name: string;
  email: string;
  role: string;
  profile: {
    profile_photo?: string | null;
    cover_photo?: string | null;
  } | null;
};

type ProfileApiResponse = {
  success: boolean;
  message: string;
  data: ProfileApiData;
};

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -60px 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: visible ? `${delay}ms` : "0ms",
      }}
      className={[
        "transform-gpu will-change-transform",
        "transition-all duration-[900ms]",
        "ease-[cubic-bezier(0.16,1,0.3,1)]",
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-8 scale-[0.985] opacity-0",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function CameraIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 7.5C4 6.67157 4.67157 6 5.5 6H8L9.2 4.5H14.8L16 6H18.5C19.3284 6 20 6.67157 20 7.5V18.5C20 19.3284 19.3284 20 18.5 20H5.5C4.67157 20 4 19.3284 4 18.5V7.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function TrashIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 7H19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9 7V5.5C9 4.67157 9.67157 4 10.5 4H13.5C14.3284 4 15 4.67157 15 5.5V7"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7 7L7.8 19C7.85655 19.8468 8.56031 20.5 9.409 20.5H14.591C15.4397 20.5 16.1435 19.8468 16.2 19L17 7"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M10 10.5V17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14 10.5V17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EditIcon({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 20H8L19 9C20.1046 7.89543 20.1046 6.10457 19 5C17.8954 3.89543 16.1046 3.89543 15 5L4 16V20Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function UserIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4.5 20C5.5 16.5 8.1 14.5 12 14.5C15.9 14.5 18.5 16.5 19.5 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12.5L9.2 16.5L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CompressIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 3H3V8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 3H21V8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 21H3V16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 21H21V16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 9L3.5 3.5M15 9L20.5 3.5M9 15L3.5 20.5M15 15L20.5 20.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function compressImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality = 0.85,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const image = new Image();

      image.onload = () => {
        let width = image.width;
        let height = image.height;

        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);

        width = Math.round(width * ratio);
        height = Math.round(height * ratio);

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvas tidak tersedia."));
          return;
        }

        ctx.drawImage(image, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Gagal melakukan kompresi gambar."));
              return;
            }

            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, "") + ".jpg",
              {
                type: "image/jpeg",
                lastModified: Date.now(),
              },
            );

            resolve(compressedFile);
          },
          "image/jpeg",
          quality,
        );
      };

      image.onerror = () => {
        reject(new Error("Gagal membaca gambar."));
      };

      image.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Gagal membaca file."));
    };

    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const [name, setName] = useState("Pengguna");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("mentee");

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const [profileImage, setProfileImage] = useState("");
  const [coverImage, setCoverImage] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const messageTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        setLoadingProfile(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/profile`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const result: ProfileApiResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil data profil.");
        }

        const profile = result.data.profile;

        const serverName = result.data.name || "Pengguna";
        const serverEmail = result.data.email || "";
        const serverRole = result.data.role || "mentee";

        const serverProfileImage = profile?.profile_photo || "";

        const serverCoverImage = profile?.cover_photo || "";

        setName(serverName);
        setEmail(serverEmail);
        setRole(serverRole);

        setEditName(serverName);
        setEditEmail(serverEmail);

        setProfileImage(serverProfileImage);
        setCoverImage(serverCoverImage);

        localStorage.setItem("user_name", serverName);
        localStorage.setItem("user_email", serverEmail);
        localStorage.setItem("user_role", serverRole);

        if (serverProfileImage) {
          localStorage.setItem("profile_image", serverProfileImage);
        } else {
          localStorage.removeItem("profile_image");
        }

        if (serverCoverImage) {
          localStorage.setItem("cover_image", serverCoverImage);
        } else {
          localStorage.removeItem("cover_image");
        }
      } catch (error) {
        console.error("Gagal mengambil profil:", error);

        setMessage(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data profil.",
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    void loadProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimerRef.current !== null) {
        window.clearTimeout(messageTimerRef.current);
      }
    };
  }, []);

  const initial = name.trim().charAt(0).toUpperCase() || "P";

  const showMessage = (text: string) => {
    if (messageTimerRef.current !== null) {
      window.clearTimeout(messageTimerRef.current);
    }

    setMessage(text);

    messageTimerRef.current = window.setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const handleStartEditing = () => {
    setEditName(name);
    setEditEmail(email);
    setMessage("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditName(name);
    setEditEmail(email);
    setMessage("");
    setIsEditing(false);
  };

  const handleSaveProfile = () => {
    const cleanedName = editName.trim();
    const cleanedEmail = editEmail.trim();

    if (!cleanedName) {
      setMessage("Nama tidak boleh kosong.");
      return;
    }

    localStorage.setItem("user_name", cleanedName);
    localStorage.setItem("user_email", cleanedEmail);

    setName(cleanedName);
    setEmail(cleanedEmail);
    setIsEditing(false);

    showMessage("Profil berhasil diperbarui.");
  };

  const handleProfileImageChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("File foto profil harus berupa gambar.");
      event.target.value = "";
      return;
    }

    const token = localStorage.getItem("auth_token");

    if (!token) {
      setMessage("Sesi login tidak ditemukan. Silakan login kembali.");
      event.target.value = "";
      return;
    }

    try {
      setUploadingProfile(true);

      const compressedFile = await compressImage(file, 500, 500, 0.85);

      const formData = new FormData();

      formData.append("photo", compressedFile);

      const response = await fetch(`${API_URL}/profile/photo`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengunggah foto profil.");
      }

      const imageUrl = result.data?.profile_photo || "";

      setProfileImage(imageUrl);

      if (imageUrl) {
        localStorage.setItem("profile_image", imageUrl);
      }

      showMessage("Foto profil berhasil diperbarui dan disimpan.");
    } catch (error) {
      console.error("Gagal upload foto profil:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Gagal mengunggah foto profil.",
      );
    } finally {
      setUploadingProfile(false);
      event.target.value = "";
    }
  };

  const handleCoverImageChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("File background harus berupa gambar.");
      event.target.value = "";
      return;
    }

    const token = localStorage.getItem("auth_token");

    if (!token) {
      setMessage("Sesi login tidak ditemukan. Silakan login kembali.");
      event.target.value = "";
      return;
    }

    try {
      setUploadingCover(true);

      const compressedFile = await compressImage(file, 1600, 700, 0.85);

      const formData = new FormData();

      formData.append("cover", compressedFile);

      const response = await fetch(`${API_URL}/profile/cover`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal mengunggah background profil.",
        );
      }

      const imageUrl = result.data?.cover_photo || "";

      setCoverImage(imageUrl);

      if (imageUrl) {
        localStorage.setItem("cover_image", imageUrl);
      }

      showMessage("Background profil berhasil diperbarui dan disimpan.");
    } catch (error) {
      console.error("Gagal upload background:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Gagal mengunggah background profil.",
      );
    } finally {
      setUploadingCover(false);
      event.target.value = "";
    }
  };

  const removeProfileImage = async () => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setMessage("Sesi login tidak ditemukan.");
      return;
    }

    try {
      setUploadingProfile(true);

      const response = await fetch(`${API_URL}/profile/photo`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus foto profil.");
      }

      setProfileImage("");
      localStorage.removeItem("profile_image");

      showMessage("Foto profil berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus foto:", error);

      setMessage(
        error instanceof Error ? error.message : "Gagal menghapus foto profil.",
      );
    } finally {
      setUploadingProfile(false);
    }
  };

  const removeCoverImage = async () => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setMessage("Sesi login tidak ditemukan.");
      return;
    }

    try {
      setUploadingCover(true);

      const response = await fetch(`${API_URL}/profile/cover`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus background profil.");
      }

      setCoverImage("");
      localStorage.removeItem("cover_image");

      showMessage("Background profil berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus background:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Gagal menghapus background profil.",
      );
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes profileFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes profileScaleIn {
          from {
            opacity: 0;
            transform: scale(0.94);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes profileSlideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes profileToast {
          0% {
            opacity: 0;
            transform: translateY(-12px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .profile-fade-up {
          animation: profileFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .profile-scale-in {
          animation: profileScaleIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .profile-slide-down {
          animation: profileSlideDown 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .profile-toast {
          animation: profileToast 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .profile-fade-up,
          .profile-scale-in,
          .profile-slide-down,
          .profile-toast {
            animation: none !important;
          }
        }
      `}</style>

      <main className="min-h-screen bg-[#FCFBF8] text-[#2C1E16]">
        <Navbar />

        <section className="mx-auto max-w-6xl px-6 py-10 md:px-8">
          {/* PAGE HEADER */}

          <Reveal>
            <div className="mb-8">
              <p className="mb-2 text-sm font-semibold text-[#8A6A47]">
                Akun Saya
              </p>

              <h1 className="text-3xl font-extrabold tracking-tight text-[#2C1E16] md:text-4xl">
                Profil Saya
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 md:text-base">
                Kelola informasi profil dan tampilan akun Anda di Career Cafe.
              </p>
            </div>
          </Reveal>

          {/* LOADING */}

          {loadingProfile ? (
            <div className="overflow-hidden rounded-3xl border border-[#E9E3D7] bg-white shadow-sm">
              <div className="h-52 animate-pulse bg-gray-200" />

              <div className="space-y-4 p-8">
                <div className="h-8 w-48 animate-pulse rounded-xl bg-gray-200" />
                <div className="h-5 w-32 animate-pulse rounded-full bg-gray-200" />
                <div className="h-4 w-72 max-w-full animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ) : (
            <>
              {/* PROFILE HERO */}

              <Reveal>
                <section className="group overflow-hidden rounded-3xl border border-[#E9E3D7] bg-white shadow-[0_18px_60px_rgba(44,30,22,0.05)] transition-all duration-700 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(44,30,22,0.08)]">
                  {/* COVER */}

                  <div className="relative h-52 overflow-hidden">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt="Background profil"
                        className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-r from-[#1E3F20] via-[#315A35] to-[#587558] transition-transform duration-[1400ms] group-hover:scale-[1.04]" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 transition-opacity duration-700 group-hover:opacity-70" />

                    {isEditing && (
                      <>
                        <div className="absolute right-4 top-4 z-10 flex items-center gap-2 profile-slide-down">
                          {/* CHANGE COVER */}

                          <button
                            type="button"
                            onClick={() => coverInputRef.current?.click()}
                            disabled={uploadingCover}
                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/95 text-[#1E3F20] shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label="Ganti background"
                            title="Ganti background"
                          >
                            {uploadingCover ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1E3F20]/20 border-t-[#1E3F20]" />
                            ) : (
                              <CameraIcon size={18} />
                            )}
                          </button>

                          {/* DELETE COVER */}

                          {coverImage && (
                            <button
                              type="button"
                              onClick={removeCoverImage}
                              disabled={uploadingCover}
                              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/95 text-[#6B6259] shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-[#F8F6F1] hover:text-[#1E3F20] hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                              aria-label="Hapus background"
                              title="Hapus background"
                            >
                              <TrashIcon size={18} />
                            </button>
                          )}
                        </div>

                        <input
                          ref={coverInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCoverImageChange}
                        />
                      </>
                    )}
                  </div>

                  {/* PROFILE INFORMATION */}

                  <div className="relative px-6 pb-7 md:px-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                      {/* AVATAR */}

                      <div className="-mt-14 flex-shrink-0">
                        <div className="relative">
                          <div className="group/avatar relative">
                            {profileImage ? (
                              <img
                                src={profileImage}
                                alt="Foto profil"
                                className="h-28 w-28 rounded-full border-4 border-white bg-white object-cover shadow-lg transition-all duration-700 ease-out group-hover/avatar:scale-105 group-hover/avatar:shadow-[0_18px_40px_rgba(44,30,22,0.16)]"
                              />
                            ) : (
                              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-[#1E3F20] text-4xl font-extrabold text-white shadow-lg transition-all duration-700 ease-out group-hover/avatar:scale-105 group-hover/avatar:shadow-[0_18px_40px_rgba(30,63,32,0.22)]">
                                {initial}
                              </div>
                            )}

                            <div className="pointer-events-none absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity duration-500 group-hover/avatar:opacity-100" />
                          </div>

                          {/* AVATAR ACTIONS */}

                          {isEditing && (
                            <>
                              <div className="absolute -bottom-1 -right-1 flex items-center gap-1 profile-scale-in">
                                {/* CHANGE PROFILE */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    profileInputRef.current?.click()
                                  }
                                  disabled={uploadingProfile}
                                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-[#1E3F20] text-white shadow-md transition-all duration-300 hover:scale-110 hover:bg-[#152e17] hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                                  aria-label="Ganti foto profil"
                                  title="Ganti foto profil"
                                >
                                  {uploadingProfile ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                  ) : (
                                    <CameraIcon size={17} />
                                  )}
                                </button>

                                {/* DELETE PROFILE */}

                                {profileImage && (
                                  <button
                                    type="button"
                                    onClick={removeProfileImage}
                                    disabled={uploadingProfile}
                                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-white text-[#6B6259] shadow-md transition-all duration-300 hover:scale-110 hover:bg-[#F8F6F1] hover:text-[#1E3F20] hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                                    aria-label="Hapus foto profil"
                                    title="Hapus foto profil"
                                  >
                                    <TrashIcon size={17} />
                                  </button>
                                )}
                              </div>

                              <input
                                ref={profileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleProfileImageChange}
                              />
                            </>
                          )}
                        </div>
                      </div>

                      {/* NAME + ROLE */}

                      <div className="min-w-0 flex-1 pt-1 md:pt-4 profile-fade-up">
                        <div className="min-w-0">
                          <h2 className="break-words text-2xl font-extrabold leading-tight text-[#2C1E16] md:text-3xl">
                            {name}
                          </h2>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#E8F0E8] px-3 py-1 text-xs font-bold capitalize text-[#1E3F20] transition-all duration-300 hover:bg-[#DCE9DC] hover:shadow-sm">
                              {role}
                            </span>

                            <span className="text-sm text-gray-500">
                              Anggota Career Cafe
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </Reveal>

              {/* MESSAGE */}

              {message && (
                <div className="mt-5 profile-toast">
                  <div
                    className={[
                      "flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm font-semibold shadow-sm",
                      message.includes("berhasil") ||
                      message.includes("diperbarui") ||
                      message.includes("dihapus")
                        ? "border-green-100 bg-green-50 text-green-700"
                        : "border-red-100 bg-red-50 text-red-700",
                    ].join(" ")}
                  >
                    <div className="mt-0.5">
                      {message.includes("berhasil") ||
                      message.includes("diperbarui") ||
                      message.includes("dihapus") ? (
                        <CheckIcon size={17} />
                      ) : (
                        <span className="font-black">!</span>
                      )}
                    </div>

                    <span className="leading-6">{message}</span>
                  </div>
                </div>
              )}

              {/* MAIN CONTENT */}

              <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                {/* INFORMATION */}

                <Reveal delay={100}>
                  <section className="h-full rounded-3xl border border-[#E9E3D7] bg-white p-6 shadow-[0_18px_60px_rgba(44,30,22,0.045)] transition-all duration-700 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(44,30,22,0.07)] md:p-8">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-xl font-extrabold text-[#2C1E16]">
                          Informasi Pribadi
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Informasi dasar akun Anda.
                        </p>
                      </div>

                      {!isEditing && (
                        <button
                          type="button"
                          onClick={handleStartEditing}
                          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#1E3F20] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-lg active:scale-[0.98]"
                        >
                          <EditIcon size={17} />
                          Edit Profil
                        </button>
                      )}
                    </div>

                    {/* VIEW MODE */}

                    {!isEditing && (
                      <div
                        key="profile-view"
                        className="space-y-5 profile-fade-up"
                      >
                        {/* NAME */}

                        <div className="group/field">
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                            Nama Lengkap
                          </p>

                          <div className="rounded-2xl bg-[#F8F6F1] px-4 py-4 text-sm font-semibold text-[#2C1E16] transition-all duration-300 group-hover/field:bg-[#F2EFE8] group-hover/field:translate-x-1">
                            {name}
                          </div>
                        </div>

                        {/* EMAIL */}

                        <div className="group/field">
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                            Email
                          </p>

                          <div className="rounded-2xl bg-[#F8F6F1] px-4 py-4 text-sm font-semibold text-[#2C1E16] transition-all duration-300 group-hover/field:bg-[#F2EFE8] group-hover/field:translate-x-1">
                            {email || "Email belum tersimpan"}
                          </div>
                        </div>

                        {/* ROLE */}

                        <div className="group/field">
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                            Peran
                          </p>

                          <div className="rounded-2xl bg-[#F8F6F1] px-4 py-4 text-sm font-semibold capitalize text-[#2C1E16] transition-all duration-300 group-hover/field:bg-[#F2EFE8] group-hover/field:translate-x-1">
                            {role}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* EDIT MODE */}

                    {isEditing && (
                      <div
                        key="profile-edit"
                        className="space-y-5 profile-fade-up"
                      >
                        {/* NAME INPUT */}

                        <div>
                          <label
                            htmlFor="profile-name"
                            className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400"
                          >
                            Nama Lengkap
                          </label>

                          <input
                            id="profile-name"
                            type="text"
                            value={editName}
                            onChange={(event) =>
                              setEditName(event.target.value)
                            }
                            placeholder="Masukkan nama lengkap"
                            className="w-full rounded-2xl border border-[#DDD7CA] bg-white px-4 py-4 text-sm text-[#2C1E16] outline-none transition-all duration-300 placeholder:text-[#A6A098] hover:border-[#C9C0B0] focus:-translate-y-0.5 focus:border-[#1E3F20] focus:ring-4 focus:ring-[#1E3F20]/10"
                          />
                        </div>

                        {/* EMAIL INPUT */}

                        <div>
                          <label
                            htmlFor="profile-email"
                            className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400"
                          >
                            Email
                          </label>

                          <input
                            id="profile-email"
                            type="email"
                            value={editEmail}
                            onChange={(event) =>
                              setEditEmail(event.target.value)
                            }
                            placeholder="Masukkan email"
                            className="w-full rounded-2xl border border-[#DDD7CA] bg-white px-4 py-4 text-sm text-[#2C1E16] outline-none transition-all duration-300 placeholder:text-[#A6A098] hover:border-[#C9C0B0] focus:-translate-y-0.5 focus:border-[#1E3F20] focus:ring-4 focus:ring-[#1E3F20]/10"
                          />
                        </div>

                        {/* ROLE */}

                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
                            Peran
                          </label>

                          <div className="rounded-2xl bg-[#F8F6F1] px-4 py-4 text-sm font-semibold capitalize text-[#2C1E16]">
                            {role}
                          </div>

                          <p className="mt-2 text-xs text-gray-400">
                            Peran akun diatur oleh sistem.
                          </p>
                        </div>

                        {/* ACTIONS */}

                        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                          <button
                            type="button"
                            onClick={handleSaveProfile}
                            className="group flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1E3F20] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-lg active:scale-[0.98]"
                          >
                            <CheckIcon size={17} />
                            Simpan Perubahan
                          </button>

                          <button
                            type="button"
                            onClick={handleCancel}
                            className="cursor-pointer rounded-xl border border-[#DDD7CA] bg-white px-5 py-3 text-sm font-bold text-gray-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F8F6F1] hover:shadow-sm active:scale-[0.98]"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                  </section>
                </Reveal>

                {/* SIDEBAR */}

                <aside className="space-y-6">
                  {/* ACTIVITY */}

                  <Reveal delay={180}>
                    <section className="rounded-3xl border border-[#E9E3D7] bg-white p-6 shadow-[0_18px_60px_rgba(44,30,22,0.045)] transition-all duration-700 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(44,30,22,0.07)]">
                      <h3 className="text-xl font-extrabold text-[#2C1E16]">
                        Aktivitas
                      </h3>

                      <div className="mt-5 space-y-3">
                        {/* SESSION */}

                        <div className="group flex items-center justify-between rounded-2xl bg-[#F8F6F1] p-4 transition-all duration-400 hover:-translate-y-0.5 hover:bg-[#F1EEE7] hover:shadow-sm">
                          <div>
                            <p className="text-sm font-bold text-[#2C1E16]">
                              Sesi Konsultasi
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              Total sesi mentor
                            </p>
                          </div>

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F0E8] text-sm font-extrabold text-[#1E3F20] transition-transform duration-300 group-hover:scale-110">
                            0
                          </div>
                        </div>

                        {/* SCHEDULE */}

                        <div className="group flex items-center justify-between rounded-2xl bg-[#F8F6F1] p-4 transition-all duration-400 hover:-translate-y-0.5 hover:bg-[#F1EEE7] hover:shadow-sm">
                          <div>
                            <p className="text-sm font-bold text-[#2C1E16]">
                              Jadwal
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              Sesi yang dijadwalkan
                            </p>
                          </div>

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1E9DC] text-sm font-extrabold text-[#8A6A47] transition-transform duration-300 group-hover:scale-110">
                            0
                          </div>
                        </div>

                        {/* APPLICATION */}

                        <div className="group flex items-center justify-between rounded-2xl bg-[#F8F6F1] p-4 transition-all duration-400 hover:-translate-y-0.5 hover:bg-[#F1EEE7] hover:shadow-sm">
                          <div>
                            <p className="text-sm font-bold text-[#2C1E16]">
                              Lamaran
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              Pekerjaan yang dilamar
                            </p>
                          </div>

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDE8F5] text-sm font-extrabold text-[#69558D] transition-transform duration-300 group-hover:scale-110">
                            0
                          </div>
                        </div>
                      </div>
                    </section>
                  </Reveal>

                  {/* CAREER CAFE */}

                  <Reveal delay={260}>
                    <section className="group relative overflow-hidden rounded-3xl bg-[#1E3F20] p-6 text-white shadow-[0_18px_60px_rgba(30,63,32,0.18)] transition-all duration-700 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(30,63,32,0.24)]">
                      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-white/5 blur-2xl transition-transform duration-1000 group-hover:scale-150" />

                      <div className="relative z-10">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-white/15">
                          <UserIcon size={24} />
                        </div>

                        <h3 className="mt-5 text-lg font-extrabold">
                          Bangun Kariermu Bersama Career Cafe
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-white/75">
                          Temukan mentor, jadwalkan konsultasi, dan kembangkan
                          kemampuanmu untuk mencapai tujuan karier.
                        </p>
                      </div>
                    </section>
                  </Reveal>
                </aside>
              </div>
            </>
          )}
        </section>

        {/* FOOTER */}

        <footer className="mt-10 border-t border-[#E9E3D7] bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-gray-500 md:flex-row md:items-center md:justify-between md:px-8">
            <p>© 2026 Career Cafe. All rights reserved.</p>

            <div className="flex gap-5">
              <span className="cursor-pointer transition-colors duration-300 hover:text-[#1E3F20]">
                Tentang Kami
              </span>

              <span className="cursor-pointer transition-colors duration-300 hover:text-[#1E3F20]">
                Bantuan
              </span>

              <span className="cursor-pointer transition-colors duration-300 hover:text-[#1E3F20]">
                Kebijakan Privasi
              </span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
