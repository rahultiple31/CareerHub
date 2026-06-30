export const jobs = [
  { id: 1, title: "Senior React + Spring Boot Engineer", company: "CloudNova Systems", location: "Remote", experience: "6-9", salary: 42, skills: ["React", "Spring Boot", "PostgreSQL", "Kafka"], remote: true, match: 96, status: "Best match" },
  { id: 2, title: "DevOps Platform Lead", company: "FinGrid Labs", location: "Bengaluru", experience: "10+", salary: 58, skills: ["Kubernetes", "Terraform", "AWS", "Redis"], remote: false, match: 91, status: "Interview fast-track" },
  { id: 3, title: "AI Resume Matching Engineer", company: "TalentWorks AI", location: "Pune", experience: "3-5", salary: 30, skills: ["Python", "NLP", "MongoDB", "Search"], remote: true, match: 89, status: "Recommended" },
  { id: 4, title: "Product Designer for Hiring SaaS", company: "Northstar PeopleOps", location: "Mumbai", experience: "3-5", salary: 24, skills: ["UX", "Design Systems", "Research", "Figma"], remote: false, match: 82, status: "Saved by HR" },
  { id: 5, title: "Full Stack Marketplace Developer", company: "ScaleBridge", location: "Hyderabad", experience: "0-2", salary: 18, skills: ["Node.js", "React", "Payments", "Socket.io"], remote: true, match: 78, status: "New" }
];

export const projects = [
  { id: 101, title: "Build WebRTC Mock Interview Suite", owner: "PeoplePilot", budget: 62000, duration: "medium", skills: ["WebRTC", "Node.js", "Recording", "Socket.io"], status: "Open for bidding" },
  { id: 102, title: "AI Resume Parser and Skill Graph", owner: "HireLabs", budget: 45000, duration: "short", skills: ["NLP", "Python", "Search", "PostgreSQL"], status: "Invite-only" },
  { id: 103, title: "Escrow and Milestone Payment Engine", owner: "WorkTrust", budget: 80000, duration: "long", skills: ["Payments", "Java", "Security", "AWS"], status: "Team forming" },
  { id: 104, title: "Professional Feed and Referral Network", owner: "ReferralStack", budget: 22000, duration: "medium", skills: ["React", "MongoDB", "Kafka", "Moderation"], status: "Open for bidding" }
];

export const seedFeed = [
  { initials: "VK", name: "Vikram K.", type: "Hiring", text: "Opening 12 cloud-native roles this week across React, Java, Kafka, and platform security.", meta: "42 reactions · 9 referrals" },
  { initials: "SP", name: "Sara P.", type: "Project", text: "Looking for a 3-person team to ship a payment reconciliation dashboard with milestone billing.", meta: "18 proposals · escrow ready" },
  { initials: "RM", name: "Rahul M.", type: "Interview", text: "Mock interview feedback: strongest candidates explain tradeoffs, not just tool names.", meta: "STAR score insight · 6 comments" }
];

export const candidates = [
  { name: "Ananya Kulkarni", role: "Full Stack Engineer", skills: "React, Spring Boot, Kafka", score: 94 },
  { name: "Nisha Sharma", role: "Cloud Product Engineer", skills: "AWS, Kubernetes, Payments", score: 91 },
  { name: "Imran Sheikh", role: "DevOps Lead", skills: "Terraform, Redis, SRE", score: 88 },
  { name: "Meera Rao", role: "Product Designer", skills: "UX, Research, Design Systems", score: 84 }
];

export const invoices = [
  { title: "WebRTC Suite Milestone 1", amount: "$18,000", state: "In escrow" },
  { title: "Resume Parser Discovery", amount: "$6,500", state: "Released" },
  { title: "Payment Engine Security Review", amount: "$9,200", state: "Pending approval" }
];
