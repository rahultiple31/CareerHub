import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "../services/shared/base.css";
import "../gateway/styles.css";
import "./react.css";
import "./landing.css";

const routes = {
  workspace: ["Workspace", "workspace/", "⌂"],
  jobs: ["Jobs", "jobs/", "◎"],
  projects: ["Projects", "projects/", "◇"],
  network: ["Network", "network/", "◉"],
  interview: ["Interview", "interview/", "◫"],
  profile: ["Profile", "profile/", "○"],
  admin: ["HR Studio", "hr-studio/", "✦"],
  architecture: ["Scale", "scale/", "⬡"]
};

const initialNotifications = [
  ["Interview scheduled", "Ananya Kulkarni accepted the 20-minute mock interview slot."],
  ["Project invitation", "PeoplePilot invited you to bid on the WebRTC interview suite."],
  ["Application update", "CloudNova moved your application to technical shortlist."]
];

const workspaceAudienceTabs = {
  talent: "Find work",
  teams: "Hire talent",
  builders: "Build"
};

const defaultCandidateProfile = {
  name: "Rahul Tiple",
  role: "DevOps Engineer",
  company: "Alyssum Global Services Pvt Ltd"
};

function loadCandidateProfile() {
  try {
    return { ...defaultCandidateProfile, ...JSON.parse(localStorage.getItem("hiresphere-profile") || "{}") };
  } catch {
    return defaultCandidateProfile;
  }
}

function activeHash() {
  const value = window.location.hash.slice(1);
  return routes[value] ? value : "workspace";
}

function SidebarProfile({ profile, onEdit }) {
  return <section className="profile-overview-card sidebar-profile-card" aria-label="Candidate profile overview">
    <div className="profile-overview-main">
      <div className="profile-completion">
        <div className="profile-avatar" aria-label="Rahul Tiple profile photo">RT</div>
        <strong>100%</strong>
      </div>
      <button className="profile-name-button" onClick={onEdit} aria-label={`Edit ${profile.name}'s profile`}>{profile.name}</button>
      <p>{profile.role}</p>
      <p className="profile-company">@ {profile.company}</p>
      <small>Last updated 10m ago</small>
    </div>
  </section>;
}

function App() {
  const [active, setActive] = useState(activeHash);
  const [role, setRole] = useState("Candidate");
  const [dark, setDark] = useState(() => {
    const savedTheme = localStorage.getItem("hiresphere-theme");
    return savedTheme ? savedTheme === "dark" : window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  });
  const [trayOpen, setTrayOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [search, setSearch] = useState("");
  const [workspaceAudience, setWorkspaceAudience] = useState("talent");
  const [candidateProfile, setCandidateProfile] = useState(loadCandidateProfile);
  const [loading, setLoading] = useState(true);
  const [frameHeight, setFrameHeight] = useState(760);
  const frame = useRef(null);

  const go = (view) => {
    const next = routes[view] ? view : "workspace";
    setActive(next);
    setLoading(true);
    window.location.hash = next;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("hiresphere-theme", dark ? "dark" : "light");
    frame.current?.contentWindow?.postMessage({ type: "hiresphere:theme", dark }, window.location.origin);
  }, [dark]);

  useEffect(() => {
    const onHash = () => setActive(activeHash());
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "hiresphere:navigate") go(event.data.view);
      if (event.data?.type === "hiresphere:profile-updated" && event.data.profile) {
        const updatedProfile = { ...defaultCandidateProfile, ...event.data.profile };
        setCandidateProfile(updatedProfile);
        localStorage.setItem("hiresphere-profile", JSON.stringify(updatedProfile));
      }
      if (event.data?.type === "hiresphere:notify") {
        setNotifications((items) => [[event.data.title, event.data.body], ...items]);
        setTrayOpen(true);
      }
      if (event.data?.type === "hiresphere:resize") setFrameHeight(Math.max(640, Number(event.data.height) || 0));
    };
    window.addEventListener("hashchange", onHash);
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("message", onMessage);
    };
  }, []);

  useEffect(() => {
    frame.current?.contentWindow?.postMessage({ type: "hiresphere:search", query: search }, window.location.origin);
  }, [search]);

  useEffect(() => {
    frame.current?.contentWindow?.postMessage({ type: "hiresphere:audience", audience: workspaceAudience }, window.location.origin);
  }, [workspaceAudience]);

  const route = routes[active];
  return <div className="app-shell react-shell">
    <aside className="sidebar" aria-label="Main navigation">
      <a className="brand" href="#workspace">
        <span className="brand-mark">HS</span>
        <span><strong>hiresphere</strong><small>Talent OS</small></span>
      </a>
      <nav className="nav-groups">
        <SidebarProfile profile={candidateProfile} onEdit={() => go("profile")} />
        {Object.entries(routes).filter(([key]) => key !== "profile").map(([key, [label,, icon]]) =>
          <button key={key} className={`nav-item ${active === key ? "active" : ""}`} onClick={() => go(key)} aria-current={active === key ? "page" : undefined}>
            <span className="nav-icon">{icon}</span>{label}
          </button>
        )}
      </nav>
      <div className="role-switcher">
        <span>Active role</span>
        <div className="segmented">
          {["Candidate", "HR", "Owner", "Interviewer"].map((item) =>
            <button key={item} className={`role-tab ${role === item ? "active" : ""}`} onClick={() => {
              setRole(item);
              setNotifications((items) => [["Role switched", `Workspace permissions changed to ${item}.`], ...items]);
            }}>{item}</button>)}
        </div>
      </div>
      <div className="sidebar-status"><span className="live-dot" />All systems operational</div>
    </aside>
    <main className="main">
      <header className="topbar">
        <label className="global-search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} type="search" placeholder="Jobs, projects, people, skills" /></label>
        <div className="top-actions">
          <button className="icon-button" onClick={() => setDark((value) => !value)} aria-label={dark ? "Switch to day mode" : "Switch to night mode"} title={dark ? "Day mode" : "Night mode"}>{dark ? "☀" : "☾"}</button>
          <button className="icon-button notification-button" onClick={() => setTrayOpen((value) => !value)} aria-label="Notifications">♢{notifications.length > 0 && <b>{notifications.length}</b>}</button>
          <button className="primary-button" onClick={() => go("interview")}>Schedule interview</button>
        </div>
      </header>
      {trayOpen && <section className="notification-tray open" aria-live="polite">
        <div className="tray-head"><h2>Notifications</h2><button className="ghost-button" onClick={() => setNotifications([])}>Clear all</button></div>
        {notifications.length ? notifications.map(([title, body], index) => <article className="notification-item" key={`${title}-${index}`}><strong>{title}</strong><span>{body}</span></article>) : <article className="notification-item"><strong>All clear</strong><span>No new platform events.</span></article>}
      </section>}
      <div className="service-heading">
        <div className="service-heading-main">
          <div className="service-heading-title"><span className="eyebrow">{role} workspace</span><strong>{route[0]}</strong></div>
          {active === "workspace" && <div className="audience-switch header-audience-switch" role="tablist" aria-label="Choose your goal">
            {Object.entries(workspaceAudienceTabs).map(([key, label]) => <button key={key} role="tab" aria-selected={workspaceAudience === key} className={workspaceAudience === key ? "active" : ""} onClick={() => setWorkspaceAudience(key)}>{label}</button>)}
          </div>}
        </div>
        <span className="service-health"><i />Live</span>
      </div>
      {loading && <div className="route-loader"><span /></div>}
      <iframe id="serviceFrame" ref={frame} key={active} className={loading ? "service-frame-loading" : ""} title={`${route[0]} service`} src={route[1]} scrolling="no" height={frameHeight} onLoad={() => {
        setLoading(false);
        frame.current?.contentWindow?.postMessage({ type: "hiresphere:theme", dark }, window.location.origin);
        frame.current?.contentWindow?.postMessage({ type: "hiresphere:audience", audience: workspaceAudience }, window.location.origin);
        if (search) frame.current?.contentWindow?.postMessage({ type: "hiresphere:search", query: search }, window.location.origin);
      }} />
    </main>
  </div>;
}

createRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>);
