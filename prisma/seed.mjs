import "dotenv/config";
import bcrypt from "bcryptjs";
import pg from "pg";

const { Pool } = pg;

export async function seedDatabase(customConnectionString) {
  const connectionString =
    customConnectionString ||
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres2@localhost:5432/class_album?schema=public";

  const needsSsl =
    connectionString.includes("sslmode=require") ||
    connectionString.includes("render.com") ||
    connectionString.includes("neon.tech") ||
    connectionString.includes("supabase.co") ||
    process.env.PGSSLMODE === "require";

  const pool = new Pool({
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  });

  console.log("🌱 Starting PostgreSQL database seeding via pg pool...");

  const client = await pool.connect();
  try {
    // 1. Clean existing records in correct foreign key order
    console.log("Cleaning old records...");
    await client.query('DELETE FROM "Comment"');
    await client.query('DELETE FROM "PostLike"');
    await client.query('DELETE FROM "Post"');
    await client.query('DELETE FROM "Message"');
    await client.query('DELETE FROM "EventRSVP"');
    await client.query('DELETE FROM "TechEvent"');
    await client.query('DELETE FROM "YearbookSignature"');
    await client.query('DELETE FROM "User"');

    const defaultStudentPasswordHash = await bcrypt.hash("Student@2026!", 10);
    const adminPasswordHash = await bcrypt.hash("Admin@2026!", 10);

    // 2. Create Admin Account
    const adminRes = await client.query(
      `INSERT INTO "User" (
        id, username, email, password, role, "isActive", name, avatar, degree, "gradYear", track, "statusQuote", bio, dorm, skills, github, linkedin, connected, online, "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW()
      ) RETURNING id, username`,
      [
        "user-admin",
        "admin",
        "admin@phoenix2026.edu",
        adminPasswordHash,
        "ADMIN",
        true,
        "Phoenix Administrator",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        "Faculty / Staff",
        "2026",
        "Class Album Operations & Moderation",
        "Class album moderating & graduating cohort coordinator. 🛡️🔥",
        "Administrator overseeing the Phoenix Class of 2026 official album, directory verification, and security.",
        "Faculty Tower 101",
        ["System Security", "PostgreSQL", "Next.js", "Class Administration", "Platform Moderation"],
        "phoenix-admin",
        "phoenix-admin-2026",
        true,
        true,
      ]
    );
    console.log("✅ Created Admin Account:", adminRes.rows[0].username);

    // 3. Define 50 Rich Student Records
    const studentsData = [
      {
        id: "student-alex-chen",
        username: "alex.chen",
        name: "Alex Chen",
        email: "alex.chen@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
        track: "Full-Stack & AI Systems",
        statusQuote: "Senior Capstone team locked in! Building next-gen autonomous developer tools. 🚀",
        bio: "Passionate about architecting distributed software, reactive UI systems, and modern AI pipelines. Always down for a late-night hackathon or rooftop coffee chat.",
        dorm: "North Campus Tech Quad 402",
        skills: ["TypeScript", "Next.js", "Python", "PyTorch", "Rust", "GraphQL", "Docker", "AWS"],
        github: "alexchen-26",
        linkedin: "alexchen-se26",
        isActive: true,
      },
      {
        id: "student-sarah-jenkins",
        username: "sarah.jenkins",
        name: "Sarah Jenkins",
        email: "sarah.jenkins@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        track: "Full-Stack & Cloud Architecture",
        statusQuote: "Deploying our team's microservices cluster. Ready for senior capstone demo!",
        bio: "Full stack engineer obsessed with clean architectures, zero-downtime CI/CD pipelines, and high-performance React frontends.",
        dorm: "East Campus Tower B",
        skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Terraform", "Go"],
        github: "sjenkins-dev",
        linkedin: "sarah-jenkins-swe",
        isActive: true,
      },
      {
        id: "student-alex-rivera",
        username: "alex.rivera",
        name: "Alex Rivera",
        email: "alex.rivera@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        track: "AI & Machine Learning",
        statusQuote: "Summer SWE Internship secured! Anthropic AI lab here I come! 🎉",
        bio: "Focused on large-scale model optimization, LLM alignment, and reinforcement learning systems. IEEE SE Student Lead.",
        dorm: "Waverly Hall 312",
        skills: ["PyTorch", "CUDA", "FastAPI", "TensorRT", "Python", "Kubernetes"],
        github: "arivera-ml",
        linkedin: "alex-rivera-se",
        isActive: true,
      },
      {
        id: "student-jordan-lee",
        username: "jordan.lee",
        name: "Jordan Lee",
        email: "jordan.lee@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        track: "FinTech & Distributed Systems",
        statusQuote: "Building low-latency order execution engines. Quant club president. 📈",
        bio: "Specializing in high-frequency trading infra, memory-safe systems programming in C++ and Rust, and financial algorithms.",
        dorm: "West Campus Residential 204",
        skills: ["C++20", "Rust", "Kafka", "gRPC", "Redis", "Distributed Consensus"],
        github: "jordanlee-quant",
        linkedin: "jordan-lee-se",
        isActive: true,
      },
      {
        id: "student-sam-taylor",
        username: "sam.taylor",
        name: "Sam Taylor",
        email: "sam.taylor@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
        track: "UI/UX Engineering & Design Systems",
        statusQuote: "Design tokens are my love language. Revamping the department's web portal ✨",
        bio: "Bridging the bridge between aesthetic design and hardcore frontend engineering. Creator of campus CSS component library.",
        dorm: "South Gate Commons 108",
        skills: ["Tailwind CSS", "Figma", "Web Accessibility", "Animation", "Vue", "Next.js"],
        github: "samtaylor-ui",
        linkedin: "sam-taylor-design",
        isActive: true,
      },
      {
        id: "student-casey-chen",
        username: "casey.chen",
        name: "Casey Chen",
        email: "casey.chen@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
        track: "Cybersecurity & Cryptography",
        statusQuote: "Top 3 at National Collegiate Cyber Defense Competition! 🛡️",
        bio: "Reverse engineering, zero-day threat analysis, zero-trust network protocols, and cryptographic implementation.",
        dorm: "Founders Hall 415",
        skills: ["Rust", "GDB", "Wireshark", "Solidity", "Linux Kernel", "Reverse Eng"],
        github: "casey-security",
        linkedin: "casey-chen-sec",
        isActive: true,
      },
      {
        id: "student-morgan-smith",
        username: "morgan.smith",
        name: "Morgan Smith",
        email: "morgan.smith@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        track: "Cloud Infrastructure & DevOps",
        statusQuote: "Infrastructure as Code everything. Running 99.999% uptime campus servers.",
        bio: "Cloud native developer passionate about Kubernetes operators, GitOps workflows, automated testing, and multi-region deployment.",
        dorm: "University Village 12B",
        skills: ["Kubernetes", "Docker", "AWS", "GitHub Actions", "Ansible", "Go"],
        github: "morgansmith-ops",
        linkedin: "morgan-smith-devops",
        isActive: true,
      },
      {
        id: "student-david-kim",
        username: "david.kim",
        name: "David Kim",
        email: "david.kim@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
        track: "Mobile & iOS Systems",
        statusQuote: "Shipped our campus shuttle app to 10k monthly active students on App Store! 📱",
        bio: "Native iOS and Android engineer focusing on Swift 6, Kotlin Multiplatform, on-device ML inference, and buttery smooth 120fps gesture systems.",
        dorm: "Engineering Quad 210",
        skills: ["Swift", "SwiftUI", "Kotlin", "CoreML", "Flutter", "Combine"],
        github: "davidkim-mobile",
        linkedin: "david-kim-ios",
        isActive: true,
      },
      {
        id: "student-maya-patel",
        username: "maya.patel",
        name: "Maya Patel",
        email: "maya.patel@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
        track: "Robotics & Autonomous Software",
        statusQuote: "Our autonomous rover just mapped 5km of off-road terrain flawlessly! 🤖",
        bio: "Robotics software engineer working on ROS2, SLAM algorithms, computer vision pipelines, and embedded real-time flight controllers.",
        dorm: "Piedmont Court 501",
        skills: ["ROS2", "C++", "OpenCV", "Gazebo", "Python", "SLAM"],
        github: "mayapatel-robotics",
        linkedin: "maya-patel-robotics",
        isActive: true,
      },
      {
        id: "student-elena-rostova",
        username: "elena.rostova",
        name: "Elena Rostova",
        email: "elena.rostova@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
        track: "AI & Natural Language Processing",
        statusQuote: "Paper accepted at ACL 2026! Multimodal agents for code reasoning. 📄✨",
        bio: "Specializing in context window expansion, embedding spaces, and reasoning loops in transformer models.",
        dorm: "North Hall 202",
        skills: ["PyTorch", "Hugging Face", "Transformers", "Python", "Ray", "Triton"],
        github: "elena-nlp",
        linkedin: "elena-rostova",
        isActive: true,
      },
      {
        id: "student-liam-oconnor",
        username: "liam.oconnor",
        name: "Liam O'Connor",
        email: "liam.oconnor@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
        track: "Game Engine & Graphics Engineering",
        statusQuote: "Vulkan ray tracing engine running at 144 FPS in 4K. Let's make games!",
        bio: "Graphics developer passionate about GPU shaders, physics simulation, spatial audio engines, and Unreal C++ architecture.",
        dorm: "Pine Valley Suite 305",
        skills: ["Vulkan", "C++23", "HLSL", "Unreal Engine 5", "Metal", "Math"],
        github: "liam-graphics",
        linkedin: "liam-oconnor-engine",
        isActive: true,
      },
      {
        id: "student-chloe-zhao",
        username: "chloe.zhao",
        name: "Chloe Zhao",
        email: "chloe.zhao@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        track: "Data Engineering & Analytics",
        statusQuote: "Processed 10 TB logs pipeline with Apache Spark in under 4 minutes. ⚡",
        bio: "Architecting real-time streaming architectures, Snowflake warehouses, and lakehouse data infrastructures for high velocity workloads.",
        dorm: "South Tower 804",
        skills: ["Apache Spark", "Flink", "Snowflake", "dbt", "Airflow", "Scala"],
        github: "chloezhao-data",
        linkedin: "chloe-zhao-data",
        isActive: true,
      },
      {
        id: "student-marcus-vance",
        username: "marcus.vance",
        name: "Marcus Vance",
        email: "marcus.vance@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
        track: "Full-Stack & Distributed Systems",
        statusQuote: "Built a distributed raft consensus visualizer. Open source on GitHub! ⭐",
        bio: "Software craftsman into distributed protocols, WebAssembly edge runtimes, and resilient backends.",
        dorm: "West Quad 110",
        skills: ["Go", "Rust", "WebAssembly", "PostgreSQL", "Docker", "Next.js"],
        github: "marcusvance",
        linkedin: "marcus-vance-se",
        isActive: true,
      },
      {
        id: "student-priya-sharma",
        username: "priya.sharma",
        name: "Priya Sharma",
        email: "priya.sharma@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80",
        track: "Quantum Computing & Algorithms",
        statusQuote: "Simulating Shor's algorithm on Qiskit with error mitigation! 🌌",
        bio: "Investigating fault-tolerant quantum error correction, quantum state tomography, and hybrid classical-quantum algorithms.",
        dorm: "East Campus Suite 419",
        skills: ["Qiskit", "Cirq", "Python", "Linear Algebra", "C++", "JAX"],
        github: "priyasharma-q",
        linkedin: "priya-sharma-quantum",
        isActive: true,
      },
      {
        id: "student-noah-alvarez",
        username: "noah.alvarez",
        name: "Noah Alvarez",
        email: "noah.alvarez@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
        track: "Cybersecurity & Pentesting",
        statusQuote: "Ranked #1 in university CTF! Reverse engineered firmware binaries. 💻",
        bio: "Ethical hacker and vulnerability researcher. President of the University White Hat Cybersecurity Syndicate.",
        dorm: "Founders Hall 318",
        skills: ["Ghidra", "Burp Suite", "x86/ARM Assembly", "Python", "Metasploit"],
        github: "noahalvarez-sec",
        linkedin: "noah-alvarez-cyber",
        isActive: true,
      },
      {
        id: "student-hannah-schmidt",
        username: "hannah.schmidt",
        name: "Hannah Schmidt",
        email: "hannah.schmidt@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
        track: "Human-Computer Interaction & Frontend",
        statusQuote: "Building accessibility tools that make screen readers 3x faster. 🌈",
        bio: "Passionate about inclusive software design, accessible web technologies, voice interfaces, and micro-animations.",
        dorm: "Maple Courtyard 201",
        skills: ["React", "TypeScript", "ARIA", "CSS Grid", "Tailwind", "User Testing"],
        github: "hannah-hci",
        linkedin: "hannah-schmidt-hci",
        isActive: true,
      },
      {
        id: "student-aiden-brooks",
        username: "aiden.brooks",
        name: "Aiden Brooks",
        email: "aiden.brooks@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
        track: "Embedded Systems & IoT",
        statusQuote: "Designed an ESP32 LoRa mesh network covering the entire college campus! 📡",
        bio: "Hardware meets software: custom PCB design, C++ firmware development, FreeRTOS, and ultra low-power wireless nodes.",
        dorm: "Tech Hub 104",
        skills: ["C", "C++", "FreeRTOS", "ESP-IDF", "KiCad", "I2C/SPI", "MQTT"],
        github: "aidenbrooks-iot",
        linkedin: "aiden-brooks-embedded",
        isActive: true,
      },
      {
        id: "student-fatima-zahra",
        username: "fatima.zahra",
        name: "Fatima Zahra",
        email: "fatima.zahra@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1534751516642-a171edd25218?auto=format&fit=crop&w=400&q=80",
        track: "AI & Computer Vision",
        statusQuote: "Autonomous drone navigation without GPS - tested in university greenhouse! 🛰️",
        bio: "Focused on 3D Gaussian Splatting, real-time object tracking on Jetson chips, and semantic scene segmentation.",
        dorm: "North Hall 512",
        skills: ["PyTorch", "YOLOv10", "TensorRT", "OpenCV", "ROS2", "Python"],
        github: "fatima-cv",
        linkedin: "fatima-zahra-ai",
        isActive: true,
      },
      {
        id: "student-lucas-silva",
        username: "lucas.silva",
        name: "Lucas Silva",
        email: "lucas.silva@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80",
        track: "FinTech & Blockchain Protocols",
        statusQuote: "Audited smart contract layer for senior capstone DeFi liquidity protocol.",
        bio: "DeFi protocols, EVM bytecode optimization, zero-knowledge snarks, and quantitative trading modeling.",
        dorm: "West Campus Tower A",
        skills: ["Solidity", "Rust", "Foundry", "Ethers.js", "Python", "Go"],
        github: "lucassilva-defi",
        linkedin: "lucas-silva-crypto",
        isActive: true,
      },
      {
        id: "student-olivia-wong",
        username: "olivia.wong",
        name: "Olivia Wong",
        email: "olivia.wong@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
        track: "Cloud & Site Reliability Engineering",
        statusQuote: "Chaos engineering tests passed! Survives zone failure in 2 seconds. 🛠️",
        bio: "Automating fault injection, telemetry dashboards in Grafana/Prometheus, and elastic infrastructure scaling.",
        dorm: "University Village 8C",
        skills: ["Kubernetes", "Prometheus", "Grafana", "Terraform", "Go", "AWS"],
        github: "olivia-sre",
        linkedin: "olivia-wong-cloud",
        isActive: true,
      },
      {
        id: "student-ethan-hunt",
        username: "ethan.hunt",
        name: "Ethan Hunt",
        email: "ethan.hunt@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
        track: "Systems Programming & Linux Kernel",
        statusQuote: "Custom eBPF packet filter merged into research kernel tree! 🐧",
        bio: "Deep dive kernel hacker, memory management optimizer, and systems performance profiling enthusiast.",
        dorm: "East Wing 309",
        skills: ["C", "Rust", "eBPF", "Linux Kernel", "Perf", "GDB"],
        github: "ethanhunt-kernel",
        linkedin: "ethan-hunt-systems",
        isActive: true,
      },
      {
        id: "student-aaliyah-khan",
        username: "aaliyah.khan",
        name: "Aaliyah Khan",
        email: "aaliyah.khan@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
        track: "Bioinformatics & Computational Biology",
        statusQuote: "Accelerating CRISPR sequence alignment algorithms using GPU parallelism. 🧬",
        bio: "Developing computational genomics pipelines, molecular dynamics simulations, and deep learning for protein folding.",
        dorm: "Science Quad 403",
        skills: ["Python", "CUDA", "Nextflow", "Biopython", "PyTorch", "Docker"],
        github: "aaliyah-bioinfo",
        linkedin: "aaliyah-khan-bio",
        isActive: true,
      },
      {
        id: "student-kai-takahashi",
        username: "kai.takahashi",
        name: "Kai Takahashi",
        email: "kai.takahashi@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        track: "Game Engine & XR Development",
        statusQuote: "Apple Vision Pro spatial computing hackathon winner! 🕶️🎮",
        bio: "Building mixed reality tools, spatial hand tracking, shaders, and immersive interactive software.",
        dorm: "Arts & Tech Wing 204",
        skills: ["Swift", "visionOS", "Unity", "ShaderLab", "C#", "Blender"],
        github: "kaitakahashi-xr",
        linkedin: "kai-takahashi-dev",
        isActive: true,
      },
      {
        id: "student-sophia-martinez",
        username: "sophia.martinez",
        name: "Sophia Martinez",
        email: "sophia.martinez@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
        track: "Product Management & Full-Stack",
        statusQuote: "Organizing HackPhoenix 2026! Over 500 hackers attending this weekend. 💡",
        bio: "Bridging the gap between engineering execution and user empathy. Tech entrepreneur and hackathon lead organizer.",
        dorm: "Presidential Commons 602",
        skills: ["Product Strategy", "React", "Node.js", "User Research", "Agile", "Figma"],
        github: "sophiamartinez",
        linkedin: "sophia-martinez-pm",
        isActive: true,
      },
      {
        id: "student-benjamin-cooper",
        username: "benjamin.cooper",
        name: "Benjamin Cooper",
        email: "benjamin.cooper@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
        track: "Cloud Infrastructure & Distributed DBs",
        statusQuote: "Benchmarking CockroachDB vs TiDB multi-region latency. 📊",
        bio: "Database internal explorer, distributed consensus analyzer, and storage engine optimizer.",
        dorm: "North Hall 115",
        skills: ["PostgreSQL", "Go", "Distributed SQL", "Docker", "Kubernetes", "Kafka"],
        github: "bencooper-db",
        linkedin: "benjamin-cooper-db",
        isActive: true,
      },
      {
        id: "student-zara-hussain",
        username: "zara.hussain",
        name: "Zara Hussain",
        email: "zara.hussain@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
        track: "AI Ethics & Model Safety",
        statusQuote: "Presented research on red-teaming LLMs against adversarial jailbreaks. 🛡️",
        bio: "Dedicated to AI governance, interpretability methods, mechanist interpretability, and robust model alignment.",
        dorm: "East Campus Suite 220",
        skills: ["Python", "PyTorch", "TransformerLens", "SAE", "Ethics", "Policy"],
        github: "zarahussain-ai",
        linkedin: "zara-hussain-safety",
        isActive: true,
      },
      {
        id: "student-gabriel-rossi",
        username: "gabriel.rossi",
        name: "Gabriel Rossi",
        email: "gabriel.rossi@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
        track: "Audio DSP & Music Technology",
        statusQuote: "Created a real-time neural synthesizer VST plugin in C++ and JUCE! 🎵",
        bio: "Digital signal processing, real-time spatial acoustics, audio spatialization algorithms, and neural audio synthesis.",
        dorm: "Creative Arts Hall 311",
        skills: ["C++", "JUCE", "DSP", "PyTorch Audio", "SIMD", "MIDI"],
        github: "gabrielrossi-dsp",
        linkedin: "gabriel-rossi-audio",
        isActive: true,
      },
      {
        id: "student-emily-clark",
        username: "emily.clark",
        name: "Emily Clark",
        email: "emily.clark@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        track: "HealthTech & Medical Systems",
        statusQuote: "FDA validation pipeline for our medical image diagnostic AI complete! 🏥",
        bio: "Developing HIPAA-compliant cloud architectures, DICOM image segmentation pipelines, and hospital integration software.",
        dorm: "Health Science Court 109",
        skills: ["Python", "FastAPI", "React", "MONAI", "Docker", "HIPAA Compliance"],
        github: "emilyclark-health",
        linkedin: "emily-clark-healthtech",
        isActive: true,
      },
      {
        id: "student-diego-hernandez",
        username: "diego.hernandez",
        name: "Diego Hernandez",
        email: "diego.hernandez@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        track: "Autonomous Vehicles & Perception",
        statusQuote: "Tested our LiDAR point-cloud object detector in heavy rain conditions! 🚗💨",
        bio: "Autonomous driving perception engineer with focus on multi-sensor sensor fusion (Camera + Radar + LiDAR).",
        dorm: "West Campus 405",
        skills: ["C++", "CUDA", "PCL", "TensorRT", "ROS2", "Python"],
        github: "diegohernandez-av",
        linkedin: "diego-hernandez-auto",
        isActive: true,
      },
      {
        id: "student-ananya-deshmukh",
        username: "ananya.deshmukh",
        name: "Ananya Deshmukh",
        email: "ananya.deshmukh@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80",
        track: "Compiler Design & Programming Languages",
        statusQuote: "Implemented a custom optimizing JIT compiler backend in LLVM for capstone. ⚡",
        bio: "Fascinated by AST transformations, type systems, static analysis checkers, and garbage collector algorithms.",
        dorm: "Founders Hall 504",
        skills: ["Rust", "C++", "LLVM", "Type Theory", "Assembly", "Formal Methods"],
        github: "ananya-compiler",
        linkedin: "ananya-deshmukh-pl",
        isActive: true,
      },
      {
        id: "student-felix-bauer",
        username: "felix.bauer",
        name: "Felix Bauer",
        email: "felix.bauer@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
        track: "Energy Systems & Smart Grid Software",
        statusQuote: "Campus solar farm microgrid load balancer software is now active! ☀️🔋",
        bio: "Building industrial IoT controllers, power grid telemetry aggregation, and battery storage forecasting algorithms.",
        dorm: "Green Tech Tower 302",
        skills: ["Rust", "TimescaleDB", "MQTT", "Python", "Grafana", "Go"],
        github: "felixbauer-energy",
        linkedin: "felix-bauer-grid",
        isActive: true,
      },
      {
        id: "student-amara-okafor",
        username: "amara.okafor",
        name: "Amara Okafor",
        email: "amara.okafor@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1534751516642-a171edd25218?auto=format&fit=crop&w=400&q=80",
        track: "Full-Stack & EdTech Innovation",
        statusQuote: "Our interactive coding platform for middle schools hit 20k users! 🎓",
        bio: "Creating engaging educational tools, collaborative web editors, gamified learning paths, and browser IDEs.",
        dorm: "South Gate Commons 308",
        skills: ["Next.js", "WebSockets", "Monaco Editor", "Tailwind", "PostgreSQL", "Node.js"],
        github: "amaraokafor-ed",
        linkedin: "amara-okafor-edtech",
        isActive: true,
      },
      {
        id: "student-taras-shevchenko",
        username: "taras.shevchenko",
        name: "Taras Shevchenko",
        email: "taras.shevchenko@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80",
        track: "Cyber Defense & Threat Intelligence",
        statusQuote: "Published threat report on supply-chain open source package poisoning. 🕵️‍♂️",
        bio: "Analyzing malware signatures, kernel memory dump analysis, automated sandbox sandboxing, and SIEM rule engineering.",
        dorm: "East Wing 412",
        skills: ["Python", "YARA", "Snort", "Splunk", "C", "Docker"],
        github: "taras-threatintel",
        linkedin: "taras-shevchenko-sec",
        isActive: true,
      },
      {
        id: "student-lily-tran",
        username: "lily.tran",
        name: "Lily Tran",
        email: "lily.tran@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
        track: "Full-Stack & Creative Coding",
        statusQuote: "Generative generative art showcase live in the engineering atrium! 🎨💻",
        bio: "Blending Three.js shaders, WebGL canvas experiences, generative typography, and interactive audio-visual systems.",
        dorm: "Arts Quad 102",
        skills: ["Three.js", "WebGL", "GLSL", "React", "TypeScript", "GSAP"],
        github: "lilytran-creative",
        linkedin: "lily-tran-design",
        isActive: true,
      },
      {
        id: "student-vikram-mehta",
        username: "vikram.mehta",
        name: "Vikram Mehta",
        email: "vikram.mehta@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        track: "Distributed Storage & High Performance",
        statusQuote: "Re-implemented an append-only LSM tree database engine in Rust. 💾",
        bio: "Storage primitives, write amplification reduction, SSD caching algorithms, and NVMe optimization.",
        dorm: "North Tech Quad 201",
        skills: ["Rust", "C++", "LSM Trees", "B-Trees", "io_uring", "Linux"],
        github: "vikrammehta-db",
        linkedin: "vikram-mehta-storage",
        isActive: true,
      },
      {
        id: "student-nadia-popov",
        username: "nadia.popov",
        name: "Nadia Popov",
        email: "nadia.popov@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
        track: "DevSecOps & Zero Trust Architecture",
        statusQuote: "Automated container vulnerability scanning with automated PR auto-remediation! 🛡️",
        bio: "Integrating security gates into git workflows, cryptographic signing with Sigstore, and SPIFFE identity workloads.",
        dorm: "University Village 4A",
        skills: ["Kubernetes", "Sigstore", "Trivy", "Terraform", "GitHub Actions", "Go"],
        github: "nadiapopov-secops",
        linkedin: "nadia-popov-devsec",
        isActive: true,
      },
      {
        id: "student-oscar-lindqvist",
        username: "oscar.lindqvist",
        name: "Oscar Lindqvist",
        email: "oscar.lindqvist@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
        track: "Aerospace Software & Flight Control",
        statusQuote: "Flight flight simulator software hit real-time hardware-in-the-loop tests! 🚀",
        bio: "Avionics software developer, DO-178C safety critical standards, Kalman filtering, and attitude determination.",
        dorm: "West Campus 514",
        skills: ["C", "Ada", "Simulink", "C++", "Kalman Filters", "RTOS"],
        github: "oscarlindqvist-aero",
        linkedin: "oscar-lindqvist-flight",
        isActive: true,
      },
      {
        id: "student-leila-moradi",
        username: "leila.moradi",
        name: "Leila Moradi",
        email: "leila.moradi@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
        track: "AI & Graph Neural Networks",
        statusQuote: "Drug molecule interaction graph neural network trained on 1M compounds! 💊",
        bio: "Geometric deep learning, topological data analysis, knowledge graph embeddings, and drug discovery modeling.",
        dorm: "Science Court 310",
        skills: ["PyTorch Geometric", "DGL", "NetworkX", "Python", "Neo4j", "C++"],
        github: "leilamoradi-gnn",
        linkedin: "leila-moradi-ai",
        isActive: true,
      },
      {
        id: "student-mateo-fernandez",
        username: "mateo.fernandez",
        name: "Mateo Fernandez",
        email: "mateo.fernandez@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        track: "Mobile Android & Performance",
        statusQuote: "Rebuilt the campus dining app in Jetpack Compose. Startup time down 60%! ⚡",
        bio: "Deep Android platform engineering, Kotlin Coroutines, baseline profiles, and offline-first synchronization architecture.",
        dorm: "East Campus Suite 105",
        skills: ["Kotlin", "Jetpack Compose", "Coroutines", "Room", "Hilt", "Android NDK"],
        github: "mateofernandez-droid",
        linkedin: "mateo-fernandez-android",
        isActive: true,
      },
      {
        id: "student-yuki-tanaka",
        username: "yuki.tanaka",
        name: "Yuki Tanaka",
        email: "yuki.tanaka@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        track: "Robotic Swarms & Multi-Agent Systems",
        statusQuote: "Demonstrated 20-drone synchronized light and mapping dance outdoors! ✨🛰️",
        bio: "Flocking algorithms, decentralized auction protocols, peer-to-peer ad-hoc communication, and multi-robot SLAM.",
        dorm: "North Hall 408",
        skills: ["C++", "ROS2", "Python", "Crazyflie", "Algorithms", "Simulation"],
        github: "yukitanaka-swarms",
        linkedin: "yuki-tanaka-robotics",
        isActive: true,
      },
      {
        id: "student-clara-novak",
        username: "clara.novak",
        name: "Clara Novak",
        email: "clara.novak@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        track: "Full-Stack & Real-Time Collaboration",
        statusQuote: "Building a CRDT collaborative whiteboard with zero server lag! 🎨",
        bio: "Operational transforms, CRDTs (Yjs, Automerge), WebSockets, and ultra fast collaborative document engines.",
        dorm: "South Tower 402",
        skills: ["TypeScript", "CRDTs", "Yjs", "WebSockets", "React", "Canvas API"],
        github: "claranovak-crdt",
        linkedin: "clara-novak-collab",
        isActive: true,
      },
      {
        id: "student-samuel-adebayo",
        username: "samuel.adebayo",
        name: "Samuel Adebayo",
        email: "samuel.adebayo@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
        track: "FinTech & Payment Infrastructure",
        statusQuote: "Processed 50,000 test transactions with zero reconciliation discrepancy! 💳",
        bio: "Double-entry ledger systems, ISO20022 payment standards, fraud detection heuristic filters, and high resilience microservices.",
        dorm: "West Campus Residential 308",
        skills: ["Java", "Spring Boot", "PostgreSQL", "Kafka", "Docker", "AWS"],
        github: "samueladebayo-fin",
        linkedin: "samuel-adebayo-fintech",
        isActive: true,
      },
      {
        id: "student-isabella-rossi",
        username: "isabella.rossi",
        name: "Isabella Rossi",
        email: "isabella.rossi@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
        track: "AR & Spatial Audio Engineering",
        statusQuote: "Binaural audio acoustic engine for virtual campus tour complete! 🎧🏛️",
        bio: "Head-related transfer functions (HRTF), room impulse response convolution, Unity XR, and spatial acoustic physics.",
        dorm: "Creative Hall 215",
        skills: ["C++", "C#", "Unity", "Spatial Audio", "DSP", "Metal"],
        github: "isabellarossi-audio",
        linkedin: "isabella-rossi-spatial",
        isActive: true,
      },
      {
        id: "student-ibrahim-khalil",
        username: "ibrahim.khalil",
        name: "Ibrahim Khalil",
        email: "ibrahim.khalil@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
        track: "Autonomous Robotics & Control",
        statusQuote: "Model Predictive Control (MPC) running at 200 Hz on embedded STM32! 🏎️",
        bio: "Trajectory optimization, nonlinear dynamics, quadrotor aerobatic controllers, and embedded C optimization.",
        dorm: "Engineering Quad 411",
        skills: ["C++", "Python", "MPC", "Optimization", "MATLAB", "STM32"],
        github: "ibrahimkhalil-ctrl",
        linkedin: "ibrahim-khalil-robotics",
        isActive: true,
      },
      {
        id: "student-zoe-williams",
        username: "zoe.williams",
        name: "Zoe Williams",
        email: "zoe.williams@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
        track: "Frontend Architecture & Web Performance",
        statusQuote: "Achieved 100/100 Lighthouse score on all senior capstone pages! 💯⚡",
        bio: "Performance optimization fanatic: critical CSS extraction, island architectures, WASM decoders, and zero JS payloads.",
        dorm: "Founders Hall 206",
        skills: ["Next.js", "React", "Web Workers", "WebAssembly", "Tailwind", "Vite"],
        github: "zoewilliams-perf",
        linkedin: "zoe-williams-frontend",
        isActive: true,
      },
      {
        id: "student-artem-ivanov",
        username: "artem.ivanov",
        name: "Artem Ivanov",
        email: "artem.ivanov@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
        track: "Computer Networks & High Speed Routing",
        statusQuote: "DPDK 100Gbps network packet processing benchmark completed without dropped frames! 🌐",
        bio: "Userspace network packet processing, kernel bypass techniques (DPDK, XDP), BGP router implementation, and SDN architectures.",
        dorm: "Tech Hub 304",
        skills: ["C", "DPDK", "XDP", "Linux Networking", "BGP", "Wireshark"],
        github: "artemivanov-net",
        linkedin: "artem-ivanov-networks",
        isActive: true,
      },
      {
        id: "student-mia-kowalski",
        username: "mia.kowalski",
        name: "Mia Kowalski",
        email: "mia.kowalski@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80",
        track: "AI & Speech Recognition",
        statusQuote: "Trained multilingual low-resource speech model for minority languages! 🎙️🌍",
        bio: "Acoustic modeling, CTC decoders, Whisper model fine-tuning, streaming low-latency speech-to-text inference.",
        dorm: "East Campus Suite 315",
        skills: ["PyTorch", "Whisper", "Kaldi", "Python", "Transformers", "CUDA"],
        github: "miakowalski-speech",
        linkedin: "mia-kowalski-ai",
        isActive: true,
      },
      {
        id: "student-kenji-sato",
        username: "kenji.sato",
        name: "Kenji Sato",
        email: "kenji.sato@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80",
        track: "Security Hardware & Side-Channel Attacks",
        statusQuote: "Demonstrated electromagnetic differential power analysis attack in lab! ⚡🔓",
        bio: "Physical chip security, timing attack mitigation, fault injection hardening, and trusted execution environments (TEE).",
        dorm: "Founders Hall 109",
        skills: ["C", "Oscilloscopes", "ChipWhisperer", "Verilog", "Cryptography", "Python"],
        github: "kenjisato-sec",
        linkedin: "kenji-sato-hardware",
        isActive: true,
      },
      {
        id: "student-selam-haile",
        username: "selam.haile",
        name: "Selam Haile",
        email: "selam.haile@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1534751516642-a171edd25218?auto=format&fit=crop&w=400&q=80",
        track: "Cloud Computing & Serverless Platforms",
        statusQuote: "Designed sub-millisecond cold start serverless container engine! ☁️🚀",
        bio: "Firecracker microVMs, snapshot restoration techniques, distributed scheduling, and edge worker runtimes.",
        dorm: "North Hall 307",
        skills: ["Rust", "Go", "Firecracker", "WebAssembly", "Docker", "AWS Lambda"],
        github: "selamhaile-cloud",
        linkedin: "selam-haile-swe",
        isActive: true,
      },
      {
        id: "student-julian-dupont",
        username: "julian.dupont",
        name: "Julian Dupont",
        email: "julian.dupont@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
        track: "Full-Stack & Microservices",
        statusQuote: "Taking a brief semester leave for external startup incubation! 🚀",
        bio: "Full stack builder exploring next-generation B2B developer tool workflows.",
        dorm: "Off-Campus Innovation Loft",
        skills: ["TypeScript", "NestJS", "PostgreSQL", "Docker", "GraphQL"],
        github: "juliandupont",
        linkedin: "julian-dupont",
        isActive: false, // Inactive account for demonstration
      },
      {
        id: "student-daria-volkova",
        username: "daria.volkova",
        name: "Daria Volkova",
        email: "daria.volkova@phoenix2026.edu",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
        track: "Cybersecurity & Incident Response",
        statusQuote: "Currently on study abroad exchange program in Zurich! 🏔️",
        bio: "Threat intelligence and penetration testing exchange scholar.",
        dorm: "Zurich International Exchange",
        skills: ["Python", "Wireshark", "Linux", "Ghidra", "Splunk"],
        github: "dariavolkova-sec",
        linkedin: "daria-volkova-cyber",
        isActive: false, // Inactive account for demonstration
      },
    ];

    const exact50Students = studentsData.slice(0, 50);
    console.log(`Inserting ${exact50Students.length} students into PostgreSQL...`);
    for (const s of exact50Students) {
      await client.query(
        `INSERT INTO "User" (
          id, username, email, password, role, "isActive", name, avatar, degree, "gradYear", track, "statusQuote", bio, dorm, skills, github, linkedin, connected, online, "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW()
        )`,
        [
          s.id,
          s.username,
          s.email,
          defaultStudentPasswordHash,
          "STUDENT",
          s.isActive,
          s.name,
          s.avatar,
          "B.S. Software Engineering",
          "2026",
          s.track,
          s.statusQuote,
          s.bio,
          s.dorm,
          s.skills,
          s.github,
          s.linkedin,
          true,
          s.isActive,
        ]
      );
    }
    console.log(`✅ Successfully inserted ${studentsData.length} student records!`);

    // 4. Create Initial Posts
    console.log("Inserting initial posts...");
    const post1Res = await client.query(
      `INSERT INTO "Post" (
        id, "authorId", "authorName", "authorAvatar", "authorTrack", "timeAgo", content, image, tag, "likesCount", "createdAt", "updatedAt"
      ) VALUES (
        'post-capstone-demo', 'student-alex-chen', 'Alex Chen', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
        'Full-Stack & AI Systems', '2 hours ago',
        'Just wrapped up our final benchmark on the autonomous code-synthesis engine for Senior Capstone! 🚀 We reached sub-80ms latencies with AST-level verification. Massive shoutout to the team for the sleepless caffeine-fueled weekends!',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        'Projects', 24, NOW(), NOW()
      ) RETURNING id`
    );

    const post2Res = await client.query(
      `INSERT INTO "Post" (
        id, "authorId", "authorName", "authorAvatar", "authorTrack", "timeAgo", content, image, tag, "likesCount", "createdAt", "updatedAt"
      ) VALUES (
        'post-stripe-offer', 'student-sarah-jenkins', 'Sarah Jenkins', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        'Full-Stack & Cloud Architecture', '4 hours ago',
        'Thrilled to share that I have officially signed my full-time offer as a Cloud Infrastructure Engineer at Stripe! 💳✨ Thank you to every professor, mentor, and late-night study group in the SE lounge over the past 4 years.',
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
        'Career & Offers', 58, NOW(), NOW()
      ) RETURNING id`
    );

    const post3Res = await client.query(
      `INSERT INTO "Post" (
        id, "authorId", "authorName", "authorAvatar", "authorTrack", "timeAgo", content, image, tag, "likesCount", "createdAt", "updatedAt"
      ) VALUES (
        'post-robotics-rover', 'student-maya-patel', 'Maya Patel', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        'Robotics & Autonomous Software', '6 hours ago',
        'Live test of our quadruped robotics rover mapping the campus botanical garden in full 3D! 🤖🌿 Check out this point cloud reconstruction accuracy.',
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
        'Hackathons & Tech', 39, NOW(), NOW()
      ) RETURNING id`
    );

    // 5. Create Comments
    await client.query(
      `INSERT INTO "Comment" (
        id, "postId", "authorId", "authorName", "authorAvatar", "authorTrack", "timeAgo", content, "createdAt", "updatedAt"
      ) VALUES 
      ('c-1', 'post-capstone-demo', 'student-sarah-jenkins', 'Sarah Jenkins', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', 'Full-Stack & Cloud Architecture', '1 hour ago', 'Incredible work Alex! That AST parsing pipeline is unbelievably fast. Can''t wait for Friday demo!', NOW(), NOW()),
      ('c-2', 'post-capstone-demo', 'student-jordan-lee', 'Jordan Lee', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', 'FinTech & Distributed Systems', '45 mins ago', 'Are you guys publishing the benchmarks before commencement? Would love to read the writeup.', NOW(), NOW()),
      ('c-3', 'post-stripe-offer', 'student-alex-chen', 'Alex Chen', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80', 'Full-Stack & AI Systems', '3 hours ago', 'CONGRATS SARAH!! 🥳 Stripe is getting an absolute rockstar. So proud of you!', NOW(), NOW()),
      ('c-4', 'post-stripe-offer', 'student-casey-chen', 'Casey Chen', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80', 'Cybersecurity & Cryptography', '2 hours ago', 'Well deserved Sarah!! Let''s celebrate at the graduation dinner! 🎉', NOW(), NOW()),
      ('c-5', 'post-robotics-rover', 'student-alex-chen', 'Alex Chen', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80', 'Full-Stack & AI Systems', '5 hours ago', 'The SLAM precision on this is wild! What LiDAR sensor did you end up using?', NOW(), NOW())`
    );

    // 6. Create Tech Events
    await client.query(
      `INSERT INTO "TechEvent" (
        id, title, month, day, time, location, description, "createdAt"
      ) VALUES
      ('event-1', 'Senior Capstone Project Showcase 2026', 'MAY', '14', '10:00 AM - 4:00 PM EST', 'Grand Auditorium & Innovation Atrium', 'Official demonstration of all 50 Senior Software Engineering Capstone projects before industry judges and alumni.', NOW()),
      ('event-2', 'Phoenix Class of ''26 Graduation Banquet', 'MAY', '21', '6:30 PM - 10:00 PM EST', 'Skyline Ballroom & Terrace', 'Formal dinner, awards ceremony, and commemorative yearbook celebration for the graduating batch.', NOW()),
      ('event-3', 'Alumni Tech Panel & Career Mixer', 'MAY', '28', '5:00 PM - 7:30 PM EST', 'Tech Quad Lounge & Virtual Stream', 'Fireside chat with previous Phoenix SE alumni at OpenAI, Apple, Stripe, and Google.', NOW())`
    );

    // 7. Create Yearbook Signatures
    await client.query(
      `INSERT INTO "YearbookSignature" (
        id, "authorId", "authorName", "authorAvatar", "authorTrack", date, message, "createdAt"
      ) VALUES
      ('sig-1', 'student-sarah-jenkins', 'Sarah Jenkins', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', 'Full-Stack & Cloud Architecture', 'May 2026', 'To the brightest software engineering batch: we survived compiler theory, OS kernels, and late-night builds. Now let''s go build the future! 🔥🚀', NOW()),
      ('sig-2', 'student-jordan-lee', 'Jordan Lee', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', 'FinTech & Distributed Systems', 'May 2026', 'Best 4 years of my life. Grateful for every teammate, hackathon memory, and coffee run. Stay in touch everyone! ✨', NOW()),
      ('sig-3', 'student-casey-chen', 'Casey Chen', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80', 'Cybersecurity & Cryptography', 'May 2026', 'Phoenix Class of ''26 is unstoppable. Remember: keep your dependencies updated and your passwords salted! 🛡️❤️', NOW())`
    );

    // 8. Create Direct Messages
    await client.query(
      `INSERT INTO "Message" (
        id, "senderId", "receiverId", text, "isRead", "createdAt"
      ) VALUES
      ('msg-1', 'student-sarah-jenkins', 'student-alex-chen', 'Hey Alex! Are you bringing your laptop to the Capstone rehearsal this afternoon?', true, NOW()),
      ('msg-2', 'student-alex-chen', 'student-sarah-jenkins', 'Yes! Got the demo build ready on the latest branch. See you in the lab at 2pm!', true, NOW()),
      ('msg-3', 'student-jordan-lee', 'student-alex-chen', 'Hey man, did you see the announcement about the graduation capstone awards?', false, NOW())`
    );

    console.log("🎉 Database successfully seeded with 1 Admin + 50 Students + Posts + Comments + Events + Messages!");
    return { success: true, count: 51 };
  } finally {
    client.release();
    await pool.end();
  }
}

export { seedDatabase as main };

const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith("seed.mjs") || process.argv[1].endsWith("seed.js"));

if (isDirectRun) {
  seedDatabase().catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
}

