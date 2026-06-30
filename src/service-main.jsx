import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { candidates, invoices, jobs, projects, seedFeed } from "./data.js";
import { navigate, notify, useShellBridge } from "./bridge.js";
import "../services/shared/base.css";
import "../services/shared/frame.css";
import "./react.css";
import "./landing.css";

const SectionTitle = ({ eyebrow, title, children }) => <div className="section-title">
  <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div>{children}
</div>;

const Skills = ({ items }) => <div className="skill-cloud">{items.map((skill) => <span key={skill}>{skill}</span>)}</div>;

const FeedItem = ({ post }) => <article className="feed-item">
  <div className="avatar">{post.initials}</div>
  <div><strong>{post.name}</strong><span className="tag">{post.type}</span><p>{post.text}</p><small>{post.meta}</small></div>
</article>;

const Candidate = ({ candidate, action }) => <article className="candidate-row">
  <div><strong>{candidate.name}</strong><small>{candidate.role} · {candidate.skills}</small><div className="pipeline-meter"><span style={{ width: `${candidate.score}%` }} /></div></div>
  <div className="candidate-actions"><span className="status-pill">{candidate.score}%</span>{action}</div>
</article>;

const workspaceAudiences = {
  talent: {
    eyebrow: "Your next move, matched", title: "Find work that moves your career forward.",
    copy: "One profile unlocks high-fit roles, paid projects, warm referrals, and structured interview practice.",
    primary: ["See my best matches", "jobs"], secondary: ["Build my profile", "profile"], signal: "96% top match"
  },
  teams: {
    eyebrow: "From opening to confident yes", title: "Turn hiring noise into a confident shortlist.",
    copy: "Source verified people, compare explainable match scores, interview consistently, and keep every decision in one place.",
    primary: ["Start hiring", "admin"], secondary: ["Explore talent", "jobs"], signal: "48h to shortlist"
  },
  builders: {
    eyebrow: "Specialists when momentum matters", title: "Build the team behind your next big release.",
    copy: "Discover proven specialists, fund protected milestones, assemble flexible teams, and ship without the usual marketplace chaos.",
    primary: ["Browse specialists", "projects"], secondary: ["Create a project", "admin"], signal: "$428K protected"
  }
};

function Workspace() {
  const [audience, setAudience] = useState("talent");
  useShellBridge();
  useEffect(() => {
    const receiveAudience = (event) => {
      if (event.origin !== window.location.origin) return;
      const nextAudience = event.data?.audience;
      if (event.data?.type === "hiresphere:audience" && workspaceAudiences[nextAudience]) setAudience(nextAudience);
    };
    window.addEventListener("message", receiveAudience);
    return () => window.removeEventListener("message", receiveAudience);
  }, []);
  const message = workspaceAudiences[audience];
  const categories = [
    ["Engineering", "1,240 opportunities", "React, Java, Cloud", "jobs"],
    ["AI & Data", "680 opportunities", "Python, NLP, Search", "jobs"],
    ["Design", "390 opportunities", "Product, UX, Research", "projects"],
    ["Cloud & DevOps", "520 opportunities", "AWS, Kubernetes, SRE", "jobs"]
  ];

  return <section className="view active landing-view">
    <div className="workspace-hero conversion-hero">
      <img src="./talent-command-center.png" alt="Talent and hiring activity inside HireSphere" />
      <div className="hero-copy">
        <div className="hero-live"><span />12,000+ people building what comes next</div>
        <span className="eyebrow">{message.eyebrow}</span>
        <h1>{message.title}</h1>
        <p>{message.copy}</p>
        <div className="hero-actions">
          <button className="primary-button hero-primary" onClick={() => navigate(message.primary[1])}>{message.primary[0]}</button>
          <button className="secondary-button hero-secondary" onClick={() => navigate(message.secondary[1])}>{message.secondary[0]}</button>
        </div>
        <div className="hero-assurance"><span>No platform fee to join</span><span>Verified opportunities</span><span>Protected payments</span></div>
      </div>
      <aside className="hero-signal-card" aria-label="Live marketplace signal">
        <div><span className="signal-label">Live marketplace</span><strong>{message.signal}</strong></div>
        <div className="signal-people"><span>AK</span><span>NS</span><span>IS</span><small>+2.8k active today</small></div>
      </aside>
    </div>

    <section className="trust-strip" aria-label="Trusted companies">
      <span>Trusted by ambitious teams</span>
      {["CloudNova", "FinGrid", "PeoplePilot", "Northstar", "ScaleBridge"].map((company) => <strong key={company}>{company}</strong>)}
    </section>

    <div className="metric-grid impact-metrics">
      {[["12.4K", "Verified professionals", "Skills and identity checked"], ["92%", "Quality match rate", "Explainable recommendations"], ["<48h", "Average shortlist", "Less noise, faster decisions"], ["$428K", "Protected in escrow", "Milestone-based releases"]].map(([value, label, detail]) => <article className="metric-block" key={label}><strong>{value}</strong><span>{label}</span><small>{detail}</small></article>)}
    </div>

    <section className="landing-section">
      <div className="landing-section-head"><div><span className="eyebrow">Explore your path</span><h2>Opportunity should feel specific to you.</h2></div><button className="ghost-button" onClick={() => navigate("jobs")}>View every opportunity</button></div>
      <div className="opportunity-grid">{categories.map(([title, count, skills, destination], index) => <button className="opportunity-card" key={title} onClick={() => navigate(destination)}><span className="opportunity-index">0{index + 1}</span><strong>{title}</strong><small>{count}</small><p>{skills}</p><span className="opportunity-link">Explore</span></button>)}</div>
    </section>

    <section className="outcome-story">
      <div className="story-quote"><span className="eyebrow">Real momentum</span><blockquote>“I went from invisible applications to three conversations with teams I actually wanted to join—in one week.”</blockquote><div className="story-person"><span>NS</span><div><strong>Nisha Sharma</strong><small>Cloud Product Engineer</small></div></div></div>
      <div className="journey-steps">
        {[["01", "Show your signal", "Create one rich profile with verified skills, work, and interview strengths."], ["02", "Meet the right fit", "See roles, projects, and people ranked by relevance—not ad spend."], ["03", "Move with confidence", "Interview, collaborate, and manage protected milestones in one flow."]].map(([number, title, copy]) => <article key={number}><span>{number}</span><div><strong>{title}</strong><p>{copy}</p></div></article>)}
      </div>
    </section>

    <div className="workspace-grid proof-grid">
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">For talent</span><h2>Best matches right now</h2></div><button className="ghost-button" onClick={() => navigate("jobs")}>View all</button></div><div className="compact-list">{jobs.slice(0, 3).map((job) => <article className="compact-card" key={job.id}><div><strong>{job.title}</strong><small>{job.company} · {job.location} · {job.salary} LPA</small></div><span className="status-pill">{job.match}%</span></article>)}</div></section>
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">For teams</span><h2>High-signal talent</h2></div><span className="status-pill">Live scoring</span></div><div className="pipeline-list">{candidates.slice(0, 3).map((candidate) => <Candidate candidate={candidate} key={candidate.name} />)}</div></section>
    </div>

    <section className="landing-cta"><div><span className="eyebrow">Your next chapter is already here</span><h2>Come for one opportunity. Stay for an entire career ecosystem.</h2><p>Jobs, freelance projects, trusted people, better interviews, and protected work—connected at last.</p></div><div><button className="primary-button" onClick={() => navigate("jobs")}>Find your opportunity</button><button className="secondary-button" onClick={() => navigate("admin")}>Hire exceptional people</button></div></section>
  </section>;
}

function Jobs() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("all");
  const [experience, setExperience] = useState("all");
  const [salary, setSalary] = useState(0);
  const [remote, setRemote] = useState(false);
  const [applied, setApplied] = useState(new Set());
  const [saved, setSaved] = useState(new Set());
  useShellBridge(setKeyword);
  const results = useMemo(() => jobs.filter((job) => {
    const haystack = [job.title, job.company, job.location, ...job.skills].join(" ").toLowerCase();
    return (!keyword || haystack.includes(keyword.toLowerCase())) && (location === "all" || job.location === location) && (experience === "all" || job.experience === experience) && job.salary >= salary && (!remote || job.remote);
  }), [keyword, location, experience, salary, remote]);
  const updateSet = (setter, id, message) => setter((current) => { const next = new Set(current); next.add(id); notify(...message); return next; });
  return <section className="view active">
    <SectionTitle eyebrow="Curated opportunities" title="Find work that fits where you are going."><button className="primary-button" onClick={() => navigate("admin")}>Post a job</button></SectionTitle>
    <div className="tool-row">
      <label>Keyword<input value={keyword} onChange={(e) => setKeyword(e.target.value)} type="search" placeholder="React, Java, DevOps" /></label>
      <label>Location<select value={location} onChange={(e) => setLocation(e.target.value)}><option value="all">All locations</option>{["Remote", "Bengaluru", "Pune", "Hyderabad", "Mumbai"].map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Experience<select value={experience} onChange={(e) => setExperience(e.target.value)}><option value="all">Any experience</option>{["0-2", "3-5", "6-9", "10+"].map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Salary min<input value={salary} onChange={(e) => setSalary(Number(e.target.value))} type="range" min="0" max="80" /><output>{salary ? `${salary} LPA+` : "Any"}</output></label>
      <label className="check-line"><input checked={remote} onChange={(e) => setRemote(e.target.checked)} type="checkbox" />Remote only</label>
    </div>
    <div className="result-layout"><div className="result-list">{results.length ? results.map((job) => <article className="job-card" key={job.id}><header><div><h2>{job.title}</h2><strong>{job.company}</strong></div><span className="status-pill">{job.match}% match</span></header><div className="job-meta"><span className="tag">{job.location}</span><span className="tag">{job.experience} yrs</span><span className="tag">{job.salary} LPA</span><span className="tag coral">{job.status}</span></div><Skills items={job.skills} /><div className="card-actions"><button disabled={applied.has(job.id)} className="primary-button" onClick={() => updateSet(setApplied, job.id, ["Application submitted", `${job.company} can now review your application.`])}>{applied.has(job.id) ? "Applied ✓" : "Apply now"}</button><button className="secondary-button" onClick={() => updateSet(setSaved, job.id, ["Job saved", `${job.title} was added to your shortlist.`])}>{saved.has(job.id) ? "Saved ✓" : "Save"}</button></div></article>) : <article className="empty-state"><strong>No roles match yet</strong><p>Try a broader skill, location, or salary range.</p><button className="secondary-button" onClick={() => { setKeyword(""); setLocation("all"); setExperience("all"); setSalary(0); setRemote(false); }}>Reset filters</button></article>}</div>
      <aside className="insight-panel"><span className="eyebrow">Live insight</span><h2>{results.length} matching roles</h2><p>Your strongest signal is React paired with cloud platform experience.</p><Skills items={[...new Set(results.flatMap((job) => job.skills))].slice(0, 10)} /><h2>Application tracker</h2><div className="mini-timeline">{["Applied: CloudNova Systems", "Shortlisted: TalentWorks AI", "Interview: Friday, 11:30 AM", "Offer review: FinGrid Labs"].map((item) => <article className="timeline-item" key={item}>{item}</article>)}</div></aside>
    </div>
  </section>;
}

function Projects() {
  const [keyword, setKeyword] = useState("");
  const [budget, setBudget] = useState("all");
  const [duration, setDuration] = useState("all");
  const [bids, setBids] = useState(new Set());
  useShellBridge(setKeyword);
  const results = projects.filter((project) => [project.title, project.owner, ...project.skills].join(" ").toLowerCase().includes(keyword.toLowerCase()) && (budget === "all" || project.budget >= Number(budget)) && (duration === "all" || project.duration === duration));
  return <section className="view active"><SectionTitle eyebrow="Freelance marketplace" title="Turn ambitious ideas into funded milestones."><button className="primary-button" onClick={() => navigate("admin")}>Create project</button></SectionTitle>
    <div className="tool-row"><label>Skill<input value={keyword} onChange={(e) => setKeyword(e.target.value)} type="search" placeholder="AI, mobile, cloud" /></label><label>Budget<select value={budget} onChange={(e) => setBudget(e.target.value)}><option value="all">Any budget</option><option value="10000">Above $10K</option><option value="25000">Above $25K</option><option value="50000">Above $50K</option></select></label><label>Duration<select value={duration} onChange={(e) => setDuration(e.target.value)}><option value="all">Any duration</option><option value="short">Under 4 weeks</option><option value="medium">1–3 months</option><option value="long">3+ months</option></select></label></div>
    <div className="project-board">{results.map((project) => <article className="project-card" key={project.id}><header><div><h2>{project.title}</h2><small>{project.owner}</small></div><span className="status-pill">${project.budget.toLocaleString()}</span></header><div className="project-meta"><span className="tag">{project.duration}</span><span className="tag coral">{project.status}</span></div><Skills items={project.skills} /><div className="card-actions"><button disabled={bids.has(project.id)} className="primary-button" onClick={() => { setBids((current) => new Set(current).add(project.id)); notify("Proposal submitted", `Your proposal was sent to ${project.owner}.`); }}>{bids.has(project.id) ? "Proposal sent ✓" : "Bid project"}</button><button className="secondary-button" onClick={() => notify("Team invite ready", "Choose collaborators from your network to continue.")}>Invite team</button></div></article>)}</div>
    <section className="panel payment-panel"><div className="panel-head"><h2>Escrow payment flow</h2><span className="status-pill">Milestone protected</span></div><div className="payment-flow">{["Owner funds", "Escrow locks", "Work approved", "Payment released"].map((item) => <span key={item}>{item}</span>)}</div><div className="invoice-list">{invoices.map((invoice) => <article className="invoice-item" key={invoice.title}><strong>{invoice.title}</strong><small>{invoice.amount} · {invoice.state}</small></article>)}</div></section>
  </section>;
}

function Network() {
  const [feed, setFeed] = useState(seedFeed);
  const [text, setText] = useState("");
  const [type, setType] = useState("Hiring");
  useShellBridge(setText);
  const publish = (event) => { event?.preventDefault(); if (!text.trim()) return; setFeed((items) => [{ initials: "ME", name: "You", type, text: text.trim(), meta: "Just now" }, ...items]); setText(""); notify("Update published", "Your network update is now live."); };
  return <section className="view active"><SectionTitle eyebrow="Professional network" title="Useful signals, generous referrals, real momentum."><button className="primary-button" onClick={publish}>Publish update</button></SectionTitle><form className="composer" onSubmit={publish}><textarea value={text} onChange={(e) => setText(e.target.value)} rows="3" placeholder="Share a role, project, referral, or interview insight…" /><div className="composer-actions"><label className="compact-select">Topic<select value={type} onChange={(e) => setType(e.target.value)}>{["Hiring", "Project", "Referral", "Interview"].map((item) => <option key={item}>{item}</option>)}</select></label><button className="secondary-button">Add to feed</button></div></form><div className="feed-stack full-feed">{feed.map((post, index) => <FeedItem post={post} key={`${post.name}-${index}`} />)}</div></section>;
}

function Interview() {
  const [seconds, setSeconds] = useState(1200);
  const [running, setRunning] = useState(false);
  const [messages, setMessages] = useState(["RM: Walk me through a production outage you handled.", "AK: I’ll frame it using Situation, Task, Action, and Result.", "RM: Good. Include the tradeoffs you considered."]);
  const [message, setMessage] = useState("");
  const [scores, setScores] = useState([4.5, 4, 4.5, 4]);
  useShellBridge();
  useEffect(() => { if (!running) return; const timer = window.setInterval(() => setSeconds((value) => { if (value <= 1) { setRunning(false); notify("Interview complete", "The recording and feedback are ready."); return 0; } return value - 1; }), 1000); return () => window.clearInterval(timer); }, [running]);
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const send = (event) => { event.preventDefault(); if (!message.trim()) return; setMessages((items) => [...items, `You: ${message.trim()}`]); setMessage(""); };
  return <section className="view active"><SectionTitle eyebrow="Structured live interview" title="A calmer room for better conversations."><button className="primary-button" onClick={() => { setRunning(true); notify("Interview started", "The 20-minute session is now live."); }}>{running ? "Session live" : "Start 20 min"}</button></SectionTitle><div className="interview-grid"><section className="video-stage"><div className="video-main"><span className="camera-label">Candidate camera</span><div className="avatar-large">AK</div><strong>Ananya Kulkarni</strong><small>Senior Full Stack Engineer</small></div><div className="video-side"><div><span className="camera-label">Interviewer</span><div className="avatar-small">RM</div></div><div><span className="camera-label">Screen share</span><div className="screen-share"><span /><span /><span /></div></div></div><div className="call-controls"><button className="icon-button active-control">◉</button><button className="icon-button active-control">⌁</button><button className="icon-button">□</button><button className="danger-button" onClick={() => { setRunning(false); notify("Interview ended", `Session closed with ${time} remaining.`); }}>End</button></div></section><aside className="interview-side"><div className="timer-block"><span>Session timer</span><strong>{time}</strong><small>{running ? "● Recording in progress" : "Recording ready"}</small></div><div className="chat-box">{messages.map((item, index) => <div className="chat-message" key={index}>{item}</div>)}</div><form className="chat-form" onSubmit={send}><input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Interview chat message" /><button className="secondary-button">Send</button></form></aside></div><section className="rating-panel"><div className="panel-head"><h2>STAR feedback</h2><span className="status-pill">Auto score <strong>{(scores.reduce((sum, item) => sum + item, 0) / scores.length).toFixed(1)}</strong></span></div><div className="star-grid">{[["Situation", "Handled a production outage during a release window."], ["Task", "Restore availability and protect customer transactions."], ["Action", "Scaled pods, isolated a database lock, and coordinated rollback."], ["Result", "Recovered within 20 minutes with clear ownership."]].map(([label, value]) => <label key={label}>{label}<textarea defaultValue={value} /></label>)}</div><div className="score-grid">{["Communication", "Technical skills", "Problem solving", "Confidence"].map((label, index) => <label key={label}>{label}<input value={scores[index]} onChange={(e) => setScores((items) => items.map((item, itemIndex) => itemIndex === index ? Number(e.target.value) : item))} type="range" min="1" max="5" step=".5" /></label>)}</div></section></section>;
}

function Profile() {
  const [uploads, setUploads] = useState([]);
  const [profile, setProfile] = useState(() => {
    const fallback = { name: "Rahul Tiple", role: "DevOps Engineer", company: "Alyssum Global Services Pvt Ltd", bio: "DevOps engineer focused on reliable cloud platforms, Kubernetes, automation, and observability." };
    try { return { ...fallback, ...JSON.parse(localStorage.getItem("hiresphere-profile") || "{}") }; } catch { return fallback; }
  });
  useShellBridge();
  const upload = (label, files) => { if (!files.length) return; setUploads((items) => [`${label}: ${files.length} file${files.length > 1 ? "s" : ""} ready`, ...items]); notify("Upload ready", `${label} passed the local file check.`); };
  const updateProfile = (field) => (event) => setProfile((current) => ({ ...current, [field]: event.target.value }));
  const saveProfile = (event) => {
    event.preventDefault();
    localStorage.setItem("hiresphere-profile", JSON.stringify(profile));
    window.parent?.postMessage({ type: "hiresphere:profile-updated", profile }, window.location.origin);
    notify("Profile saved", "Your profile details and document metadata were saved.");
  };
  return <section className="view active"><SectionTitle eyebrow="Candidate profile" title="Edit your profile details."><button className="primary-button" type="submit" form="profile-editor">Save profile</button></SectionTitle><div className="profile-grid"><form id="profile-editor" className="profile-card profile-editor" onSubmit={saveProfile}><div className="profile-photo">RT</div><label>Full name<input value={profile.name} onChange={updateProfile("name")} required /></label><label>Role<input value={profile.role} onChange={updateProfile("role")} required /></label><label>Company<input value={profile.company} onChange={updateProfile("company")} required /></label><label>About<textarea value={profile.bio} onChange={updateProfile("bio")} /></label><Skills items={["Kubernetes", "AWS", "Terraform", "Docker", "Observability"]} /></form><section className="upload-panel"><h2>Documents</h2><div className="upload-grid">{["Resume PDF", "Cover letter", "Photo", "Certificates", "Portfolio", "Self interview video"].map((label) => <label key={label}>{label}<input type="file" multiple={label === "Certificates"} onChange={(e) => upload(label, e.target.files)} /></label>)}</div><div className="upload-status">{uploads.map((item) => <article className="timeline-item" key={item}>{item}</article>)}</div></section><section className="self-video"><div className="panel-head"><h2>Self interview</h2><span className="status-pill">2–5 min</span></div><div className="video-card"><div className="avatar-large">RT</div><div><strong>Self intro recording</strong><small>Clarity 87% · filler words low · confidence strong</small></div></div><button className="secondary-button" onClick={() => notify("Recording started", "Your self-introduction capture is ready.")}>Record self intro</button></section></div></section>;
}

function HrStudio() {
  useShellBridge();
  const submit = (kind) => (event) => { event.preventDefault(); event.currentTarget.reset(); notify(`${kind} created`, `The new ${kind.toLowerCase()} is ready for review.`); };
  return <section className="view active"><SectionTitle eyebrow="HR + team studio" title="Move from opening to shortlist without losing the human thread." /><div className="admin-grid"><form className="studio-form" onSubmit={submit("Job")}><h2>Create job</h2><input name="title" placeholder="Job title" required /><input name="skills" placeholder="Required skills" required /><select name="location"><option>Remote</option><option>Bengaluru</option><option>Pune</option><option>Hyderabad</option></select><input name="salary" type="number" placeholder="Salary LPA" required /><textarea name="description" placeholder="What will this person make possible?" /><button className="primary-button">Add job</button></form><form className="studio-form" onSubmit={submit("Project")}><h2>Create project</h2><input name="title" placeholder="Project title" required /><input name="skills" placeholder="Skills needed" required /><input name="budget" type="number" placeholder="Budget USD" required /><input name="deadline" type="date" required /><textarea name="milestones" placeholder="Key milestones" /><button className="primary-button">Add project</button></form><section className="shortlist-panel"><div className="panel-head"><h2>AI candidate matching</h2><span className="status-pill">Explainable ranking</span></div><div className="candidate-list">{candidates.map((candidate) => <Candidate key={candidate.name} candidate={candidate} action={<button className="secondary-button" onClick={() => notify("Candidate shortlisted", `${candidate.name} moved to the shortlist.`)}>Shortlist</button>} />)}</div></section></div></section>;
}

function Scale() {
  useShellBridge();
  const lanes = [["Frontend", "React micro-frontends with shared design tokens, route isolation, and independently shipped bundles."], ["API gateway", "JWT auth, MFA, RBAC policy checks, rate limits, audit logs, and domain routing."], ["Services", "User, Job, Project, Interview, Notification, Payment, Search, and Recommendation domains."], ["Real time", "WebSocket presence, Redis Pub/Sub fanout, and Kafka-backed durable events."], ["Data", "PostgreSQL transactions, MongoDB feed data, Redis cache, and encrypted object storage."], ["Cloud scale", "Docker, Kubernetes, Helm, autoscaling, observability, and progressive delivery."]];
  return <section className="view active"><SectionTitle eyebrow="Platform architecture" title="Independent at the edges. Coherent at the center." /><div className="architecture-grid">{lanes.map(([title, text], index) => <section className="arch-lane" key={title}><span className="arch-number">0{index + 1}</span><h2>{title}</h2><p>{text}</p></section>)}</div><div className="scale-flow">{["Load balancer", "API gateway", "Kubernetes", "Microservices", "Redis cache", "PostgreSQL + MongoDB"].map((item) => <span key={item}>{item}</span>)}</div></section>;
}

const pages = { workspace: Workspace, jobs: Jobs, projects: Projects, network: Network, interview: Interview, profile: Profile, "hr-studio": HrStudio, scale: Scale };
const service = document.body.dataset.service;
const Page = pages[service] || Workspace;
createRoot(document.getElementById("root")).render(<React.StrictMode><Page /></React.StrictMode>);
