const routes = Object.freeze({
  workspace: { label: "Workspace", path: "workspace/" },
  jobs: { label: "Jobs", path: "jobs/" },
  projects: { label: "Projects", path: "projects/" },
  network: { label: "Network", path: "network/" },
  interview: { label: "Interview", path: "interview/" },
  profile: { label: "Profile", path: "profile/" },
  admin: { label: "HR Studio", path: "hr-studio/" },
  architecture: { label: "Scale", path: "scale/" }
});

const frame = document.querySelector("#serviceFrame");
const search = document.querySelector("#globalSearch");
let notifications = [
  { title: "Interview scheduled", body: "Ananya Kulkarni accepted the 20-minute mock interview slot." },
  { title: "Project invitation", body: "PeoplePilot invited you to bid on the WebRTC interview suite." },
  { title: "Application update", body: "CloudNova moved your application to technical shortlist." }
];

function activeView() {
  const requested = window.location.hash.slice(1);
  return Object.hasOwn(routes, requested) ? requested : "workspace";
}

function renderNotifications() {
  const list = document.querySelector("#notificationList");
  list.replaceChildren();
  const items = notifications.length
    ? notifications
    : [{ title: "All clear", body: "No new platform events." }];
  items.forEach((item) => {
    const article = document.createElement("article");
    article.className = "notification-item";
    const title = document.createElement("strong");
    const body = document.createElement("span");
    title.textContent = item.title;
    body.textContent = item.body;
    article.append(title, body);
    list.append(article);
  });
}

function notify(title, body) {
  notifications.unshift({ title, body });
  renderNotifications();
}

function navigate(viewId, updateHash = true) {
  const route = routes[viewId] || routes.workspace;
  const resolvedView = routes[viewId] ? viewId : "workspace";
  document.querySelectorAll(".nav-item").forEach((item) => {
    const active = item.dataset.view === resolvedView;
    item.classList.toggle("active", active);
    item.setAttribute("aria-current", active ? "page" : "false");
  });
  if (frame.dataset.view !== resolvedView) {
    frame.dataset.view = resolvedView;
    frame.classList.add("service-frame-loading");
    frame.src = route.path;
    frame.title = `${route.label} service`;
  }
  if (updateHash && window.location.hash !== `#${resolvedView}`) {
    window.location.hash = resolvedView;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-view], [data-view-jump]").forEach((button) => {
  button.addEventListener("click", () => navigate(button.dataset.view || button.dataset.viewJump));
});

document.querySelectorAll(".role-tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".role-tab").forEach((tab) => tab.classList.remove("active"));
    button.classList.add("active");
    notify("Role switched", `Workspace permissions changed to ${button.textContent}.`);
  });
});

document.querySelector("#themeToggle").addEventListener("click", () => {
  const dark = document.body.classList.toggle("dark");
  frame.contentWindow?.postMessage({ type: "hiresphere:theme", dark }, window.location.origin);
});

document.querySelector("#notifyToggle").addEventListener("click", () => {
  document.querySelector("#notificationTray").classList.toggle("open");
});

document.querySelector("#clearNotifications").addEventListener("click", () => {
  notifications = [];
  renderNotifications();
});

search.addEventListener("input", () => {
  frame.contentWindow?.postMessage(
    { type: "hiresphere:search", query: search.value },
    window.location.origin
  );
});

frame.addEventListener("load", () => {
  frame.classList.remove("service-frame-loading");
  frame.contentWindow?.postMessage(
    { type: "hiresphere:theme", dark: document.body.classList.contains("dark") },
    window.location.origin
  );
  if (search.value) {
    frame.contentWindow?.postMessage(
      { type: "hiresphere:search", query: search.value },
      window.location.origin
    );
  }
});

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin) return;
  if (event.data?.type === "hiresphere:navigate") navigate(event.data.view);
  if (event.data?.type === "hiresphere:notify") notify(event.data.title, event.data.body);
  if (event.data?.type === "hiresphere:resize") {
    frame.style.height = `${Math.max(640, Number(event.data.height) || 0)}px`;
  }
});

window.addEventListener("hashchange", () => navigate(activeView(), false));
renderNotifications();
navigate(activeView(), false);
