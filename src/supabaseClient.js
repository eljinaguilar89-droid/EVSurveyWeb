import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] Missing environment variables.\n" +
      "Copy .env.example → .env.local and fill in your project credentials.\n" +
      "Survey responses will NOT be saved until this is configured."
  );
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Submit a completed survey response to Supabase.
 *
 * @param {Object} basicInfo  - name, email (required), age, gender, occupation, monthly_income
 * @param {Object} answers    - { [questionId]: string[] }
 * @returns {{ success: boolean, error?: string }}
 */
export async function submitSurveyResponse(basicInfo, answers) {
  if (!supabase) {
    console.warn("[Supabase] Client not initialised — skipping DB write.");
    return { success: true, skipped: true };
  }

  const payload = {
    // ── Respondent info ──────────────────────────────────────────────────
    name: basicInfo.name.trim(),
    email: (basicInfo.email || "").trim(),
    age: parseInt(basicInfo.age, 10),
    gender: basicInfo.gender,
    occupation: basicInfo.occupation,
    monthly_income: basicInfo.monthly_income,

    // ── Survey answers (stored as JSONB columns) ─────────────────────────
    vehicle_type: answers.vehicle_type ?? [],
    car_brand: answers.car_brand ?? [],
    charging_difficulty: answers.charging_difficulty?.[0] ?? null,
    charging_preference: answers.charging_preference ?? [],
    charging_speed: answers.charging_speed?.[0] ?? null,
    solar_preference: answers.solar_preference?.[0] ?? null,
    meralco_concern: answers.meralco_concern?.[0] ?? null,
    willingness_to_pay: answers.willingness_to_pay?.[0] ?? null,
    location: answers.location?.[0] ?? null,
    ev_timeline: answers.ev_timeline?.[0] ?? null,

    // ── Meta ─────────────────────────────────────────────────────────────
    submitted_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("survey_responses").insert(payload);

  if (error) {
    console.error("[Supabase] Insert error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
