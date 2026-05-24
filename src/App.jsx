import { useState, useEffect } from "react";
import { submitSurveyResponse } from "./supabaseClient";

// ─── SURVEY QUESTIONS ─────────────────────────────────────────────────────────
const questions = [
  {
    id: "vehicle_type",
    section: "YOUR RIDE",
    question: "What type of electric vehicle do you own or plan to own?",
    type: "multi_select",
    options: [
      { label: "Electric Car (EV)", icon: "🚗" },
      { label: "Electric Motorcycle / E-Moto", icon: "🏍️" },
      { label: "E-Bike / Electric Bicycle", icon: "🚲" },
      { label: "Electric Tricycle / E-Trike", icon: "🛺" },
      { label: "Electric Scooter", icon: "🛵" },
      { label: "I don't own one yet, but interested", icon: "👀" },
    ],
  },
  {
    id: "car_brand",
    section: "YOUR RIDE",
    question: "If you own an electric car, what brand is it?",
    subtitle: "Select all that apply, or skip if not applicable.",
    type: "multi_select",
    skippable: true,
    options: [
      { label: "BYD", icon: "🇨🇳" },
      { label: "Nissan (Leaf / Ariya)", icon: "🇯🇵" },
      { label: "MG / Morris Garages", icon: "🇬🇧" },
      { label: "Hyundai (Ioniq / Kona)", icon: "🇰🇷" },
      { label: "Kia (EV6 / Niro)", icon: "🇰🇷" },
      { label: "Tesla", icon: "⚡" },
      { label: "Volvo", icon: "🇸🇪" },
      { label: "BMW / Mini Electric", icon: "🇩🇪" },
      { label: "Other Brand", icon: "🚘" },
      { label: "Not applicable", icon: "—" },
    ],
  },
  {
    id: "charging_difficulty",
    section: "CHARGING PAIN POINTS",
    question: "How hard is it for you to find a charging station near you?",
    type: "single_select",
    options: [
      { label: "Very Hard — almost impossible to find one", icon: "😤" },
      { label: "Hard — I have to really plan ahead", icon: "😓" },
      { label: "Manageable — but not convenient", icon: "😐" },
      { label: "Easy — stations are accessible near me", icon: "😊" },
      { label: "I charge only at home", icon: "🏠" },
    ],
  },
  {
    id: "charging_preference",
    section: "CHARGING BEHAVIOR",
    question: "Where do you currently charge or prefer to charge your EV?",
    subtitle: "Select all that apply.",
    type: "multi_select",
    options: [
      { label: "At home (overnight)", icon: "🏠" },
      { label: "At the mall / commercial areas", icon: "🏬" },
      { label: "At work / office building", icon: "🏢" },
      { label: "At gas stations with EV chargers", icon: "⛽" },
      { label: "Dedicated public EV charging hubs", icon: "🔌" },
      { label: "No preference yet", icon: "🤷" },
    ],
  },
  {
    id: "charging_speed",
    section: "CHARGING BEHAVIOR",
    question: "What charging speed do you prefer when charging outside your home?",
    type: "single_select",
    options: [
      { label: "Fast Charging (DC Fast / 30–60 mins)", icon: "⚡" },
      { label: "Standard (AC Level 2 / 2–4 hrs)", icon: "🔋" },
      { label: "No preference, just need it available", icon: "🤷" },
      { label: "I only charge at home", icon: "🏠" },
    ],
  },
  {
    id: "solar_preference",
    section: "GREEN ENERGY",
    question: "Would you prefer to charge your EV using solar-powered stations?",
    subtitle: "100% solar — not dependent on Meralco grid or rising electricity bills.",
    type: "single_select",
    options: [
      { label: "Yes! 100% — I want clean energy only", icon: "☀️" },
      { label: "Yes, if the price is competitive", icon: "💚" },
      { label: "Neutral — I just need it to charge", icon: "😐" },
      { label: "No preference between solar and grid", icon: "🤔" },
      { label: "No, I trust the current grid setup", icon: "🔌" },
    ],
  },
  {
    id: "meralco_concern",
    section: "GREEN ENERGY",
    question:
      "How concerned are you about rising electricity costs (Meralco bills) affecting your EV charging?",
    type: "single_select",
    options: [
      { label: "Extremely concerned — it affects my EV use", icon: "😰" },
      { label: "Concerned — it's a growing worry", icon: "😟" },
      { label: "Somewhat — I'm watching the trend", icon: "🤨" },
      { label: "Not really, costs are manageable", icon: "🙂" },
      { label: "Not at all", icon: "😎" },
    ],
  },
  {
    id: "willingness_to_pay",
    section: "GREEN ENERGY",
    question: "How much you pay per kWh for solar-powered EV charging?",
    subtitle:
      "📊 Actual PH rates: Meralco residential = ₱14.3496/kWh · Public AC chargers = ₱14–18/kWh · DC Fast chargers at major commercial hubs = ₱23.65–₱28.50/kWh",
    type: "single_select",
    options: [
      { label: "Below ₱14.35/kWh — must be cheaper than Meralco", icon: "🪙" },
      { label: "₱14.35–₱23/kWh — fair range for solar charging", icon: "💰" },
      { label: "₱23–₱28.50/kWh — same as commercial fast chargers", icon: "💰💰" },
      { label: "I don't mind the price if it's solar & fast", icon: "☀️" },
    ],
  },
  {
    id: "location",
    section: "ABOUT YOU",
    question: "Where in the Philippines are you based?",
    type: "single_select",
    options: [
      { label: "Metro Manila (NCR)", icon: "🏙️" },
      { label: "Luzon (outside Metro Manila)", icon: "🗺️" },
      { label: "Visayas", icon: "🏝️" },
      { label: "Mindanao", icon: "🌿" },
    ],
  },
  {
    id: "ev_timeline",
    section: "ABOUT YOU",
    question: "When do you plan to own or switch to an EV?",
    type: "single_select",
    options: [
      { label: "Already own one", icon: "✅" },
      { label: "Within the next 6 months", icon: "📅" },
      { label: "Within 1–2 years", icon: "📆" },
      { label: "2–5 years from now", icon: "🔮" },
      { label: "Not sure yet", icon: "🤷" },
    ],
  },
];

const TOTAL = questions.length;

const sectionColors = {
  "YOUR RIDE": "#FFD166",
  "CHARGING PAIN POINTS": "#FF6B6B",
  "CHARGING BEHAVIOR": "#4ECDC4",
  "GREEN ENERGY": "#06D6A0",
  "ABOUT YOU": "#118AB2",
};

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? `${parseInt(r[1], 16)}, ${parseInt(r[2], 16)}, ${parseInt(r[3], 16)}`
    : "255,255,255";
}

// ─── BASIC INFO PAGE ──────────────────────────────────────────────────────────
function BasicInfoPage({ onContinue, initial }) {
  const [info, setInfo] = useState(() => ({
    name: initial?.name || "",
    email: initial?.email || "",
    age: initial?.age || "",
    gender: initial?.gender || "",
    occupation: initial?.occupation || "",
    monthly_income: initial?.monthly_income || "",
  }));
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setInfo((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!info.name.trim()) e.name = "Required";
    if (info.email && !/^\S+@\S+\.\S+$/.test(info.email)) e.email = "Enter a valid email";
    if (!info.age || isNaN(+info.age) || +info.age < 15 || +info.age > 90)
      e.age = "Valid age (15–90)";
    if (!info.gender) e.gender = "Required";
    if (!info.occupation) e.occupation = "Required";
    if (!info.monthly_income) e.monthly_income = "Required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const baseInput = (field) => ({
    width: "100%",
    padding: "0.82rem 1rem",
    background: "var(--input-bg)",
    border: `1.5px solid ${errors[field] ? "#FF6B6B" : "var(--border)"}`,
    borderRadius: "10px",
    color: "var(--text-h)",
    fontSize: "0.92rem",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    transition: "border-color 0.2s",
  });

  const selectBase = (field) => ({
    ...baseInput(field),
    appearance: "none",
    cursor: "pointer",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%236B7280' d='M5 7L0 2h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 1rem center",
    paddingRight: "2.5rem",
  });

  const label = (text) => (
    <span
      style={{
        display: "block",
        color: "var(--muted)",
        fontSize: "0.7rem",
        fontWeight: 700,
        letterSpacing: "0.1em",
        marginBottom: "0.4rem",
      }}
    >
      {text}
    </span>
  );

  const fieldWrap = { display: "flex", flexDirection: "column", gap: "0.35rem" };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }
        input:focus, select:focus { border-color: var(--accent) !important; }
        .go-btn { transition: all 0.2s ease; cursor: pointer; }
        .go-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(6,214,160,0.12); }
        select option { background: var(--input-bg); color: var(--text-h); }
      `}</style>

      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "3rem 1.5rem 5rem",
          animation: "fadeUp 0.5s ease both",
          background: "var(--card-bg)",
          borderRadius: 12,
          boxShadow: "var(--shadow)",
          color: "var(--text)",
        }}>
        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            marginBottom: "2rem",
          }}
        >
          <span style={{ fontSize: "1.3rem" }}>☀️</span>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800,
              fontSize: "0.65rem",
              letterSpacing: "0.14em",
              color: "var(--accent)",
            }}
          >
            SOLAR EV CHARGING PH · FEASIBILITY STUDY
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(1.7rem, 5vw, 2.3rem)",
            fontWeight: 800,
            color: "var(--text-h)",
            lineHeight: 1.1,
            marginBottom: "0.75rem",
          }}
        >
          Before we start,
          <br />
          tell us about you.
        </h1>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "0.88rem",
            lineHeight: 1.7,
            marginBottom: "2rem",
          }}
        >
          Helps us understand who needs solar EV charging most across the
          Philippines.
        </p>

        <div style={{ height: 1, background: "var(--border)", marginBottom: "1.75rem" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {/* Name */}
          <div style={fieldWrap}>
            {label("NAME OR NICKNAME")}
            <input
              type="text"
              placeholder="e.g. Juan dela Cruz"
              value={info.name}
              onChange={(e) => set("name", e.target.value)}
              style={baseInput("name")}
            />
            {errors.name && (
              <span style={{ color: "#FF6B6B", fontSize: "0.75rem" }}>
                {errors.name}
              </span>
            )}
          </div>

          {/* Email */}
          <div style={fieldWrap}>
            {label("EMAIL (optional)")}
            <input
              type="email"
              placeholder="e.g. juan@example.com"
              value={info.email}
              onChange={(e) => set("email", e.target.value)}
              style={baseInput("email")}
            />
            {errors.email && (
              <span style={{ color: "#FF6B6B", fontSize: "0.75rem" }}>
                {errors.email}
              </span>
            )}
          </div>

          {/* Age + Gender */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={fieldWrap}>
              {label("AGE")}
              <input
                type="number"
                placeholder="e.g. 28"
                min={15}
                max={90}
                value={info.age}
                onChange={(e) => set("age", e.target.value)}
                style={baseInput("age")}
              />
              {errors.age && (
                <span style={{ color: "#FF6B6B", fontSize: "0.75rem" }}>
                  {errors.age}
                </span>
              )}
            </div>
            <div style={fieldWrap}>
              {label("GENDER")}
              <select
                value={info.gender}
                onChange={(e) => set("gender", e.target.value)}
                style={selectBase("gender")}
              >
                <option value="">Select...</option>
                <option>Male</option>
                <option>Female</option>
                <option>Non-binary</option>
                <option>Prefer not to say</option>
              </select>
              {errors.gender && (
                <span style={{ color: "#FF6B6B", fontSize: "0.75rem" }}>
                  {errors.gender}
                </span>
              )}
            </div>
          </div>

          {/* Occupation */}
          <div style={fieldWrap}>
            {label("OCCUPATION")}
            <select
              value={info.occupation}
              onChange={(e) => set("occupation", e.target.value)}
              style={selectBase("occupation")}
            >
              <option value="">Select your occupation...</option>
              <option>Employed — Private sector</option>
              <option>Employed — Government / Public sector</option>
              <option>Self-employed / Freelancer</option>
              <option>Business owner / Entrepreneur</option>
              <option>Student</option>
              <option>Professional driver</option>
              <option>Retired</option>
              <option>Currently unemployed</option>
              <option>Other</option>
            </select>
            {errors.occupation && (
              <span style={{ color: "#FF6B6B", fontSize: "0.75rem" }}>
                {errors.occupation}
              </span>
            )}
          </div>

          {/* Monthly income */}
          <div style={fieldWrap}>
            {label("MONTHLY HOUSEHOLD INCOME")}
            <select
              value={info.monthly_income}
              onChange={(e) => set("monthly_income", e.target.value)}
              style={selectBase("monthly_income")}
            >
              <option value="">Select income range...</option>
              <option>Under ₱15,000</option>
              <option>₱15,000–₱30,000</option>
              <option>₱30,000–₱60,000</option>
              <option>₱60,000–₱100,000</option>
              <option>₱100,000–₱200,000</option>
              <option>Over ₱200,000</option>
              <option>Prefer not to say</option>
            </select>
            {errors.monthly_income && (
              <span style={{ color: "#FF6B6B", fontSize: "0.75rem" }}>
                {errors.monthly_income}
              </span>
            )}
          </div>

          {/* Privacy */}
          <div
            style={{
              background: "rgba(6,214,160,0.06)",
              border: "1px solid rgba(6,214,160,0.18)",
              borderRadius: "10px",
              padding: "0.85rem 1rem",
              display: "flex",
              gap: "0.6rem",
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: "0.95rem", marginTop: "1px" }}>🔒</span>
            <p style={{ color: "var(--muted)", fontSize: "0.78rem", lineHeight: 1.65 }}>
              Your data is confidential and used only for this EV charging
              feasibility study. No info will be shared or sold.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => validate() && onContinue(info)}
            className="go-btn"
            style={{
              width: "100%",
              padding: "1.1rem",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg, #06D6A0, var(--accent-2))",
              color: "var(--text-h)",
              fontSize: "1rem",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800,
              letterSpacing: "0.02em",
              marginTop: "0.25rem",
            }}
          >
            Start the Survey →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SURVEY QUESTIONS VIEW ────────────────────────────────────────────────────
function SurveyQuestions({ basicInfo, onBack }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [direction, setDirection] = useState("forward");
  const [animKey, setAnimKey] = useState(0);

  const q = questions[current];
  const accent = sectionColors[q?.section] || "#FFD166";
  const progress = (current / TOTAL) * 100;

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [animKey]);

  const toggle = (id, value, type) => {
    if (type === "single_select") setAnswers((a) => ({ ...a, [id]: [value] }));
    else
      setAnswers((a) => {
        const prev = a[id] || [];
        return {
          ...a,
          [id]: prev.includes(value)
            ? prev.filter((v) => v !== value)
            : [...prev, value],
        };
      });
  };

  const isSelected = (id, val) => (answers[id] || []).includes(val);
  const canNext = (answers[q.id] || []).length > 0 || q.skippable;

  const goNext = async () => {
    if (!canNext) return;
    setDirection("forward");
    setAnimKey((k) => k + 1);

    if (current < TOTAL - 1) {
      setCurrent((c) => c + 1);
    } else {
      // Final question — submit to Supabase
      setSubmitting(true);
      setSubmitError(null);
      const result = await submitSurveyResponse(basicInfo, answers);
      setSubmitting(false);
      if (result.success) {
        setSubmitted(true);
      } else {
        setSubmitError(
          result.error ||
            "Something went wrong saving your response. Please try again."
        );
      }
    }
  };

  const goBack = () => {
    if (!current) return;
    setDirection("back");
    setAnimKey((k) => k + 1);
    setCurrent((c) => c - 1);
  };

  if (submitted)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif",
          padding: "2rem",
        }}
      >
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div
          style={{
            textAlign: "center",
            maxWidth: 480,
            animation: "fadeUp 0.6s ease both",
          }}
        >
          <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>☀️</div>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "2.2rem",
              fontWeight: 800,
              color: "var(--text-h)",
              marginBottom: "0.75rem",
              lineHeight: 1.1,
            }}
          >
            Salamat, {basicInfo.name.split(" ")[0]}!
          </h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "1rem",
              lineHeight: 1.7,
              marginBottom: "2rem",
            }}
          >
            Your responses will help us build the{" "}
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>
              first solar-powered EV charging network
            </span>{" "}
            designed for Filipino drivers. We'll keep you posted on our launch.
            🇵🇭⚡
          </p>
          <div
            style={{
              background: "var(--accent-bg)",
              border: "1px solid var(--accent-border)",
              borderRadius: "12px",
              padding: "1.25rem 1.5rem",
              fontSize: "0.85rem",
              color: "var(--muted)",
            }}
          >
            {TOTAL} questions answered · {Object.values(answers).flat().length} data
            points collected
          </div>
        </div>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes slideIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
        @keyframes slideInBack{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:translateX(0)}}
        .opt{transition:all 0.18s ease;cursor:pointer}.opt:hover{transform:translateY(-2px)}
        .nb{transition:all 0.2s ease;cursor:pointer}.nb:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.4)}.nb:disabled{opacity:.35;cursor:not-allowed}
      `}</style>

      {/* Top progress bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "var(--border)",
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: `linear-gradient(90deg,${accent}, var(--accent-2))`,
            transition: "width .4s ease,background .4s ease",
            borderRadius: "0 4px 4px 0",
          }}
        />
      </div>

      {/* Section + step */}
      <div
        style={{
          padding: "2.5rem 2rem 0",
          maxWidth: 680,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "0.5rem",
          }}
        >
          <span
            style={{
              background: accent,
              color: "var(--text-h)",
              fontFamily: "'Space Grotesk',sans-serif",
              fontWeight: 800,
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              padding: "3px 10px",
              borderRadius: 999,
            }}
          >
            {q.section}
          </span>
          <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
            {current + 1} of {TOTAL}
          </span>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: "0.5rem" }}>
          {questions.map((_, i) => (
            <div
              key={i}
              style={{
                height: 3,
                width: i === current ? 24 : 8,
                borderRadius: 99,
                background: i <= current ? accent : "var(--border)",
                transition: "all .3s ease",
                opacity: i > current ? 0.4 : 1,
              }}
            />
          ))}
        </div>
      </div>

      {/* Question body */}
      <div
        key={animKey}
        style={{
          flex: 1,
          maxWidth: 680,
          margin: "0 auto",
          width: "100%",
          padding: "1.5rem 2rem 7rem",
          animation: `${direction === "forward" ? "slideIn" : "slideInBack"} .35s ease both`,
        }}
      >
        <h2
            style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: "clamp(1.25rem,4vw,1.65rem)",
            fontWeight: 800,
              color: "var(--text-h)",
            lineHeight: 1.25,
            marginBottom: q.subtitle ? "0.5rem" : "1.75rem",
          }}
        >
          {q.question}
        </h2>

        {q.subtitle && (
          <p
            style={{
              color: "var(--muted)",
              fontSize: "0.8rem",
              marginBottom: "1.5rem",
              lineHeight: 1.7,
              padding: "0.65rem 1rem",
              background: "rgba(0,0,0,0.03)",
              borderLeft: `3px solid ${accent}`,
              borderRadius: "0 8px 8px 0",
            }}
          >
            {q.subtitle}
          </p>
        )}

        {q.type === "multi_select" && (
          <p
            style={{
              color: "var(--muted)",
              fontSize: "0.78rem",
              marginBottom: "1.25rem",
              letterSpacing: "0.05em",
            }}
          >
            SELECT ALL THAT APPLY
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {q.options.map((opt) => {
            const sel = isSelected(q.id, opt.label);
            return (
              <button
                key={opt.label}
                className="opt"
                onClick={() => toggle(q.id, opt.label, q.type)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  borderRadius: "12px",
                  border: sel ? `1.5px solid ${accent}` : "1.5px solid var(--border)",
                  background: sel ? `rgba(${hexToRgb(accent)},.12)` : "var(--panel-bg)",
                  color: sel ? "var(--text-h)" : "var(--muted)",
                  fontSize: "0.95rem",
                  fontFamily: "'DM Sans',sans-serif",
                  fontWeight: sel ? 700 : 400,
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    fontSize: "1.4rem",
                    minWidth: 32,
                    textAlign: "center",
                    filter: sel ? "none" : "grayscale(.5)",
                  }}
                >
                  {opt.icon}
                </span>
                <span style={{ flex: 1 }}>{opt.label}</span>
                {sel && (
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-h)",
                      fontSize: "0.7rem",
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {q.skippable && !(answers[q.id] || []).length && (
          <p
            style={{
              color: "var(--muted)",
              fontSize: "0.78rem",
              marginTop: "1rem",
              textAlign: "center",
            }}
          >
            You can skip this if not applicable →
          </p>
        )}

        {/* Submit error */}
        {submitError && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.85rem 1rem",
              background: "rgba(255,107,107,0.1)",
              border: "1px solid rgba(255,107,107,0.3)",
              borderRadius: "10px",
              color: "#FF6B6B",
              fontSize: "0.82rem",
              lineHeight: 1.6,
            }}
          >
            ⚠️ {submitError}
          </div>
        )}
      </div>

      {/* Nav footer */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.03) 70%, transparent)",
          padding: "1.5rem 2rem 2rem",
        }}
      >
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >
          {(current > 0 || onBack) && (
            <button
              onClick={current > 0 ? goBack : onBack}
              disabled={submitting}
              className="nb"
              style={{
                padding: "0.9rem 1.4rem",
                borderRadius: "12px",
                border: "1.5px solid var(--border)",
                background: "transparent",
                color: "var(--muted)",
                fontSize: "0.95rem",
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: 700,
              }}
            >
              ← Back
            </button>
          )}
          <button
            onClick={goNext}
            disabled={!canNext || submitting}
            className="nb"
            style={{
              flex: 1,
              padding: "1rem",
              borderRadius: "12px",
              border: "none",
              background:
                canNext && !submitting
                  ? `linear-gradient(135deg,${accent}, var(--accent-2))`
                  : "var(--border)",
              color: canNext && !submitting ? "var(--text-h)" : "var(--muted)",
              fontSize: "1rem",
              fontFamily: "'Space Grotesk',sans-serif",
              fontWeight: 800,
              letterSpacing: "0.02em",
            }}
          >
            {submitting
              ? "Saving… ⏳"
              : current === TOTAL - 1
              ? "Submit Survey ☀️"
              : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [basicInfo, setBasicInfo] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [theme, setTheme] = useState("light");

  // apply theme to html[data-theme] attribute; default is light (no attribute)
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
      try {
        localStorage.setItem("theme", theme);
      } catch (e) {}
    }
  }, [theme]);

  // restore saved preference (optional) — default remains light if none
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") setTheme("dark");
    } catch (e) {}
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <>
      <button
        aria-label="Toggle color theme"
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        onClick={toggleTheme}
        style={{
          position: "fixed",
          top: 12,
          right: 12,
          zIndex: 9999,
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          color: "var(--muted)",
          padding: "8px 10px",
          borderRadius: 999,
          boxShadow: "var(--shadow)",
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      {showSurvey ? (
        <SurveyQuestions basicInfo={basicInfo} onBack={() => setShowSurvey(false)} />
      ) : (
        <BasicInfoPage
          initial={basicInfo}
          onContinue={(info) => {
            setBasicInfo(info);
            setShowSurvey(true);
          }}
        />
      )}
    </>
  );
}
