-- Migration: sync pmp_sessions với PMPSession TypeScript interface
-- Idempotent — safe to re-run after partial failure

-- 1. Rename time_spent_ms → time_seconds (skip if already renamed)
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

-- 2. Rename ai_output → ai_response (skip if already renamed)
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

-- 3. Thêm columns mới nếu chưa có
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

-- 4. Drop columns cũ không còn dùng
ALTER TABLE public.pmp_sessions
  DROP COLUMN IF EXISTS user_answer,
  DROP COLUMN IF EXISTS correct_answer,
  DROP COLUMN IF EXISTS trigger_words,
  DROP COLUMN IF EXISTS trap_types;

-- 5. Cleanup: drop legacy time_spent_ms if time_seconds already exists (duplicate from manual fix)
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

-- 6. Cleanup: drop legacy ai_output if ai_response already exists
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
