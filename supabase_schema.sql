-- ─────────────────────────────────────────────────────────────────────────────
-- EV Charging Station Solar — Supabase Schema
-- ─────────────────────────────────────────────────────────────────────────────
-- Run this in the Supabase SQL Editor:
--   Supabase Dashboard → SQL Editor → New Query → paste & run
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS survey_responses (
  id                 BIGSERIAL PRIMARY KEY,
  submitted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Respondent demographics
  name               TEXT        NOT NULL,
  age                SMALLINT    NOT NULL CHECK (age BETWEEN 15 AND 90),
  gender             TEXT        NOT NULL,
  occupation         TEXT        NOT NULL,
  monthly_income     TEXT        NOT NULL,

  -- Section: YOUR RIDE
  vehicle_type       TEXT[]      DEFAULT '{}',   -- multi-select
  car_brand          TEXT[]      DEFAULT '{}',   -- multi-select (skippable)

  -- Section: CHARGING PAIN POINTS
  charging_difficulty TEXT,                       -- single-select

  -- Section: CHARGING BEHAVIOR
  charging_preference TEXT[]     DEFAULT '{}',   -- multi-select
  charging_speed      TEXT,                       -- single-select

  -- Section: GREEN ENERGY
  solar_preference    TEXT,                       -- single-select
  meralco_concern     TEXT,                       -- single-select
  willingness_to_pay  TEXT,                       -- single-select

  -- Section: ABOUT YOU
  location            TEXT,                       -- single-select
  ev_timeline         TEXT                        -- single-select
);

-- ─── Row-Level Security ───────────────────────────────────────────────────────
-- Enable RLS so only authenticated service-role can read data.
-- The anon key (used by the app) can INSERT but not SELECT.
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Allow the app (anon key) to insert new responses
CREATE POLICY "allow_anon_insert"
  ON survey_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated users (e.g. you, logged into Supabase Studio) can read all
CREATE POLICY "allow_authenticated_select"
  ON survey_responses
  FOR SELECT
  TO authenticated
  USING (true);

-- ─── Useful indexes ───────────────────────────────────────────────────────────
CREATE INDEX idx_survey_submitted_at ON survey_responses (submitted_at DESC);
CREATE INDEX idx_survey_location     ON survey_responses (location);
CREATE INDEX idx_survey_ev_timeline  ON survey_responses (ev_timeline);

-- ─── Quick sanity check ───────────────────────────────────────────────────────
-- After running, verify with:
--   SELECT COUNT(*) FROM survey_responses;
