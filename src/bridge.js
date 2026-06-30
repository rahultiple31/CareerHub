import { useEffect } from "react";

export function notify(title, body) {
  window.parent?.postMessage({ type: "hiresphere:notify", title, body }, window.location.origin);
}

export function navigate(view) {
  window.parent?.postMessage({ type: "hiresphere:navigate", view }, window.location.origin);
}

export function useShellBridge(onSearch) {
  useEffect(() => {
    const receive = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "hiresphere:theme") {
        document.body.classList.toggle("dark", Boolean(event.data.dark));
      }
      if (event.data?.type === "hiresphere:search") onSearch?.(String(event.data.query || ""));
    };

    const reportHeight = () => window.parent?.postMessage({
      type: "hiresphere:resize",
      height: document.documentElement.scrollHeight
    }, window.location.origin);
    const syncViewport = () => {
      const shellWidth = window.parent?.innerWidth || window.innerWidth;
      document.documentElement.style.setProperty("--shell-vw", `${shellWidth / 100}px`);
      document.documentElement.classList.toggle("shell-wide", shellWidth > 1180);
    };

    window.addEventListener("message", receive);
    window.parent?.addEventListener("resize", syncViewport);
    const observer = new ResizeObserver(reportHeight);
    observer.observe(document.body);
    syncViewport();
    reportHeight();
    return () => {
      window.removeEventListener("message", receive);
      window.parent?.removeEventListener("resize", syncViewport);
      observer.disconnect();
    };
  }, [onSearch]);
}
