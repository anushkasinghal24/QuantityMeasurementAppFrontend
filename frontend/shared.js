(() => {
  const STORAGE_KEYS = {
    theme: "qm_theme",
    users: "qm_users",
    session: "qm_session",
  };

  function getStoredTheme() {
    const t = localStorage.getItem(STORAGE_KEYS.theme);
    return t === "dark" || t === "light" ? t : null;
  }

  function getPreferredTheme() {
    const stored = getStoredTheme();
    if (stored) return stored;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  function setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    applyTheme(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    setTheme(current === "dark" ? "light" : "dark");
  }

  function wireThemeToggles() {
    const toggles = Array.from(document.querySelectorAll("[data-theme-toggle]"));
    for (const btn of toggles) btn.addEventListener("click", toggleTheme);
  }

  function safeJsonParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function loadUsers() {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.users), []);
  }

  function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }

  function getSession() {
    const sessionFromSessionStorage = safeJsonParse(
      sessionStorage.getItem(STORAGE_KEYS.session),
      null,
    );
    if (sessionFromSessionStorage) return sessionFromSessionStorage;
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.session), null);
  }

  function setSession(session, { persist } = { persist: true }) {
    if (persist) {
      sessionStorage.removeItem(STORAGE_KEYS.session);
      localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
      return;
    }

    localStorage.removeItem(STORAGE_KEYS.session);
    sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.session);
    sessionStorage.removeItem(STORAGE_KEYS.session);
  }

  // Expose a tiny API for other scripts
  window.QM = {
    storageKeys: STORAGE_KEYS,
    theme: { getPreferredTheme, applyTheme, setTheme, toggleTheme, wireThemeToggles },
    auth: { loadUsers, saveUsers, getSession, setSession, clearSession },
  };

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(getPreferredTheme());
    wireThemeToggles();
  });
})();
