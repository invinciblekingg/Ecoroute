const scrollButtons = document.querySelectorAll("[data-scroll-target]");
const riskForm = document.getElementById("risk-form");
const toast = document.getElementById("toast");
const demoModal = document.getElementById("demo-modal");
const mobileNavToggle = document.getElementById("mobile-nav-toggle");
const siteNav = document.getElementById("site-nav");
const downloadReportButton = document.getElementById("download-report");
const simulateImprovementButton = document.getElementById("simulate-improvement");
const checkinButton = document.getElementById("simulate-checkin");
const suggestPlanButton = document.getElementById("suggest-plan");
const trackerButtons = document.querySelectorAll("[data-track]");
const moodButtons = document.querySelectorAll(".mood-chip");
const modeButtons = document.querySelectorAll(".mode-chip");
const sendJournalButton = document.getElementById("send-journal");
const promptButtons = document.querySelectorAll("[data-prompt]");
const scheduleReminderButton = document.getElementById("schedule-reminder");
const assistantSendButton = document.getElementById("assistant-send");
const assistantTriageButton = document.getElementById("assistant-triage");
const assistantInput = document.getElementById("assistant-input");
const journalInput = document.getElementById("journal-input");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");

const state = {
  assessment: null,
  mood: "calm",
  mode: "coach",
  care: "City Hospital",
  reminders: [],
  sessionId: localStorage.getItem("vitasense-session-id") || `session-${Date.now()}`,
  tracker: {
    water: 2.1,
    steps: 6600,
    sleepGoal: 7.1,
  },
};

localStorage.setItem("vitasense-session-id", state.sessionId);

const careProfiles = {
  "City Hospital": "Fastest route: 12 minutes away. Best match for elevated cardiovascular risk and urgent diagnostics.",
  "Wellness Clinic": "Best for preventive consults, nutrition planning, and weekly habit follow-up. Estimated wait time: 15 minutes.",
  "Cardio Care": "Recommended when heart-risk markers trend upward. Specialist evaluation slots available this afternoon.",
  "MindCare Center": "A strong option for stress therapy, anxiety counseling, and regular emotional wellness check-ins.",
};

const revealElements = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);
revealElements.forEach((element) => revealObserver.observe(element));

scrollButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(button.dataset.scrollTarget);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });

    const modalId = button.dataset.closeModal;
    if (modalId) closeModal(document.getElementById(modalId));
    document.body.classList.remove("nav-open");
    mobileNavToggle?.setAttribute("aria-expanded", "false");
  });
});

mobileNavToggle?.addEventListener("click", () => {
  const next = !document.body.classList.contains("nav-open");
  document.body.classList.toggle("nav-open", next);
  mobileNavToggle.setAttribute("aria-expanded", String(next));
});

siteNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
    mobileNavToggle?.setAttribute("aria-expanded", "false");
  });
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("visible");
  }, 2600);
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  if (window.gsap) {
    gsap.fromTo(".modal-card", { y: 24, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" });
  }
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function appendMessage(type, text, label = type === "ai" ? "VitaSense AI" : "You") {
  const thread = document.getElementById("chat-thread");
  const message = document.createElement("div");
  message.className = `chat-message ${type}${type === "ai" ? " accent" : ""}`;
  message.innerHTML = `<span class="chat-label">${label}</span><p>${text}</p>`;
  thread.appendChild(message);
  thread.scrollTop = thread.scrollHeight;
  if (window.gsap) {
    gsap.fromTo(message, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" });
  }
}

function setRingScore(score) {
  const ring = document.getElementById("hero-ring");
  const circumference = 289;
  const dashOffset = circumference - (circumference * score) / 100;
  ring.style.strokeDashoffset = `${dashOffset}`;
  document.getElementById("hero-score").textContent = Math.round(score);
}

function refreshTracker() {
  document.getElementById("water-progress").value = Math.min(100, Math.round((state.tracker.water / 3) * 100));
  document.getElementById("steps-progress").value = Math.min(100, Math.round((state.tracker.steps / 10000) * 100));
  document.getElementById("sleep-progress").value = Math.min(100, Math.round((state.tracker.sleepGoal / 8.5) * 100));
  document.getElementById("water-label").textContent = `${state.tracker.water.toFixed(1)}L`;
  document.getElementById("steps-label").textContent = state.tracker.steps.toLocaleString();
  document.getElementById("sleep-label").textContent = `${state.tracker.sleepGoal.toFixed(1)}h`;
}

function setRiskList(conditions) {
  const list = document.getElementById("risk-list");
  list.innerHTML = conditions
    .slice(0, 4)
    .map((condition) => `<li><span>${condition.name}</span><strong>${condition.risk}%</strong></li>`)
    .join("");
}

function setBiometrics(biometrics) {
  const grid = document.getElementById("biometric-grid");
  grid.innerHTML = biometrics
    .map((metric) => `<div class="bio-pill"><span>${metric.label}</span><strong>${metric.value}</strong></div>`)
    .join("");
}

function setRecommendations(recommendations) {
  const list = document.getElementById("recommendation-list");
  list.innerHTML = recommendations.map((item) => `<li>${item}</li>`).join("");
}

function setScenarios(scenarios) {
  const grid = document.getElementById("scenario-grid");
  if (!grid || !Array.isArray(scenarios)) return;

  grid.innerHTML = scenarios
    .map(
      (scenario, index) => `
        <article class="scenario-card ${index === 0 ? "active" : ""}" data-scenario="${scenario.id}">
          <span>${scenario.label}</span>
          <strong>${scenario.score}</strong>
          <p>${scenario.change}</p>
        </article>
      `
    )
    .join("");

  grid.querySelectorAll(".scenario-card").forEach((card) => {
    card.addEventListener("click", () => {
      grid.querySelectorAll(".scenario-card").forEach((item) => item.classList.remove("active"));
      card.classList.add("active");
      const scenario = scenarios.find((item) => item.id === card.dataset.scenario);
      if (!scenario) return;
      setRingScore(scenario.score);
      document.getElementById("scenario-text").textContent = scenario.note;
      showToast(`${scenario.label} applied to preview.`);
    });
  });
}

function setCarePath(carePath) {
  if (!carePath) return;
  document.getElementById("care-path-title").textContent = carePath.title;
  document.getElementById("care-path-copy").textContent = carePath.reason;
  document.getElementById("care-path-eta").textContent = carePath.eta;
  document.getElementById("care-path-action").textContent = carePath.nextAction;
}

function setAssistantList(id, items, formatter) {
  const list = document.getElementById(id);
  if (!list) return;
  list.innerHTML = items.map(formatter).join("");
}

function activateMode(mode) {
  state.mode = mode;
  modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
}

function updateAssessmentUI(result) {
  state.assessment = result;
  state.tracker = result.tracker;
  refreshTracker();

  document.getElementById("confidence-badge").textContent = `Confidence ${result.confidence}%`;
  document.getElementById("bmi-value").textContent = result.stats.bmi.toFixed(1);
  document.getElementById("primary-focus").textContent = result.focus;
  document.getElementById("routine-text").textContent = result.routine;
  document.getElementById("risk-alert").textContent = result.alert;
  document.getElementById("resilience-score").textContent = result.stats.resilience;
  document.getElementById("readiness-score").textContent = result.stats.readiness;
  document.getElementById("resilience-copy").textContent = `${result.stats.recovery} recovery score with ${result.stressLabel.toLowerCase()} perceived strain.`;
  document.getElementById("readiness-copy").textContent = `${result.primaryGoal}. Targets: ${result.stats.sleepTarget} and ${result.stats.movementTarget}.`;

  document.getElementById("hero-heart-risk").textContent = `${result.conditions.find((item) => item.name === "Heart disease")?.risk ?? 0}%`;
  document.getElementById("hero-sleep").textContent = `${result.tracker.sleepGoal.toFixed(1)}h`;
  document.getElementById("hero-stress").textContent = result.stressLabel;
  document.getElementById("hero-next-step").textContent = result.nextStep;
  document.getElementById("insight-copy").textContent = result.insight;
  document.getElementById("scenario-text").textContent = result.scenario;
  document.getElementById("attention-badge").textContent = result.attention;

  setRiskList(result.conditions);
  setBiometrics(result.biometrics);
  setRecommendations(result.recommendations);
  setScenarios(result.scenarios);
  setCarePath(result.carePath);
  setRingScore(result.score);

  document.querySelectorAll("#chart-bars span").forEach((bar, index) => {
    bar.style.setProperty("--size", `${result.weekly[index]}%`);
  });

  if (window.gsap) {
    gsap.fromTo("#chart-bars span", { scaleY: 0.4, transformOrigin: "bottom center" }, { scaleY: 1, stagger: 0.05, duration: 0.55, ease: "power2.out" });
    gsap.fromTo(["#biometric-grid .bio-pill", "#recommendation-list li"], { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: "power2.out" });
  }
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${url}`);
  }

  return response.json();
}

async function runAssessment(extra = {}) {
  const formData = new FormData(riskForm);
  const payload = Object.fromEntries(formData.entries());
  payload.sessionId = state.sessionId;
  Object.assign(payload, extra);
  const result = await postJson("/api/assessment", payload);
  updateAssessmentUI(result);
  return result;
}

function updateAssistantPanels(result) {
  document.getElementById("assistant-headline").textContent = result.headline;
  document.getElementById("assistant-summary").textContent = result.summary;
  document.getElementById("mood-trend").textContent = `${result.tone[0].toUpperCase()}${result.tone.slice(1)} ${result.modeLabel.toLowerCase()} mode`;
  document.getElementById("mood-detail").textContent = result.message;
  document.getElementById("next-action-text").textContent = result.followUpQuestions[0];
  document.getElementById("assistant-warning-title").textContent = result.warning ? "Needs attention" : "No urgent signal";
  document.getElementById("assistant-warning-copy").textContent = result.warning || "This assistant supports wellness habits, but it is not emergency care or a diagnosis tool.";
  document.getElementById("tool-list").innerHTML = result.copingTools.map((tool) => `<li>${tool.detail}</li>`).join("");
  document.getElementById("care-plan-list").innerHTML = result.carePlan.map((step) => `<li>${step}</li>`).join("");
  document.getElementById("assistant-session-label").textContent = `${result.modeLabel} mode active`;
  document.getElementById("assistant-session-copy").textContent = `Turn ${result.session?.turnCount ?? 1} of your daily support session is now live.`;
  setAssistantList("assistant-checklist", result.checklist ?? [], (item) => `<li class="${item.done ? "done" : ""}">${item.label}</li>`);
  setAssistantList("assistant-protocols", result.protocols ?? [], (item) => `<li>${item.detail}</li>`);
  setAssistantList("assistant-resources", result.resources ?? [], (item) => `<li>${item.title}</li>`);
  setAssistantList("assistant-reminders", result.reminders ?? [], (item) => `<li>${item.time}: ${item.title}</li>`);
  state.reminders = result.reminders ?? [];

  document.querySelectorAll("#assistant-checklist li").forEach((item) => {
    item.addEventListener("click", () => item.classList.toggle("done"));
  });
}

async function askAssistant(message, journalOverride = "") {
  const result = await postJson("/api/assistant", {
    sessionId: state.sessionId,
    message,
    mode: state.mode,
    mood: state.mood,
    journal: journalOverride,
    assessment: state.assessment,
  });
  appendMessage("ai", result.message);
  if (result.journalReflection) appendMessage("ai", result.journalReflection);
  updateAssistantPanels(result);
  showToast("Assistant response updated.");
  return result;
}

function selectCare(name, action) {
  document.getElementById("care-name").textContent = name;
  document.getElementById("care-copy").textContent = careProfiles[name];
  state.care = name;

  const actionMessages = {
    directions: `Directions opened for ${name}. Estimated arrival updated in the care panel.`,
    book: `Booking flow started for ${name}. Preventive consultation slots look available this week.`,
    connect: `Connection request sent to ${name}. A support callback is ready to be scheduled.`,
  };

  if (action) showToast(actionMessages[action]);
}

document.querySelectorAll("[data-action='book-demo']").forEach((button) => {
  button.addEventListener("click", () => openModal(demoModal));
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => closeModal(document.getElementById(button.dataset.closeModal)));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && demoModal && !demoModal.classList.contains("hidden")) {
    closeModal(demoModal);
  }
});

riskForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const result = await runAssessment();
    appendMessage("ai", `Your updated assessment is ready. ${result.focus} is the current focus area and your health score is ${result.score}.`);
    showToast("Risk snapshot updated across the dashboard.");
  } catch (error) {
    showToast("Assessment service is temporarily unavailable.");
  }
});

downloadReportButton?.addEventListener("click", () => {
  const report = [
    "VitaSense AI Health Snapshot",
    `Score: ${state.assessment?.score ?? "-"}`,
    `Focus: ${state.assessment?.focus ?? "-"}`,
    `Confidence: ${state.assessment?.confidence ?? "-"}`,
    `Hydration target: ${state.assessment?.stats?.hydrationTarget ?? "-"}`,
    "",
    "Recommendations:",
    ...(state.assessment?.recommendations ?? []),
  ].join("\n");

  const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "vitasense-report.txt";
  link.click();
  URL.revokeObjectURL(url);
  showToast("Assessment report downloaded.");
});

simulateImprovementButton?.addEventListener("click", async () => {
  try {
    const result = await runAssessment({ sleep: 7.8, water: 2.8, exercise: 4, steps: 9200 });
    appendMessage("ai", `Improvement simulation complete. Your projected score rises to ${result.score} with better sleep, hydration, and movement consistency.`);
    showToast("Improvement scenario simulated.");
  } catch (error) {
    showToast("Simulation could not be completed.");
  }
});

trackerButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.track;
    if (target === "water") state.tracker.water = Math.min(3.5, state.tracker.water + 0.25);
    if (target === "steps") state.tracker.steps = Math.min(15000, state.tracker.steps + 900);
    if (target === "sleep") state.tracker.sleepGoal = Math.min(8.5, state.tracker.sleepGoal + 0.2);
    refreshTracker();
    showToast(`${target.charAt(0).toUpperCase() + target.slice(1)} tracker updated.`);
  });
});

moodButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    moodButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.mood = button.dataset.mood;
    try {
      await askAssistant(`My mood is ${state.mood} today.`);
    } catch (error) {
      showToast("Assistant is temporarily unavailable.");
    }
  });
});

modeButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    activateMode(button.dataset.mode);
    try {
      await askAssistant(`Switch my support mode to ${state.mode}.`);
    } catch (error) {
      showToast("Assistant mode could not be updated.");
    }
  });
});

promptButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    appendMessage("user", `${button.textContent} help, please.`);
    try {
      await askAssistant(`${button.textContent} support please.`);
    } catch (error) {
      showToast("Assistant is temporarily unavailable.");
    }
  });
});

sendJournalButton?.addEventListener("click", async () => {
  const note = journalInput.value.trim();
  if (!note) {
    showToast("Add a quick journal note first.");
    return;
  }

  appendMessage("user", note);
  try {
    await askAssistant("Please reflect on my journal.", note);
    journalInput.value = "";
  } catch (error) {
    showToast("Assistant reflection service is unavailable.");
  }
});

assistantSendButton?.addEventListener("click", async () => {
  const message = assistantInput.value.trim();
  if (!message) {
    showToast("Type a message for the assistant first.");
    return;
  }

  appendMessage("user", message);
  try {
    await askAssistant(message, journalInput.value.trim());
    assistantInput.value = "";
  } catch (error) {
    showToast("Assistant message failed.");
  }
});

assistantTriageButton?.addEventListener("click", async () => {
  activateMode("triage");
  try {
    await askAssistant("Run a full wellness triage and tell me what matters most today.", journalInput.value.trim());
  } catch (error) {
    showToast("Triage is temporarily unavailable.");
  }
});

checkinButton?.addEventListener("click", async () => {
  activateMode("coach");
  try {
    await askAssistant("Run my daily check-in and tell me the best immediate action.");
  } catch (error) {
    showToast("Daily check-in is temporarily unavailable.");
  }
});

suggestPlanButton?.addEventListener("click", async () => {
  activateMode("recovery");
  try {
    await askAssistant("Build me a personalized recovery plan for the rest of today.", journalInput.value.trim());
  } catch (error) {
    showToast("Recovery planning is temporarily unavailable.");
  }
});

scheduleReminderButton?.addEventListener("click", () => {
  const reminder = state.reminders[0];
  if (!reminder) {
    showToast("No reminder suggestion is ready yet.");
    return;
  }

  showToast(`Reminder scheduled: ${reminder.time} ${reminder.title}.`);
});

document.querySelectorAll("[data-care-action]").forEach((button) => {
  button.addEventListener("click", () => selectCare(button.dataset.care, button.dataset.careAction));
});

document.querySelectorAll(".pin").forEach((pin) => {
  pin.addEventListener("click", () => {
    selectCare(pin.dataset.care);
    showToast(`${pin.dataset.care} selected on the map.`);
  });
});

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && cursorDot && cursorRing) {
  document.addEventListener("mousemove", (event) => {
    cursorDot.style.opacity = "1";
    cursorRing.style.opacity = "1";
    cursorDot.style.transform = `translate(${event.clientX - 4}px, ${event.clientY - 4}px)`;
    cursorRing.style.transform = `translate(${event.clientX - 17}px, ${event.clientY - 17}px)`;
  });

  document.querySelectorAll("a, button, input, select, textarea").forEach((element) => {
    element.addEventListener("mouseenter", () => cursorRing.classList.add("active"));
    element.addEventListener("mouseleave", () => cursorRing.classList.remove("active"));
  });
}

function runGsapIntro() {
  if (!window.gsap) return;

  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  gsap.from(".topbar", { y: -24, opacity: 0, duration: 0.6, ease: "power3.out" });
  gsap.from(".hero-copy > *", { y: 24, opacity: 0, stagger: 0.08, duration: 0.7, ease: "power3.out", delay: 0.12 });
  gsap.from(".pulse-card", { x: 24, opacity: 0, rotateY: -10, duration: 0.8, ease: "power3.out", delay: 0.18 });
  gsap.to(".orb-a", { y: 14, repeat: -1, yoyo: true, duration: 4.2, ease: "sine.inOut" });
  gsap.to(".orb-b", { y: -12, repeat: -1, yoyo: true, duration: 5.4, ease: "sine.inOut" });

  if (window.ScrollTrigger) {
    gsap.utils.toArray(".glass-card, .feature-card, .mini-panel, .roadmap-card").forEach((element) => {
      gsap.fromTo(
        element,
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 86%",
            once: true,
          },
        }
      );
    });
  }
}

async function initialize() {
  refreshTracker();
  activateMode(state.mode);
  runGsapIntro();

  try {
    const result = await runAssessment();
    await askAssistant("Start my daily wellness check-in.");
    appendMessage("ai", `Daily monitoring is live. ${result.focus} is the top prevention focus for today.`);
  } catch (error) {
    showToast("Local backend is not running yet.");
  }
}

initialize();
