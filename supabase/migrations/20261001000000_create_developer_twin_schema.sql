-- Developer Twin Database Schema Migration
-- Module: Developer Twin ("Simulate Before You Commit")
-- Strictly separated from Manager Twin tables

create extension if not exists pgcrypto;

-- 1. developer_projects
create table if not exists public.developer_projects (
  id uuid primary key default gen_random_uuid(),
  developer_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  repository_url text,
  language text,
  framework text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 2. components
create table if not exists public.components (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.developer_projects(id) on delete cascade,
  name text not null,
  type text not null default 'service',
  file_path text,
  created_at timestamptz not null default timezone('utc', now())
);

-- 3. dependencies
create table if not exists public.dependencies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.developer_projects(id) on delete cascade,
  source_component_id uuid not null references public.components(id) on delete cascade,
  target_component_id uuid not null references public.components(id) on delete cascade,
  dependency_type text not null default 'depends_on',
  created_at timestamptz not null default timezone('utc', now()),
  constraint dependencies_unique_edge unique (project_id, source_component_id, target_component_id)
);

-- 4. analysis_history
create table if not exists public.analysis_history (
  id uuid primary key default gen_random_uuid(),
  developer_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.developer_projects(id) on delete cascade,
  change_description text not null,
  change_type text not null,
  status text not null default 'Completed',
  created_at timestamptz not null default timezone('utc', now())
);

-- 5. impact_reports
create table if not exists public.impact_reports (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analysis_history(id) on delete cascade,
  risk_level text not null default 'LOW',
  risk_score integer not null default 1,
  affected_components integer not null default 0,
  affected_files integer not null default 0,
  affected_apis integer not null default 0,
  impact_summary text,
  created_at timestamptz not null default timezone('utc', now())
);

-- 6. test_recommendations
create table if not exists public.test_recommendations (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analysis_history(id) on delete cascade,
  test_name text not null,
  description text,
  priority text not null default 'MEDIUM',
  completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

-- Trigger for developer_projects updated_at
drop trigger if exists developer_projects_set_updated_at on public.developer_projects;
create trigger developer_projects_set_updated_at
before update on public.developer_projects
for each row execute function public.set_updated_at();

-- Performance Indexes
create index if not exists idx_developer_projects_developer_id on public.developer_projects(developer_id);
create index if not exists idx_components_project_id on public.components(project_id);
create index if not exists idx_dependencies_project_id on public.dependencies(project_id);
create index if not exists idx_dependencies_source on public.dependencies(source_component_id);
create index if not exists idx_dependencies_target on public.dependencies(target_component_id);
create index if not exists idx_analysis_history_developer_id on public.analysis_history(developer_id);
create index if not exists idx_analysis_history_project_id on public.analysis_history(project_id);
create index if not exists idx_impact_reports_analysis_id on public.impact_reports(analysis_id);
create index if not exists idx_test_recommendations_analysis_id on public.test_recommendations(analysis_id);

-- Row Level Security (RLS)
alter table public.developer_projects enable row level security;
alter table public.components enable row level security;
alter table public.dependencies enable row level security;
alter table public.analysis_history enable row level security;
alter table public.impact_reports enable row level security;
alter table public.test_recommendations enable row level security;

-- Policies: developer_projects
create policy "Developer can manage their own projects"
on public.developer_projects
for all to authenticated
using (developer_id = (select auth.uid()))
with check (developer_id = (select auth.uid()));

-- Policies: components
create policy "Developer can manage components for their own projects"
on public.components
for all to authenticated
using (
  exists (
    select 1 from public.developer_projects
    where developer_projects.id = components.project_id
      and developer_projects.developer_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.developer_projects
    where developer_projects.id = components.project_id
      and developer_projects.developer_id = (select auth.uid())
  )
);

-- Policies: dependencies
create policy "Developer can manage dependencies for their own projects"
on public.dependencies
for all to authenticated
using (
  exists (
    select 1 from public.developer_projects
    where developer_projects.id = dependencies.project_id
      and developer_projects.developer_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.developer_projects
    where developer_projects.id = dependencies.project_id
      and developer_projects.developer_id = (select auth.uid())
  )
);

-- Policies: analysis_history
create policy "Developer can manage their own analysis history"
on public.analysis_history
for all to authenticated
using (developer_id = (select auth.uid()))
with check (developer_id = (select auth.uid()));

-- Policies: impact_reports
create policy "Developer can manage impact reports for their own analyses"
on public.impact_reports
for all to authenticated
using (
  exists (
    select 1 from public.analysis_history
    where analysis_history.id = impact_reports.analysis_id
      and analysis_history.developer_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.analysis_history
    where analysis_history.id = impact_reports.analysis_id
      and analysis_history.developer_id = (select auth.uid())
  )
);

-- Policies: test_recommendations
create policy "Developer can manage test recommendations for their own analyses"
on public.test_recommendations
for all to authenticated
using (
  exists (
    select 1 from public.analysis_history
    where analysis_history.id = test_recommendations.analysis_id
      and analysis_history.developer_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.analysis_history
    where analysis_history.id = test_recommendations.analysis_id
      and analysis_history.developer_id = (select auth.uid())
  )
);
