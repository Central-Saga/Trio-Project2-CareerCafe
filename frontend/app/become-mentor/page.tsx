"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type Industry = {
  id: number;
  name: string;
};

type Skill = {
  id: number;
  name: string;
};

type EvidenceType = "certificate" | "work_experience" | "portfolio" | "other";

type UploadedDocument = {
  id: string;
  file: File;
  type: EvidenceType;
};

type MentorApplication = {
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
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
  industry?: {
    id: number;
    name: string;
  } | null;
  documents?: Array<{
    id: number;
    document_type: string;
    original_name: string;
    mime_type: string;
    file_size: number;
    created_at: string;
  }>;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const MAX_DOCUMENTS = 3;
const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024;

const evidenceTypeOptions: Array<{
  value: EvidenceType;
  label: string;
  shortLabel: string;
}> = [
  {
    value: "certificate",
    label: "Sertifikat profesional",
    shortLabel: "Sertifikat",
  },
  {
    value: "work_experience",
    label: "Surat pengalaman kerja",
    shortLabel: "Pengalaman kerja",
  },
  {
    value: "portfolio",
    label: "Portfolio / bukti proyek",
    shortLabel: "Portfolio",
  },
  {
    value: "other",
    label: "Dokumen pendukung lainnya",
    shortLabel: "Lainnya",
  },
];

export default function BecomeMentorPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [token, setToken] = useState("");
  const [userRole, setUserRole] = useState("");

  const [industries, setIndustries] = useState<Industry[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [applications, setApplications] = useState<MentorApplication[]>([]);

  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [experienceYears, setExperienceYears] = useState("0");
  const [education, setEducation] = useState("");
  const [industryId, setIndustryId] = useState("");
  const [bio, setBio] = useState("");
  const [motivation, setMotivation] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);

  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const documentInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const latestApplication = useMemo(() => {
    return applications[0] ?? null;
  }, [applications]);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token") || "";
    const storedRole = localStorage.getItem("user_role") || "";
    const storedName = localStorage.getItem("user_name") || "";

    if (!storedToken) {
      router.replace("/login");
      return;
    }

    setToken(storedToken);
    setUserRole(storedRole);

    if (storedRole === "mentor") {
      router.replace("/mentor/dashboard");
      return;
    }

    if (storedRole === "admin") {
      router.replace("/admin/mentor-applications");
      return;
    }

    setFullName(storedName);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);

        const [industryResponse, skillResponse] = await Promise.all([
          fetch(`${API_URL}/industries`),
          fetch(`${API_URL}/skills`),
        ]);

        const industryData = await industryResponse.json().catch(() => null);
        const skillData = await skillResponse.json().catch(() => null);

        if (industryResponse.ok) {
          setIndustries(industryData?.data ?? []);
        }

        if (skillResponse.ok) {
          setSkills(skillData?.data ?? []);
        }
      } catch {
        setError("Gagal memuat pilihan industry dan skills.");
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  useEffect(() => {
    if (!token || userRole !== "mentee") {
      return;
    }

    const loadApplications = async () => {
      try {
        const response = await fetch(`${API_URL}/mentor-applications/my`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          return;
        }

        setApplications(data?.data ?? []);
      } catch {
        // Riwayat tidak perlu membuat form gagal ditampilkan.
      }
    };

    loadApplications();
  }, [token, userRole]);

  const toggleSkill = (skillId: number) => {
    setSelectedSkills((current) => {
      if (current.includes(skillId)) {
        return current.filter((id) => id !== skillId);
      }

      if (current.length >= 20) {
        return current;
      }

      return [...current, skillId];
    });
  };

  const addDocuments = (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);

    if (incoming.length === 0) {
      return;
    }

    const nextFiles: UploadedDocument[] = [];
    const validationMessages: string[] = [];

    for (const file of incoming) {
      if (documents.length + nextFiles.length >= MAX_DOCUMENTS) {
        validationMessages.push(
          `Maksimal ${MAX_DOCUMENTS} dokumen dapat diunggah.`,
        );
        break;
      }

      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      const allowedExtensions = ["pdf", "jpg", "jpeg", "png"];

      if (!allowedExtensions.includes(extension)) {
        validationMessages.push(
          `${file.name}: format harus PDF, JPG, JPEG, atau PNG.`,
        );
        continue;
      }

      if (file.size > MAX_DOCUMENT_SIZE) {
        validationMessages.push(`${file.name}: ukuran file maksimal 5 MB.`);
        continue;
      }

      const alreadyAdded = documents.some(
        (document) =>
          document.file.name === file.name && document.file.size === file.size,
      );

      const duplicateInBatch = nextFiles.some(
        (document) =>
          document.file.name === file.name && document.file.size === file.size,
      );

      if (alreadyAdded || duplicateInBatch) {
        validationMessages.push(`${file.name}: file sudah dipilih.`);
        continue;
      }

      nextFiles.push({
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        type: "certificate",
      });
    }

    if (nextFiles.length > 0) {
      setDocuments((current) => [...current, ...nextFiles]);
    }

    if (validationMessages.length > 0) {
      setError(validationMessages.join(" "));
    } else {
      setError("");
    }

    if (documentInputRef.current) {
      documentInputRef.current.value = "";
    }
  };

  const handleDocumentInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addDocuments(event.target.files);
    }
  };

  const handleDocumentDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files) {
      addDocuments(event.dataTransfer.files);
    }
  };

  const removeDocument = (documentId: string) => {
    setDocuments((current) =>
      current.filter((document) => document.id !== documentId),
    );
  };

  const updateDocumentType = (documentId: string, type: EvidenceType) => {
    setDocuments((current) =>
      current.map((document) =>
        document.id === documentId
          ? {
              ...document,
              type,
            }
          : document,
      ),
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getEvidenceTypeLabel = (type: EvidenceType) => {
    return (
      evidenceTypeOptions.find((option) => option.value === type)?.shortLabel ??
      "Dokumen"
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setFieldErrors({});

    if (documents.length < 1) {
      setError(
        "Upload minimal 1 dokumen pendukung sebelum mengirim pengajuan mentor.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("full_name", fullName.trim());
      formData.append("job_title", jobTitle.trim());
      formData.append("company", company.trim());
      formData.append("location", location.trim());
      formData.append("experience_years", String(Number(experienceYears)));
      formData.append("education", education.trim());
      formData.append(
        "industry_id",
        industryId ? String(Number(industryId)) : "",
      );
      formData.append("bio", bio.trim());
      formData.append("motivation", motivation.trim());
      formData.append("linkedin_url", linkedinUrl.trim());

      selectedSkills.forEach((skillId) => {
        formData.append("skills[]", String(skillId));
      });

      documents.forEach((document) => {
        formData.append("documents[]", document.file, document.file.name);
        formData.append("document_types[]", document.type);
      });

      const response = await fetch(`${API_URL}/mentor-applications`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(
          data?.message ||
            "Pengajuan mentor gagal dikirim. Periksa kembali data yang kamu isi.",
        );

        setFieldErrors(data?.errors ?? {});
        return;
      }

      setSuccess(
        data?.message ||
          "Pengajuan mentor berhasil dikirim dan sedang menunggu review admin.",
      );

      const newApplication = data?.data as MentorApplication | undefined;

      if (newApplication) {
        setApplications((current) => [newApplication, ...current]);
      }

      setJobTitle("");
      setCompany("");
      setLocation("");
      setExperienceYears("0");
      setEducation("");
      setIndustryId("");
      setBio("");
      setMotivation("");
      setLinkedinUrl("");
      setSelectedSkills([]);
      setDocuments([]);
    } catch {
      setError(
        "Tidak dapat terhubung ke server. Pastikan backend Laravel sedang berjalan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FCFBF8] px-6">
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF0E7] shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D6E0D2] border-t-[#1E3F20]" />
          </div>
          <p className="mt-5 text-sm font-semibold text-gray-500">
            Preparing mentor application...
          </p>
        </motion.div>
      </main>
    );
  }

  if (userRole !== "mentee") {
    return null;
  }

  const heroContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.09,
      },
    },
  };

  const heroItem = {
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const sectionReveal = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.72,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FCFBF8] text-[#2C1E16]">
      <Navbar />

      <main className="relative isolate">
        {/* Soft background atmosphere */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[700px] overflow-hidden">
          <motion.div
            aria-hidden="true"
            className="absolute -right-40 top-10 h-[26rem] w-[26rem] rounded-full bg-[#DCE6D8]/55 blur-3xl"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    x: [0, -14, 0],
                    y: [0, 12, 0],
                  }
            }
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            aria-hidden="true"
            className="absolute -left-40 top-44 h-[24rem] w-[24rem] rounded-full bg-[#E9DDD0]/50 blur-3xl"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    x: [0, 12, 0],
                    y: [0, -10, 0],
                  }
            }
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-7 lg:px-10 lg:pb-20 lg:pt-10">
          {/* HERO */}
          <motion.section
            initial={shouldReduceMotion ? false : "hidden"}
            animate="visible"
            variants={heroContainer}
            className="relative mb-7 overflow-hidden rounded-[34px] border border-[#284F2D]/10 bg-[#1E3F20] shadow-[0_20px_60px_-28px_rgba(30,63,32,0.55)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_30%)]" />
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-white/10 bg-white/5 blur-sm" />
            <div className="absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-[#DCE6D8]/10 blur-2xl" />

            <div className="relative z-10 grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.5fr_0.8fr] lg:px-10 lg:py-11">
              <div>
                <motion.div variants={heroItem}>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/80 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#DCE6D8]" />
                    Become a Mentor
                  </span>
                </motion.div>

                <motion.h1
                  variants={heroItem}
                  className="mt-4 max-w-3xl text-3xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl"
                >
                  Share your experience.
                  <span className="mt-1 block text-white/75">
                    Help someone grow.
                  </span>
                </motion.h1>

                <motion.p
                  variants={heroItem}
                  className="mt-5 max-w-2xl text-sm leading-7 text-white/72 sm:text-base"
                >
                  Lengkapi profil profesionalmu untuk mulai bergabung sebagai
                  mentor. Semua pengajuan akan ditinjau oleh admin sebelum akses
                  mentor diaktifkan.
                </motion.p>

                <motion.div
                  variants={heroItem}
                  className="mt-6 flex flex-wrap items-center gap-2.5"
                >
                  <span className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-bold text-white/80">
                    04 tahap verifikasi
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-bold text-white/80">
                    Profil profesional
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-bold text-white/80">
                    Review admin
                  </span>
                </motion.div>
              </div>

              <motion.div
                variants={heroItem}
                className="relative flex min-h-[300px] items-end justify-center lg:min-h-[340px] lg:justify-end"
              >
                <div className="relative h-[300px] w-full overflow-hidden rounded-[30px] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-sm sm:h-[340px] lg:h-[360px] lg:max-w-[360px]">
                  <motion.img
                    src="/mentor-photo-career-cafe-clean.png"
                    alt="Mentor profesional Career Cafe"
                    className="absolute inset-0 h-full w-full scale-[1.015] object-cover object-center"
                    initial={
                      shouldReduceMotion
                        ? false
                        : {
                            opacity: 0,
                            scale: 1.04,
                          }
                    }
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      duration: 0.8,
                      ease: [0.22, 1, 0.36, 1] as const,
                      delay: 0.14,
                    }}
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : {
                            scale: 1.035,
                          }
                    }
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#102413]/90 via-[#102413]/10 to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">
                      Experience becomes impact.
                    </p>

                    <p className="mt-1 max-w-[270px] text-xl font-extrabold leading-tight text-white">
                      Bagikan pengalamanmu,
                      <span className="block text-white/70">
                        bantu karier seseorang bertumbuh.
                      </span>
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* LATEST APPLICATION */}
          <AnimatePresence initial={false} mode="wait">
            {latestApplication && (
              <motion.section
                key={`${latestApplication.id}-${latestApplication.status}`}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mb-6 overflow-hidden rounded-[28px] border border-[#E5DED2] bg-white shadow-sm"
              >
                <div className="p-5 sm:p-6 lg:p-7">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#1E3F20]" />
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-gray-400">
                          Latest Application
                        </p>
                      </div>

                      <h2 className="mt-2 text-xl font-extrabold text-[#2C1E16]">
                        {latestApplication.job_title}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Dikirim{" "}
                        {new Date(
                          latestApplication.created_at,
                        ).toLocaleDateString("id-ID")}
                      </p>
                    </div>

                    <span
                      className={[
                        "inline-flex w-fit rounded-full border px-4 py-2 text-xs font-extrabold capitalize",
                        latestApplication.status === "pending"
                          ? "border-amber-100 bg-amber-50 text-amber-700"
                          : latestApplication.status === "approved"
                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                            : "border-red-100 bg-red-50 text-red-700",
                      ].join(" ")}
                    >
                      {latestApplication.status}
                    </span>
                  </div>

                  {latestApplication.status === "approved" && (
                    <motion.div
                      initial={
                        shouldReduceMotion ? false : { opacity: 0, y: 8 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.4 }}
                      className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800"
                    >
                      Pengajuanmu sudah disetujui. Akunmu telah menjadi mentor.
                      Silakan login ulang untuk memperbarui role di browser.
                    </motion.div>
                  )}

                  {latestApplication.status === "rejected" &&
                    latestApplication.rejection_reason && (
                      <motion.div
                        initial={
                          shouldReduceMotion ? false : { opacity: 0, y: 8 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4"
                      >
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-red-500">
                          Rejection Reason
                        </p>

                        <p className="mt-2 text-sm leading-6 text-red-800">
                          {latestApplication.rejection_reason}
                        </p>
                      </motion.div>
                    )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* APPLICATION PROGRESS */}
          <motion.section
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 rounded-[26px] border border-[#E7E0D5] bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ["01", "Profile", "Data profesional"],
                ["02", "Expertise", "Skills & links"],
                ["03", "Verification", "Bukti pengalaman"],
                ["04", "Review", "Bio & motivasi"],
              ].map(([number, label, description], index) => (
                <div key={number} className="relative flex items-start gap-3">
                  {index < 3 && (
                    <div className="absolute left-9 right-[-12px] top-5 hidden h-px bg-[#E7E0D5] md:block" />
                  )}

                  <span
                    className={[
                      "relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-[10px] font-extrabold",
                      index === 2
                        ? "bg-[#1E3F20] text-white shadow-sm"
                        : "bg-[#F3F6F0] text-[#1E3F20]",
                    ].join(" ")}
                  >
                    {number}
                  </span>

                  <div className="relative z-10 min-w-0">
                    <p className="text-xs font-extrabold text-[#2C1E16]">
                      {label}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-4 text-gray-400">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          <AnimatePresence initial={false} mode="wait">
            {success && (
              <motion.div
                key="success"
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, y: 10, scale: 0.99 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold leading-6 text-emerald-800 shadow-sm"
              >
                {success}
              </motion.div>
            )}

            {error && (
              <motion.div
                key="error"
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, y: 10, scale: 0.99 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold leading-6 text-red-700 shadow-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={shouldReduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.03 }}
          >
            {/* STEP 01 */}
            <motion.section
              variants={sectionReveal}
              className="relative overflow-hidden rounded-[30px] border border-[#E7E0D5] bg-white shadow-sm"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-[#DCE6D8]" />
              <div className="p-6 sm:p-8 lg:p-9">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF0E7] text-xs font-extrabold text-[#1E3F20]">
                        01
                      </span>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#9A9185]">
                          Professional profile
                        </p>
                        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#2C1E16]">
                          Professional Information
                        </h2>
                      </div>
                    </div>

                    <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500">
                      Ceritakan posisi, perusahaan, dan pengalaman profesional
                      yang ingin kamu tampilkan kepada calon mentee.
                    </p>
                  </div>

                  <span className="w-fit rounded-full border border-[#E7E0D5] bg-[#FAF8F4] px-3 py-1.5 text-[10px] font-bold text-gray-500">
                    Profil dasar
                  </span>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Full Name"
                    required
                    value={fullName}
                    onChange={setFullName}
                    placeholder="Your full name"
                    error={fieldErrors.full_name?.[0]}
                  />

                  <Field
                    label="Job Title"
                    required
                    value={jobTitle}
                    onChange={setJobTitle}
                    placeholder="e.g. Senior Product Designer"
                    error={fieldErrors.job_title?.[0]}
                  />

                  <Field
                    label="Company"
                    value={company}
                    onChange={setCompany}
                    placeholder="e.g. Tokopedia"
                    error={fieldErrors.company?.[0]}
                  />

                  <Field
                    label="Location"
                    value={location}
                    onChange={setLocation}
                    placeholder="e.g. Jakarta, Indonesia"
                    error={fieldErrors.location?.[0]}
                  />

                  <Field
                    label="Experience (Years)"
                    required
                    type="number"
                    min="0"
                    max="60"
                    value={experienceYears}
                    onChange={setExperienceYears}
                    placeholder="0"
                    error={fieldErrors.experience_years?.[0]}
                  />

                  <Field
                    label="Education"
                    value={education}
                    onChange={setEducation}
                    placeholder="e.g. S.Kom, Computer Science"
                    error={fieldErrors.education?.[0]}
                  />

                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#2C1E16]">
                      Industry
                    </label>

                    <motion.div
                      whileFocus={
                        shouldReduceMotion ? undefined : { scale: 1.005 }
                      }
                      transition={{ duration: 0.2 }}
                    >
                      <select
                        value={industryId}
                        onChange={(event) => setIndustryId(event.target.value)}
                        className="w-full rounded-2xl border border-[#DED7CB] bg-white px-4 py-3.5 text-sm font-medium text-gray-700 outline-none transition focus:border-[#1E3F20] focus:ring-4 focus:ring-[#1E3F20]/10"
                        disabled={loadingOptions}
                      >
                        <option value="">
                          {loadingOptions
                            ? "Loading industry..."
                            : "Select industry"}
                        </option>

                        {industries.map((industry) => (
                          <option key={industry.id} value={industry.id}>
                            {industry.name}
                          </option>
                        ))}
                      </select>
                    </motion.div>

                    {fieldErrors.industry_id?.[0] && (
                      <p className="mt-2 text-xs font-semibold text-red-600">
                        {fieldErrors.industry_id[0]}
                      </p>
                    )}
                  </div>

                  <Field
                    label="LinkedIn URL"
                    value={linkedinUrl}
                    onChange={setLinkedinUrl}
                    placeholder="https://linkedin.com/in/..."
                    error={fieldErrors.linkedin_url?.[0]}
                  />
                </div>
              </div>
            </motion.section>

            {/* STEP 02 */}
            <motion.section
              variants={sectionReveal}
              className="relative overflow-hidden rounded-[30px] border border-[#E7E0D5] bg-white shadow-sm"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-[#D8E4EF]" />
              <div className="p-6 sm:p-8 lg:p-9">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EDF4FA] text-xs font-extrabold text-[#45667E]">
                        02
                      </span>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#9A9185]">
                          Expertise
                        </p>
                        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#2C1E16]">
                          Skills
                        </h2>
                      </div>
                    </div>

                    <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500">
                      Pilih skill yang paling relevan dengan pengalamanmu.
                      Mentee akan menggunakan informasi ini untuk memahami area
                      yang bisa kamu bantu.
                    </p>
                  </div>

                  <motion.div
                    animate={
                      shouldReduceMotion
                        ? undefined
                        : selectedSkills.length > 0
                          ? { scale: [1, 1.04, 1] }
                          : undefined
                    }
                    transition={{ duration: 0.35 }}
                    className="w-fit rounded-full border border-[#D8E4EF] bg-[#F6FAFD] px-3 py-1.5 text-[10px] font-extrabold text-[#45667E]"
                  >
                    {selectedSkills.length} selected
                  </motion.div>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {skills.map((skill, index) => {
                    const selected = selectedSkills.includes(skill.id);

                    return (
                      <motion.button
                        key={skill.id}
                        type="button"
                        onClick={() => toggleSkill(skill.id)}
                        initial={
                          shouldReduceMotion ? false : { opacity: 0, y: 8 }
                        }
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{
                          delay: Math.min(index * 0.025, 0.25),
                          duration: 0.28,
                          ease: [0.22, 1, 0.36, 1] as const,
                        }}
                        whileHover={
                          shouldReduceMotion
                            ? undefined
                            : {
                                y: -2,
                                scale: 1.015,
                              }
                        }
                        whileTap={
                          shouldReduceMotion
                            ? undefined
                            : {
                                scale: 0.98,
                              }
                        }
                        className={[
                          "cursor-pointer rounded-full border px-4 py-2.5 text-sm font-bold transition-colors duration-300",
                          selected
                            ? "border-[#1E3F20] bg-[#1E3F20] text-white shadow-md shadow-[#1E3F20]/10"
                            : "border-[#DED7CB] bg-white text-gray-600 hover:border-[#B8C2B5] hover:bg-[#F7F4EC]",
                        ].join(" ")}
                      >
                        <span className="inline-flex items-center gap-2">
                          {selected && (
                            <motion.span
                              initial={
                                shouldReduceMotion
                                  ? false
                                  : { opacity: 0, scale: 0.4 }
                              }
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.18 }}
                            >
                              ✓
                            </motion.span>
                          )}
                          {skill.name}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {fieldErrors.skills?.[0] && (
                  <p className="mt-3 text-xs font-semibold text-red-600">
                    {fieldErrors.skills[0]}
                  </p>
                )}

                <div className="mt-5 flex items-center justify-between rounded-2xl border border-[#EEE7DC] bg-[#FCFAF6] px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500">
                    Pilih sampai 20 skill yang paling relevan.
                  </p>

                  <p className="text-xs font-extrabold text-[#2C1E16]">
                    {selectedSkills.length}/20
                  </p>
                </div>
              </div>
            </motion.section>

            {/* STEP 03 - VERIFICATION */}
            <motion.section
              variants={sectionReveal}
              className="relative overflow-hidden rounded-[30px] border border-[#DDE8DF] bg-white shadow-sm"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-[#1E3F20]" />

              <div className="p-6 sm:p-8 lg:p-9">
                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF0E7] text-xs font-extrabold text-[#1E3F20]">
                        03
                      </span>

                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7B8B7A]">
                          Verification
                        </p>

                        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#2C1E16]">
                          Bukti Pengalaman Profesional
                        </h2>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-gray-500">
                      Upload dokumen yang dapat membantu admin memverifikasi
                      pengalaman dan keahlianmu sebelum akses mentor diaktifkan.
                    </p>
                  </div>

                  <div className="w-fit rounded-full border border-[#DDE8DF] bg-[#F5F8F3] px-3 py-1.5 text-[10px] font-extrabold text-[#1E3F20]">
                    {documents.length}/{MAX_DOCUMENTS} dokumen
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
                  <div>
                    <input
                      ref={documentInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      onChange={handleDocumentInput}
                      className="sr-only"
                    />

                    <motion.div
                      role="button"
                      tabIndex={0}
                      onClick={() => documentInputRef.current?.click()}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          documentInputRef.current?.click();
                        }
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDocumentDrop}
                      whileHover={
                        shouldReduceMotion
                          ? undefined
                          : {
                              scale: 1.005,
                              y: -1,
                            }
                      }
                      transition={{
                        duration: 0.22,
                        ease: [0.22, 1, 0.36, 1] as const,
                      }}
                      className={[
                        "flex min-h-[230px] cursor-pointer flex-col items-center justify-center rounded-[26px] border-2 border-dashed px-6 text-center transition-colors",
                        isDragging
                          ? "border-[#1E3F20] bg-[#F0F6EE]"
                          : "border-[#C9D7C6] bg-[#FAFCF8] hover:border-[#9BB09A] hover:bg-[#F7FAF5]",
                      ].join(" ")}
                    >
                      <motion.div
                        animate={
                          shouldReduceMotion
                            ? undefined
                            : {
                                y: [0, -5, 0],
                              }
                        }
                        transition={{
                          duration: 2.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF0E7] text-2xl text-[#1E3F20] shadow-sm"
                      >
                        ↑
                      </motion.div>

                      <p className="mt-5 text-sm font-extrabold text-[#2C1E16]">
                        Drag & drop file di sini
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        atau klik area ini untuk memilih dokumen
                      </p>

                      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold text-gray-400">
                        <span className="rounded-full bg-white px-3 py-1.5">
                          PDF
                        </span>
                        <span className="rounded-full bg-white px-3 py-1.5">
                          JPG
                        </span>
                        <span className="rounded-full bg-white px-3 py-1.5">
                          JPEG
                        </span>
                        <span className="rounded-full bg-white px-3 py-1.5">
                          PNG
                        </span>
                        <span className="rounded-full bg-white px-3 py-1.5">
                          Max 5 MB
                        </span>
                      </div>
                    </motion.div>

                    {fieldErrors.documents?.[0] && (
                      <p className="mt-3 text-xs font-semibold text-red-600">
                        {fieldErrors.documents[0]}
                      </p>
                    )}

                    <AnimatePresence initial={false}>
                      {documents.length > 0 ? (
                        <motion.div
                          initial={
                            shouldReduceMotion
                              ? false
                              : {
                                  opacity: 0,
                                  y: 10,
                                }
                          }
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          className="mt-5 space-y-3"
                        >
                          {documents.map((document, index) => (
                            <motion.div
                              key={document.id}
                              layout
                              initial={
                                shouldReduceMotion
                                  ? false
                                  : {
                                      opacity: 0,
                                      y: 8,
                                    }
                              }
                              animate={{
                                opacity: 1,
                                y: 0,
                              }}
                              exit={
                                shouldReduceMotion
                                  ? undefined
                                  : {
                                      opacity: 0,
                                      x: -12,
                                    }
                              }
                              transition={{
                                duration: 0.28,
                                delay: index * 0.03,
                              }}
                              className="rounded-2xl border border-[#E6EBE3] bg-[#FCFDFB] p-4"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#EAF0E7] text-xs font-extrabold text-[#1E3F20]">
                                    {document.file.name
                                      .split(".")
                                      .pop()
                                      ?.toUpperCase() ?? "FILE"}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-extrabold text-[#2C1E16]">
                                      {document.file.name}
                                    </p>

                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-gray-400">
                                      <span>
                                        {formatFileSize(document.file.size)}
                                      </span>
                                      <span>•</span>
                                      <span>
                                        {getEvidenceTypeLabel(document.type)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 sm:flex-shrink-0">
                                  <select
                                    value={document.type}
                                    onChange={(event) =>
                                      updateDocumentType(
                                        document.id,
                                        event.target.value as EvidenceType,
                                      )
                                    }
                                    className="min-w-0 flex-1 rounded-xl border border-[#D9E1D6] bg-white px-3 py-2 text-xs font-bold text-gray-600 outline-none focus:border-[#1E3F20] focus:ring-4 focus:ring-[#1E3F20]/10 sm:w-[180px]"
                                  >
                                    {evidenceTypeOptions.map((option) => (
                                      <option
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>

                                  <motion.button
                                    type="button"
                                    onClick={() => removeDocument(document.id)}
                                    whileHover={
                                      shouldReduceMotion
                                        ? undefined
                                        : {
                                            scale: 1.04,
                                          }
                                    }
                                    whileTap={
                                      shouldReduceMotion
                                        ? undefined
                                        : {
                                            scale: 0.96,
                                          }
                                    }
                                    className="flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-xl border border-red-100 bg-red-50 text-xs font-bold text-red-500"
                                    aria-label={`Hapus ${document.file.name}`}
                                  >
                                    ×
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={
                            shouldReduceMotion
                              ? false
                              : {
                                  opacity: 0,
                                }
                          }
                          animate={{
                            opacity: 1,
                          }}
                          className="mt-5 rounded-2xl border border-dashed border-[#E3E8E0] bg-[#FCFDFB] px-5 py-6 text-center"
                        >
                          <p className="text-sm font-bold text-gray-500">
                            Belum ada dokumen yang dipilih
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            Upload minimal 1 bukti pengalaman untuk melanjutkan.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-[#DCE8DE] bg-[#F3F8F1] p-5">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white text-sm font-extrabold text-[#1E3F20] shadow-sm">
                          i
                        </span>

                        <div>
                          <p className="text-sm font-extrabold text-[#2C1E16]">
                            Dokumen yang diterima
                          </p>

                          <ul className="mt-3 space-y-2 text-xs leading-5 text-gray-600">
                            {evidenceTypeOptions.map((option) => (
                              <li
                                key={option.value}
                                className="flex items-start gap-2"
                              >
                                <span className="mt-0.5 text-[#1E3F20]">✓</span>
                                <span>{option.label}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#EEE4D8] bg-[#FCF8F2] p-5">
                      <p className="text-sm font-extrabold text-[#2C1E16]">
                        Kenapa kami meminta bukti?
                      </p>

                      <p className="mt-2 text-xs leading-5 text-gray-600">
                        Career Cafe menggunakan dokumen ini sebagai bahan review
                        admin agar status mentor tidak hanya berdasarkan data
                        profil yang diisi sendiri.
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-500">
                        <span className="rounded-xl bg-white px-3 py-2">
                          1–3 dokumen
                        </span>
                        <span className="rounded-xl bg-white px-3 py-2">
                          Max 5 MB/file
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] leading-5 text-gray-400">
                      Dokumen digunakan untuk proses review admin dan tidak
                      ditampilkan sebagai file publik pada profil mentor.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* STEP 04 - ABOUT */}
            <motion.section
              variants={sectionReveal}
              className="relative overflow-hidden rounded-[30px] border border-[#E7E0D5] bg-white shadow-sm"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-[#E7DCCF]" />

              <div className="p-6 sm:p-8 lg:p-9">
                <div className="mb-8">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F6EFE7] text-xs font-extrabold text-[#8A6A47]">
                      04
                    </span>

                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#9A9185]">
                        Story & motivation
                      </p>

                      <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#2C1E16]">
                        About You
                      </h2>
                    </div>
                  </div>

                  <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500">
                    Bagian ini membantu admin dan calon mentee memahami
                    pengalamanmu, cara kamu membantu orang lain, dan alasanmu
                    ingin menjadi mentor.
                  </p>
                </div>

                <div className="space-y-5">
                  <TextareaField
                    label="Professional Bio"
                    required
                    value={bio}
                    onChange={setBio}
                    placeholder="Ceritakan pengalaman, keahlian, dan bidang yang kamu kuasai..."
                    maxLength={3000}
                    error={fieldErrors.bio?.[0]}
                  />

                  <TextareaField
                    label="Why do you want to become a mentor?"
                    required
                    value={motivation}
                    onChange={setMotivation}
                    placeholder="Ceritakan motivasi kamu membantu mentee..."
                    maxLength={3000}
                    error={fieldErrors.motivation?.[0]}
                  />
                </div>
              </div>
            </motion.section>

            {/* SUBMIT */}
            <motion.section
              variants={sectionReveal}
              className="relative overflow-hidden rounded-[30px] border border-[#E7E0D5] bg-[#F7F4EC] shadow-sm"
            >
              <div className="absolute -right-10 -top-14 h-32 w-32 rounded-full bg-white/40 blur-2xl" />

              <div className="relative flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between lg:p-9">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#1E3F20]" />
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8A8074]">
                      Final step
                    </p>
                  </div>

                  <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-[#2C1E16]">
                    Ready to apply?
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Setelah dikirim, admin akan memeriksa profilmu sebelum
                    mengaktifkan akses mentor.
                  </p>
                  <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#E7E0D5] bg-white/70 p-3">
                    <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-[#1E3F20] text-[10px] font-extrabold text-white">
                      ✓
                    </div>
                    <p className="text-[10px] leading-5 text-gray-500">
                      Saya memastikan informasi yang saya kirim benar dan
                      dokumen yang diunggah berkaitan dengan pengalaman
                      profesional saya.
                    </p>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: -3,
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
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-flex min-w-[190px] cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#1E3F20] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#1E3F20]/10 hover:bg-[#152E17] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <span aria-hidden="true">→</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.section>
          </motion.form>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-7 text-center"
          >
            <Link
              href="/mentors"
              className="inline-flex items-center gap-2 rounded-full border border-[#E7E0D5] bg-white px-4 py-2.5 text-sm font-bold text-[#1E3F20] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#D7CFC4] hover:bg-[#FAF8F4]"
            >
              <span>←</span>
              Back to Mentors
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Field({
  label,
  required = false,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  min,
  max,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
  min?: string;
  max?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-[#2C1E16]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        type={type}
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-2xl border border-[#DED7CB] bg-white px-4 py-3.5 text-sm font-medium text-gray-700 outline-none transition placeholder:text-gray-300 focus:border-[#1E3F20] focus:ring-4 focus:ring-[#1E3F20]/10"
      />

      {error && (
        <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>
      )}
    </div>
  );
}

function TextareaField({
  label,
  required = false,
  value,
  onChange,
  placeholder,
  error,
  maxLength,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <label className="block text-sm font-bold text-[#2C1E16]">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>

        {maxLength && (
          <span className="text-xs font-semibold text-gray-400">
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        rows={7}
        className="w-full resize-none rounded-2xl border border-[#DED7CB] bg-white px-4 py-3.5 text-sm font-medium leading-7 text-gray-700 outline-none transition placeholder:text-gray-300 focus:border-[#1E3F20] focus:ring-4 focus:ring-[#1E3F20]/10"
      />

      {error && (
        <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>
      )}
    </div>
  );
}
