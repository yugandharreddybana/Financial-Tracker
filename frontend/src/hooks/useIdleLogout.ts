import { useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";

const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
const DEBOUNCE_MS = 1000;

export function useIdleLogout() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef(Date.now());

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast("Session expired due to inactivity", { icon: "⏰" });
    window.location.href = "/login";
  }, []);

  const resetTimer = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityRef.current < DEBOUNCE_MS) return;
    lastActivityRef.current = now;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logout, IDLE_TIMEOUT_MS);
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const events: (keyof WindowEventMap)[] = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));

    // Start the initial timer
    timerRef.current = setTimeout(logout, IDLE_TIMEOUT_MS);

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer, logout]);
}
