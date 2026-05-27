-- ============================================================
-- mentorOS — Supabase Database Schema
-- Version: 1.0 (Phase 0 + Phase 1 foundation)
-- Run this in Supabase SQL editor in order.
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for future fuzzy search on glossary


-- ============================================================
-- USERS
-- Synced from auth.users via trigger.
-- Stores app-level user data and subscription state.
-- ============================================================

create table public.users (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  display_name    text,
  avatar_url      text,

  -- Subscription / access
  plan            text not null default 'free',
  -- values: 'free' | 'pmp_monthly' | 'pmp_quarterly' | 'beta'
  plan_expires_at timestamptz,
  is_beta         boolean not null default false,

  -- Metadata
  preferred_lang  text not null default 'vi',
  -- values: 'vi' | 'en'

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Auto-sync new auth users into public.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute procedure public.set_updated_at();


-- ============================================================
-- RLS: users
-- ============================================================

alter table public.users enable row level security;

create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- ============================================================
-- PMP_DAILY_USAGE
-- Tracks how many user-input (non-sample) questions
-- a free user has analyzed today.
-- Resets daily. Paid users bypass this check in app logic.
-- ============================================================

create table public.pmp_daily_usage (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  usage_date  date not null default current_date,
  count       int  not null default 0,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  unique(user_id, usage_date)
);

create trigger pmp_daily_usage_updated_at
  before update on public.pmp_daily_usage
  for each row execute procedure public.set_updated_at();

-- Index for fast lookup by user + date
create index idx_pmp_daily_usage_user_date
  on public.pmp_daily_usage(user_id, usage_date);

-- RLS
alter table public.pmp_daily_usage enable row level security;

create policy "Users can read own usage"
  on public.pmp_daily_usage for select
  using (auth.uid() = user_id);

create policy "Users can insert own usage"
  on public.pmp_daily_usage for insert
  with check (auth.uid() = user_id);

create policy "Users can update own usage"
  on public.pmp_daily_usage for update
  using (auth.uid() = user_id);


-- ============================================================
-- PMP_SESSIONS
-- Stores each question analysis session.
-- Links to user (nullable for anonymous/guest sessions).
-- ============================================================

create table public.pmp_sessions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references public.users(id) on delete set null,

  -- Question data
  question_text   text not null,
  question_source text not null default 'user_input',
  -- values: 'user_input' | 'sample'
  answer_choices  jsonb,
  -- array of { label: string, text: string }
  user_answer     text,
  -- the label user selected e.g. 'A', 'B', 'C', 'D'
  correct_answer  text,
  is_correct      boolean,

  -- Mode
  mood            text not null,
  -- values: 'mood1' | 'mood2'

  -- AI output (stored for data analysis)
  ai_output       jsonb,
  -- full structured output from the AI analysis

  -- Trap / cognition tags (extracted from ai_output for analytics)
  trap_types      text[],
  -- e.g. ['escalation_reflex', 'action_before_analysis']
  trigger_words   text[],

  -- Timing
  time_spent_ms   int,

  created_at      timestamptz not null default now()
);

-- Indexes
create index idx_pmp_sessions_user_id
  on public.pmp_sessions(user_id);

create index idx_pmp_sessions_question_source
  on public.pmp_sessions(question_source);

create index idx_pmp_sessions_mood
  on public.pmp_sessions(mood);

-- RLS
alter table public.pmp_sessions enable row level security;

create policy "Users can read own sessions"
  on public.pmp_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.pmp_sessions for insert
  with check (auth.uid() = user_id or user_id is null);


-- ============================================================
-- PMP_SAMPLE_QUESTIONS
-- Curated sample questions bundled with the product.
-- Free, unlimited analysis. Admin-managed.
-- ============================================================

create table public.pmp_sample_questions (
  id              uuid primary key default uuid_generate_v4(),
  question_text   text not null,
  answer_choices  jsonb not null,
  -- [{ label: 'A', text: '...' }, ...]
  correct_answer  text not null,

  -- Classification
  domain          text,
  -- e.g. 'People', 'Process', 'Business Environment'
  process_group   text,
  -- e.g. 'Initiating', 'Planning', 'Executing', 'Monitoring', 'Closing'
  knowledge_area  text,
  -- e.g. 'Risk', 'Stakeholder', 'Communications', etc.
  difficulty      text not null default 'medium',
  -- values: 'easy' | 'medium' | 'hard'
  approach        text not null default 'predictive',
  -- values: 'predictive' | 'agile' | 'hybrid'

  -- Trap metadata (used to seed analysis and build trap taxonomy)
  trap_types      text[],
  trigger_words   text[],
  core_rule       text,
  -- one-liner rule e.g. "Understand root cause before taking action."

  -- Mood 2 interpretation options (for Reading Decode mode)
  mood2_options   jsonb,
  -- [{ label: 'A', text: '...', is_correct: bool }]

  is_active       boolean not null default true,
  sort_order      int,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger pmp_sample_questions_updated_at
  before update on public.pmp_sample_questions
  for each row execute procedure public.set_updated_at();

create index idx_pmp_sample_questions_active
  on public.pmp_sample_questions(is_active, sort_order);

-- RLS: Sample questions are public (read-only for all)
alter table public.pmp_sample_questions enable row level security;

create policy "Anyone can read active sample questions"
  on public.pmp_sample_questions for select
  using (is_active = true);


-- ============================================================
-- PMP_GLOSSARY
-- PMP terminology with PMI-context explanations.
-- ============================================================

create table public.pmp_glossary (
  id              uuid primary key default uuid_generate_v4(),
  term            text not null unique,
  -- Keep in English e.g. 'Mitigation', 'Escalate'

  -- Explanation layers
  definition      text not null,
  -- PMI-context definition
  eli5            text,
  -- Explain like I'm 5 / simple Vietnamese explanation
  common_trap     text,
  -- What Vietnamese learners commonly misunderstand
  real_example    text,
  -- Practical usage example

  -- Confusing pairs
  confuses_with   text[],
  -- e.g. ['Contingency', 'Avoidance']

  -- Classification
  category        text,
  -- e.g. 'Risk', 'Stakeholder', 'Agile Roles', 'EVM', 'PMI Mindset'

  is_active       boolean not null default true,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger pmp_glossary_updated_at
  before update on public.pmp_glossary
  for each row execute procedure public.set_updated_at();

-- Full-text search index
create index idx_pmp_glossary_term_trgm
  on public.pmp_glossary using gin(term gin_trgm_ops);

-- RLS: Glossary is public
alter table public.pmp_glossary enable row level security;

create policy "Anyone can read active glossary"
  on public.pmp_glossary for select
  using (is_active = true);


-- ============================================================
-- ASKBETTER_SESSIONS
-- Stores each prompt improvement session.
-- ============================================================

create table public.askbetter_sessions (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references public.users(id) on delete set null,

  -- Input
  raw_request       text not null,
  task_category     text,
  -- e.g. 'Writing', 'Analysis', 'Meeting', 'Planning'

  -- AI output (round 1)
  detected_issues   jsonb,
  -- [{ type: string, description: string }]
  missing_context   jsonb,
  improved_request  text,
  suggested_ai      text,
  -- e.g. 'ChatGPT', 'Claude', 'Gemini'

  -- Round 2 (user rewrites)
  user_rewrite      text,
  rewrite_feedback  jsonb,

  -- Cognition tags
  mistake_tags      text[],
  -- e.g. ['missing_audience', 'vague_outcome', 'no_output_format']

  created_at        timestamptz not null default now()
);

create index idx_askbetter_sessions_user_id
  on public.askbetter_sessions(user_id);

create index idx_askbetter_sessions_task_category
  on public.askbetter_sessions(task_category);

-- RLS
alter table public.askbetter_sessions enable row level security;

create policy "Users can read own askbetter sessions"
  on public.askbetter_sessions for select
  using (auth.uid() = user_id);

create policy "Anyone can insert askbetter sessions"
  on public.askbetter_sessions for insert
  with check (true);
  -- Anonymous sessions allowed; user_id can be null


-- ============================================================
-- NEXTUP_TASKS
-- Stores tasks extracted from user's natural language input.
-- Requires login to save (anonymous users see results but can't save).
-- ============================================================

create table public.nextup_tasks (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,

  -- Task data
  title           text not null,
  raw_input       text,
  -- the original natural-language input this was extracted from

  -- Time
  due_date        date,
  due_time        time,
  deadline_confidence text not null default 'inferred',
  -- values: 'explicit' | 'inferred' | 'none'
  time_bucket     text not null default 'no_deadline',
  -- values: 'today' | 'this_week' | 'this_month' | 'overdue' | 'no_deadline'

  -- Classification
  category        text,
  -- e.g. 'Admin', 'Meeting', 'Finance', 'Follow-up'
  priority        text not null default 'medium',
  -- values: 'high' | 'medium' | 'low'

  -- State
  status          text not null default 'pending',
  -- values: 'pending' | 'done' | 'cancelled'
  completed_at    timestamptz,

  -- Cognition tags (for future analysis)
  trap_tags       text[],
  -- e.g. ['vague_task', 'missing_deadline', 'no_next_action']

  notes           text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger nextup_tasks_updated_at
  before update on public.nextup_tasks
  for each row execute procedure public.set_updated_at();

-- Indexes
create index idx_nextup_tasks_user_id
  on public.nextup_tasks(user_id);

create index idx_nextup_tasks_user_status
  on public.nextup_tasks(user_id, status);

create index idx_nextup_tasks_user_time_bucket
  on public.nextup_tasks(user_id, time_bucket);

create index idx_nextup_tasks_due_date
  on public.nextup_tasks(user_id, due_date);

-- RLS
alter table public.nextup_tasks enable row level security;

create policy "Users can read own tasks"
  on public.nextup_tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.nextup_tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.nextup_tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.nextup_tasks for delete
  using (auth.uid() = user_id);


-- ============================================================
-- PAYMENT_REQUESTS
-- Manual QR payment tracking.
-- Admin verifies and updates user.plan manually in Supabase.
-- ============================================================

create table public.payment_requests (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,

  -- Plan info
  plan            text not null,
  -- values: 'pmp_monthly' | 'pmp_quarterly'
  amount_vnd      int not null,
  -- 199000 or 399000

  -- Transfer details
  transfer_ref    text,
  -- the content the user typed in their bank transfer
  transfer_note   text,
  -- any note from the user

  -- Status
  status          text not null default 'pending',
  -- values: 'pending' | 'confirmed' | 'rejected'
  confirmed_at    timestamptz,
  confirmed_by    text,
  -- admin email or identifier

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger payment_requests_updated_at
  before update on public.payment_requests
  for each row execute procedure public.set_updated_at();

create index idx_payment_requests_user_id
  on public.payment_requests(user_id);

create index idx_payment_requests_status
  on public.payment_requests(status);

-- RLS
alter table public.payment_requests enable row level security;

create policy "Users can read own payment requests"
  on public.payment_requests for select
  using (auth.uid() = user_id);

create policy "Users can insert own payment requests"
  on public.payment_requests for insert
  with check (auth.uid() = user_id);


-- ============================================================
-- TYPESCRIPT TYPES (for reference — copy to src/types/database.ts)
-- ============================================================

/*

export type UserPlan = 'free' | 'pmp_monthly' | 'pmp_quarterly' | 'beta'
export type Lang = 'vi' | 'en'

export interface User {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  plan: UserPlan
  plan_expires_at: string | null
  is_beta: boolean
  preferred_lang: Lang
  created_at: string
  updated_at: string
}

export interface PmpDailyUsage {
  id: string
  user_id: string
  usage_date: string
  count: number
  created_at: string
  updated_at: string
}

export interface PmpSession {
  id: string
  user_id: string | null
  question_text: string
  question_source: 'user_input' | 'sample'
  answer_choices: { label: string; text: string }[] | null
  user_answer: string | null
  correct_answer: string | null
  is_correct: boolean | null
  mood: 'mood1' | 'mood2'
  ai_output: Record<string, unknown> | null
  trap_types: string[] | null
  trigger_words: string[] | null
  time_spent_ms: number | null
  created_at: string
}

export interface PmpSampleQuestion {
  id: string
  question_text: string
  answer_choices: { label: string; text: string }[]
  correct_answer: string
  domain: string | null
  process_group: string | null
  knowledge_area: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  approach: 'predictive' | 'agile' | 'hybrid'
  trap_types: string[] | null
  trigger_words: string[] | null
  core_rule: string | null
  mood2_options: { label: string; text: string; is_correct: boolean }[] | null
  is_active: boolean
  sort_order: number | null
  created_at: string
  updated_at: string
}

export interface PmpGlossaryTerm {
  id: string
  term: string
  definition: string
  eli5: string | null
  common_trap: string | null
  real_example: string | null
  confuses_with: string[] | null
  category: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AskBetterSession {
  id: string
  user_id: string | null
  raw_request: string
  task_category: string | null
  detected_issues: { type: string; description: string }[] | null
  missing_context: Record<string, unknown> | null
  improved_request: string | null
  suggested_ai: string | null
  user_rewrite: string | null
  rewrite_feedback: Record<string, unknown> | null
  mistake_tags: string[] | null
  created_at: string
}

export interface NextUpTask {
  id: string
  user_id: string
  title: string
  raw_input: string | null
  due_date: string | null
  due_time: string | null
  deadline_confidence: 'explicit' | 'inferred' | 'none'
  time_bucket: 'today' | 'this_week' | 'this_month' | 'overdue' | 'no_deadline'
  category: string | null
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'done' | 'cancelled'
  completed_at: string | null
  trap_tags: string[] | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PaymentRequest {
  id: string
  user_id: string
  plan: 'pmp_monthly' | 'pmp_quarterly'
  amount_vnd: number
  transfer_ref: string | null
  transfer_note: string | null
  status: 'pending' | 'confirmed' | 'rejected'
  confirmed_at: string | null
  confirmed_by: string | null
  created_at: string
  updated_at: string
}

*/
