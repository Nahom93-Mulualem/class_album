export interface Student {
  id: string;
  name: string;
  avatar: string;
  degree: string;
  gradYear: string;
  track: string;
  statusQuote: string;
  bio: string;
  dorm: string;
  skills: string[];
  github?: string;
  linkedin?: string;
  connected?: boolean;
  online?: boolean;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorTrack: string;
  timeAgo: string;
  content: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorTrack: string;
  timeAgo: string;
  content: string;
  image?: string;
  video?: string;
  tag: "Career & Offers" | "Campus Life" | "Hackathons & Tech" | "Projects";
  likesCount: number;
  isLiked?: boolean;
  comments: Comment[];
}

export interface ReactionItem {
  emoji: string;
  count: number;
  users: string[];
}

export interface MessageItem {
  id: string;
  senderId: string; // 'current-user' or student.id
  text: string;
  time: string;
  isRead?: boolean;
  reactions?: ReactionItem[];
}

export interface Conversation {
  id: string;
  studentId: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: MessageItem[];
}

export interface TechEvent {
  id: string;
  title: string;
  month: string;
  day: string;
  location: string;
  time: string;
  description: string;
  isRSVPed: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  image: string;
  category: string;
  aspect: "large" | "square" | "wide";
  hasVideo?: boolean;
}

export interface YearbookSignature {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorTrack: string;
  date: string;
  message: string;
}

export type MemoryCategory =
  | "Graduation"
  | "Campus Life"
  | "Class Events"
  | "Friends"
  | "Trips"
  | "Funny Moments"
  | "Throwbacks"
  | "Other";

export interface MemoryComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorTrack?: string;
  timeAgo: string;
  content: string;
}

export interface MemoryItem {
  id: string;
  title: string;
  story: string;
  image: string;
  video?: string;
  category: MemoryCategory;
  year: "2026" | "2025" | "2024" | "2023" | "2022" | "2021" | "2020";
  date: string;
  location: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  taggedClassmates?: { id: string; name: string; avatar: string }[];
  likesCount: number;
  isLiked?: boolean;
  comments: MemoryComment[];
  aspect?: "tall" | "wide" | "square" | "featured";
}

export interface NotificationItem {
  id: string;
  type: "like" | "comment" | "message" | "connect" | "event";
  title: string;
  description: string;
  time: string;
  read: boolean;
  avatar?: string;
}

// Current User Record
export const CURRENT_USER: Student = {
  id: "user-admin",
  name: "Alex Chen",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDMLGCNKFCr7a7iihM-ILAGx8wgcjhWgZ6G9lJSFTgXX8c4dhm_MAMiOziO1tPRIZaGgUvGtj3JyOqKyMhS6EWpNky4VhuTuknCyMt2oOsex1Fyx05WN93WpuKdhefX1W3Ma7HeRAXg1V3KV7DQnTSnAqLGOLja6D0RFGfkWrDAVJjJMEpzzIYxzuGGz8wX8eJaIWkzL6xquakSbjuJHPk7TyZZEMh8CfC2-Bo7omnHCyl-El_nMOaoKA",
  degree: "B.S. Software Engineering",
  gradYear: "2026",
  track: "Full-Stack & AI Systems",
  statusQuote: "Senior Capstone team locked in! Building next-gen autonomous developer tools. 🚀",
  bio: "Passionate about architecting distributed software, reactive UI systems, and modern AI pipelines. Class of 2020 - 2026 representative.",
  dorm: "North Campus Tech Quad, Suite 402",
  skills: ["TypeScript", "Next.js", "Python", "PyTorch", "Rust", "GraphQL", "Docker", "AWS"],
  github: "alexchen-26",
  linkedin: "alexchen-se26",
  connected: true,
  online: true,
};

// Software Engineering Class of 2026 Directory
export const INITIAL_STUDENTS: Student[] = [
  {
    id: "alex-rivera",
    name: "Alex Rivera",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC5GY7O5cwEHCv_uXRtHcBs2kj7yc6DygT8MCXUgYLegkJt4UmzYVVHA_UPs-9d6UBKCbQ25xU5NwWa-wP96xw4RUDP2cefHqdlp6rmJpRO8QuCeJ-PSVBHWa51DFzt6mF5mkNySiM1oykvu-hmNEEKNs2VI0Ar9qPQfFoDU3y7dHOd3SqikkelWWMBMIsm75dxS3z_N9pKJc2NyESjOe3BTbndRSUsoKrtxAn17iUvE1MC847rnuhgsw",
    degree: "B.S. Software Engineering",
    gradYear: "2026",
    track: "AI & Machine Learning",
    statusQuote: "Summer SWE Internship secured! Anthropic AI lab here I come! 🎉",
    bio: "Focused on large-scale model optimization, LLM alignment, and reinforcement learning systems. IEEE SE Student Lead.",
    dorm: "Waverly Hall 312",
    skills: ["PyTorch", "CUDA", "FastAPI", "TensorRT", "Python", "Kubernetes"],
    github: "arivera-ml",
    linkedin: "alex-rivera-se",
    connected: true,
    online: true,
  },
  {
    id: "sarah-jenkins",
    name: "Sarah Jenkins",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCyDT6-ktTvfpRGZwfsO_paU4KRwpNzpzaVi5eGer2p4q1QBff1JcSW_hgTa9GYJ-Nol7OWZBKyzukrMWZgl5Z4wbtYmokpjbsuXxgdckzKW92R8z6py3BvfiZE0M04TEgU3O31h8S7HHEITtbskAbaPGDc8AXi1xyWleloUfpJM3JHoLLBF88CqYXlwcvNiT_8tGX90M9J5wXFup-yoRPqL7gZWHnY_h7gkKUv0UTItQkFFBq7NcsHPQ",
    degree: "B.S. Software Engineering",
    gradYear: "2026",
    track: "Full-Stack & Cloud Architecture",
    statusQuote: "Deploying our team's microservices cluster. Ready for senior capstone demo!",
    bio: "Full stack engineer obsessed with clean architectures, zero-downtime CI/CD pipelines, and high-performance React frontends.",
    dorm: "East Campus Tower B",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Terraform", "Go"],
    github: "sjenkins-dev",
    linkedin: "sarah-jenkins-swe",
    connected: true,
    online: true,
  },
  {
    id: "jordan-lee",
    name: "Jordan Lee",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCVo6a4oI5Qv3KUl190xpqnSuZYjmt15ULGjauVqKOmiruyZe_MoRKVIK7NfKeysAy9cQiPITkdozgh1mh9LO2mXZEeALFMPymGhj9xBMhFBvq9q3916BjlocdL1D9sqk1mJtnRpBY_HJtm4sYPr-UZi3obt9MK7ftd5YMiKXxi6HOEzzilpaW6uiqUN7FOAS1QpIiqtdf7BdVJQJeDHEeyuNK-oqa3jIAlloNcJduOxPZcqWVX1sst8A",
    degree: "B.S. Software Engineering",
    gradYear: "2026",
    track: "FinTech & Distributed Systems",
    statusQuote: "Building low-latency order execution engines. Quant club president.",
    bio: "Specializing in high-frequency trading infra, memory-safe systems programming in C++ and Rust, and financial algorithms.",
    dorm: "West Campus Residential 204",
    skills: ["C++20", "Rust", "Kafka", "gRPC", "Redis", "Distributed Consensus"],
    github: "jordanlee-quant",
    linkedin: "jordan-lee-se",
    connected: false,
    online: false,
  },
  {
    id: "sam-taylor",
    name: "Sam Taylor",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCS6Dfafzx18d3Q3S93HE6bVM4NQ50RLdxlvj3q1e6YQVLSWteOFxknFiBVLNOn1UBCyT7pqRI_Sci1vSYlQPKw5F9ZzwdJnZ2qb1EGuLp_Kl1bxjfOULTEfl5GGKtEUvCPNcjS6_hWa5-oWiYYwksX4L-WZ9ZTRtw8mdZyNua9lZ-OOp5j0rXcKB1sHc6v33CP7IT8iWxNKupZTnZsu8TlY2Y-lmIL21cxXooIMY0R2kdl7FBkyK1Rjw",
    degree: "B.S. Software Engineering",
    gradYear: "2026",
    track: "UI/UX Engineering & Design Systems",
    statusQuote: "Design tokens are my love language. Revamping the department's web portal ✨",
    bio: "Bridging the bridge between aesthetic design and hardcore frontend engineering. Creator of campus CSS component library.",
    dorm: "South Gate Commons 108",
    skills: ["Tailwind CSS", "Figma", "Web Accessibility", "Animation", "Vue", "Next.js"],
    github: "samtaylor-ui",
    linkedin: "sam-taylor-design",
    connected: true,
    online: true,
  },
  {
    id: "casey-chen",
    name: "Casey Chen",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBqJ-NreNGNWq4Y6JRkMyPreWs_Punom6TI_ZOZwPekBR2jv0rT-6UOWRhKoNG0WtpaC-q0zKbhx1bxgd5SaP92DOdjKuN-8soayHuc7wqJJEaamsGAUeo4E9jHoL0Mlsr457C4H_bG9q-h-gbUO_qNVI5uC6lB2ycMl-iCcIsoy48xAuS9SlLPH_paCf_fU2TDkTe07sQK_XFfDFuJu7nZeZxorJfM1NUedf8plM0_nMLQkw0ltMGQtQ",
    degree: "B.S. Software Engineering",
    gradYear: "2026",
    track: "Cybersecurity & Cryptography",
    statusQuote: "Top 3 at National Collegiate Cyber Defense Competition! 🛡️",
    bio: "Reverse engineering, zero-day threat analysis, zero-trust network protocols, and cryptographic implementation.",
    dorm: "Founders Hall 415",
    skills: ["Rust", "GDB", "Wireshark", "Solidity", "Linux Kernel", "Reverse Eng"],
    github: "casey-security",
    linkedin: "casey-chen-sec",
    connected: true,
    online: false,
  },
  {
    id: "morgan-smith",
    name: "Morgan Smith",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCX04sPyB22yuGZuiNKsFKb7KTymxooIWM99vUKaQmTnT-xEz_syJPwKi200YglU_N9LVUClz9rob57KzW3E-cSCuVxWurJiTz3b0wewvvkK6YNM5GgwNuAoFm-ihdzXv1clM_YBcvK9r8rlJGgBWq0J3swytQH--8_8ruBVQnH4999WN8hFaHjHqOBcoc6SDpCUWlRiuiszYbJBqipNCBGWIIu2XPIBOiFbg_R5A9cLQxUEa4SNeKdpw",
    degree: "B.S. Software Engineering",
    gradYear: "2026",
    track: "Cloud Infrastructure & DevOps",
    statusQuote: "Infrastructure as Code everything. Running 99.999% uptime campus servers.",
    bio: "Cloud native developer passionate about Kubernetes operators, GitOps workflows, automated testing, and multi-region deployment.",
    dorm: "University Village 12B",
    skills: ["Kubernetes", "Docker", "AWS", "GitHub Actions", "Ansible", "Go"],
    github: "morgansmith-ops",
    linkedin: "morgan-smith-devops",
    connected: false,
    online: true,
  },
  {
    id: "david-kim",
    name: "David Kim",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDMpoJ016780KIy0SgtW0A-ldQiOnYrQlYXljNVzTURuURt6dQ4S9lDCLcZUtDOT-a4mT2ZLcRjc9BSYNcAXTI7TbHQbVrEYWfSPfPe-TDEVLxyvKQij3NQt7VTw8Vx1K6d_wnsUlC5gAPTvjXC-iieC8jqqoeGgwR9CVPxzKwIDfNCcInfWcKNdo30b3DBRpoUN7ZGs1-smidSzmDUNPFHNNrrdWkypG0BAfuiP9nCNM2FJGSzhbG2Mg",
    degree: "B.S. Software Engineering",
    gradYear: "2026",
    track: "Mobile & iOS Systems",
    statusQuote: "Shipped our campus shuttle app to 10k monthly active students on App Store! 📱",
    bio: "Native iOS and Android engineer focusing on Swift 6, Kotlin Multiplatform, on-device ML inference, and buttery smooth 120fps gesture systems.",
    dorm: "Engineering Quad 210",
    skills: ["Swift", "SwiftUI", "Kotlin", "CoreML", "Flutter", "Combine"],
    github: "davidkim-mobile",
    linkedin: "david-kim-ios",
    connected: true,
    online: true,
  },
  {
    id: "maya-patel",
    name: "Maya Patel",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuABaVbmkXdaAA4_u8SG2RVoDy6SqSkPlEJDuVe-34Ri4efRh5i5FXZGg6a-kr9GuO0yXghqnJH09jUF8C2tzTN-CbBLD7zUw7ZT4FPVRhShOCjOqGXGRiozOsZ9dJAnFn2B_QhjT3KZt-rUmvnP7fNtjg0UtcVVg6uoJNxCV29lGxmdkxODlyTR4rVXHCVSmF6J-Ac3vxoay_iXhNVAU675m4w6uDDmlmDwhMFw6oimPy7eAbM3bAXaMw",
    degree: "B.S. Software Engineering",
    gradYear: "2026",
    track: "AI & Computer Vision",
    statusQuote: "Autonomous drone navigation thesis paper accepted at CVPR 2026! 🎓",
    bio: "Computer vision researcher & engineer. Building real-time object tracking, 3D Gaussian splatting, and robotics perception systems.",
    dorm: "Robotics Research Wing 301",
    skills: ["OpenCV", "PyTorch", "C++", "ROS2", "SLAM", "Point Cloud Lib"],
    github: "mayapatel-cv",
    linkedin: "maya-patel-ai",
    connected: false,
    online: true,
  },
  {
    id: "elena-rostova",
    name: "Elena Rostova",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA70IcVh69EPpOaJi9kJJGl_oT5Sr06Hs3iVOYBsSVlDqGoCqksUZkgcqij1s5r4nXhTzWoUshTREPc6SRAachQ5VUKub24zzmlmAMyFNvYjJIqWdLupHG9HMyezEudnx-dV8_rxOL8huwyiMOFc60s2vLR2TE8cDxaasTMPa8cVoNYKJW-YLtboVJ9yl_degknb-wUyvRjT2xq944GgVun258mk2rVgJKHrkMMpCd9IhzAqx9E3kG3Hw",
    degree: "B.S. Software Engineering",
    gradYear: "2026",
    track: "Compilers & Systems Architecture",
    statusQuote: "Wrote an LLVM backend pass for custom RISC-V extensions this weekend.",
    bio: "Low-level hacker fascinated by compiler optimization, JIT runtimes, instruction scheduling, and memory allocators.",
    dorm: "Waverly Hall 105",
    skills: ["LLVM", "C++", "Rust", "Assembly", "Operating Systems", "GDB"],
    github: "elena-compilers",
    linkedin: "elena-rostova-swe",
    connected: true,
    online: false,
  },
  {
    id: "marcus-brody",
    name: "Marcus Brody",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAyHSi89gyMWdZ7XvLHicHi60yuQ_MlrypXBqFEbITLTUrSPPX-vy3JMvDHRFG2S40RgL-nJyQkj0Y8-0Np1E9AaYQiw60aUeclXEVxt6ImsaGzg2U4ckSU0Hl0Q_qQ5E6U9WBMGFMTRlJPQw-uVYSE7yhrbgrwiZdtQXUZg5TlPLzQmQwH9FTljiYOo5FKSzwTwblxjOkUHCvemAR7mPeYoFqFXUccFc524WvtzK6RU-ELTmRR698bvA",
    degree: "B.S. Software Engineering",
    gradYear: "2026",
    track: "Backend & Microservices",
    statusQuote: "Benchmarking 100k requests/sec GraphQL gateways on edge workers.",
    bio: "Specializing in high-throughput backend infrastructure, asynchronous event pipelines, and distributed caching topologies.",
    dorm: "Highland Heights 401",
    skills: ["Go", "Node.js", "Redis", "Kafka", "PostgreSQL", "Docker"],
    github: "marcus-backend",
    linkedin: "marcus-brody-se",
    connected: false,
    online: true,
  },
];

// Initial Feed Posts
export const INITIAL_POSTS: Post[] = [
  {
    id: "post-1",
    authorId: "alex-rivera",
    authorName: "Alex Rivera",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC5GY7O5cwEHCv_uXRtHcBs2kj7yc6DygT8MCXUgYLegkJt4UmzYVVHA_UPs-9d6UBKCbQ25xU5NwWa-wP96xw4RUDP2cefHqdlp6rmJpRO8QuCeJ-PSVBHWa51DFzt6mF5mkNySiM1oykvu-hmNEEKNs2VI0Ar9qPQfFoDU3y7dHOd3SqikkelWWMBMIsm75dxS3z_N9pKJc2NyESjOe3BTbndRSUsoKrtxAn17iUvE1MC847rnuhgsw",
    authorTrack: "AI & Machine Learning",
    timeAgo: "2 hours ago",
    content:
      "Just signed my full-time Software Engineer offer for post-graduation! Huge shoutout to the SE senior capstone mentors and everyone who did mock coding interviews with me. Ready to celebrate tonight! 🎉🚀",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCgcOuqBJPMpAwZ7k8OfkIjFTwhRdHQX8O959hDa99ZHSZlk9xLaGKl0D1tGwRvvINb9QeMHrRrughUkT_-LTY913UKn4ZXkmkIfuultPcc6nPJs4o3I4QGgTZmfRMjp8j-nAbCnBs-Si-1UzqZhzs5bNZ9A0td6JQSNYlhCf372mVjgeijXka6P82gAw4aLSnks0lZu7OStMuMVg5xajitMnalvMePKl7qySNfG2QeuesrK83GXQNvCA",
    tag: "Career & Offers",
    likesCount: 42,
    isLiked: false,
    comments: [
      {
        id: "c-1",
        authorName: "Sarah Jenkins",
        authorAvatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCyDT6-ktTvfpRGZwfsO_paU4KRwpNzpzaVi5eGer2p4q1QBff1JcSW_hgTa9GYJ-Nol7OWZBKyzukrMWZgl5Z4wbtYmokpjbsuXxgdckzKW92R8z6py3BvfiZE0M04TEgU3O31h8S7HHEITtbskAbaPGDc8AXi1xyWleloUfpJM3JHoLLBF88CqYXlwcvNiT_8tGX90M9J5wXFup-yoRPqL7gZWHnY_h7gkKUv0UTItQkFFBq7NcsHPQ",
        authorTrack: "Full-Stack & Cloud",
        timeAgo: "1 hour ago",
        content: "Congrats Alex! Super deserved after all those distributed systems leetcode marathons! 🍕",
      },
      {
        id: "c-2",
        authorName: "Jordan Lee",
        authorAvatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCVo6a4oI5Qv3KUl190xpqnSuZYjmt15ULGjauVqKOmiruyZe_MoRKVIK7NfKeysAy9cQiPITkdozgh1mh9LO2mXZEeALFMPymGhj9xBMhFBvq9q3916BjlocdL1D9sqk1mJtnRpBY_HJtm4sYPr-UZi3obt9MK7ftd5YMiKXxi6HOEzzilpaW6uiqUN7FOAS1QpIiqtdf7BdVJQJeDHEeyuNK-oqa3jIAlloNcJduOxPZcqWVX1sst8A",
        authorTrack: "FinTech & Systems",
        timeAgo: "45 mins ago",
        content: "Massive win! Let's get the whole SE 2026 crew together this Friday to celebrate.",
      },
    ],
  },
  {
    id: "post-2",
    authorId: "current-user",
    authorName: "Alex Chen",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDMLGCNKFCr7a7iihM-ILAGx8wgcjhWgZ6G9lJSFTgXX8c4dhm_MAMiOziO1tPRIZaGgUvGtj3JyOqKyMhS6EWpNky4VhuTuknCyMt2oOsex1Fyx05WN93WpuKdhefX1W3Ma7HeRAXg1V3KV7DQnTSnAqLGOLja6D0RFGfkWrDAVJjJMEpzzIYxzuGGz8wX8eJaIWkzL6xquakSbjuJHPk7TyZZEMh8CfC2-Bo7omnHCyl-El_nMOaoKA",
    authorTrack: "Full-Stack & AI Systems",
    timeAgo: "5 hours ago",
    content:
      "Our Senior Capstone project 'DevPulse' just passed 10,000 requests per second in load testing with sub-5ms latency! ⚡️ Open source repo will be dropping right before Graduation Expo in May.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDqevVO5_wHxhoQDc4KRJHtQwo3DPY1n-8I7xivRIAY-oVmzxZruRcIb3djwnzfBLgNk1jJsW-BdyWVzREJ6Mq4BVhnp1XyYvB5a5fMAHRzcSgPBeDummr6XPPXuRiIDESfaRfvQOrg87-nP2QbJd7AhuxsCiPZIiho8b2jmNCBVClqxoudmn4nH0Q0GNt0ED5H8yBNdCkFIrOkB-TMrCoUEAVXwQqIeBen-2Vb_1klmV01mZOP8H0U_A",
    tag: "Projects",
    likesCount: 68,
    isLiked: true,
    comments: [
      {
        id: "c-3",
        authorName: "Marcus Brody",
        authorAvatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAyHSi89gyMWdZ7XvLHicHi60yuQ_MlrypXBqFEbITLTUrSPPX-vy3JMvDHRFG2S40RgL-nJyQkj0Y8-0Np1E9AaYQiw60aUeclXEVxt6ImsaGzg2U4ckSU0Hl0Q_qQ5E6U9WBMGFMTRlJPQw-uVYSE7yhrbgrwiZdtQXUZg5TlPLzQmQwH9FTljiYOo5FKSzwTwblxjOkUHCvemAR7mPeYoFqFXUccFc524WvtzK6RU-ELTmRR698bvA",
        authorTrack: "Backend & Microservices",
        timeAgo: "3 hours ago",
        content: "What did you end up using for the caching layer? Redis clusters or memory maps?",
      },
    ],
  },
  {
    id: "post-3",
    authorId: "maya-patel",
    authorName: "Maya Patel",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuABaVbmkXdaAA4_u8SG2RVoDy6SqSkPlEJDuVe-34Ri4efRh5i5FXZGg6a-kr9GuO0yXghqnJH09jUF8C2tzTN-CbBLD7zUw7ZT4FPVRhShOCjOqGXGRiozOsZ9dJAnFn2B_QhjT3KZt-rUmvnP7fNtjg0UtcVVg6uoJNxCV29lGxmdkxODlyTR4rVXHCVSmF6J-Ac3vxoay_iXhNVAU675m4w6uDDmlmDwhMFw6oimPy7eAbM3bAXaMw",
    authorTrack: "AI & Computer Vision",
    timeAgo: "Yesterday",
    content:
      "First place at the Annual SE Inter-University Hackathon! 🏆 36 hours of non-stop coding, energy drinks, and debugging computer vision models on edge GPUs. Proud of our 2026 squad!",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDVKSi5KNEGsCkJ978c4-ItkyffXdqLQkoV9YtsZtAMwuAZn0LrFoFjc2pCWQM6dMeixLe30ykUPrz7j2XJ0AuSVE6TpQC_cf6JbwivOFctHZOhCw9LkZky8LUqCZPVaBkb7uvIY8zVMJB5Aympx1AvHKbAC7wXwWPq8zH3TpWS6G2eI4lS9d9tSosBXAZKsxFuuPVYWf_3lM20LgCkBWOCzq_0BPpoYRytLaeznmqYKUnn9bGc-d9_QA",
    tag: "Hackathons & Tech",
    likesCount: 95,
    isLiked: false,
    comments: [],
  },
  {
    id: "post-4",
    authorId: "liam-zhang",
    authorName: "Liam Zhang",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD1Z_H8W0Wq-1hN3VqF0zS97QOklm_P4H9yX6wL5uE2kF1_rG_c4wP6nL3_rS7pT5kQ8wU9mZ4_pT6yU1oN2wM3qL_5",
    authorTrack: "Robotics & Embedded C++",
    timeAgo: "2 days ago",
    content:
      "Live demo test of our Senior Capstone quadcopter navigation system running autonomous obstacle avoidance! 🚁 Watch it thread the needle through the robotics arena.",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    tag: "Projects",
    likesCount: 112,
    isLiked: true,
    comments: [
      {
        id: "c-4",
        authorName: "Alex Chen",
        authorAvatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDMLGCNKFCr7a7iihM-ILAGx8wgcjhWgZ6G9lJSFTgXX8c4dhm_MAMiOziO1tPRIZaGgUvGtj3JyOqKyMhS6EWpNky4VhuTuknCyMt2oOsex1Fyx05WN93WpuKdhefX1W3Ma7HeRAXg1V3KV7DQnTSnAqLGOLja6D0RFGfkWrDAVJjJMEpzzIYxzuGGz8wX8eJaIWkzL6xquakSbjuJHPk7TyZZEMh8CfC2-Bo7omnHCyl-El_nMOaoKA",
        authorTrack: "Full-Stack & AI Systems",
        timeAgo: "1 day ago",
        content: "The PID loop stability here is insane!! What frequency is the telemetry stream running at?",
      },
    ],
  },
];

// Initial 1-on-1 Direct Messaging Conversations
export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-sarah",
    studentId: "sarah-jenkins",
    lastMessage: "Are we still on for reviewing the Capstone architecture doc?",
    lastMessageTime: "10:42 AM",
    unreadCount: 2,
    messages: [
      {
        id: "m-1",
        senderId: "sarah-jenkins",
        text: "Hey Alex! How did the distributed systems midterm go?",
        time: "10:30 AM",
        isRead: true,
        reactions: [
          { emoji: "👋", count: 1, users: ["current-user"] },
        ],
      },
      {
        id: "m-2",
        senderId: "current-user",
        text: "Not too bad! The Raft consensus study guide really helped a lot.",
        time: "10:35 AM",
        isRead: true,
        reactions: [
          { emoji: "🔥", count: 2, users: ["current-user", "sarah-jenkins"] },
          { emoji: "🚀", count: 1, users: ["sarah-jenkins"] },
        ],
      },
      {
        id: "m-3",
        senderId: "current-user",
        text: "Definitely need a massive coffee break though ☕",
        time: "10:36 AM",
        isRead: true,
        reactions: [
          { emoji: "❤️", count: 1, users: ["sarah-jenkins"] },
          { emoji: "😂", count: 1, users: ["current-user"] },
        ],
      },
      {
        id: "m-4",
        senderId: "sarah-jenkins",
        text: "Same here! Total brain drain.",
        time: "10:40 AM",
        isRead: false,
      },
      {
        id: "m-5",
        senderId: "sarah-jenkins",
        text: "Are we still on for reviewing the Capstone architecture doc?",
        time: "10:42 AM",
        isRead: false,
      },
    ],
  },
  {
    id: "conv-alex-r",
    studentId: "alex-rivera",
    lastMessage: "Thanks man! We definitely need to celebrate this weekend.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    messages: [
      {
        id: "m-6",
        senderId: "current-user",
        text: "Dude huge congratulations on the Anthropic offer!! That's huge!",
        time: "Yesterday, 3:15 PM",
        isRead: true,
      },
      {
        id: "m-7",
        senderId: "alex-rivera",
        text: "Thanks man! We definitely need to celebrate this weekend.",
        time: "Yesterday, 3:20 PM",
        isRead: true,
      },
    ],
  },
  {
    id: "conv-david",
    studentId: "david-kim",
    lastMessage: "Yeah, SwiftUI 6 navigation stacks are so much cleaner.",
    lastMessageTime: "Mon",
    unreadCount: 0,
    messages: [
      {
        id: "m-8",
        senderId: "david-kim",
        text: "Hey, did you check out the new campus app release?",
        time: "Mon 2:10 PM",
        isRead: true,
      },
      {
        id: "m-9",
        senderId: "current-user",
        text: "Yes! The live shuttle tracking animation is super smooth.",
        time: "Mon 2:15 PM",
        isRead: true,
      },
      {
        id: "m-10",
        senderId: "david-kim",
        text: "Yeah, SwiftUI 6 navigation stacks are so much cleaner.",
        time: "Mon 2:18 PM",
        isRead: true,
      },
    ],
  },
  {
    id: "conv-sam",
    studentId: "sam-taylor",
    lastMessage: "Sent the Figma design system tokens over email!",
    lastMessageTime: "Sun",
    unreadCount: 0,
    messages: [
      {
        id: "m-11",
        senderId: "sam-taylor",
        text: "Sent the Figma design system tokens over email!",
        time: "Sun 6:45 PM",
        isRead: true,
      },
    ],
  },
  {
    id: "conv-casey",
    studentId: "casey-chen",
    lastMessage: "Ran an audit on the auth endpoints, all clean!",
    lastMessageTime: "Oct 18",
    unreadCount: 0,
    messages: [
      {
        id: "m-12",
        senderId: "casey-chen",
        text: "Ran an audit on the auth endpoints, all clean!",
        time: "Oct 18 11:20 AM",
        isRead: true,
      },
    ],
  },
];

// Upcoming Tech & SE Class Events
export const INITIAL_EVENTS: TechEvent[] = [
  {
    id: "evt-1",
    title: "Senior Capstone Demo Expo",
    month: "NOV",
    day: "14",
    location: "Engineering Atrium",
    time: "2:00 PM - 6:00 PM",
    description: "Annual project showcase where all 50 SE graduating teams present live prototypes to industry tech recruiters.",
    isRSVPed: true,
  },
  {
    id: "evt-2",
    title: "Class of 2026 Tech Alumni Mixer",
    month: "NOV",
    day: "28",
    location: "Campus Innovation Hub",
    time: "6:30 PM - 9:00 PM",
    description: "Connect with former grads now at Google, OpenAI, Apple, and leading startups. Drinks and networking.",
    isRSVPed: false,
  },
  {
    id: "evt-3",
    title: "Software Eng Hackathon Finale",
    month: "DEC",
    day: "05",
    location: "Computer Science Hall",
    time: "9:00 AM - 9:00 PM",
    description: "48-hour sprint building AI agents and distributed systems for $10k in prize bounties.",
    isRSVPed: true,
  },
  {
    id: "evt-4",
    title: "SE Class of 2026 Commencement Gala",
    month: "MAY",
    day: "22",
    location: "Grand Ballroom & Quad",
    time: "7:00 PM - Midnight",
    description: "Official graduation celebration for the Software Engineering Class of 2026 graduates, friends, and faculty.",
    isRSVPed: true,
  },
];

// Profile Gallery
export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: "g-1",
    title: "Senior Capstone Sprint '24",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDqevVO5_wHxhoQDc4KRJHtQwo3DPY1n-8I7xivRIAY-oVmzxZruRcIb3djwnzfBLgNk1jJsW-BdyWVzREJ6Mq4BVhnp1XyYvB5a5fMAHRzcSgPBeDummr6XPPXuRiIDESfaRfvQOrg87-nP2QbJd7AhuxsCiPZIiho8b2jmNCBVClqxoudmn4nH0Q0GNt0ED5H8yBNdCkFIrOkB-TMrCoUEAVXwQqIeBen-2Vb_1klmV01mZOP8H0U_A",
    category: "Projects",
    aspect: "large",
  },
  {
    id: "g-2",
    title: "Late Night Code & Coffee",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDVKSi5KNEGsCkJ978c4-ItkyffXdqLQkoV9YtsZtAMwuAZn0LrFoFjc2pCWQM6dMeixLe30ykUPrz7j2XJ0AuSVE6TpQC_cf6JbwivOFctHZOhCw9LkZky8LUqCZPVaBkb7uvIY8zVMJB5Aympx1AvHKbAC7wXwWPq8zH3TpWS6G2eI4lS9d9tSosBXAZKsxFuuPVYWf_3lM20LgCkBWOCzq_0BPpoYRytLaeznmqYKUnn9bGc-d9_QA",
    category: "Campus Life",
    aspect: "square",
  },
  {
    id: "g-3",
    title: "Campus Game Day Hackathon",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA_9Dak6Gw2NMOfsHraBsnp50b5H4GNZDWHdVKUhqQPmViOiVAe3_lDSaMSPy8T1829gtlccidWMTTlG293aTbZYeLeyXa9dg5e68NqtuMOxu01PtCaps2rd3VK1kmWcUF1H-h5J1kU9uvGFkztsvZ1lLEzfYn4_u9cOPVMtPbPXcpWE4rK7uK2ffDEE1cUlnrthHdZqgf0Ho6CCDn5EKA-GIsGB5w4WvocweWhAJZau37ag9hLoyOf-Q",
    category: "Hackathons",
    aspect: "square",
    hasVideo: true,
  },
  {
    id: "g-4",
    title: "Tech Innovation Center Quad",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD-8_4OIWUx9-YFYuzTuwPrDZVPig1ofbP_x4hESMcy_EhRWYmwh852WZnRZ_5QFPh6NKz-yzb8HyQHxdywfAzx3av5oxDQH0sFoHmHW5zCacywcr5VedZVcfxUpuigktGkJ8zpnuC2VEg9SbMRx9zd1xNkGlJUB0wumSe2dl90ZlKIf6b14dvHWVDcF7B7b64IVstsI2rHoOBxOvffVnXwJxVwS5v4yTLXrR71BqoKWVkqy5OAjO3hpw",
    category: "Campus",
    aspect: "square",
  },
];

// Digital Yearbook Signatures
export const INITIAL_SIGNATURES: YearbookSignature[] = [
  {
    id: "sig-1",
    authorName: "Sarah Jenkins",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCyDT6-ktTvfpRGZwfsO_paU4KRwpNzpzaVi5eGer2p4q1QBff1JcSW_hgTa9GYJ-Nol7OWZBKyzukrMWZgl5Z4wbtYmokpjbsuXxgdckzKW92R8z6py3BvfiZE0M04TEgU3O31h8S7HHEITtbskAbaPGDc8AXi1xyWleloUfpJM3JHoLLBF88CqYXlwcvNiT_8tGX90M9J5wXFup-yoRPqL7gZWHnY_h7gkKUv0UTItQkFFBq7NcsHPQ",
    authorTrack: "Full-Stack & Cloud",
    date: "Oct 20, 2026",
    message:
      "Alex, our 3 AM debugging marathons for the distributed systems lab will forever be legendary! Proud to graduate alongside you. Let's conquer Silicon Valley together! 🎓💻",
  },
  {
    id: "sig-2",
    authorName: "Alex Rivera",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC5GY7O5cwEHCv_uXRtHcBs2kj7yc6DygT8MCXUgYLegkJt4UmzYVVHA_UPs-9d6UBKCbQ25xU5NwWa-wP96xw4RUDP2cefHqdlp6rmJpRO8QuCeJ-PSVBHWa51DFzt6mF5mkNySiM1oykvu-hmNEEKNs2VI0Ar9qPQfFoDU3y7dHOd3SqikkelWWMBMIsm75dxS3z_N9pKJc2NyESjOe3BTbndRSUsoKrtxAn17iUvE1MC847rnuhgsw",
    authorTrack: "AI & Machine Learning",
    date: "Oct 19, 2026",
    message:
      "Best capstone partner ever. From our first `Hello World` in freshman year to deploying AI pipelines, what a journey! Class of '26 for life! 🚀",
  },
  {
    id: "sig-3",
    authorName: "Sam Taylor",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCS6Dfafzx18d3Q3S93HE6bVM4NQ50RLdxlvj3q1e6YQVLSWteOFxknFiBVLNOn1UBCyT7pqRI_Sci1vSYlQPKw5F9ZzwdJnZ2qb1EGuLp_Kl1bxjfOULTEfl5GGKtEUvCPNcjS6_hWa5-oWiYYwksX4L-WZ9ZTRtw8mdZyNua9lZ-OOp5j0rXcKB1sHc6v33CP7IT8iWxNKupZTnZsu8TlY2Y-lmIL21cxXooIMY0R2kdl7FBkyK1Rjw",
    authorTrack: "UI/UX Engineering",
    date: "Oct 15, 2026",
    message: "Always having your frontend back! Don't forget to push your commits before graduation day! ✨",
  },
];

// Initial Notifications
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n-1",
    type: "message",
    title: "New message from Sarah Jenkins",
    description: "Are we still on for reviewing the Capstone architecture doc?",
    time: "10 mins ago",
    read: false,
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCyDT6-ktTvfpRGZwfsO_paU4KRwpNzpzaVi5eGer2p4q1QBff1JcSW_hgTa9GYJ-Nol7OWZBKyzukrMWZgl5Z4wbtYmokpjbsuXxgdckzKW92R8z6py3BvfiZE0M04TEgU3O31h8S7HHEITtbskAbaPGDc8AXi1xyWleloUfpJM3JHoLLBF88CqYXlwcvNiT_8tGX90M9J5wXFup-yoRPqL7gZWHnY_h7gkKUv0UTItQkFFBq7NcsHPQ",
  },
  {
    id: "n-2",
    type: "like",
    title: "Alex Rivera liked your post",
    description: "Our Senior Capstone project 'DevPulse' just passed 10k req/s...",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "n-3",
    type: "event",
    title: "Event Reminder",
    description: "Senior Capstone Demo Expo starts in 4 days at Engineering Atrium.",
    time: "3 hours ago",
    read: true,
  },
];

// Rich Digital Yearbook Memory Vault (Class of 2026)
export const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: "mem-1",
    title: "Senior Capstone Final Prototype Launch",
    story:
      "After 8 straight months of whiteboarding, distributed microservices refactoring, and hundreds of git commits, team 'DevPulse' delivered our working live demo to faculty judges! A milestone we will remember forever.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDqevVO5_wHxhoQDc4KRJHtQwo3DPY1n-8I7xivRIAY-oVmzxZruRcIb3djwnzfBLgNk1jJsW-BdyWVzREJ6Mq4BVhnp1XyYvB5a5fMAHRzcSgPBeDummr6XPPXuRiIDESfaRfvQOrg87-nP2QbJd7AhuxsCiPZIiho8b2jmNCBVClqxoudmn4nH0Q0GNt0ED5H8yBNdCkFIrOkB-TMrCoUEAVXwQqIeBen-2Vb_1klmV01mZOP8H0U_A",
    category: "Graduation",
    year: "2026",
    date: "April 18, 2026",
    location: "Engineering Innovation Auditorium",
    authorId: "current-user",
    authorName: "Alex Chen",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDMLGCNKFCr7a7iihM-ILAGx8wgcjhWgZ6G9lJSFTgXX8c4dhm_MAMiOziO1tPRIZaGgUvGtj3JyOqKyMhS6EWpNky4VhuTuknCyMt2oOsex1Fyx05WN93WpuKdhefX1W3Ma7HeRAXg1V3KV7DQnTSnAqLGOLja6D0RFGfkWrDAVJjJMEpzzIYxzuGGz8wX8eJaIWkzL6xquakSbjuJHPk7TyZZEMh8CfC2-Bo7omnHCyl-El_nMOaoKA",
    taggedClassmates: [
      {
        id: "sarah-jenkins",
        name: "Sarah Jenkins",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCyDT6-ktTvfpRGZwfsO_paU4KRwpNzpzaVi5eGer2p4q1QBff1JcSW_hgTa9GYJ-Nol7OWZBKyzukrMWZgl5Z4wbtYmokpjbsuXxgdckzKW92R8z6py3BvfiZE0M04TEgU3O31h8S7HHEITtbskAbaPGDc8AXi1xyWleloUfpJM3JHoLLBF88CqYXlwcvNiT_8tGX90M9J5wXFup-yoRPqL7gZWHnY_h7gkKUv0UTItQkFFBq7NcsHPQ",
      },
      {
        id: "alex-rivera",
        name: "Alex Rivera",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuC5GY7O5cwEHCv_uXRtHcBs2kj7yc6DygT8MCXUgYLegkJt4UmzYVVHA_UPs-9d6UBKCbQ25xU5NwWa-wP96xw4RUDP2cefHqdlp6rmJpRO8QuCeJ-PSVBHWa51DFzt6mF5mkNySiM1oykvu-hmNEEKNs2VI0Ar9qPQfFoDU3y7dHOd3SqikkelWWMBMIsm75dxS3z_N9pKJc2NyESjOe3BTbndRSUsoKrtxAn17iUvE1MC847rnuhgsw",
      },
    ],
    likesCount: 84,
    isLiked: true,
    aspect: "featured",
    comments: [
      {
        id: "mc-1",
        authorName: "Sarah Jenkins",
        authorAvatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCyDT6-ktTvfpRGZwfsO_paU4KRwpNzpzaVi5eGer2p4q1QBff1JcSW_hgTa9GYJ-Nol7OWZBKyzukrMWZgl5Z4wbtYmokpjbsuXxgdckzKW92R8z6py3BvfiZE0M04TEgU3O31h8S7HHEITtbskAbaPGDc8AXi1xyWleloUfpJM3JHoLLBF88CqYXlwcvNiT_8tGX90M9J5wXFup-yoRPqL7gZWHnY_h7gkKUv0UTItQkFFBq7NcsHPQ",
        timeAgo: "2 days ago",
        content: "Still can't believe the cluster held up during the live chaos testing demo! Proud of us.",
      },
    ],
  },
  {
    id: "mem-2",
    title: "Late Night 3 AM Algorithms Cram Session",
    story:
      "Red Bull cans everywhere, 4 whiteboards filled with dynamic programming trees, and laughing hysterically at Dijkstra's shortest path edge cases in the CS basement.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDVKSi5KNEGsCkJ978c4-ItkyffXdqLQkoV9YtsZtAMwuAZn0LrFoFjc2pCWQM6dMeixLe30ykUPrz7j2XJ0AuSVE6TpQC_cf6JbwivOFctHZOhCw9LkZky8LUqCZPVaBkb7uvIY8zVMJB5Aympx1AvHKbAC7wXwWPq8zH3TpWS6G2eI4lS9d9tSosBXAZKsxFuuPVYWf_3lM20LgCkBWOCzq_0BPpoYRytLaeznmqYKUnn9bGc-d9_QA",
    category: "Campus Life",
    year: "2025",
    date: "November 14, 2025",
    location: "Turing Hall Study Lounge, Room 204",
    authorId: "alex-rivera",
    authorName: "Alex Rivera",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC5GY7O5cwEHCv_uXRtHcBs2kj7yc6DygT8MCXUgYLegkJt4UmzYVVHA_UPs-9d6UBKCbQ25xU5NwWa-wP96xw4RUDP2cefHqdlp6rmJpRO8QuCeJ-PSVBHWa51DFzt6mF5mkNySiM1oykvu-hmNEEKNs2VI0Ar9qPQfFoDU3y7dHOd3SqikkelWWMBMIsm75dxS3z_N9pKJc2NyESjOe3BTbndRSUsoKrtxAn17iUvE1MC847rnuhgsw",
    taggedClassmates: [
      {
        id: "current-user",
        name: "Alex Chen",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDMLGCNKFCr7a7iihM-ILAGx8wgcjhWgZ6G9lJSFTgXX8c4dhm_MAMiOziO1tPRIZaGgUvGtj3JyOqKyMhS6EWpNky4VhuTuknCyMt2oOsex1Fyx05WN93WpuKdhefX1W3Ma7HeRAXg1V3KV7DQnTSnAqLGOLja6D0RFGfkWrDAVJjJMEpzzIYxzuGGz8wX8eJaIWkzL6xquakSbjuJHPk7TyZZEMh8CfC2-Bo7omnHCyl-El_nMOaoKA",
      },
      {
        id: "jordan-lee",
        name: "Jordan Lee",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCVo6a4oI5Qv3KUl190xpqnSuZYjmt15ULGjauVqKOmiruyZe_MoRKVIK7NfKeysAy9cQiPITkdozgh1mh9LO2mXZEeALFMPymGhj9xBMhFBvq9q3916BjlocdL1D9sqk1mJtnRpBY_HJtm4sYPr-UZi3obt9MK7ftd5YMiKXxi6HOEzzilpaW6uiqUN7FOAS1QpIiqtdf7BdVJQJeDHEeyuNK-oqa3jIAlloNcJduOxPZcqWVX1sst8A",
      },
    ],
    likesCount: 67,
    isLiked: false,
    aspect: "tall",
    comments: [],
  },
  {
    id: "mem-3",
    title: "1st Place Champions - Inter-University Hackathon",
    story:
      "36 hours without sleep, built an on-device robotics spatial navigation agent in Rust and WebGPU, and took home the Grand Trophy for the Software Engineering department!",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCgcOuqBJPMpAwZ7k8OfkIjFTwhRdHQX8O959hDa99ZHSZlk9xLaGKl0D1tGwRvvINb9QeMHrRrughUkT_-LTY913UKn4ZXkmkIfuultPcc6nPJs4o3I4QGgTZmfRMjp8j-nAbCnBs-Si-1UzqZhzs5bNZ9A0td6JQSNYlhCf372mVjgeijXka6P82gAw4aLSnks0lZu7OStMuMVg5xajitMnalvMePKl7qySNfG2QeuesrK83GXQNvCA",
    category: "Class Events",
    year: "2025",
    date: "October 12, 2025",
    location: "Metropolitan Tech Pavilion",
    authorId: "maya-patel",
    authorName: "Maya Patel",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuABaVbmkXdaAA4_u8SG2RVoDy6SqSkPlEJDuVe-34Ri4efRh5i5FXZGg6a-kr9GuO0yXghqnJH09jUF8C2tzTN-CbBLD7zUw7ZT4FPVRhShOCjOqGXGRiozOsZ9dJAnFn2B_QhjT3KZt-rUmvnP7fNtjg0UtcVVg6uoJNxCV29lGxmdkxODlyTR4rVXHCVSmF6J-Ac3vxoay_iXhNVAU675m4w6uDDmlmDwhMFw6oimPy7eAbM3bAXaMw",
    likesCount: 118,
    isLiked: true,
    aspect: "wide",
    comments: [],
  },
  {
    id: "mem-4",
    title: "Senior Class Yosemite Cabin Retreat",
    story:
      "Escaping the IDEs and laptops for an unforgettable weekend under the redwoods, stargazing, campfire marshmallow roasts, and telling our wildest freshman coding stories.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDL89L9PaJ9NEi-lfnwJ5qTDX1cbySDaTvCeYF9k33qDbkrFRk6m8EHpKOtBPCr3Jf48aRrjdnyEorml_ONa40iQTxiUHEpBbtdH4sl66eA649UZsBaA7lXP4D3z9w40oHosCwG_DAHI4VqiuYX7Fi7X7rTqqhKJPDPbqSIAVlAz22VBTEaG82CVcc2_pPGcSxy5hjDkeI6L1jEy1NpJkOECRZIiJGQ8yZm2f2A2VhveeoJYGenEuScWg",
    category: "Trips",
    year: "2025",
    date: "September 02, 2025",
    location: "Yosemite National Park Valley",
    authorId: "sam-taylor",
    authorName: "Sam Taylor",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCS6Dfafzx18d3Q3S93HE6bVM4NQ50RLdxlvj3q1e6YQVLSWteOFxknFiBVLNOn1UBCyT7pqRI_Sci1vSYlQPKw5F9ZzwdJnZ2qb1EGuLp_Kl1bxjfOULTEfl5GGKtEUvCPNcjS6_hWa5-oWiYYwksX4L-WZ9ZTRtw8mdZyNua9lZ-OOp5j0rXcKB1sHc6v33CP7IT8iWxNKupZTnZsu8TlY2Y-lmIL21cxXooIMY0R2kdl7FBkyK1Rjw",
    taggedClassmates: [
      {
        id: "david-kim",
        name: "David Kim",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDMpoJ016780KIy0SgtW0A-ldQiOnYrQlYXljNVzTURuURt6dQ4S9lDCLcZUtDOT-a4mT2ZLcRjc9BSYNcAXTI7TbHQbVrEYWfSPfPe-TDEVLxyvKQij3NQt7VTw8Vx1K6d_wnsUlC5gAPTvjXC-iieC8jqqoeGgwR9CVPxzKwIDfNCcInfWcKNdo30b3DBRpoUN7ZGs1-smidSzmDUNPFHNNrrdWkypG0BAfuiP9nCNM2FJGSzhbG2Mg",
      },
    ],
    likesCount: 92,
    isLiked: false,
    aspect: "square",
    comments: [],
  },
  {
    id: "mem-5",
    title: "When the Production Database Seed Accidentally Dropped",
    story:
      "The exact moment during our Sophomore database systems class when somebody typed `DROP TABLE users;` on the live demo server. The collective gasp across 150 students was pure cinematic comedy.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA_9Dak6Gw2NMOfsHraBsnp50b5H4GNZDWHdVKUhqQPmViOiVAe3_lDSaMSPy8T1829gtlccidWMTTlG293aTbZYeLeyXa9dg5e68NqtuMOxu01PtCaps2rd3VK1kmWcUF1H-h5J1kU9uvGFkztsvZ1lLEzfYn4_u9cOPVMtPbPXcpWE4rK7uK2ffDEE1cUlnrthHdZqgf0Ho6CCDn5EKA-GIsGB5w4WvocweWhAJZau37ag9hLoyOf-Q",
    category: "Funny Moments",
    year: "2024",
    date: "March 15, 2024",
    location: "CS Lecture Hall 101",
    authorId: "jordan-lee",
    authorName: "Jordan Lee",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCVo6a4oI5Qv3KUl190xpqnSuZYjmt15ULGjauVqKOmiruyZe_MoRKVIK7NfKeysAy9cQiPITkdozgh1mh9LO2mXZEeALFMPymGhj9xBMhFBvq9q3916BjlocdL1D9sqk1mJtnRpBY_HJtm4sYPr-UZi3obt9MK7ftd5YMiKXxi6HOEzzilpaW6uiqUN7FOAS1QpIiqtdf7BdVJQJeDHEeyuNK-oqa3jIAlloNcJduOxPZcqWVX1sst8A",
    likesCount: 145,
    isLiked: true,
    aspect: "tall",
    comments: [],
  },
  {
    id: "mem-6",
    title: "Freshman Year 'Hello World' Lab 1",
    story:
      "Day 1 in September 2022. We were nervous, didn't know what a pointer was, and spent 2 hours figuring out why the C compiler was yelling about a missing semicolon. Look at where we are now!",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD-8_4OIWUx9-YFYuzTuwPrDZVPig1ofbP_x4hESMcy_EhRWYmwh852WZnRZ_5QFPh6NKz-yzb8HyQHxdywfAzx3av5oxDQH0sFoHmHW5zCacywcr5VedZVcfxUpuigktGkJ8zpnuC2VEg9SbMRx9zd1xNkGlJUB0wumSe2dl90ZlKIf6b14dvHWVDcF7B7b64IVstsI2rHoOBxOvffVnXwJxVwS5v4yTLXrR71BqoKWVkqy5OAjO3hpw",
    category: "Throwbacks",
    year: "2022",
    date: "September 08, 2022",
    location: "Freshman Engineering Lab A",
    authorId: "current-user",
    authorName: "Alex Chen",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDMLGCNKFCr7a7iihM-ILAGx8wgcjhWgZ6G9lJSFTgXX8c4dhm_MAMiOziO1tPRIZaGgUvGtj3JyOqKyMhS6EWpNky4VhuTuknCyMt2oOsex1Fyx05WN93WpuKdhefX1W3Ma7HeRAXg1V3KV7DQnTSnAqLGOLja6D0RFGfkWrDAVJjJMEpzzIYxzuGGz8wX8eJaIWkzL6xquakSbjuJHPk7TyZZEMh8CfC2-Bo7omnHCyl-El_nMOaoKA",
    likesCount: 160,
    isLiked: true,
    aspect: "square",
    comments: [],
  },
  {
    id: "mem-7",
    title: "Robotics Arena Autonomous Drone Flight Test",
    story:
      "First successful zero-crash obstacle navigation through the quad obstacle maze! The entire lab erupted when the telemetry confirmed sub-5ms control loop response.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDqevVO5_wHxhoQDc4KRJHtQwo3DPY1n-8I7xivRIAY-oVmzxZruRcIb3djwnzfBLgNk1jJsW-BdyWVzREJ6Mq4BVhnp1XyYvB5a5fMAHRzcSgPBeDummr6XPPXuRiIDESfaRfvQOrg87-nP2QbJd7AhuxsCiPZIiho8b2jmNCBVClqxoudmn4nH0Q0GNt0ED5H8yBNdCkFIrOkB-TMrCoUEAVXwQqIeBen-2Vb_1klmV01mZOP8H0U_A",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    category: "Graduation",
    year: "2026",
    date: "April 05, 2026",
    location: "Robotics Research Wing Arena",
    authorId: "maya-patel",
    authorName: "Maya Patel",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuABaVbmkXdaAA4_u8SG2RVoDy6SqSkPlEJDuVe-34Ri4efRh5i5FXZGg6a-kr9GuO0yXghqnJH09jUF8C2tzTN-CbBLD7zUw7ZT4FPVRhShOCjOqGXGRiozOsZ9dJAnFn2B_QhjT3KZt-rUmvnP7fNtjg0UtcVVg6uoJNxCV29lGxmdkxODlyTR4rVXHCVSmF6J-Ac3vxoay_iXhNVAU675m4w6uDDmlmDwhMFw6oimPy7eAbM3bAXaMw",
    likesCount: 98,
    isLiked: false,
    aspect: "wide",
    comments: [],
  },
  {
    id: "mem-8",
    title: "Senior Sunset Rooftop Hangout",
    story:
      "Watching the sunset from the North Campus rooftop after turning in our final software systems lab. Grateful for this chosen family of engineers and creators.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCgcOuqBJPMpAwZ7k8OfkIjFTwhRdHQX8O959hDa99ZHSZlk9xLaGKl0D1tGwRvvINb9QeMHrRrughUkT_-LTY913UKn4ZXkmkIfuultPcc6nPJs4o3I4QGgTZmfRMjp8j-nAbCnBs-Si-1UzqZhzs5bNZ9A0td6JQSNYlhCf372mVjgeijXka6P82gAw4aLSnks0lZu7OStMuMVg5xajitMnalvMePKl7qySNfG2QeuesrK83GXQNvCA",
    category: "Friends",
    year: "2026",
    date: "May 01, 2026",
    location: "North Quad Tower Rooftop",
    authorId: "david-kim",
    authorName: "David Kim",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDMpoJ016780KIy0SgtW0A-ldQiOnYrQlYXljNVzTURuURt6dQ4S9lDCLcZUtDOT-a4mT2ZLcRjc9BSYNcAXTI7TbHQbVrEYWfSPfPe-TDEVLxyvKQij3NQt7VTw8Vx1K6d_wnsUlC5gAPTvjXC-iieC8jqqoeGgwR9CVPxzKwIDfNCcInfWcKNdo30b3DBRpoUN7ZGs1-smidSzmDUNPFHNNrrdWkypG0BAfuiP9nCNM2FJGSzhbG2Mg",
    taggedClassmates: [
      {
        id: "alex-rivera",
        name: "Alex Rivera",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuC5GY7O5cwEHCv_uXRtHcBs2kj7yc6DygT8MCXUgYLegkJt4UmzYVVHA_UPs-9d6UBKCbQ25xU5NwWa-wP96xw4RUDP2cefHqdlp6rmJpRO8QuCeJ-PSVBHWa51DFzt6mF5mkNySiM1oykvu-hmNEEKNs2VI0Ar9qPQfFoDU3y7dHOd3SqikkelWWMBMIsm75dxS3z_N9pKJc2NyESjOe3BTbndRSUsoKrtxAn17iUvE1MC847rnuhgsw",
      },
      {
        id: "sarah-jenkins",
        name: "Sarah Jenkins",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCyDT6-ktTvfpRGZwfsO_paU4KRwpNzpzaVi5eGer2p4q1QBff1JcSW_hgTa9GYJ-Nol7OWZBKyzukrMWZgl5Z4wbtYmokpjbsuXxgdckzKW92R8z6py3BvfiZE0M04TEgU3O31h8S7HHEITtbskAbaPGDc8AXi1xyWleloUfpJM3JHoLLBF88CqYXlwcvNiT_8tGX90M9J5wXFup-yoRPqL7gZWHnY_h7gkKUv0UTItQkFFBq7NcsHPQ",
      },
    ],
    likesCount: 124,
    isLiked: true,
    aspect: "square",
    comments: [],
  },
  {
    id: "mem-9",
    title: "Junior Year IEEE Silicon Valley Tech Trek",
    story:
      "Toured Google, Anthropic, and Figma headquarters with 25 of our classmates! Meeting alumni SWEs who graduated 5 years ago gave all of us so much inspiration for our senior year.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDVKSi5KNEGsCkJ978c4-ItkyffXdqLQkoV9YtsZtAMwuAZn0LrFoFjc2pCWQM6dMeixLe30ykUPrz7j2XJ0AuSVE6TpQC_cf6JbwivOFctHZOhCw9LkZky8LUqCZPVaBkb7uvIY8zVMJB5Aympx1AvHKbAC7wXwWPq8zH3TpWS6G2eI4lS9d9tSosBXAZKsxFuuPVYWf_3lM20LgCkBWOCzq_0BPpoYRytLaeznmqYKUnn9bGc-d9_QA",
    category: "Trips",
    year: "2025",
    date: "January 20, 2025",
    location: "San Francisco & Mountain View, CA",
    authorId: "sarah-jenkins",
    authorName: "Sarah Jenkins",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCyDT6-ktTvfpRGZwfsO_paU4KRwpNzpzaVi5eGer2p4q1QBff1JcSW_hgTa9GYJ-Nol7OWZBKyzukrMWZgl5Z4wbtYmokpjbsuXxgdckzKW92R8z6py3BvfiZE0M04TEgU3O31h8S7HHEITtbskAbaPGDc8AXi1xyWleloUfpJM3JHoLLBF88CqYXlwcvNiT_8tGX90M9J5wXFup-yoRPqL7gZWHnY_h7gkKUv0UTItQkFFBq7NcsHPQ",
    likesCount: 105,
    isLiked: false,
    aspect: "tall",
    comments: [],
  },
  {
    id: "mem-10",
    title: "Sophomore Year Midnight Pancake Breakfast",
    story:
      "Midnight breakfast hosted by the SE faculty right before finals week. Syrup, coding debates, and good vibes when we needed it most.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDL89L9PaJ9NEi-lfnwJ5qTDX1cbySDaTvCeYF9k33qDbkrFRk6m8EHpKOtBPCr3Jf48aRrjdnyEorml_ONa40iQTxiUHEpBbtdH4sl66eA649UZsBaA7lXP4D3z9w40oHosCwG_DAHI4VqiuYX7Fi7X7rTqqhKJPDPbqSIAVlAz22VBTEaG82CVcc2_pPGcSxy5hjDkeI6L1jEy1NpJkOECRZIiJGQ8yZm2f2A2VhveeoJYGenEuScWg",
    category: "Campus Life",
    year: "2024",
    date: "December 10, 2024",
    location: "Campus Dining Commons",
    authorId: "sam-taylor",
    authorName: "Sam Taylor",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCS6Dfafzx18d3Q3S93HE6bVM4NQ50RLdxlvj3q1e6YQVLSWteOFxknFiBVLNOn1UBCyT7pqRI_Sci1vSYlQPKw5F9ZzwdJnZ2qb1EGuLp_Kl1bxjfOULTEfl5GGKtEUvCPNcjS6_hWa5-oWiYYwksX4L-WZ9ZTRtw8mdZyNua9lZ-OOp5j0rXcKB1sHc6v33CP7IT8iWxNKupZTnZsu8TlY2Y-lmIL21cxXooIMY0R2kdl7FBkyK1Rjw",
    likesCount: 79,
    isLiked: false,
    aspect: "square",
    comments: [],
  },
  {
    id: "mem-11",
    title: "Freshman Orientation Scavenger Hunt",
    story:
      "Our very first weekend together as a cohort in Fall 2022! We had to decode binary messages hidden around the science library to win free department hoodies.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA_9Dak6Gw2NMOfsHraBsnp50b5H4GNZDWHdVKUhqQPmViOiVAe3_lDSaMSPy8T1829gtlccidWMTTlG293aTbZYeLeyXa9dg5e68NqtuMOxu01PtCaps2rd3VK1kmWcUF1H-h5J1kU9uvGFkztsvZ1lLEzfYn4_u9cOPVMtPbPXcpWE4rK7uK2ffDEE1cUlnrthHdZqgf0Ho6CCDn5EKA-GIsGB5w4WvocweWhAJZau37ag9hLoyOf-Q",
    category: "Throwbacks",
    year: "2022",
    date: "August 28, 2022",
    location: "University Main Quad",
    authorId: "current-user",
    authorName: "Alex Chen",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDMLGCNKFCr7a7iihM-ILAGx8wgcjhWgZ6G9lJSFTgXX8c4dhm_MAMiOziO1tPRIZaGgUvGtj3JyOqKyMhS6EWpNky4VhuTuknCyMt2oOsex1Fyx05WN93WpuKdhefX1W3Ma7HeRAXg1V3KV7DQnTSnAqLGOLja6D0RFGfkWrDAVJjJMEpzzIYxzuGGz8wX8eJaIWkzL6xquakSbjuJHPk7TyZZEMh8CfC2-Bo7omnHCyl-El_nMOaoKA",
    likesCount: 133,
    isLiked: true,
    aspect: "tall",
    comments: [],
  },
  {
    id: "mem-12",
    title: "Annual Faculty vs SE Seniors Trivia Night",
    story:
      "The seniors actually beat the professors by 1 point on the final question about retro 1980s programming language quirks! 🏆",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD-8_4OIWUx9-YFYuzTuwPrDZVPig1ofbP_x4hESMcy_EhRWYmwh852WZnRZ_5QFPh6NKz-yzb8HyQHxdywfAzx3av5oxDQH0sFoHmHW5zCacywcr5VedZVcfxUpuigktGkJ8zpnuC2VEg9SbMRx9zd1xNkGlJUB0wumSe2dl90ZlKIf6b14dvHWVDcF7B7b64IVstsI2rHoOBxOvffVnXwJxVwS5v4yTLXrR71BqoKWVkqy5OAjO3hpw",
    category: "Other",
    year: "2026",
    date: "February 27, 2026",
    location: "Engineering Faculty Lounge",
    authorId: "jordan-lee",
    authorName: "Jordan Lee",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCVo6a4oI5Qv3KUl190xpqnSuZYjmt15ULGjauVqKOmiruyZe_MoRKVIK7NfKeysAy9cQiPITkdozgh1mh9LO2mXZEeALFMPymGhj9xBMhFBvq9q3916BjlocdL1D9sqk1mJtnRpBY_HJtm4sYPr-UZi3obt9MK7ftd5YMiKXxi6HOEzzilpaW6uiqUN7FOAS1QpIiqtdf7BdVJQJeDHEeyuNK-oqa3jIAlloNcJduOxPZcqWVX1sst8A",
    likesCount: 88,
    isLiked: false,
    aspect: "square",
    comments: [],
  },
  {
    id: "mem-13",
    title: "Sophomore Year Data Structures Whiteboard Battle",
    story:
      "Balancing Red-Black trees and AVL rotation challenges on four floor-to-ceiling glass boards. The moment when everyone finally understood tree rotations was pure euphoria.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDL89L9PaJ9NEi-lfnwJ5qTDX1cbySDaTvCeYF9k33qDbkrFRk6m8EHpKOtBPCr3Jf48aRrjdnyEorml_ONa40iQTxiUHEpBbtdH4sl66eA649UZsBaA7lXP4D3z9w40oHosCwG_DAHI4VqiuYX7Fi7X7rTqqhKJPDPbqSIAVlAz22VBTEaG82CVcc2_pPGcSxy5hjDkeI6L1jEy1NpJkOECRZIiJGQ8yZm2f2A2VhveeoJYGenEuScWg",
    category: "Class Events",
    year: "2023",
    date: "November 19, 2023",
    location: "Turing Lab 304",
    authorId: "elena-rostova",
    authorName: "Elena Rostova",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA70IcVh69EPpOaJi9kJJGl_oT5Sr06Hs3iVOYBsSVlDqGoCqksUZkgcqij1s5r4nXhTzWoUshTREPc6SRAachQ5VUKub24zzmlmAMyFNvYjJIqWdLupHG9HMyezEudnx-dV8_rxOL8huwyiMOFc60s2vLR2TE8cDxaasTMPa8cVoNYKJW-YLtboVJ9yl_degknb-wUyvRjT2xq944GgVun258mk2rVgJKHrkMMpCd9IhzAqx9E3kG3Hw",
    likesCount: 112,
    isLiked: true,
    aspect: "wide",
    comments: [],
  },
  {
    id: "mem-14",
    title: "Spring Break Beach Campfire Jam",
    story:
      "Singing acoustic guitar songs, roasting s'mores, and debating tabs vs spaces under the stars by the Pacific Ocean waves. Best class bonding trip ever.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCgcOuqBJPMpAwZ7k8OfkIjFTwhRdHQX8O959hDa99ZHSZlk9xLaGKl0D1tGwRvvINb9QeMHrRrughUkT_-LTY913UKn4ZXkmkIfuultPcc6nPJs4o3I4QGgTZmfRMjp8j-nAbCnBs-Si-1UzqZhzs5bNZ9A0td6JQSNYlhCf372mVjgeijXka6P82gAw4aLSnks0lZu7OStMuMVg5xajitMnalvMePKl7qySNfG2QeuesrK83GXQNvCA",
    category: "Trips",
    year: "2024",
    date: "March 28, 2024",
    location: "Half Moon Bay Coast",
    authorId: "casey-chen",
    authorName: "Casey Chen",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBqJ-NreNGNWq4Y6JRkMyPreWs_Punom6TI_ZOZwPekBR2jv0rT-6UOWRhKoNG0WtpaC-q0zKbhx1bxgd5SaP92DOdjKuN-8soayHuc7wqJJEaamsGAUeo4E9jHoL0Mlsr457C4H_bG9q-h-gbUO_qNVI5uC6lB2ycMl-iCcIsoy48xAuS9SlLPH_paCf_fU2TDkTe07sQK_XFfDFuJu7nZeZxorJfM1NUedf8plM0_nMLQkw0ltMGQtQ",
    taggedClassmates: [
      {
        id: "current-user",
        name: "Alex Chen",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDMLGCNKFCr7a7iihM-ILAGx8wgcjhWgZ6G9lJSFTgXX8c4dhm_MAMiOziO1tPRIZaGgUvGtj3JyOqKyMhS6EWpNky4VhuTuknCyMt2oOsex1Fyx05WN93WpuKdhefX1W3Ma7HeRAXg1V3KV7DQnTSnAqLGOLja6D0RFGfkWrDAVJjJMEpzzIYxzuGGz8wX8eJaIWkzL6xquakSbjuJHPk7TyZZEMh8CfC2-Bo7omnHCyl-El_nMOaoKA",
      },
      {
        id: "morgan-smith",
        name: "Morgan Smith",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCX04sPyB22yuGZuiNKsFKb7KTymxooIWM99vUKaQmTnT-xEz_syJPwKi200YglU_N9LVUClz9rob57KzW3E-cSCuVxWurJiTz3b0wewvvkK6YNM5GgwNuAoFm-ihdzXv1clM_YBcvK9r8rlJGgBWq0J3swytQH--8_8ruBVQnH4999WN8hFaHjHqOBcoc6SDpCUWlRiuiszYbJBqipNCBGWIIu2XPIBOiFbg_R5A9cLQxUEa4SNeKdpw",
      },
    ],
    likesCount: 156,
    isLiked: false,
    aspect: "square",
    comments: [],
  },
  {
    id: "mem-15",
    title: "Fall 2020: Freshman Orientation & The First 'Hello World'",
    story:
      "September 2020! When our journey as the Phoenix Batch began. Meeting each other on video lectures, writing our very first lines of C and Python code, and dreaming about graduation 2026.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD-8_4OIWUx9-YFYuzTuwPrDZVPig1ofbP_x4hESMcy_EhRWYmwh852WZnRZ_5QFPh6NKz-yzb8HyQHxdywfAzx3av5oxDQH0sFoHmHW5zCacywcr5VedZVcfxUpuigktGkJ8zpnuC2VEg9SbMRx9zd1xNkGlJUB0wumSe2dl90ZlKIf6b14dvHWVDcF7B7b64IVstsI2rHoOBxOvffVnXwJxVwS5v4yTLXrR71BqoKWVkqy5OAjO3hpw",
    category: "Throwbacks",
    year: "2020",
    date: "September 15, 2020",
    location: "Freshman Virtual Lounge",
    authorId: "user-admin",
    authorName: "Alex Chen",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDMLGCNKFCr7a7iihM-ILAGx8wgcjhWgZ6G9lJSFTgXX8c4dhm_MAMiOziO1tPRIZaGgUvGtj3JyOqKyMhS6EWpNky4VhuTuknCyMt2oOsex1Fyx05WN93WpuKdhefX1W3Ma7HeRAXg1V3KV7DQnTSnAqLGOLja6D0RFGfkWrDAVJjJMEpzzIYxzuGGz8wX8eJaIWkzL6xquakSbjuJHPk7TyZZEMh8CfC2-Bo7omnHCyl-El_nMOaoKA",
    likesCount: 180,
    isLiked: true,
    aspect: "featured",
    comments: [],
  },
  {
    id: "mem-16",
    title: "Spring 2021: First In-Person Lab & Hardware Kit Unboxing",
    story:
      "Unboxing our microcontroller kits, soldering LED circuits, and writing embedded drivers together in the engineering workshop. The sparks in our eyes when the first breadboard blinking test passed!",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDL89L9PaJ9NEi-lfnwJ5qTDX1cbySDaTvCeYF9k33qDbkrFRk6m8EHpKOtBPCr3Jf48aRrjdnyEorml_ONa40iQTxiUHEpBbtdH4sl66eA649UZsBaA7lXP4D3z9w40oHosCwG_DAHI4VqiuYX7Fi7X7rTqqhKJPDPbqSIAVlAz22VBTEaG82CVcc2_pPGcSxy5hjDkeI6L1jEy1NpJkOECRZIiJGQ8yZm2f2A2VhveeoJYGenEuScWg",
    category: "Class Events",
    year: "2021",
    date: "April 22, 2021",
    location: "Embedded Systems Lab 102",
    authorId: "maya-patel",
    authorName: "Maya Patel",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuABaVbmkXdaAA4_u8SG2RVoDy6SqSkPlEJDuVe-34Ri4efRh5i5FXZGg6a-kr9GuO0yXghqnJH09jUF8C2tzTN-CbBLD7zUw7ZT4FPVRhShOCjOqGXGRiozOsZ9dJAnFn2B_QhjT3KZt-rUmvnP7fNtjg0UtcVVg6uoJNxCV29lGxmdkxODlyTR4rVXHCVSmF6J-Ac3vxoay_iXhNVAU675m4w6uDDmlmDwhMFw6oimPy7eAbM3bAXaMw",
    likesCount: 138,
    isLiked: false,
    aspect: "tall",
    comments: [],
  },
  {
    id: "mem-17",
    title: "Winter 2020: Midnight Discord Hackathon Sprint",
    story:
      "Our very first virtual 24-hour hackathon! We built a simple text-based multiplayer RPG in Python sockets while playing lofi beats on Discord at 4 AM.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDVKSi5KNEGsCkJ978c4-ItkyffXdqLQkoV9YtsZtAMwuAZn0LrFoFjc2pCWQM6dMeixLe30ykUPrz7j2XJ0AuSVE6TpQC_cf6JbwivOFctHZOhCw9LkZky8LUqCZPVaBkb7uvIY8zVMJB5Aympx1AvHKbAC7wXwWPq8zH3TpWS6G2eI4lS9d9tSosBXAZKsxFuuPVYWf_3lM20LgCkBWOCzq_0BPpoYRytLaeznmqYKUnn9bGc-d9_QA",
    category: "Campus Life",
    year: "2020",
    date: "December 18, 2020",
    location: "Discord Voice Channel #all-night-coders",
    authorId: "sarah-jenkins",
    authorName: "Sarah Jenkins",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCyDT6-ktTvfpRGZwfsO_paU4KRwpNzpzaVi5eGer2p4q1QBff1JcSW_hgTa9GYJ-Nol7OWZBKyzukrMWZgl5Z4wbtYmokpjbsuXxgdckzKW92R8z6py3BvfiZE0M04TEgU3O31h8S7HHEITtbskAbaPGDc8AXi1xyWleloUfpJM3JHoLLBF88CqYXlwcvNiT_8tGX90M9J5wXFup-yoRPqL7gZWHnY_h7gkKUv0UTItQkFFBq7NcsHPQ",
    likesCount: 144,
    isLiked: true,
    aspect: "wide",
    comments: [],
  },
];

