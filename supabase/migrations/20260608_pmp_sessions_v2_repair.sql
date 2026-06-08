-- REPAIR: chạy file này nếu migration gốc fail giữa chừng
-- (VD: "column time_seconds already exists")
-- Copy toàn bộ vào Supabase SQL Editor → Run

-- === Bước 0: Xem schema hiện tại ===
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'pmp_sessions'
-- ORDER BY ordinal_position;

-- === Bước 1–6: Idempotent sync (same as 20260608_pmp_sessions_v2.sql) ===

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pmp_sessions' AND column_name = 'time_spent_ms'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pmp_sessions' AND column_name = 'time_seconds'
  ) THEN
    ALTER TABLE public.pmp_sessions RENAME COLUMN time_spent_ms TO time_seconds;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pmp_sessions' AND column_name = 'ai_output'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pmp_sessions' AND column_name = 'ai_response'
  ) THEN
    ALTER TABLE public.pmp_sessions RENAME COLUMN ai_output TO ai_response;
  END IF;
END $$;

ALTER TABLE public.pmp_sessions
  ADD COLUMN IF NOT EXISTS question_tag text,
  ADD COLUMN IF NOT EXISTS sample_question_id integer,
  ADD COLUMN IF NOT EXISTS response_type text NOT NULL DEFAULT 'single',
  ADD COLUMN IF NOT EXISTS user_answers text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS correct_answers text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS trap_name text,
  ADD COLUMN IF NOT EXISTS trap_category text,
  ADD COLUMN IF NOT EXISTS trap_domain text,
  ADD COLUMN IF NOT EXISTS trap_approach text,
  ADD COLUMN IF NOT EXISTS core_rule text,
  ADD COLUMN IF NOT EXISTS pmi_signal text;

ALTER TABLE public.pmp_sessions
  DROP COLUMN IF EXISTS user_answer,
  DROP COLUMN IF EXISTS correct_answer,
  DROP COLUMN IF EXISTS trigger_words,
  DROP COLUMN IF EXISTS trap_types;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pmp_sessions' AND column_name = 'time_spent_ms'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pmp_sessions' AND column_name = 'time_seconds'
  ) THEN
    ALTER TABLE public.pmp_sessions DROP COLUMN time_spent_ms;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pmp_sessions' AND column_name = 'ai_output'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pmp_sessions' AND column_name = 'ai_response'
  ) THEN
    ALTER TABLE public.pmp_sessions DROP COLUMN ai_output;
  END IF;
END $$;
