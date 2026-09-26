create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  employee_code text not null unique,
  name text not null,
  role text not null,
  department text not null,
  experience_years numeric(5, 2) not null default 0
    check (experience_years >= 0),
  current_workload numeric(5, 2) not null default 0
    check (current_workload between 0 and 100),
  availability_status text generated always as (
    case
      when current_workload <= 50 then 'Available'
      when current_workload <= 80 then 'Limited'
      else 'Unavailable'
    end
  ) stored,
  capacity numeric(5, 2) generated always as (100 - current_workload) stored,
  relevant_experience text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint skills_name_unique unique (name)
);

create table public.employee_skills (
  employee_id uuid not null references public.employees(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  proficiency_level text not null
    check (proficiency_level in ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  primary key (employee_id, skill_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  project_code text not null unique,
  name text not null,
  description text,
  team_size_required integer not null default 0
    check (team_size_required >= 0),
  estimated_workload numeric(5, 2) not null default 0
    check (estimated_workload between 0 and 100),
  duration_weeks integer not null default 1
    check (duration_weeks > 0),
  deadline date,
  priority text not null default 'Medium'
    check (priority in ('Low', 'Medium', 'High', 'Critical')),
  status text not null default 'Planning'
    check (status in ('Planning', 'Active', 'At Risk', 'Completed', 'On Hold')),
  risk_level text not null default 'Low'
    check (risk_level in ('Low', 'Medium', 'High')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.project_requirements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  role text not null,
  quantity integer not null default 1
    check (quantity > 0),
  created_at timestamptz not null default timezone('utc', now()),
  constraint project_requirements_role_unique unique (project_id, role)
);

create table public.project_required_skills (
  project_id uuid not null references public.projects(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete restrict,
  required_level text not null
    check (required_level in ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  primary key (project_id, skill_id)
);

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete restrict,
  allocation_percentage numeric(5, 2) not null default 0
    check (allocation_percentage between 0 and 100),
  joined_at timestamptz not null default timezone('utc', now()),
  constraint project_members_employee_unique unique (project_id, employee_id)
);

create table public.scenarios (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  description text,
  scenario_type text not null
    check (scenario_type in (
      'Current Allocation',
      'Add Employee',
      'Remove Employee',
      'Move Employee',
      'Redistribute Workload',
      'Custom Allocation'
    )),
  created_at timestamptz not null default timezone('utc', now()),
  constraint scenarios_project_name_unique unique (project_id, name)
);

create table public.scenario_members (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.scenarios(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete restrict,
  allocation_percentage numeric(5, 2) not null default 0
    check (allocation_percentage between 0 and 100),
  constraint scenario_members_employee_unique unique (scenario_id, employee_id)
);

create table public.simulation_results (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.scenarios(id) on delete cascade,
  current_workload numeric(5, 2) not null
    check (current_workload between 0 and 100),
  projected_workload numeric(5, 2) not null
    check (projected_workload between 0 and 100),
  current_capacity numeric(5, 2) not null
    check (current_capacity between 0 and 100),
  projected_capacity numeric(5, 2) not null
    check (projected_capacity between 0 and 100),
  current_utilization numeric(5, 2) not null
    check (current_utilization between 0 and 100),
  projected_utilization numeric(5, 2) not null
    check (projected_utilization between 0 and 100),
  skill_coverage_percentage numeric(5, 2) not null
    check (skill_coverage_percentage between 0 and 100),
  projected_completion_date date,
  risk_level text not null
    check (risk_level in ('Low', 'Medium', 'High')),
  risks jsonb not null default '[]'::jsonb,
  tradeoffs jsonb not null default '[]'::jsonb,
  assumptions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null
    check (type in (
      'Project Invitation',
      'Team Update',
      'Capacity Warning',
      'Simulation Result',
      'Project Risk',
      'Employee Availability'
    )),
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index employee_skills_skill_id_idx on public.employee_skills(skill_id);
create index project_requirements_project_id_idx on public.project_requirements(project_id);
create index project_required_skills_skill_id_idx on public.project_required_skills(skill_id);
create index project_members_employee_id_idx on public.project_members(employee_id);
create index scenarios_project_id_idx on public.scenarios(project_id);
create index scenario_members_employee_id_idx on public.scenario_members(employee_id);
create index simulation_results_scenario_id_idx on public.simulation_results(scenario_id);
create index notifications_user_id_created_at_idx
  on public.notifications(user_id, created_at desc);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger employees_set_updated_at
before update on public.employees
for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.employees enable row level security;
alter table public.skills enable row level security;
alter table public.employee_skills enable row level security;
alter table public.projects enable row level security;
alter table public.project_requirements enable row level security;
alter table public.project_required_skills enable row level security;
alter table public.project_members enable row level security;
alter table public.scenarios enable row level security;
alter table public.scenario_members enable row level security;
alter table public.simulation_results enable row level security;
alter table public.notifications enable row level security;

create policy "Authenticated users can read profiles"
on public.profiles for select to authenticated
using (true);

create policy "Users can update their own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Authenticated users can manage employees"
on public.employees for all to authenticated
using (true)
with check (true);

create policy "Authenticated users can manage skills"
on public.skills for all to authenticated
using (true)
with check (true);

create policy "Authenticated users can manage employee skills"
on public.employee_skills for all to authenticated
using (true)
with check (true);

create policy "Authenticated users can manage projects"
on public.projects for all to authenticated
using (true)
with check (true);

create policy "Authenticated users can manage project requirements"
on public.project_requirements for all to authenticated
using (true)
with check (true);

create policy "Authenticated users can manage project required skills"
on public.project_required_skills for all to authenticated
using (true)
with check (true);

create policy "Authenticated users can manage project members"
on public.project_members for all to authenticated
using (true)
with check (true);

create policy "Authenticated users can manage scenarios"
on public.scenarios for all to authenticated
using (true)
with check (true);

create policy "Authenticated users can manage scenario members"
on public.scenario_members for all to authenticated
using (true)
with check (true);

create policy "Authenticated users can manage simulation results"
on public.simulation_results for all to authenticated
using (true)
with check (true);

create policy "Users can read their own notifications"
on public.notifications for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can update their own notifications"
on public.notifications for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
