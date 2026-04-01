import json
import logging
import math
import mimetypes
import time
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
from uuid import uuid4


ROOT = Path(__file__).resolve().parent
API_VERSION = "2026.04-launch"
SERVICE_NAME = "VitaSense local backend"
SERVER_STARTED_AT = time.time()
SESSION_STORE = {}
ALLOWED_STATIC_SUFFIXES = {".html", ".css", ".js", ".json", ".png", ".jpg", ".jpeg", ".svg", ".webp", ".ico"}

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
LOGGER = logging.getLogger("vitasense")


def clamp(value, lower, upper):
    return max(lower, min(upper, value))


def now_iso():
    return datetime.utcnow().isoformat() + "Z"


def to_float(payload, key, default=0.0):
    try:
      return float(payload.get(key, default))
    except (TypeError, ValueError):
      return default


def to_int(payload, key, default=0):
    try:
      return int(float(payload.get(key, default)))
    except (TypeError, ValueError):
      return default


def normalize_choice(value, allowed, default):
    text = str(value or "").strip().lower()
    return text if text in allowed else default


def detect_tier(risk, high, moderate):
    if risk >= high:
        return "high"
    if risk >= moderate:
        return "moderate"
    return "low"


def ensure_session(session_id):
    if session_id not in SESSION_STORE:
        SESSION_STORE[session_id] = {
            "createdAt": now_iso(),
            "assistantTurns": 0,
            "history": [],
            "lastAssessment": None,
            "reminders": [],
        }
    return SESSION_STORE[session_id]


def assessment_engine(payload, session_id="demo-session"):
    age = to_int(payload, "age", 29)
    weight = to_float(payload, "weight", 72)
    height = max(1.0, to_float(payload, "height", 172))
    sleep = to_float(payload, "sleep", 6.8)
    exercise = to_int(payload, "exercise", 2)
    water = to_float(payload, "water", 2.1)
    steps = to_int(payload, "steps", 6600)
    resting_hr = to_int(payload, "restingHeartRate", 78)
    systolic = to_int(payload, "systolic", 124)
    calories = to_int(payload, "calories", 2100)
    diet = normalize_choice(payload.get("diet"), {"balanced", "processed", "vegetarian", "high-protein"}, "balanced")
    stress = normalize_choice(payload.get("stress"), {"low", "moderate", "high"}, "moderate")
    smoking = normalize_choice(payload.get("smoking"), {"yes", "no"}, "no")
    alcohol = normalize_choice(payload.get("alcohol"), {"none", "low", "moderate", "high"}, "low")
    history = normalize_choice(payload.get("history"), {"yes", "no"}, "yes")

    bmi = weight / ((height / 100) ** 2)
    bmi_penalty = 9 if bmi >= 29 else 6 if bmi >= 26 else 0
    bmi_bonus = 3 if 20 <= bmi <= 24.9 else 0
    sleep_penalty = max(0, (7.4 - sleep) * 7.6)
    exercise_boost = min(exercise * 3.1, 16)
    hydration_boost = min(water * 3.2, 11)
    step_boost = min(max(steps - 4000, 0) / 600, 10)
    hr_penalty = max(resting_hr - 72, 0) * 0.55
    bp_penalty = max(systolic - 118, 0) * 0.42
    calorie_penalty = 6 if calories > 2600 else 3 if calories < 1500 else 0
    age_penalty = max(age - 30, 0) * 0.48
    stress_penalty = {"low": 1, "moderate": 7, "high": 14}.get(stress, 7)
    diet_penalty = {"balanced": 0, "vegetarian": 1, "high-protein": 2, "processed": 11}.get(diet, 0)
    smoking_penalty = 17 if smoking == "yes" else 0
    alcohol_penalty = {"none": 0, "low": 1, "moderate": 6, "high": 11}.get(alcohol, 1)
    history_penalty = 10 if history == "yes" else 0

    score = clamp(
        88
        - bmi_penalty
        + bmi_bonus
        - sleep_penalty
        + exercise_boost
        + hydration_boost
        + step_boost
        - hr_penalty
        - bp_penalty
        - calorie_penalty
        - age_penalty
        - stress_penalty
        - diet_penalty
        - smoking_penalty
        - alcohol_penalty
        - history_penalty,
        29,
        97,
    )

    diabetes = clamp(round(16 + bmi_penalty * 1.6 + diet_penalty + history_penalty + bp_penalty / 2 - exercise_boost / 2), 7, 84)
    heart = clamp(round(13 + smoking_penalty + history_penalty + bp_penalty + hr_penalty / 1.8 + age_penalty / 2 - step_boost / 2), 8, 86)
    burnout = clamp(round(14 + sleep_penalty * 2.1 + stress_penalty + calorie_penalty + (3 if exercise < 2 else 0)), 9, 91)
    metabolic = clamp(round((diabetes * 0.58) + (heart * 0.42)), 8, 83)

    conditions = [
        {"name": "Sleep burnout", "risk": burnout, "tier": "high" if burnout >= 58 else "moderate" if burnout >= 34 else "low"},
        {"name": "Type 2 diabetes", "risk": diabetes, "tier": "high" if diabetes >= 56 else "moderate" if diabetes >= 30 else "low"},
        {"name": "Heart disease", "risk": heart, "tier": "high" if heart >= 52 else "moderate" if heart >= 26 else "low"},
        {"name": "Metabolic strain", "risk": metabolic, "tier": "high" if metabolic >= 55 else "moderate" if metabolic >= 30 else "low"},
    ]
    conditions.sort(key=lambda item: item["risk"], reverse=True)

    top_name = conditions[0]["name"]
    confidence = clamp(round(84 + (2 if history == "yes" else 0) + (2 if smoking == "yes" else 0) + (1 if stress == "high" else 0)), 81, 97)
    readiness = clamp(round((exercise_boost + hydration_boost + step_boost + bmi_bonus * 2) * 3.2), 35, 96)
    resilience = clamp(round(score - stress_penalty / 2 + sleep * 2.4), 32, 94)
    recovery = clamp(round(100 - burnout + sleep * 3.4), 18, 92)

    recommendations = [
        "Bring sleep to at least 7.5 hours for the next 10 days.",
        "Lock in 30 minutes of cardio or brisk walking 4 times each week.",
        "Shift dinner toward lower sugar, higher fiber meals on weekdays.",
        "Use one structured decompression routine within 90 minutes of bedtime.",
    ]

    if smoking == "yes":
        recommendations.insert(0, "Prioritize smoking reduction immediately; it is materially lifting cardiovascular risk.")
    if stress == "high":
        recommendations.insert(0, "Treat stress control as a core health intervention, not a side habit.")

    biometrics = [
        {"label": "BMI", "value": f"{bmi:.1f}", "status": "optimal" if 20 <= bmi <= 25 else "watch"},
        {"label": "Resting HR", "value": f"{resting_hr} bpm", "status": "optimal" if resting_hr <= 72 else "watch"},
        {"label": "Blood pressure", "value": f"{systolic} systolic", "status": "optimal" if systolic <= 120 else "watch"},
        {"label": "Recovery score", "value": f"{recovery}", "status": "optimal" if recovery >= 68 else "watch"},
    ]

    weekly = [clamp(round(score - 18 + index * 3 + math.sin(index) * 4), 28, 96) for index in range(7)]
    simulation_gain = clamp(round((exercise_boost / 2) + (7.5 - min(sleep, 7.5)) * 4 + (0 if smoking == "yes" else 3) + (3 if water >= 2.3 else 0)), 4, 16)
    performance_gain = clamp(simulation_gain + 4, 8, 20)

    drivers = [
        {"label": "Sleep consistency", "impact": round(sleep_penalty), "detail": "Short sleep is increasing recovery debt and burnout pressure."},
        {"label": "Stress load", "impact": round(stress_penalty), "detail": "Stress is amplifying focus loss and long-term health load."},
        {"label": "Cardio base", "impact": -round(exercise_boost), "detail": "Regular movement is actively buffering overall risk."},
        {"label": "Blood pressure", "impact": round(bp_penalty), "detail": "Cardiovascular pressure is slightly above the ideal range."},
    ]
    drivers.sort(key=lambda item: abs(item["impact"]), reverse=True)

    scenarios = [
        {
            "id": "baseline",
            "label": "Current lifestyle",
            "score": round(score),
            "change": "Current baseline",
            "note": "This reflects your present sleep, hydration, movement, and recovery pattern.",
        },
        {
            "id": "recovery",
            "label": "Recovery sprint",
            "score": round(clamp(score + simulation_gain, 29, 97)),
            "change": f"+{simulation_gain}",
            "note": "Sleep consistency and calmer evenings produce the fastest short-term gain.",
        },
        {
            "id": "reset",
            "label": "Habit reset",
            "score": round(clamp(score + performance_gain, 29, 97)),
            "change": f"+{performance_gain}",
            "note": "Sleep, cardio, hydration, and cleaner meals together soften risk much faster.",
        },
    ]

    care_path = {
        "title": "Preventive clinician follow-up" if conditions[0]["risk"] < 55 else "Priority clinician review",
        "eta": "Within 7 days" if conditions[0]["risk"] < 55 else "Within 48 hours",
        "reason": f"{top_name} is the top signal and should guide the next care decision.",
        "nextAction": "Carry this summary into a preventive consultation or counselor check-in.",
    }

    coach_plan = [
        {"title": "Morning foundation", "detail": "Hydrate early and get daylight before the first heavy task.", "when": "Before 9 AM"},
        {"title": "Movement floor", "detail": "Protect one walk or cardio block even if the day gets crowded.", "when": "Midday"},
        {"title": "Evening reset", "detail": "Reduce stimulation and protect your pre-sleep routine.", "when": "90 minutes before bed"},
    ]

    alert = (
        f"{top_name} is the leading risk area right now. "
        f"The fastest leverage point is {'sleep stabilization' if top_name == 'Sleep burnout' else 'cardio and recovery consistency'}."
    )

    result = {
        "generatedAt": now_iso(),
        "score": round(score),
        "confidence": confidence,
        "focus": top_name,
        "summary": f"{top_name} is currently the strongest prevention signal, with the clearest upside coming from more stable recovery habits.",
        "primaryGoal": "Restore recovery capacity" if top_name == "Sleep burnout" else "Reduce compounding cardio-metabolic load",
        "routine": recommendations[0],
        "alert": alert,
        "attention": "Clinical watch" if conditions[0]["risk"] >= 58 else "Preventive watch",
        "insight": f"{top_name} is elevated because your current recovery, activity, and risk-history pattern is creating avoidable load.",
        "scenario": f"If you sustain stronger sleep, hydration, and movement habits, your combined risk profile improves by {simulation_gain}% over the next 8 weeks.",
        "nextStep": "Sleep reset protocol" if top_name == "Sleep burnout" else "Risk reduction plan",
        "stressLabel": stress.capitalize(),
        "conditions": conditions,
        "drivers": drivers[:4],
        "recommendations": recommendations[:5],
        "biometrics": biometrics,
        "weekly": weekly,
        "scenarios": scenarios,
        "carePath": care_path,
        "coachPlan": coach_plan,
        "signals": [
            {"label": "Readiness", "value": readiness, "detail": "Ability to adopt changes this week."},
            {"label": "Resilience", "value": resilience, "detail": "Current capacity to absorb load."},
            {"label": "Recovery", "value": recovery, "detail": "Sleep and nervous-system recovery strength."},
        ],
        "stats": {
            "bmi": round(bmi, 1),
            "readiness": readiness,
            "resilience": resilience,
            "recovery": recovery,
            "hydrationTarget": "2.7L/day" if weight >= 75 else "2.4L/day",
            "movementTarget": "8,500 steps/day" if steps < 8500 else "Maintain current movement floor",
            "sleepTarget": "7.5 to 8.0h",
        },
        "tracker": {
            "water": water,
            "steps": steps,
            "sleepGoal": round(max(7.4, sleep + 0.5), 1),
        },
    }
    ensure_session(session_id)["lastAssessment"] = result
    return result


def build_assistant_reply(payload):
    session_id = str(payload.get("sessionId") or "demo-session").strip()
    session = ensure_session(session_id)
    message = (payload.get("message") or "").strip()
    mood = normalize_choice(payload.get("mood"), {"calm", "stressed", "anxious", "tired"}, "calm")
    journal = (payload.get("journal") or "").strip()
    assessment = payload.get("assessment") or session.get("lastAssessment") or {}
    focus = assessment.get("focus", "recovery")
    score = assessment.get("score", 78)
    requested_mode = normalize_choice(payload.get("mode"), {"coach", "triage", "sleep", "focus", "recovery"}, "")

    lowered = message.lower()
    if requested_mode:
        mode = requested_mode
    elif any(term in lowered for term in ["triage", "urgent", "emergency", "symptom", "panic", "chest pain"]):
        mode = "triage"
    elif any(term in lowered for term in ["sleep", "bedtime", "insomnia", "night"]):
        mode = "sleep"
    elif any(term in lowered for term in ["focus", "work", "distracted", "concentrate"]):
        mode = "focus"
    elif focus == "Sleep burnout":
        mode = "recovery"
    else:
        mode = "coach"

    library = {
        "calm": {
            "tone": "steady",
            "headline": "You're in a workable place today.",
            "plan": [
                "Protect the momentum with hydration before lunch.",
                "Keep one short walk after your heaviest work block.",
                "Use a low-friction wind-down routine tonight.",
            ],
        },
        "stressed": {
            "tone": "supportive",
            "headline": "Your system looks overloaded, so the plan should get lighter, not stricter.",
            "plan": [
                "Reduce the next hour to one essential task.",
                "Use 4 minutes of breathing before you restart work.",
                "Do not trade sleep for catching up tonight.",
            ],
        },
        "anxious": {
            "tone": "grounding",
            "headline": "Let's narrow the horizon and reduce uncertainty first.",
            "plan": [
                "List 3 controllable actions for today only.",
                "Mute non-essential notifications for 20 minutes.",
                "Use a grounding check before switching tasks.",
            ],
        },
        "tired": {
            "tone": "restorative",
            "headline": "Fatigue is likely amplifying everything else.",
            "plan": [
                "Keep movement gentle instead of forcing intensity.",
                "Front-load water and food quality earlier in the day.",
                "Start sleep preparation 45 minutes sooner tonight.",
            ],
        },
    }

    mode_profiles = {
        "coach": {
            "headline": "Steady health coaching is the right move today.",
            "summary": "Focus on one high-return habit, one protective recovery action, and one low-friction win.",
            "plan": [
                "Protect hydration before lunch and keep meals steady through the afternoon.",
                "Anchor one walk or cardio block instead of chasing a perfect day.",
                "Finish the day with one calming routine before sleep.",
            ],
            "protocols": [
                {"title": "Daily anchor", "detail": "Pick one habit you will protect even on messy days."},
                {"title": "Friction audit", "detail": "Remove one blocker that makes healthy behavior harder than it should be."},
                {"title": "Recovery buffer", "detail": "Reserve 20 minutes before bed for low-stimulation recovery."},
            ],
        },
        "triage": {
            "headline": "Let's separate urgent signals from manageable strain.",
            "summary": "The assistant will keep the plan conservative and encourage escalation when something looks unsafe.",
            "plan": [
                "Pause and assess whether symptoms are worsening, sudden, or hard to explain.",
                "Do not self-manage alone if breathing, chest pain, fainting, or severe distress are present.",
                "Use the care finder or emergency support when risk feels beyond a routine wellness issue.",
            ],
            "protocols": [
                {"title": "Immediate safety check", "detail": "Confirm whether symptoms are sudden, severe, or rapidly worsening."},
                {"title": "Escalation rule", "detail": "When in doubt, seek clinician support early instead of waiting for clarity."},
                {"title": "Aftercare note", "detail": "Document timing, triggers, and intensity so a clinician gets clearer context."},
            ],
        },
        "sleep": {
            "headline": "Sleep protection will move more metrics than almost any other change right now.",
            "summary": "The goal is not a perfect night. It is a repeatable pre-sleep system that lowers nervous-system load.",
            "plan": [
                "Set a consistent start time for wind-down tonight.",
                "Lower screens, caffeine, and heavy stimulation earlier than usual.",
                "Aim for a calmer last hour instead of trying to catch up on work.",
            ],
            "protocols": [
                {"title": "90-minute sleep protocol", "detail": "Dim lights, reduce stimulation, and stop performance tasks."},
                {"title": "Night reset", "detail": "If your mind races, journal three concerns and one next-day plan."},
                {"title": "Morning recovery", "detail": "Use daylight and hydration to anchor your next sleep cycle."},
            ],
        },
        "focus": {
            "headline": "Mental clarity improves when pressure gets narrowed, not expanded.",
            "summary": "Reduce noise, define one target, and use a short body reset before you restart work.",
            "plan": [
                "Pick the next task that reduces the most pressure with the least effort.",
                "Mute non-essential notifications for the next focus block.",
                "Take a 6-minute walk or stretch before restarting your attention.",
            ],
            "protocols": [
                {"title": "20-minute focus sprint", "detail": "One small target, one timer, zero multitasking."},
                {"title": "Attention reset", "detail": "Stand up, breathe slower, then restart with a smaller scope."},
                {"title": "Shutdown rule", "detail": "Stop the spiral when clarity drops and return after a reset."},
            ],
        },
        "recovery": {
            "headline": "Recovery should get lighter and more structured from here.",
            "summary": "Your best gain will come from protecting capacity instead of forcing output through strain.",
            "plan": [
                "Shrink the rest of the day down to essential movement, hydration, and calmer sleep preparation.",
                "Choose recovery-friendly wins over hard effort tonight.",
                "Let consistency matter more than intensity for the next 48 hours.",
            ],
            "protocols": [
                {"title": "Nervous-system downshift", "detail": "Use slow breathing and low-stimulation transitions between tasks."},
                {"title": "Recovery walk", "detail": "Keep movement easy enough that it restores energy instead of draining it."},
                {"title": "Sleep-first evening", "detail": "Move mentally heavy work out of your final hour before bed."},
            ],
        },
    }

    selected = library.get(mood, library["calm"])
    selected_mode = mode_profiles.get(mode, mode_profiles["coach"])

    warning = None
    if any(term in lowered for term in ["panic", "can't breathe", "chest pain", "fainting", "emergency"]):
        warning = "If you're in immediate danger or having a medical emergency, contact local emergency services right away."
    elif score < 45 or mode == "triage":
        warning = "Your current health profile suggests elevated strain. Consider booking a clinician or counselor follow-up soon."

    response = {
        "mode": mode,
        "modeLabel": mode.capitalize(),
        "headline": selected_mode["headline"],
        "tone": selected["tone"],
        "summary": (
            f"Given your current {focus.lower()} focus and mood state, the best next move is a short, specific recovery action rather than a big reset."
        ),
        "carePlan": selected_mode["plan"],
        "protocols": selected_mode["protocols"],
        "copingTools": [
            {"title": "Breathing reset", "detail": "Inhale 4, hold 4, exhale 6 for four rounds."},
            {"title": "Micro-journal", "detail": "Write one pressure, one win, and one next small action."},
            {"title": "Body reset", "detail": "Take a 6-minute walk or stretch before re-engaging."},
        ],
        "followUpQuestions": [
            "What part of the day feels heaviest right now?",
            "Do you want a focus plan, calm-down plan, or sleep plan next?",
        ],
        "message": (
            f"{selected['headline']} {selected_mode['summary']} Based on what you shared"
            f"{' in your journal' if journal else ''}, I would keep today simple and protect your recovery capacity."
        ),
        "warning": warning,
        "checkInScore": clamp(round((score + {"calm": 8, "stressed": -6, "anxious": -8, "tired": -5}.get(mood, 0)) / 10), 1, 10),
        "checklist": [
            {"label": "Hydrate before the next work block", "done": False},
            {"label": "Take a 6-minute walk or stretch reset", "done": False},
            {"label": "Protect the final hour before sleep", "done": False},
        ] if mode != "triage" else [
            {"label": "Check whether symptoms are sudden or worsening", "done": False},
            {"label": "Decide whether care escalation is needed now", "done": False},
            {"label": "Document timing, severity, and triggers", "done": False},
        ],
        "resources": [
            {"title": "Recovery routine", "detail": "A short evening ritual lowers stimulation and protects sleep consistency."},
            {"title": "Care finder", "detail": "Use nearby preventive or mental wellness support before issues compound."},
            {"title": "Behavior loop", "detail": "Protect one stable habit daily so momentum does not collapse under pressure."},
        ],
        "reminders": [
            {
                "title": "Recovery check-in" if mode != "sleep" else "Sleep protocol",
                "time": "6:30 PM" if mode != "sleep" else "9:30 PM",
                "note": "Hydrate, breathe, and choose your next small recovery action." if mode != "sleep" else "Start low-stimulation wind-down and step away from work.",
            }
        ],
        "coachSignals": [
            {"label": "Clarity", "value": clamp(round((score / 100) * 84), 20, 92), "detail": "Current ability to think cleanly and choose the next step."},
            {"label": "Recovery", "value": clamp(round((score / 100) * 88), 18, 95), "detail": "Nervous-system and sleep protection capacity."},
            {"label": "Consistency", "value": clamp(round((score / 100) * 82), 18, 93), "detail": "Likelihood of keeping one useful habit in place today."},
        ],
    }

    if journal:
        response["journalReflection"] = (
            "Your note suggests you are carrying effort and friction at the same time. The safest productive move is reducing pressure while keeping one stabilizing habit intact."
        )

    if message:
        response["message"] += f" I heard: \"{message[:140]}\"."

    session["assistantTurns"] += 1
    session["history"].append({"at": now_iso(), "mode": mode, "message": message[:160]})
    session["history"] = session["history"][-8:]
    session["reminders"] = response["reminders"]
    response["session"] = {
        "sessionId": session_id,
        "turnCount": session["assistantTurns"],
        "lastMode": mode,
    }

    return response


class VitaSenseHandler(BaseHTTPRequestHandler):
    server_version = "VitaSense/1.0"

    def log_message(self, format, *args):
        LOGGER.info("%s - %s", self.address_string(), format % args)

    def _send_bytes(self, body, content_type="text/plain; charset=utf-8", status=200):
        payload = body if isinstance(body, bytes) else body.encode("utf-8")
        request_id = str(uuid4())
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Request-ID", request_id)
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Resource-Policy", "same-origin")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(payload)

    def _send_json(self, payload, status=200):
        self._send_bytes(json.dumps(payload), "application/json; charset=utf-8", status)

    def _read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length > 0 else b"{}"
        return json.loads(raw.decode("utf-8") or "{}")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/health":
            self._send_json({"status": "ok", "service": SERVICE_NAME, "version": API_VERSION, "uptimeSeconds": round(time.time() - SERVER_STARTED_AT, 2)})
            return

        if path == "/":
            file_path = ROOT / "index.html"
        else:
            file_path = (ROOT / path.lstrip("/")).resolve()

        if ROOT not in file_path.parents and file_path != ROOT / "index.html":
            self._send_json({"error": "Forbidden path"}, 403)
            return

        if not file_path.exists() or not file_path.is_file() or file_path.suffix.lower() not in ALLOWED_STATIC_SUFFIXES:
            self._send_json({"error": "Not found"}, 404)
            return

        content_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
        if content_type.startswith("text/") or content_type in {"application/javascript", "application/json"}:
            content_type = f"{content_type}; charset=utf-8"

        self._send_bytes(file_path.read_bytes(), content_type)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if "application/json" not in self.headers.get("Content-Type", ""):
            self._send_json({"error": "Content-Type must be application/json"}, 415)
            return

        try:
            payload = self._read_json()
        except json.JSONDecodeError:
            self._send_json({"error": "Invalid JSON payload"}, 400)
            return

        session_id = str(payload.get("sessionId") or "demo-session").strip()

        if path == "/api/assessment":
            result = assessment_engine(payload, session_id)
            self._send_json(result)
            return

        if path == "/api/assistant":
            result = build_assistant_reply(payload)
            self._send_json(result)
            return

        self._send_json({"error": "Not found"}, 404)


def main():
    server = ThreadingHTTPServer(("127.0.0.1", 8000), VitaSenseHandler)
    print("VitaSense running at http://127.0.0.1:8000")
    server.serve_forever()


if __name__ == "__main__":
    main()
