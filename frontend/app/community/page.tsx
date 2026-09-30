"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type Post = {
  id: number;
  author: string;
  role: string;
  initial: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
  userId?: number | null;
  createdAt?: string | null;
};

type RawPost = Record<string, unknown>;

type ApiResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
  errors?: Record<string, string[]>;
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const categories = [
  { value: "Semua", label: "All" },
  { value: "Karier", label: "Career" },
  { value: "Interview", label: "Interview" },
  { value: "Programming", label: "Programming" },
  { value: "UI/UX", label: "UI/UX" },
  { value: "Freelance", label: "Freelance" },
  { value: "Tips & Trik", label: "Tips & Tricks" },
];

const popularTopics = [
  "Career",
  "Interview",
  "Laravel",
  "Next.js",
  "Figma",
  "Freelance",
  "Portfolio",
  "Remote Work",
];

const demoPosts: Post[] = [
  {
    id: 9001,
    author: "Ava Morgan",
    role: "Frontend Developer",
    initial: "A",
    title: "How do I prepare for my first technical interview?",
    content:
      "I have a technical interview next week. What should I prioritize: algorithms, system design, or reviewing my previous projects?",
    category: "Interview",
    likes: 84,
    comments: 26,
  },
  {
    id: 9002,
    author: "Daniel Lee",
    role: "Product Designer",
    initial: "D",
    title: "Building a portfolio that tells a clear story",
    content:
      "What makes a portfolio case study stand out to hiring managers without making the page feel too long or crowded?",
    category: "UI/UX",
    likes: 67,
    comments: 18,
  },
  {
    id: 9003,
    author: "Maya Chen",
    role: "Software Engineer",
    initial: "M",
    title: "React or Next.js first for a beginner?",
    content:
      "I want to build modern web applications quickly. Should I learn React deeply first or start directly with Next.js?",
    category: "Programming",
    likes: 91,
    comments: 34,
  },
  {
    id: 9004,
    author: "Noah Williams",
    role: "Career Switcher",
    initial: "N",
    title: "Switching careers without a traditional background",
    content:
      "For anyone who moved into tech from another field, which project or learning milestone helped you get your first opportunity?",
    category: "Karier",
    likes: 73,
    comments: 21,
  },
  {
    id: 9005,
    author: "Sofia Rivera",
    role: "Freelance Designer",
    initial: "S",
    title: "How should I price my first freelance project?",
    content:
      "I am preparing a quote for my first client. How do you set a fair rate without underpricing your work?",
    category: "Freelance",
    likes: 58,
    comments: 17,
  },
  {
    id: 9006,
    author: "Ethan Park",
    role: "Career Coach",
    initial: "E",
    title: "Creating a practical 90-day career plan",
    content:
      "What is a simple way to turn a long-term career goal into weekly actions that are measurable and realistic?",
    category: "Tips & Trik",
    likes: 76,
    comments: 24,
  },
  {
    id: 9007,
    author: "Liam Foster",
    role: "Remote Engineer",
    initial: "L",
    title: "What should I prepare for my first remote role?",
    content:
      "I want to improve my remote setup and communication habits before applying. Which routines made the biggest difference for you?",
    category: "Karier",
    likes: 62,
    comments: 15,
  },
  {
    id: 9008,
    author: "Grace Kim",
    role: "Marketing Specialist",
    initial: "G",
    title: "Making LinkedIn content feel useful, not salesy",
    content:
      "What type of posts help you build professional credibility while still sounding natural and authentic?",
    category: "Karier",
    likes: 54,
    comments: 19,
  },
];

const fallbackCategoryStyles = {
  badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
  avatar: "bg-emerald-100 text-emerald-700",
  icon: "↗",
};

const categoryStyles: Record<
  string,
  {
    badge: string;
    avatar: string;
    icon: string;
  }
> = {
  Karier: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    avatar: "bg-emerald-100 text-emerald-700",
    icon: "↗",
  },
  Interview: {
    badge: "bg-sky-50 text-sky-700 border-sky-100",
    avatar: "bg-sky-100 text-sky-700",
    icon: "✓",
  },
  Programming: {
    badge: "bg-violet-50 text-violet-700 border-violet-100",
    avatar: "bg-violet-100 text-violet-700",
    icon: "</>",
  },
  "UI/UX": {
    badge: "bg-pink-50 text-pink-700 border-pink-100",
    avatar: "bg-pink-100 text-pink-700",
    icon: "✦",
  },
  Freelance: {
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    avatar: "bg-amber-100 text-amber-700",
    icon: "$",
  },
  "Tips & Trik": {
    badge: "bg-orange-50 text-orange-700 border-orange-100",
    avatar: "bg-orange-100 text-orange-700",
    icon: "★",
  },
};

function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={[
        "transform-gpu transition-all duration-700 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function getInitial(name?: string | null) {
  return (name?.trim().charAt(0) || "P").toUpperCase();
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function unwrapList(payload: unknown): RawPost[] {
  if (Array.isArray(payload)) {
    return payload.filter(
      (item): item is RawPost => !!item && typeof item === "object",
    );
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;

  for (const key of ["data", "posts", "items"] as const) {
    if (Array.isArray(record[key])) {
      return record[key].filter(
        (item): item is RawPost => !!item && typeof item === "object",
      );
    }
  }

  if (record.data && typeof record.data === "object") {
    const nested = record.data as Record<string, unknown>;
    for (const key of ["data", "posts", "items"] as const) {
      if (Array.isArray(nested[key])) {
        return nested[key].filter(
          (item): item is RawPost => !!item && typeof item === "object",
        );
      }
    }
  }

  return [];
}

function getAuthorName(raw: RawPost) {
  const user =
    raw.user && typeof raw.user === "object" ? (raw.user as RawPost) : null;
  const author =
    raw.author && typeof raw.author === "object"
      ? (raw.author as RawPost)
      : null;

  return (
    asString(raw.author_name) ||
    asString(raw.user_name) ||
    asString(user?.name) ||
    asString(author?.name) ||
    asString(raw.author) ||
    "Career Cafe Member"
  );
}

function getAuthorRole(raw: RawPost) {
  const user =
    raw.user && typeof raw.user === "object" ? (raw.user as RawPost) : null;
  const author =
    raw.author && typeof raw.author === "object"
      ? (raw.author as RawPost)
      : null;

  return (
    asString(raw.author_role) ||
    asString(raw.user_role) ||
    asString(user?.job_title) ||
    asString(user?.role_label) ||
    asString(author?.role) ||
    asString(raw.role) ||
    "Member"
  );
}

function normalizePost(raw: RawPost, index: number): Post {
  const author = getAuthorName(raw);
  const category = asString(raw.category, "Karier") || "Karier";
  const nestedUser =
    raw.user && typeof raw.user === "object" ? (raw.user as RawPost) : null;

  return {
    id: asNumber(raw.id, index + 1),
    author,
    role: getAuthorRole(raw),
    initial: asString(raw.initial, getInitial(author)),
    title: asString(raw.title) || "Career Cafe Discussion",
    content: asString(raw.content) || asString(raw.body),
    category,
    likes: asNumber(raw.likes_count ?? raw.likes, 0),
    comments: asNumber(raw.comments_count ?? raw.comments, 0),
    userId: asNumber(raw.user_id ?? nestedUser?.id, NaN),
    createdAt: asString(raw.created_at, null as unknown as string),
  };
}

function formatPostDate(value?: string | null) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTags(category: string) {
  const tags: Record<string, string[]> = {
    Programming: ["#Laravel", "#Nextjs"],
    "UI/UX": ["#Figma", "#Design"],
    Karier: ["#Portfolio", "#Career"],
    Freelance: ["#Freelance", "#Client"],
    Interview: ["#Interview", "#Career"],
    "Tips & Trik": ["#Tips", "#Career"],
  };

  return tags[category] ?? [];
}

function getCategoryLabel(category: string) {
  return categories.find((item) => item.value === category)?.label ?? category;
}

function getCategoryButtonClass(category: string, active: boolean) {
  if (active) {
    return "border-[#1E3F20] bg-[#1E3F20] text-white shadow-md";
  }

  const tones: Record<string, string> = {
    Semua:
      "border-[#DAD5CE] bg-white text-gray-600 hover:bg-[#F7F4EC] hover:text-[#2C1E16]",
    Karier: "border-[#D5E4D5] bg-[#F3F8F2] text-[#47684B] hover:bg-[#EAF3E9]",
    Interview:
      "border-[#D4E3F0] bg-[#F2F7FC] text-[#4B6D8C] hover:bg-[#E8F1FA]",
    Programming:
      "border-[#DFD6EA] bg-[#F7F3FA] text-[#70558A] hover:bg-[#EEE7F5]",
    "UI/UX": "border-[#E8D2DC] bg-[#FCF4F7] text-[#9B5B72] hover:bg-[#F7E8EE]",
    Freelance:
      "border-[#EADABF] bg-[#FFF8EC] text-[#936D2F] hover:bg-[#FFF0D4]",
    "Tips & Trik":
      "border-[#ECD2C5] bg-[#FFF5F0] text-[#A2604B] hover:bg-[#FBE9E0]",
  };

  return tones[category] ?? tones.Semua;
}

async function parseApiResponse(response: Response): Promise<ApiResponse> {
  return response.json().catch(() => ({
    success: false,
    message: "The server returned an invalid response.",
  }));
}

export default function CommunityPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [copiedPostId, setCopiedPostId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Karier");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const data = await parseApiResponse(response);

      if (!response.ok || data.success === false) {
        throw new Error("Unable to load discussions.");
      }

      const normalized = unwrapList(data.data).map(normalizePost);
      setPosts(normalized.length > 0 ? normalized : demoPosts);
    } catch {
      setPosts(demoPosts);
      setPageError("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === "Semua" || post.category === activeCategory;
      const matchesSearch =
        !keyword ||
        post.title.toLowerCase().includes(keyword) ||
        post.content.toLowerCase().includes(keyword) ||
        post.author.toLowerCase().includes(keyword) ||
        post.role.toLowerCase().includes(keyword) ||
        post.category.toLowerCase().includes(keyword);

      return matchesCategory && matchesSearch;
    });
  }, [posts, search, activeCategory]);

  const totalLikes = useMemo(
    () => posts.reduce((total, post) => total + post.likes, 0),
    [posts],
  );

  const openCreatePost = () => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      router.push("/login");
      return;
    }

    setCreateError("");
    setCreateSuccess("");
    setCreateOpen(true);
  };

  const closeCreatePost = () => {
    if (createSubmitting) return;
    setCreateOpen(false);
    setCreateError("");
    setCreateSuccess("");
  };

  const handleCreatePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const title = newTitle.trim();
    const content = newContent.trim();

    if (!title) {
      setCreateError("Discussion title is required.");
      return;
    }

    if (!content) {
      setCreateError("Discussion content is required.");
      return;
    }

    setCreateSubmitting(true);
    setCreateError("");

    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          category: newCategory,
        }),
      });

      const data = await parseApiResponse(response);

      if (!response.ok || data.success === false) {
        const validationError =
          data.errors?.title?.[0] ||
          data.errors?.content?.[0] ||
          data.errors?.category?.[0];

        throw new Error(
          validationError || data.message || "Failed to create discussion.",
        );
      }

      setNewTitle("");
      setNewContent("");
      setNewCategory("Karier");
      setCreateSuccess("Discussion published successfully.");

      await loadPosts();
    } catch (error) {
      setCreateError(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the discussion.",
      );
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleLike = (postId: number) => {
    setLikedPosts((current) => {
      const alreadyLiked = current.includes(postId);

      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: alreadyLiked
                  ? Math.max(post.likes - 1, 0)
                  : post.likes + 1,
              }
            : post,
        ),
      );

      return alreadyLiked
        ? current.filter((id) => id !== postId)
        : [...current, postId];
    });
  };

  const handleShare = async (post: Post) => {
    const shareText = `${post.title}`;

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: post.title,
          text: shareText,
          url: window.location.href,
        });
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedPostId(post.id);
        window.setTimeout(() => {
          setCopiedPostId((current) => (current === post.id ? null : current));
        }, 1800);
      }
    } catch {
      // User may cancel the native share dialog.
    }
  };

  const handleTopicClick = (topic: string) => {
    setSearch(topic.replace(/^#/, ""));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] font-sans text-[#2C1E16]">
      <Navbar />

      <section className="relative overflow-hidden border-b border-gray-100 bg-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#DCE6D8]/70 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#E8D8C7]/50 blur-3xl" />
          <div className="absolute right-[30%] top-20 h-36 w-36 rounded-full bg-[#E8F0E8]/60 blur-3xl" />
          <div className="absolute left-[18%] top-10 h-24 w-24 rounded-full bg-[#E9DDF2]/60 blur-3xl" />
          <div className="absolute right-[12%] bottom-6 h-28 w-28 rounded-full bg-[#F8DCE7]/50 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pt-7 pb-14 sm:pt-9 sm:pb-16 lg:pt-10 lg:pb-20">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mt-5 text-3xl font-extrabold leading-[1.08] tracking-tight text-[#2C1E16] sm:text-4xl lg:text-5xl">
                Grow,
                <span className="block text-[#1E3F20]">
                  share, and connect.
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base lg:text-lg">
                A place to ask questions, share experiences, discover new
                insights, and build meaningful connections with other
                professionals.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="mx-auto mt-9 max-w-3xl">
              <div className="group relative">
                <div className="pointer-events-none absolute -inset-1 rounded-[24px] bg-[#1E3F20]/5 opacity-0 blur-xl transition-opacity duration-500 group-focus-within:opacity-100" />
                <div className="relative flex items-center rounded-[22px] border border-gray-200 bg-white p-2 shadow-[0_14px_40px_rgba(44,30,22,0.06)] transition-all duration-300 focus-within:border-[#1E3F20]/30 focus-within:shadow-[0_18px_50px_rgba(30,63,32,0.10)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F7F4EC] text-[#1E3F20]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.04 6.04a7.5 7.5 0 0 0 10.61 10.61Z"
                      />
                    </svg>
                  </div>

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search discussions, topics, or questions..."
                    className="h-12 flex-1 bg-transparent px-4 text-sm text-[#2C1E16] outline-none placeholder:text-gray-400"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="mr-2 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-all duration-300 hover:bg-gray-200 hover:text-gray-600"
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#DCE9DD] bg-[#F3F8F2] p-4 text-center shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <p className="text-xl font-extrabold text-[#1E3F20]">
                  {posts.length}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-gray-400">
                  Discussions
                </p>
              </div>
              <div className="rounded-2xl border border-[#E2D8EE] bg-[#F8F4FC] p-4 text-center shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <p className="text-xl font-extrabold text-[#76558E]">
                  {totalLikes}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-gray-400">
                  Total Likes
                </p>
              </div>
              <div className="rounded-2xl border border-[#F0DDE4] bg-[#FCF5F7] p-4 text-center shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <p className="text-xl font-extrabold text-[#A65D73]">
                  {new Set(posts.map((post) => post.author)).size}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-gray-400">
                  Contributors
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-12 md:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Reveal>
              <div className="mb-7">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {categories.map((category) => {
                    const active = activeCategory === category.value;

                    return (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => setActiveCategory(category.value)}
                        className={[
                          "whitespace-nowrap rounded-full border px-4 py-2.5 text-xs font-bold transition-all duration-300 hover:-translate-y-0.5",
                          getCategoryButtonClass(category.value, active),
                        ].join(" ")}
                      >
                        {category.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#1E3F20]" />
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.17em] text-[#8A6A47]">
                      Community Feed
                    </p>
                  </div>
                  <h2 className="mt-2 text-2xl font-extrabold text-[#2C1E16] sm:text-3xl">
                    Latest Discussions
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Follow conversations and insights from the Career Cafe
                    community.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openCreatePost}
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#1E3F20] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152e17] hover:shadow-md"
                >
                  <span className="text-base leading-none transition-transform duration-300 group-hover:rotate-90">
                    +
                  </span>
                  Create Discussion
                </button>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="mb-5 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-400">
                  Showing{" "}
                  <span className="text-[#2C1E16]">{filteredPosts.length}</span>{" "}
                  discussions
                </p>

                {(search || activeCategory !== "Semua") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setActiveCategory("Semua");
                    }}
                    className="text-xs font-bold text-[#1E3F20] transition-colors hover:text-[#152e17]"
                  >
                    Reset filter
                  </button>
                )}
              </div>
            </Reveal>

            {loading ? (
              <div className="space-y-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-[26px] border border-gray-100 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 animate-pulse rounded-2xl bg-[#EDE8E1]" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 animate-pulse rounded bg-[#EDE8E1]" />
                        <div className="h-3 w-24 animate-pulse rounded bg-[#F3EEE8]" />
                      </div>
                    </div>
                    <div className="mt-6 h-5 w-2/3 animate-pulse rounded bg-[#EDE8E1]" />
                    <div className="mt-3 h-4 w-full animate-pulse rounded bg-[#F3EEE8]" />
                    <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-[#F3EEE8]" />
                  </div>
                ))}
              </div>
            ) : pageError ? (
              <div className="rounded-[26px] border border-dashed border-[#E7C9C2] bg-[#FFF8F6] px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F9E8E3] text-2xl text-[#A25F52]">
                  !
                </div>
                <h3 className="mt-5 text-lg font-extrabold text-[#2C1E16]">
                  Community unavailable
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  {pageError}
                </p>
                <button
                  type="button"
                  onClick={loadPosts}
                  className="mt-6 rounded-xl bg-[#1E3F20] px-5 py-3 text-xs font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152e17]"
                >
                  Try Again
                </button>
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="space-y-5">
                {filteredPosts.map((post, index) => {
                  const style =
                    categoryStyles[post.category] ?? fallbackCategoryStyles;
                  const isLiked = likedPosts.includes(post.id);
                  const tags = getTags(post.category);

                  return (
                    <Reveal key={post.id} delay={Math.min(index * 90, 360)}>
                      <article className="group relative overflow-hidden rounded-[26px] border border-gray-100 bg-white p-5 shadow-[0_8px_28px_rgba(44,30,22,0.045)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#1E3F20]/10 hover:shadow-[0_22px_55px_rgba(30,63,32,0.10)] sm:p-6">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#1E3F20]/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                        <div className="flex items-center gap-3">
                          <div
                            className={[
                              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold shadow-sm transition-transform duration-300 group-hover:scale-105",
                              style.avatar,
                            ].join(" ")}
                          >
                            {post.initial}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-[#2C1E16]">
                              {post.author}
                            </p>
                            <div className="mt-0.5 flex items-center gap-2">
                              <p className="truncate text-xs text-gray-500">
                                {post.role}
                              </p>
                              <span className="h-1 w-1 shrink-0 rounded-full bg-gray-300" />
                              <span className="text-[10px] font-semibold text-gray-400">
                                {formatPostDate(post.createdAt)}
                              </span>
                            </div>
                          </div>
                          <span
                            className={[
                              "ml-auto hidden rounded-full border px-3 py-1.5 text-[10px] font-bold sm:inline-flex",
                              style.badge,
                            ].join(" ")}
                          >
                            {getCategoryLabel(post.category)}
                          </span>
                        </div>

                        <div className="mt-5">
                          <div className="flex items-start gap-3">
                            <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F7F4EC] text-xs font-bold text-[#1E3F20] sm:flex">
                              {style.icon}
                            </div>
                            <div className="min-w-0">
                              <span
                                className={[
                                  "mb-2 inline-flex rounded-full border px-3 py-1 text-[10px] font-bold sm:hidden",
                                  style.badge,
                                ].join(" ")}
                              >
                                {getCategoryLabel(post.category)}
                              </span>
                              <h3 className="text-lg font-extrabold leading-snug text-[#2C1E16] transition-colors duration-300 group-hover:text-[#1E3F20]">
                                {post.title}
                              </h3>
                              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-600">
                                {post.content}
                              </p>
                            </div>
                          </div>
                        </div>

                        {tags.length > 0 && (
                          <div className="mt-5 flex flex-wrap gap-2">
                            {tags.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => handleTopicClick(tag)}
                                className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-[10px] font-semibold text-gray-500 transition hover:bg-[#F7F4EC] hover:text-[#1E3F20]"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-5">
                          <button
                            type="button"
                            onClick={() => handleLike(post.id)}
                            className={[
                              "group/like inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-300",
                              isLiked
                                ? "bg-[#1E3F20]/10 text-[#1E3F20]"
                                : "text-gray-500 hover:bg-[#F7F4EC] hover:text-[#1E3F20]",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "text-base transition-transform duration-300",
                                isLiked
                                  ? "scale-110"
                                  : "group-hover/like:scale-110",
                              ].join(" ")}
                            >
                              {isLiked ? "♥" : "♡"}
                            </span>
                            {post.likes}
                            <span className="hidden sm:inline">Likes</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCreateOpen(false)}
                            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-gray-500 transition-all duration-300 hover:bg-[#F7F4EC] hover:text-[#1E3F20]"
                            title="Comments will be available when the backend comment module is enabled"
                          >
                            <span className="text-base">○</span>
                            {post.comments}
                            <span className="hidden sm:inline">Comments</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleShare(post)}
                            className="ml-auto inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-gray-500 transition-all duration-300 hover:bg-[#F7F4EC] hover:text-[#1E3F20]"
                          >
                            <span className="text-base">↗</span>
                            {copiedPostId === post.id ? "Copied" : "Share"}
                          </button>
                        </div>
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[26px] border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F0E8] text-2xl text-[#1E3F20]">
                  ⌕
                </div>
                <h3 className="mt-5 text-lg font-extrabold text-[#2C1E16]">
                  No discussions found
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  No discussions match your current search or filter.
                </p>
                <button
                  type="button"
                  onClick={openCreatePost}
                  className="mt-6 rounded-xl bg-[#1E3F20] px-5 py-3 text-xs font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#152e17]"
                >
                  Create Discussion Pertama
                </button>
              </div>
            )}
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <Reveal delay={100}>
              <div className="group relative overflow-hidden rounded-[28px] bg-[#1E3F20] p-6 text-white shadow-[0_18px_45px_rgba(30,63,32,0.18)]">
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg backdrop-blur">
                      +
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
                        Community
                      </p>
                      <p className="text-sm font-bold text-white">
                        Share your thoughts
                      </p>
                    </div>
                  </div>
                  <h3 className="mt-5 text-2xl font-extrabold leading-tight">
                    Have a question?
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/75">
                    Share an experience, question, or insight that could help
                    another community member.
                  </p>
                  <button
                    type="button"
                    onClick={openCreatePost}
                    className="group/cta mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-[#1E3F20] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F8F6F1] hover:shadow-md"
                  >
                    Start a Discussion
                    <span className="transition-transform duration-300 group-hover/cta:translate-x-1">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-[0_10px_35px_rgba(44,30,22,0.045)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8A6A47]">
                      Explore
                    </p>
                    <h3 className="mt-1 text-lg font-extrabold text-[#2C1E16]">
                      Popular Topics
                    </h3>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F7F4EC] text-sm text-[#1E3F20]">
                    #
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {popularTopics.map((topic) => {
                    const active = search.toLowerCase() === topic.toLowerCase();
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => handleTopicClick(topic)}
                        className={[
                          "rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-300",
                          active
                            ? "border-[#1E3F20] bg-[#1E3F20] text-white shadow-sm"
                            : "border-gray-200 bg-[#FCFBF8] text-gray-600 hover:-translate-y-0.5 hover:border-[#1E3F20]/20 hover:bg-[#1E3F20]/5 hover:text-[#1E3F20]",
                        ].join(" ")}
                      >
                        #{topic}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            <Reveal delay={220}>
              <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-[0_10px_35px_rgba(44,30,22,0.045)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F0E8] text-[#1E3F20]">
                    ✓
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8A6A47]">
                      Be kind
                    </p>
                    <h3 className="mt-0.5 text-lg font-extrabold text-[#2C1E16]">
                      Community Guidelines
                    </h3>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  {[
                    [
                      "1",
                      "Be respectful",
                      "Use respectful and constructive language.",
                    ],
                    [
                      "2",
                      "Share positively",
                      "Share useful experiences and information.",
                    ],
                    [
                      "3",
                      "Avoid spam",
                      "Keep discussions relevant to the topic.",
                    ],
                  ].map(([number, title, description]) => (
                    <div key={number} className="group flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8F0E8] text-xs font-extrabold text-[#1E3F20] transition-transform duration-300 group-hover:scale-105">
                        {number}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#2C1E16]">
                          {title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          {description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={280}>
              <div className="rounded-[28px] border border-[#D8D0C4] bg-[#F7F4EC] p-6">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8A6A47]">
                  Career Cafe
                </p>
                <h3 className="mt-2 text-xl font-extrabold leading-tight text-[#2C1E16]">
                  Learn faster together.
                </h3>
                <p className="mt-2 text-xs leading-6 text-gray-500">
                  Discover new perspectives from mentors, developers, designers,
                  and other professionals.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/mentors")}
                  className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-[#1E3F20] transition-all duration-300 hover:gap-3"
                >
                  Explore Mentors <span>→</span>
                </button>
              </div>
            </Reveal>
          </aside>
        </div>
      </main>

      <Footer />

      {createOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#2C1E16]/45 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close modal"
            onClick={closeCreatePost}
            className="absolute inset-0 cursor-default"
          />

          <form
            onSubmit={handleCreatePost}
            className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-white/70 bg-[#FFFDFC] p-6 shadow-[0_30px_100px_rgba(44,30,22,0.24)] sm:p-8"
          >
            <button
              type="button"
              onClick={closeCreatePost}
              disabled={createSubmitting}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border border-[#E7DFD5] bg-white text-[#6E665D] transition hover:bg-[#F7F3EE] disabled:opacity-50"
              aria-label="Close"
            >
              ×
            </button>

            <div className="pr-12">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9B9187]">
                Community
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-[#2C1E16]">
                Create a New Discussion
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#81776D]">
                Share a question, experience, or insight with the Career Cafe
                community.
              </p>
            </div>

            {createError && (
              <div className="mt-5 rounded-2xl border border-[#E8CFC9] bg-[#FFF6F4] px-4 py-3 text-sm font-semibold text-[#985D52]">
                {createError}
              </div>
            )}

            {createSuccess && (
              <div className="mt-5 rounded-2xl border border-[#D8E7D4] bg-[#F2F8F0] px-4 py-3 text-sm font-semibold text-[#4A704D]">
                {createSuccess}
              </div>
            )}

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="community-category"
                  className="mb-2 block text-xs font-black text-[#50483F]"
                >
                  Category
                </label>
                <select
                  id="community-category"
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value)}
                  disabled={createSubmitting}
                  className="w-full rounded-2xl border border-[#DED6CD] bg-white px-4 py-3.5 text-sm text-[#2C1E16] outline-none transition focus:border-[#9BB398] focus:ring-4 focus:ring-[#DCE8D9]"
                >
                  {categories
                    .filter((category) => category.value !== "Semua")
                    .map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="community-title"
                  className="mb-2 block text-xs font-black text-[#50483F]"
                >
                  Discussion title
                </label>
                <input
                  id="community-title"
                  type="text"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  maxLength={255}
                  disabled={createSubmitting}
                  placeholder="Example: How should I prepare a frontend portfolio?"
                  className="w-full rounded-2xl border border-[#DED6CD] bg-white px-4 py-3.5 text-sm text-[#2C1E16] outline-none transition focus:border-[#9BB398] focus:ring-4 focus:ring-[#DCE8D9]"
                />
                <p className="mt-1.5 text-right text-[10px] font-semibold text-[#9B9187]">
                  {newTitle.length}/255
                </p>
              </div>

              <div>
                <label
                  htmlFor="community-content"
                  className="mb-2 block text-xs font-black text-[#50483F]"
                >
                  Discussion content
                </label>
                <textarea
                  id="community-content"
                  value={newContent}
                  onChange={(event) => setNewContent(event.target.value)}
                  maxLength={5000}
                  rows={7}
                  disabled={createSubmitting}
                  placeholder="Tell us about your question or experience..."
                  className="w-full resize-none rounded-2xl border border-[#DED6CD] bg-white px-4 py-3.5 text-sm leading-6 text-[#2C1E16] outline-none transition focus:border-[#9BB398] focus:ring-4 focus:ring-[#DCE8D9]"
                />
                <p className="mt-1.5 text-right text-[10px] font-semibold text-[#9B9187]">
                  {newContent.length}/5000
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeCreatePost}
                disabled={createSubmitting}
                className="rounded-2xl border border-[#DED6CD] bg-white px-5 py-3.5 text-sm font-black text-[#625A52] transition hover:bg-[#F8F5F1] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createSubmitting}
                className="rounded-2xl bg-[#1E3F20] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[#1E3F20]/10 transition hover:-translate-y-0.5 hover:bg-[#152e17] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createSubmitting ? "Publishing..." : "Publish Discussion"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
