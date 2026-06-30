const jobs = [
  {
    id: 1,
    title: "Senior React + Spring Boot Engineer",
    company: "CloudNova Systems",
    location: "Remote",
    experience: "6-9",
    salary: 42,
    skills: ["React", "Spring Boot", "PostgreSQL", "Kafka"],
    remote: true,
    match: 96,
    status: "Best match"
  },
  {
    id: 2,
    title: "DevOps Platform Lead",
    company: "FinGrid Labs",
    location: "Bengaluru",
    experience: "10+",
    salary: 58,
    skills: ["Kubernetes", "Terraform", "AWS", "Redis"],
    remote: false,
    match: 91,
    status: "Interview fast-track"
  },
  {
    id: 3,
    title: "AI Resume Matching Engineer",
    company: "TalentWorks AI",
    location: "Pune",
    experience: "3-5",
    salary: 30,
    skills: ["Python", "NLP", "MongoDB", "Search"],
    remote: true,
    match: 89,
    status: "Recommended"
  },
  {
    id: 4,
    title: "Product Designer for Hiring SaaS",
    company: "Northstar PeopleOps",
    location: "Mumbai",
    experience: "3-5",
    salary: 24,
    skills: ["UX", "Design Systems", "Research", "Figma"],
    remote: false,
    match: 82,
    status: "Saved by HR"
  },
  {
    id: 5,
    title: "Full Stack Marketplace Developer",
    company: "ScaleBridge",
    location: "Hyderabad",
    experience: "0-2",
    salary: 18,
    skills: ["Node.js", "React", "Payments", "Socket.io"],
    remote: true,
    match: 78,
    status: "New"
  }
];

const projects = [
  {
    id: 101,
    title: "Build WebRTC Mock Interview Suite",
    owner: "PeoplePilot",
    budget: 62000,
    duration: "medium",
    skills: ["WebRTC", "Node.js", "Recording", "Socket.io"],
    status: "Open for bidding"
  },
  {
    id: 102,
    title: "AI Resume Parser and Skill Graph",
    owner: "HireLabs",
    budget: 45000,
    duration: "short",
    skills: ["NLP", "Python", "Search", "PostgreSQL"],
    status: "Invite-only"
  },
  {
    id: 103,
    title: "Escrow and Milestone Payment Engine",
    owner: "WorkTrust",
    budget: 80000,
    duration: "long",
    skills: ["Payments", "Java", "Security", "AWS"],
    status: "Team forming"
  },
  {
    id: 104,
    title: "Professional Feed and Referral Network",
    owner: "ReferralStack",
    budget: 22000,
    duration: "medium",
    skills: ["React", "MongoDB", "Kafka", "Moderation"],
    status: "Open for bidding"
  }
];

let feed = [
  {
    initials: "VK",
    name: "Vikram K.",
    type: "Hiring",
    text: "Opening 12 cloud-native roles this week across React, Java, Kafka, and platform security.",
    meta: "42 reactions Â· 9 referrals"
  },
  {
    initials: "SP",
    name: "Sara P.",
    type: "Project",
    text: "Looking for a 3-person team to ship a payment reconciliation dashboard with milestone billing.",
    meta: "18 proposals Â· escrow ready"
  },
  {
    initials: "RM",
    name: "Rahul M.",
    type: "Interview",
    text: "Mock interview feedback: strongest candidates explain tradeoffs, not just tool names.",
    meta: "STAR score insight Â· 6 comments"
  }
];

const candidates = [
  { name: "Ananya Kulkarni", role: "Full Stack Engineer", skills: "React, Spring Boot, Kafka", score: 94 },
  { name: "Nisha Sharma", role: "Cloud Product Engineer", skills: "AWS, Kubernetes, Payments", score: 91 },
  { name: "Imran Sheikh", role: "DevOps Lead", skills: "Terraform, Redis, SRE", score: 88 },
  { name: "Meera Rao", role: "Product Designer", skills: "UX, Research, Design Systems", score: 84 }
];

let notifications = [
  { title: "Interview scheduled", body: "Ananya Kulkarni accepted the 20-minute mock interview slot." },
  { title: "Project invitation", body: "PeoplePilot invited you to bid on the WebRTC interview suite." },
  { title: "Application update", body: "CloudNova moved your application to technical shortlist." }
];

const applications = [
  "Applied: CloudNova Systems",
  "Shortlisted: TalentWorks AI",
  "Interview: Friday, 11:30 AM",
  "Offer review: FinGrid Labs"
];

const invoices = [
  { title: "WebRTC Suite Milestone 1", amount: "$18,000", state: "In escrow" },
  { title: "Resume Parser Discovery", amount: "$6,500", state: "Released" },
  { title: "Payment Engine Security Review", amount: "$9,200", state: "Pending approval" }
];

const state = {
  activeRole: "candidate",
  appliedJobs: new Set(),
  savedJobs: new Set(),
  bids: new Set(),
  timer: 20 * 60,
  timerHandle: null
};

const $ = (selector) => document.querySelector(selector);

function navigate(viewId) {
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === viewId));
  const view = document.getElementById(viewId);
  if (view) view.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function notify(title, body) {
  notifications.unshift({ title, body });
  if ($("#notificationList")) {
    renderNotifications();
    return;
  }
  window.parent?.postMessage({ type: "hiresphere:notify", title, body }, window.location.origin);
}

function renderNotifications() {
  const list = $("#notificationList");
  list.innerHTML = notifications.length
    ? notifications.map((item) => `
      <article class="notification-item">
        <strong>${item.title}</strong>
        <span>${item.body}</span>
      </article>
    `).join("")
    : `<article class="notification-item"><strong>All clear</strong><span>No new platform events.</span></article>`;
}

function renderWorkspace() {
  $("#metricJobs").textContent = jobs.length;
  $("#metricProjects").textContent = projects.length;
  $("#bestMatchList").innerHTML = jobs.slice(0, 3).map((job) => `
    <article class="compact-card">
      <div>
        <strong>${job.title}</strong>
        <small>${job.company} Â· ${job.location} Â· ${job.salary} LPA</small>
      </div>
      <span class="status-pill">${job.match}%</span>
    </article>
  `).join("");

  $("#pipelineList").innerHTML = candidates.map((candidate) => `
    <article class="candidate-row">
      <div>
        <strong>${candidate.name}</strong>
        <small>${candidate.role} Â· ${candidate.skills}</small>
        <div class="pipeline-meter" aria-label="Candidate score"><span style="width:${candidate.score}%"></span></div>
      </div>
      <span class="status-pill">${candidate.score}</span>
    </article>
  `).join("");

  $("#feedPreview").innerHTML = feed.slice(0, 2).map(feedTemplate).join("");
}

function jobMatchesFilters(job) {
  const keyword = $("#jobKeyword").value.trim().toLowerCase();
  const location = $("#jobLocation").value;
  const experience = $("#jobExperience").value;
  const salary = Number($("#salaryRange").value);
  const remoteOnly = $("#remoteOnly").checked;

  const searchable = [job.title, job.company, job.location, ...job.skills].join(" ").toLowerCase();
  return (!keyword || searchable.includes(keyword))
    && (location === "all" || job.location === location)
    && (experience === "all" || job.experience === experience)
    && job.salary >= salary
    && (!remoteOnly || job.remote);
}

function renderJobs() {
  $("#salaryOutput").textContent = Number($("#salaryRange").value) ? `${$("#salaryRange").value} LPA+` : "Any";
  const filteredJobs = jobs.filter(jobMatchesFilters);
  $("#jobResults").innerHTML = filteredJobs.length ? filteredJobs.map((job) => `
    <article class="job-card">
      <header>
        <div>
          <h2>${job.title}</h2>
          <strong>${job.company}</strong>
        </div>
        <span class="status-pill">${job.match}% match</span>
      </header>
      <div class="job-meta">
        <span class="tag">${job.location}</span>
        <span class="tag">${job.experience} yrs</span>
        <span class="tag">${job.salary} LPA</span>
        <span class="tag coral">${job.status}</span>
      </div>
      <div class="skill-cloud">${job.skills.map((skill) => `<span>${skill}</span>`).join("")}</div>
      <div class="card-actions">
        <button class="primary-button" data-apply="${job.id}" type="button">${state.appliedJobs.has(job.id) ? "Applied" : "Apply Job"}</button>
        <button class="secondary-button" data-save="${job.id}" type="button">${state.savedJobs.has(job.id) ? "Saved" : "Save Job"}</button>
      </div>
    </article>
  `).join("") : `<article class="job-card"><h2>No jobs found</h2><p>Try changing a filter or searching another skill.</p></article>`;

  const skills = [...new Set(filteredJobs.flatMap((job) => job.skills))].slice(0, 12);
  $("#jobSkillCloud").innerHTML = skills.map((skill) => `<span>${skill}</span>`).join("");
  $("#applicationTracker").innerHTML = applications.map((item) => `<article class="timeline-item">${item}</article>`).join("");
}

function projectMatchesFilters(project) {
  const skill = $("#projectSkill").value.trim().toLowerCase();
  const budget = $("#projectBudget").value;
  const duration = $("#projectDuration").value;
  const searchable = [project.title, project.owner, ...project.skills].join(" ").toLowerCase();
  return (!skill || searchable.includes(skill))
    && (budget === "all" || project.budget >= Number(budget))
    && (duration === "all" || project.duration === duration);
}

function renderProjects() {
  const filteredProjects = projects.filter(projectMatchesFilters);
  $("#projectBoard").innerHTML = filteredProjects.map((project) => `
    <article class="project-card">
      <header>
        <div>
          <h2>${project.title}</h2>
          <small>${project.owner}</small>
        </div>
        <span class="status-pill">$${project.budget.toLocaleString()}</span>
      </header>
      <div class="project-meta">
        <span class="tag">${project.duration}</span>
        <span class="tag coral">${project.status}</span>
      </div>
      <div class="skill-cloud">${project.skills.map((skill) => `<span>${skill}</span>`).join("")}</div>
      <div class="card-actions">
        <button class="primary-button" data-bid="${project.id}" type="button">${state.bids.has(project.id) ? "Proposal Sent" : "Bid Project"}</button>
        <button class="secondary-button" type="button">Invite Team</button>
      </div>
    </article>
  `).join("");

  $("#invoiceList").innerHTML = invoices.map((invoice) => `
    <article class="invoice-item">
      <strong>${invoice.title}</strong>
      <small>${invoice.amount} Â· ${invoice.state}</small>
    </article>
  `).join("");
}

function feedTemplate(post) {
  return `
    <article class="feed-item">
      <div class="avatar">${post.initials}</div>
      <div>
        <strong>${post.name}</strong>
        <span class="tag">${post.type}</span>
        <p>${post.text}</p>
        <small>${post.meta}</small>
      </div>
    </article>
  `;
}

function renderFeed() {
  const list = $("#feedList");
  const preview = $("#feedPreview");
  if (list) list.innerHTML = feed.map(feedTemplate).join("");
  if (preview) preview.innerHTML = feed.slice(0, 2).map(feedTemplate).join("");
}

function renderCandidates() {
  $("#candidateList").innerHTML = candidates.map((candidate) => `
    <article class="candidate-row">
      <div>
        <strong>${candidate.name}</strong>
        <small>${candidate.role} Â· ${candidate.skills}</small>
        <div class="pipeline-meter"><span style="width:${candidate.score}%"></span></div>
      </div>
      <div class="candidate-actions">
        <span class="status-pill">${candidate.score}%</span>
        <button class="secondary-button" data-shortlist="${candidate.name}" type="button">Shortlist</button>
      </div>
    </article>
  `).join("");
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function updateTimer() {
  $("#interviewTimer").textContent = formatTime(state.timer);
  if (state.timer <= 0) {
    clearInterval(state.timerHandle);
    state.timerHandle = null;
    $("#recordingState").textContent = "Recording saved automatically";
    notify("Interview auto-ended", "The 20-minute session ended and the recording was saved.");
  }
}

function startInterview() {
  if (state.timerHandle) return;
  $("#recordingState").textContent = "Recording in progress";
  notify("Mock interview started", "A 20-minute one-to-one session is now live.");
  state.timerHandle = setInterval(() => {
    state.timer -= 1;
    updateTimer();
  }, 1000);
}

function endInterview() {
  clearInterval(state.timerHandle);
  state.timerHandle = null;
  $("#recordingState").textContent = "Recording saved";
  notify("Interview ended", `Session closed at ${formatTime(state.timer)} remaining. Notes and ratings are ready.`);
}

function recalcScore() {
  const scores = [...document.querySelectorAll(".score-input")].map((input) => Number(input.value));
  const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  $("#starScore").textContent = avg.toFixed(1);
}

function renderChatSeed() {
  $("#chatBox").innerHTML = [
    "RM: Please walk me through a production outage you handled.",
    "AK: I will frame it using Situation, Task, Action, and Result.",
    "RM: Good. Include the tradeoffs you considered."
  ].map((message) => `<div class="chat-message">${message}</div>`).join("");
}

function bind(selector, eventName, handler) {
  const node = $(selector);
  if (node) node.addEventListener(eventName, handler);
}

function initEvents() {
  document.querySelectorAll("[data-view-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      window.parent?.postMessage(
        { type: "hiresphere:navigate", view: button.dataset.viewJump },
        window.location.origin
      );
    });
  });

  ["jobKeyword", "jobLocation", "jobExperience", "salaryRange", "remoteOnly"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", renderJobs);
  });

  ["projectSkill", "projectBudget", "projectDuration"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", renderProjects);
  });

  document.body.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target) return;
    const applyId = target.dataset.apply;
    const saveId = target.dataset.save;
    const bidId = target.dataset.bid;
    const shortlistName = target.dataset.shortlist;

    if (applyId) {
      state.appliedJobs.add(Number(applyId));
      notify("Application submitted", "Your job application is now visible to HR.");
      renderJobs();
    }
    if (saveId) {
      state.savedJobs.add(Number(saveId));
      notify("Job saved", "Saved job added to your candidate tracker.");
      renderJobs();
    }
    if (bidId) {
      state.bids.add(Number(bidId));
      notify("Proposal submitted", "Your project bid was sent to the project owner.");
      renderProjects();
    }
    if (shortlistName) {
      notify("Candidate shortlisted", `${shortlistName} was moved to the HR shortlist.`);
    }
  });

  bind("#postComposer", "submit", (event) => {
    event.preventDefault();
    const text = $("#postText").value.trim();
    if (!text) return;
    feed.unshift({
      initials: "ME",
      name: "You",
      type: $("#postType").value,
      text,
      meta: "Just now"
    });
    $("#postText").value = "";
    renderFeed();
    notify("Feed update published", "Your professional network update is live.");
  });
  bind("#publishPost", "click", () => $("#postComposer").requestSubmit());
  bind("#startInterview", "click", startInterview);
  bind("#endInterview", "click", endInterview);
  document.querySelectorAll(".score-input").forEach((input) => input.addEventListener("input", recalcScore));

  bind("#chatForm", "submit", (event) => {
    event.preventDefault();
    const input = $("#chatInput");
    const text = input.value.trim();
    if (!text) return;
    const message = document.createElement("div");
    message.className = "chat-message";
    message.textContent = `You: ${text}`;
    $("#chatBox").appendChild(message);
    input.value = "";
  });

  document.querySelectorAll("[data-upload]").forEach((input) => {
    input.addEventListener("change", () => {
      const name = input.dataset.upload;
      const count = input.files.length;
      if (!count) return;
      const status = document.createElement("article");
      status.className = "timeline-item";
      status.textContent = `${name}: ${count} file${count > 1 ? "s" : ""} queued for S3 or Azure Blob upload`;
      $("#uploadStatus").prepend(status);
      notify("Document upload queued", `${name} is ready for secure object storage.`);
    });
  });

  bind("#recordSelfIntro", "click", () => {
    notify("Self interview recording", "2-5 minute self-introduction capture started.");
  });
  bind("#saveProfile", "click", () => {
    notify("Profile saved", "Candidate profile, documents, and video metadata were saved.");
  });

  bind("#jobForm", "submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    jobs.unshift({
      id: Date.now(),
      title: data.get("title"),
      company: "Your Company",
      location: data.get("location"),
      experience: "3-5",
      salary: Number(data.get("salary")),
      skills: data.get("skills").split(",").map((skill) => skill.trim()).filter(Boolean),
      remote: data.get("location") === "Remote",
      match: 87,
      status: "New HR post"
    });
    event.target.reset();
    notify("Job posted", "The new job is searchable and recommendation-ready.");
  });

  bind("#projectForm", "submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    projects.unshift({
      id: Date.now(),
      title: data.get("title"),
      owner: "Your Team",
      budget: Number(data.get("budget")),
      duration: "medium",
      skills: data.get("skills").split(",").map((skill) => skill.trim()).filter(Boolean),
      status: "Team forming"
    });
    event.target.reset();
    notify("Project created", "The new project is ready for freelancer invitations.");
  });

  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === "hiresphere:theme") {
      document.body.classList.toggle("dark", Boolean(event.data.dark));
    }
    if (event.data?.type === "hiresphere:search") {
      const input = $("#jobKeyword") || $("#projectSkill") || $("#postText");
      if (input && input.matches("input")) {
        input.value = String(event.data.query || "");
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  });
}

export function initService() {
  const page = document.querySelector(".view.active")?.id;

  if (page === "workspace") renderWorkspace();
  if (page === "jobs") renderJobs();
  if (page === "projects") renderProjects();
  if (page === "network") renderFeed();
  if (page === "interview") {
    renderChatSeed();
    recalcScore();
    updateTimer();
  }
  if (page === "admin") renderCandidates();

  initEvents();

  const syncViewport = () => {
    const shellWidth = window.parent?.innerWidth || window.innerWidth;
    document.documentElement.style.setProperty("--shell-vw", `${shellWidth / 100}px`);
    document.documentElement.classList.toggle("shell-wide", shellWidth > 1180);
  };
  const reportHeight = () => {
    const height = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );
    window.parent?.postMessage(
      { type: "hiresphere:resize", height },
      window.location.origin
    );
  };
  syncViewport();
  window.parent?.addEventListener("resize", () => {
    syncViewport();
    reportHeight();
  });
  window.addEventListener("load", reportHeight);
  new ResizeObserver(reportHeight).observe(document.body);
  reportHeight();
  requestAnimationFrame(reportHeight);
  setTimeout(reportHeight, 100);
}
