export function setupServiceSearch(filter) {
  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === "hiresphere:theme") document.body.classList.toggle("dark", Boolean(event.data.dark));
    if (event.data?.type === "hiresphere:search") filter(String(event.data.query || "").trim().toLowerCase());
  });
}

export function text(value) {
  return document.createTextNode(String(value));
}

export function element(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.append(text(content));
  return node;
}
