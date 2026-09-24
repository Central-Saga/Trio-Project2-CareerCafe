"use client";

import Navbar from "../components/Navbar";
import { useEffect, useRef, useState } from "react";

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

        /*
         * Simpan URL saja di localStorage.
         * File aslinya tetap berada di Laravel storage.
         */
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

    loadProfile();
  }, []);

  const initial = name.trim().charAt(0).toUpperCase() || "P";

  const showMessage = (text: string) => {
    setMessage(text);

    window.setTimeout(() => {
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

    /*
     * Untuk saat ini tetap mempertahankan
     * mekanisme simpan nama/email yang sudah ada.
     */
    localStorage.setItem("user_name", cleanedName);

    localStorage.setItem("user_email", cleanedEmail);

    setName(cleanedName);
    setEmail(cleanedEmail);

    setIsEditing(false);

    showMessage("Profil berhasil diperbarui.");
  };

  const handleProfileImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
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
    event: React.ChangeEvent<HTMLInputElement>,
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
    }
  };

  const removeCoverImage = async () => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setMessage("Sesi login tidak ditemukan.");
      return;
    }

    try {
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
    }
  };

  return (
    <main className="min-h-screen bg-[#FCFBF8] text-[#2C1E16]">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-10 md:px-8">
        {/* Header */}

        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-[#8A6A47]">Akun Saya</p>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#2C1E16] md:text-4xl">
            Profil Saya
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 md:text-base">
            Kelola informasi profil dan tampilan akun Anda di Career Cafe.
          </p>
        </div>

        {/* Loading */}

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
            {/* Profile Hero */}

            <section className="overflow-hidden rounded-3xl border border-[#E9E3D7] bg-white shadow-sm">
              {/* Cover */}

              <div className="relative h-52 overflow-hidden">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt="Background profil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-[#1E3F20] via-[#315A35] to-[#587558]" />
                )}

                <div className="absolute inset-0 bg-black/10" />

                {/* Cover actions */}

                {isEditing && (
                  <>
                    <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        disabled={uploadingCover}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/95 text-[#1E3F20] shadow-md transition hover:scale-105 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Ganti background"
                        title="Ganti background"
                      >
                        {uploadingCover ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1E3F20]/20 border-t-[#1E3F20]" />
                        ) : (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
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
                        )}
                      </button>

                      {coverImage && (
                        <button
                          type="button"
                          onClick={removeCoverImage}
                          disabled={uploadingCover}
                          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/95 text-[#6B6259] shadow-md transition hover:scale-105 hover:bg-[#F8F6F1] hover:text-[#1E3F20] disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label="Hapus background"
                          title="Hapus background"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
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

              {/* Profile Information */}

              <div className="relative px-6 pb-7 md:px-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-center">
                  {/* Avatar */}

                  <div className="-mt-14 flex-shrink-0">
                    <div className="relative">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Foto profil"
                          className="h-28 w-28 rounded-full border-4 border-white bg-white object-cover shadow-lg"
                        />
                      ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-[#1E3F20] text-4xl font-extrabold text-white shadow-lg">
                          {initial}
                        </div>
                      )}

                      {/* Avatar actions */}

                      {isEditing && (
                        <>
                          <div className="absolute -bottom-1 -right-1 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => profileInputRef.current?.click()}
                              disabled={uploadingProfile}
                              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-[#1E3F20] text-white shadow-md transition hover:scale-105 hover:bg-[#152e17] disabled:cursor-not-allowed disabled:opacity-60"
                              aria-label="Ganti foto profil"
                              title="Ganti foto profil"
                            >
                              {uploadingProfile ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                              ) : (
                                <svg
                                  width="17"
                                  height="17"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M4 7.5C4 6.67157 4.67157 6 5.5 6H8L9.2 4.5H14.8L16 6H18.5C19.3284 6 20 6.67157 20 7.5V18.5C20 19.3284 19.3284 20 18.5 20H5.5C4.67157 20 4 18.3284 4 18.5V7.5Z"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                  />

                                  <path
                                    d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                  />
                                </svg>
                              )}
                            </button>

                            {profileImage && (
                              <button
                                type="button"
                                onClick={removeProfileImage}
                                disabled={uploadingProfile}
                                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-white text-[#6B6259] shadow-md transition hover:scale-105 hover:bg-[#F8F6F1] hover:text-[#1E3F20] disabled:cursor-not-allowed disabled:opacity-60"
                                aria-label="Hapus foto profil"
                                title="Hapus foto profil"
                              >
                                <svg
                                  width="17"
                                  height="17"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
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

                  {/* Name + Role */}

                  <div className="min-w-0 flex-1 pt-1 md:pt-4">
                    <div className="min-w-0">
                      <h2 className="break-words text-2xl font-extrabold leading-tight text-[#2C1E16] md:text-3xl">
                        {name}
                      </h2>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#E8F0E8] px-3 py-1 text-xs font-bold capitalize text-[#1E3F20]">
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

            {/* Message */}

            {message && (
              <div
                className={`mt-5 rounded-2xl px-5 py-4 text-sm font-semibold ${
                  message.includes("berhasil") ||
                  message.includes("diperbarui") ||
                  message.includes("dihapus")
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            {/* Main Content */}

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              {/* Information */}

              <section className="rounded-3xl border border-[#E9E3D7] bg-white p-6 shadow-sm md:p-8">
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
                      className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#1E3F20] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#152e17]"
                    >
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 20H8L19 9C20.1046 7.89543 20.1046 6.10457 19 5C17.8954 3.89543 16.1046 3.89543 15 5L4 16V20Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinejoin="round"
                        />

                        <path
                          d="M13.5 6.5L17.5 10.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                      </svg>
                      Edit Profil
                    </button>
                  )}
                </div>

                {!isEditing && (
                  <div className="space-y-5">
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                        Nama Lengkap
                      </p>

                      <div className="rounded-2xl bg-[#F8F6F1] px-4 py-4 text-sm font-semibold text-[#2C1E16]">
                        {name}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                        Email
                      </p>

                      <div className="rounded-2xl bg-[#F8F6F1] px-4 py-4 text-sm font-semibold text-[#2C1E16]">
                        {email || "Email belum tersimpan"}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                        Peran
                      </p>

                      <div className="rounded-2xl bg-[#F8F6F1] px-4 py-4 text-sm font-semibold capitalize text-[#2C1E16]">
                        {role}
                      </div>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="space-y-5">
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
                        onChange={(event) => setEditName(event.target.value)}
                        placeholder="Masukkan nama lengkap"
                        className="w-full rounded-2xl border border-[#DDD7CA] bg-white px-4 py-4 text-sm text-[#2C1E16] outline-none transition focus:border-[#1E3F20] focus:ring-2 focus:ring-[#1E3F20]/10"
                      />
                    </div>

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
                        onChange={(event) => setEditEmail(event.target.value)}
                        placeholder="Masukkan email"
                        className="w-full rounded-2xl border border-[#DDD7CA] bg-white px-4 py-4 text-sm text-[#2C1E16] outline-none transition focus:border-[#1E3F20] focus:ring-2 focus:ring-[#1E3F20]/10"
                      />
                    </div>

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

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        className="cursor-pointer rounded-xl bg-[#1E3F20] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#152e17]"
                      >
                        Simpan Perubahan
                      </button>

                      <button
                        type="button"
                        onClick={handleCancel}
                        className="cursor-pointer rounded-xl border border-[#DDD7CA] bg-white px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-[#F8F6F1]"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Sidebar */}

              <aside className="space-y-6">
                {/* Activity */}

                <section className="rounded-3xl border border-[#E9E3D7] bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-extrabold text-[#2C1E16]">
                    Aktivitas
                  </h3>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between rounded-2xl bg-[#F8F6F1] p-4">
                      <div>
                        <p className="text-sm font-bold text-[#2C1E16]">
                          Sesi Konsultasi
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Total sesi mentor
                        </p>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F0E8] text-sm font-extrabold text-[#1E3F20]">
                        0
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-[#F8F6F1] p-4">
                      <div>
                        <p className="text-sm font-bold text-[#2C1E16]">
                          Jadwal
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Sesi yang dijadwalkan
                        </p>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1E9DC] text-sm font-extrabold text-[#8A6A47]">
                        0
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-[#F8F6F1] p-4">
                      <div>
                        <p className="text-sm font-bold text-[#2C1E16]">
                          Lamaran
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Pekerjaan yang dilamar
                        </p>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDE8F5] text-sm font-extrabold text-[#69558D]">
                        0
                      </div>
                    </div>
                  </div>
                </section>

                {/* Career Cafe */}

                <section className="rounded-3xl bg-[#1E3F20] p-6 text-white shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
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
                  </div>

                  <h3 className="mt-5 text-lg font-extrabold">
                    Bangun Kariermu Bersama Career Cafe
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-white/75">
                    Temukan mentor, jadwalkan konsultasi, dan kembangkan
                    kemampuanmu untuk mencapai tujuan karier.
                  </p>
                </section>
              </aside>
            </div>
          </>
        )}
      </section>

      {/* Footer */}

      <footer className="mt-10 border-t border-[#E9E3D7] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-gray-500 md:flex-row md:items-center md:justify-between md:px-8">
          <p>© 2026 Career Cafe. All rights reserved.</p>

          <div className="flex gap-5">
            <span className="cursor-pointer hover:text-[#1E3F20]">
              Tentang Kami
            </span>

            <span className="cursor-pointer hover:text-[#1E3F20]">Bantuan</span>

            <span className="cursor-pointer hover:text-[#1E3F20]">
              Kebijakan Privasi
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
