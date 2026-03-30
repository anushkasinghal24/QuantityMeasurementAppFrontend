(() => {
  const ROUTES = {
    login: "#/login",
    signup: "#/signup",
    dashboard: "#/dashboard",
  };

  const state = {
    type: "length",
    action: "compare",
    operation: "+",
  };

  const UNIT_DEFS = {
    length: {
      label: "Length",
      baseKey: "meter",
      options: {
        millimeter: { label: "Millimeter (mm)", factor: 0.001 },
        centimeter: { label: "Centimeter (cm)", factor: 0.01 },
        meter: { label: "Meter (m)", factor: 1 },
        kilometer: { label: "Kilometer (km)", factor: 1000 },
        inch: { label: "Inch (in)", factor: 0.0254 },
        foot: { label: "Foot (ft)", factor: 0.3048 },
        yard: { label: "Yard (yd)", factor: 0.9144 },
        mile: { label: "Mile (mi)", factor: 1609.344 },
      },
    },
    weight: {
      label: "Weight",
      baseKey: "gram",
      options: {
        milligram: { label: "Milligram (mg)", factor: 0.001 },
        gram: { label: "Gram (g)", factor: 1 },
        kilogram: { label: "Kilogram (kg)", factor: 1000 },
        ounce: { label: "Ounce (oz)", factor: 28.349523125 },
        pound: { label: "Pound (lb)", factor: 453.59237 },
      },
    },
    temp: {
      label: "Temperature",
      baseKey: "c",
      options: {
        c: { label: "Celsius (°C)", toBase: (v) => v, fromBase: (v) => v },
        f: {
          label: "Fahrenheit (°F)",
          toBase: (v) => ((v - 32) * 5) / 9,
          fromBase: (v) => (v * 9) / 5 + 32,
        },
        k: { label: "Kelvin (K)", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
      },
    },
    volume: {
      label: "Volume",
      baseKey: "liter",
      options: {
        milliliter: { label: "Milliliter (mL)", factor: 0.001 },
        liter: { label: "Liter (L)", factor: 1 },
        cubic_meter: { label: "Cubic meter (m³)", factor: 1000 },
        gallon_us: { label: "Gallon (US)", factor: 3.785411784 },
        quart_us: { label: "Quart (US)", factor: 0.946352946 },
        pint_us: { label: "Pint (US)", factor: 0.473176473 },
        cup_us: { label: "Cup (US)", factor: 0.2365882365 },
      },
    },
    area: {
      label: "Area",
      baseKey: "square_meter",
      options: {
        square_millimeter: { label: "Square millimeter (mm²)", factor: 0.000001 },
        square_centimeter: { label: "Square centimeter (cm²)", factor: 0.0001 },
        square_meter: { label: "Square meter (m²)", factor: 1 },
        square_kilometer: { label: "Square kilometer (km²)", factor: 1000000 },
        square_foot: { label: "Square foot (ft²)", factor: 0.09290304 },
        square_yard: { label: "Square yard (yd²)", factor: 0.83612736 },
        acre: { label: "Acre (ac)", factor: 4046.8564224 },
        hectare: { label: "Hectare (ha)", factor: 10000 },
      },
    },
    time: {
      label: "Time",
      baseKey: "second",
      options: {
        millisecond: { label: "Millisecond (ms)", factor: 0.001 },
        second: { label: "Second (s)", factor: 1 },
        minute: { label: "Minute (min)", factor: 60 },
        hour: { label: "Hour (h)", factor: 3600 },
        day: { label: "Day (d)", factor: 86400 },
        week: { label: "Week (wk)", factor: 604800 },
      },
    },
    speed: {
      label: "Speed",
      baseKey: "mps",
      options: {
        mps: { label: "Meters/sec (m/s)", factor: 1 },
        kmph: { label: "Kilometers/hour (km/h)", factor: 0.2777777778 },
        mph: { label: "Miles/hour (mph)", factor: 0.44704 },
        knot: { label: "Knot (kn)", factor: 0.514444 },
        fps: { label: "Feet/sec (ft/s)", factor: 0.3048 },
      },
    },
  };

  function $(id) {
    return document.getElementById(id);
  }

  function showAlert(id, message) {
    const el = $(id);
    if (!el) return;
    el.textContent = message;
    el.classList.remove("d-none");
  }

  function clearAlert(id) {
    const el = $(id);
    if (!el) return;
    el.textContent = "";
    el.classList.add("d-none");
  }

  function clearRouteErrors() {
    clearAlert("loginError");
    clearAlert("signupError");
    clearAlert("calcError");
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function getSession() {
    return window.QM?.auth?.getSession ? window.QM.auth.getSession() : null;
  }

  function isAuthed() {
    return !!getSession();
  }

  function navigate(hash) {
    window.location.hash = hash;
  }

  function getRoute() {
    const h = window.location.hash || "";
    if (h.startsWith("#/")) return h;
    return "";
  }

  function setActive(buttons, predicate) {
    for (const btn of buttons) btn.classList.toggle("active", predicate(btn));
  }

  function getTypeDef() {
    return UNIT_DEFS[state.type];
  }

  function toBase(value, unitKey) {
    const def = getTypeDef();
    const opt = def.options[unitKey];
    if (!opt) throw new Error("Unknown unit");
    if (state.type === "temp") return opt.toBase(value);
    return value * opt.factor;
  }

  function fromBase(value, unitKey) {
    const def = getTypeDef();
    const opt = def.options[unitKey];
    if (!opt) throw new Error("Unknown unit");
    if (state.type === "temp") return opt.fromBase(value);
    return value / opt.factor;
  }

  function formatNumber(value) {
    if (!Number.isFinite(value)) return String(value);
    const abs = Math.abs(value);
    const decimals = abs >= 1000 ? 3 : abs >= 1 ? 4 : 6;
    return value
      .toFixed(decimals)
      .replace(/\.?0+$/, "")
      .replace(/-0$/, "0");
  }

  function populateUnits() {
    const def = getTypeDef();
    const u1 = $("unit1");
    const u2 = $("unit2");
    if (!u1 || !u2) return;

    const prev1 = u1.value;
    const prev2 = u2.value;

    u1.innerHTML = "";
    u2.innerHTML = "";

    for (const key of Object.keys(def.options)) {
      const label = def.options[key].label ?? key;
      const opt1 = document.createElement("option");
      opt1.value = key;
      opt1.textContent = label;
      u1.appendChild(opt1);

      const opt2 = document.createElement("option");
      opt2.value = key;
      opt2.textContent = label;
      u2.appendChild(opt2);
    }

    if (prev1 && def.options[prev1]) u1.value = prev1;
    if (prev2 && def.options[prev2]) u2.value = prev2;

    if (!u1.value) u1.value = def.baseKey;
    if (!u2.value) u2.value = def.baseKey;
  }

  function setType(nextType) {
    if (!UNIT_DEFS[nextType]) return;
    state.type = nextType;

    populateUnits();
    renderCalculator();
    clearResult();
  }

  function setAction(nextAction) {
    if (!["compare", "convert", "arithmetic"].includes(nextAction)) return;
    state.action = nextAction;
    renderCalculator();
    clearResult();
  }

  function setOperation(nextOperation) {
    if (!["+", "-", "*", "/"].includes(nextOperation)) return;
    state.operation = nextOperation;
    renderCalculator();
    clearResult();
  }

  function renderCalculator() {
    clearAlert("calcError");

    const typeButtons = Array.from(document.querySelectorAll("[data-type]"));
    const actionButtons = Array.from(document.querySelectorAll("[data-action]"));
    const opButtons = Array.from(document.querySelectorAll("[data-op]"));

    setActive(typeButtons, (btn) => btn.dataset.type === state.type);

    for (const btn of actionButtons) {
      const isSelected = btn.dataset.action === state.action;
      btn.classList.toggle("btn-primary", isSelected);
      btn.classList.toggle("btn-outline-primary", !isSelected);
      btn.disabled = false;
    }

    const showOps = state.action === "arithmetic";
    $("operationSection")?.classList.toggle("d-none", !showOps);
    setActive(opButtons, (btn) => btn.dataset.op === state.operation);

    const label1 = $("label1");
    const label2 = $("label2");
    const val2 = $("val2");
    const unitLabel2 = $("unitLabel2");
    const opHint = $("opHint");
    const btnSwap = $("btnSwap");
    if (btnSwap) btnSwap.classList.remove("d-none");

    if (state.action === "convert") {
      label1 && (label1.textContent = "Value");
      label2?.classList.add("d-none");
      val2?.classList.add("d-none");
      if (val2) val2.value = "";

      unitLabel2?.classList.remove("d-none");
      if (unitLabel2) {
        unitLabel2.textContent = "To unit";
        unitLabel2.setAttribute("for", "unit2");
      }

      if (btnSwap) btnSwap.disabled = false;
    } else {
      label1 && (label1.textContent = "Value 1");
      label2?.classList.remove("d-none");
      if (label2) {
        label2.textContent = "Value 2";
        label2.setAttribute("for", "val2");
      }
      unitLabel2?.classList.remove("d-none");
      if (unitLabel2) {
        unitLabel2.textContent = "Unit";
        unitLabel2.setAttribute("for", "unit2");
      }
      val2?.classList.remove("d-none");
      if (btnSwap) btnSwap.disabled = true;
    }

    if (opHint) {
      if (state.operation === "*" || state.operation === "/") opHint.classList.remove("d-none");
      else opHint.classList.add("d-none");
    }
  }

  function clearResult() {
    const r = $("result");
    if (r) r.textContent = "—";
  }

  function readNumber(inputEl, fieldName) {
    const raw = inputEl?.value ?? "";
    const value = Number(raw);
    if (!raw || Number.isNaN(value)) throw new Error(`Enter ${fieldName}.`);
    return value;
  }

  function calculate() {
    clearAlert("calcError");

    const unit1 = $("unit1")?.value;
    const unit2 = $("unit2")?.value;
    if (!unit1 || !unit2) return;

    try {
      if (state.action === "convert") {
        const v1 = readNumber($("val1"), "a value");
        const base = toBase(v1, unit1);
        const converted = fromBase(base, unit2);
        $("result").textContent = `${formatNumber(converted)} ${UNIT_DEFS[state.type].options[unit2].label}`;
        return;
      }

      const v1 = readNumber($("val1"), "Value 1");
      const v2 = readNumber($("val2"), "Value 2");

      if (state.action === "compare") {
        const b1 = toBase(v1, unit1);
        const b2 = toBase(v2, unit2);
        const rel = b1 > b2 ? ">" : b1 < b2 ? "<" : "=";
        $("result").textContent = `Value 1 ${rel} Value 2`;
        return;
      }

      if (state.operation === "+" || state.operation === "-") {
        const b1 = toBase(v1, unit1);
        const b2 = toBase(v2, unit2);
        const resultBase = state.operation === "+" ? b1 + b2 : b1 - b2;
        const out = fromBase(resultBase, unit1);
        $("result").textContent = `${formatNumber(out)} ${UNIT_DEFS[state.type].options[unit1].label}`;
        return;
      }

      if (unit1 !== unit2) {
        showAlert("calcError", "For × and ÷, please use the same unit on both sides.");
        return;
      }

      if (state.operation === "*") {
        const result = v1 * v2;
        const unitLabel = UNIT_DEFS[state.type].options[unit1].label;
        $("result").textContent = `${formatNumber(result)} ${unitLabel}²`;
        return;
      }

      if (state.operation === "/") {
        if (v2 === 0) {
          showAlert("calcError", "Cannot divide by zero.");
          return;
        }
        const result = v1 / v2;
        $("result").textContent = `${formatNumber(result)} (unitless)`;
      }
    } catch (err) {
      showAlert("calcError", err instanceof Error ? err.message : "Invalid input.");
    }
  }

  async function copyResult() {
    const text = $("result")?.textContent ?? "";
    if (!text || text === "—") return;

    const btn = $("btnCopy");
    try {
      await navigator.clipboard.writeText(text);
      if (btn) btn.textContent = "Copied";
      setTimeout(() => {
        if (btn) btn.textContent = "Copy";
      }, 900);
    } catch {
      showAlert("calcError", "Copy failed in this browser. Select the result and copy manually.");
    }
  }

  function routeElements() {
    return {
      login: $("routeLogin"),
      signup: $("routeSignup"),
      dashboard: $("routeDashboard"),
      navLogin: $("navLogin"),
      navSignup: $("navSignup"),
      btnLogout: $("btnLogout"),
      userBadge: $("userBadge"),
    };
  }

  function renderNav() {
    const { navLogin, navSignup, btnLogout, userBadge } = routeElements();
    const session = getSession();

    if (session) {
      navLogin?.classList.add("d-none");
      navSignup?.classList.add("d-none");
      btnLogout?.classList.remove("d-none");
      if (userBadge) userBadge.textContent = session.email || "Signed in";
    } else {
      navLogin?.classList.remove("d-none");
      navSignup?.classList.remove("d-none");
      btnLogout?.classList.add("d-none");
      if (userBadge) userBadge.textContent = "Not signed in";
    }
  }

  function showRoute(name) {
    const { login, signup, dashboard } = routeElements();
    login?.classList.toggle("d-none", name !== "login");
    signup?.classList.toggle("d-none", name !== "signup");
    dashboard?.classList.toggle("d-none", name !== "dashboard");
  }

  function resolveAndRenderRoute() {
    clearRouteErrors();
    const route = getRoute();

    if (!route) {
      navigate(isAuthed() ? ROUTES.dashboard : ROUTES.login);
      return;
    }

    if (route === ROUTES.dashboard && !isAuthed()) {
      navigate(ROUTES.login);
      return;
    }

    if ((route === ROUTES.login || route === ROUTES.signup) && isAuthed()) {
      navigate(ROUTES.dashboard);
      return;
    }

    if (route === ROUTES.login) showRoute("login");
    else if (route === ROUTES.signup) showRoute("signup");
    else showRoute("dashboard");

    renderNav();
  }

  async function sha256Hex(text) {
    const bytes = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async function passwordToHash(email, password) {
    if (!crypto?.subtle) return `plain:${password}`;
    return `sha256:${await sha256Hex(`${normalizeEmail(email)}|${password}`)}`;
  }

  async function maybeStoreBrowserCredential({ email, password, name }) {
    try {
      if (!window.isSecureContext) return;
      if (!navigator.credentials || !window.PasswordCredential) return;
      const cred = new PasswordCredential({
        id: email,
        name: name || email,
        password,
      });
      await navigator.credentials.store(cred);
    } catch {
      // ignore
    }
  }

  async function handleSignupSubmit(e) {
    e.preventDefault();
    clearAlert("signupError");

    const name = String($("signupName")?.value || "").trim();
    const email = normalizeEmail($("signupEmail")?.value);
    const password = String($("signupPassword")?.value || "");
    const remember = $("signupRemember")?.checked ?? true;

    if (!name) return showAlert("signupError", "Enter your name.");
    if (!email) return showAlert("signupError", "Enter your email.");
    if (!isValidEmail(email)) return showAlert("signupError", "Enter a valid email address.");
    if (!password || password.length < 6)
      return showAlert("signupError", "Password must be at least 6 characters.");

    const users = window.QM.auth.loadUsers();
    if (users.some((u) => u.email === email)) return showAlert("signupError", "This email is already registered.");

    const passwordHash = await passwordToHash(email, password);
    const user = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    window.QM.auth.saveUsers(users);
    window.QM.auth.setSession(
      { userId: user.id, email: user.email, createdAt: Date.now() },
      { persist: remember },
    );
    await maybeStoreBrowserCredential({ email, password, name });

    navigate(ROUTES.dashboard);
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    clearAlert("loginError");

    const email = normalizeEmail($("loginEmail")?.value);
    const password = String($("loginPassword")?.value || "");
    const remember = $("loginRemember")?.checked ?? true;

    if (!email) return showAlert("loginError", "Enter your email.");
    if (!isValidEmail(email)) return showAlert("loginError", "Enter a valid email address.");
    if (!password) return showAlert("loginError", "Enter your password.");

    const users = window.QM.auth.loadUsers();
    const user = users.find((u) => u.email === email);
    if (!user) return showAlert("loginError", "Invalid email or password.");

    const inputHash = await passwordToHash(email, password);
    const storedHash = user.passwordHash || (user.password ? await passwordToHash(email, user.password) : "");

    if (!storedHash || storedHash !== inputHash) return showAlert("loginError", "Invalid email or password.");

    // Migrate legacy plaintext password (if present)
    if (!user.passwordHash) {
      user.passwordHash = storedHash;
      delete user.password;
      window.QM.auth.saveUsers(users);
    }

    window.QM.auth.setSession({ userId: user.id, email: user.email, createdAt: Date.now() }, { persist: remember });
    await maybeStoreBrowserCredential({ email, password, name: user.name });
    navigate(ROUTES.dashboard);
  }

  function resetCalculator() {
    clearAlert("calcError");
    const v1 = $("val1");
    const v2 = $("val2");
    if (v1) v1.value = "";
    if (v2) v2.value = "";
    populateUnits();
    clearResult();
  }

  function swapConversionUnits() {
    if (state.action !== "convert") return;
    const u1 = $("unit1");
    const u2 = $("unit2");
    const v1 = $("val1");
    if (!u1 || !u2 || !v1) return;

    const fromUnit = u1.value;
    const toUnit = u2.value;
    if (!fromUnit || !toUnit) return;

    try {
      const num = Number(v1.value);
      if (v1.value && Number.isFinite(num)) {
        const base = toBase(num, fromUnit);
        const converted = fromBase(base, toUnit);
        v1.value = formatNumber(converted);
      }
      u1.value = toUnit;
      u2.value = fromUnit;
      clearResult();
    } catch {
      // ignore
    }
  }

  function wireEvents() {
    $("signupForm")?.addEventListener("submit", handleSignupSubmit);
    $("loginForm")?.addEventListener("submit", handleLoginSubmit);

    $("btnLogout")?.addEventListener("click", () => {
      window.QM.auth.clearSession();
      navigate(ROUTES.login);
    });

    for (const btn of Array.from(document.querySelectorAll("[data-type]"))) {
      btn.addEventListener("click", () => setType(btn.dataset.type));
    }

    for (const btn of Array.from(document.querySelectorAll("[data-action]"))) {
      btn.addEventListener("click", () => setAction(btn.dataset.action));
    }

    for (const btn of Array.from(document.querySelectorAll("[data-op]"))) {
      btn.addEventListener("click", () => setOperation(btn.dataset.op));
    }

    $("btnCalculate")?.addEventListener("click", calculate);
    $("btnCopy")?.addEventListener("click", copyResult);
    $("btnReset")?.addEventListener("click", resetCalculator);
    $("btnSwap")?.addEventListener("click", swapConversionUnits);

    const calcInputs = [$("val1"), $("val2"), $("unit1"), $("unit2")].filter(Boolean);
    for (const el of calcInputs) {
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter") calculate();
      });
      el.addEventListener("change", clearResult);
      el.addEventListener("input", clearResult);
    }

    window.addEventListener("hashchange", resolveAndRenderRoute);
  }

  function init() {
    populateUnits();
    renderCalculator();
    clearResult();
    wireEvents();
    resolveAndRenderRoute();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
