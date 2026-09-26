alter table public.employees
  alter column name drop not null,
  alter column role drop not null,
  alter column department drop not null,
  alter column current_workload drop not null;

alter table public.projects
  alter column estimated_workload drop not null,
  alter column duration_weeks drop not null;

alter table public.project_members
  alter column allocation_percentage drop not null,
  add column if not exists team_id text;

alter table public.scenario_members
  alter column allocation_percentage drop not null;

alter table public.projects
  add column if not exists project_type text,
  add column if not exists project_phase text,
  add column if not exists business_unit text,
  add column if not exists organization_id text,
  add column if not exists organization_name text;

alter table public.simulation_results
  alter column current_workload drop not null,
  alter column projected_workload drop not null,
  alter column current_capacity drop not null,
  alter column skill_coverage_percentage drop not null;

alter table public.simulation_results
  add column if not exists simulated_demand numeric,
  add column if not exists simulated_staff numeric,
  add column if not exists simulated_completed numeric,
  add column if not exists simulated_backlog numeric,
  add column if not exists simulated_delivery_days numeric,
  add column if not exists simulated_cloud_cost numeric,
  add column if not exists simulated_project_cost numeric,
  add column if not exists current_project_cost numeric,
  add column if not exists current_sla_score numeric,
  add column if not exists simulated_sla_score numeric,
  add column if not exists current_revenue numeric,
  add column if not exists current_profit numeric,
  add column if not exists simulated_revenue numeric,
  add column if not exists simulated_profit numeric;

alter table public.simulation_results
  add constraint simulation_results_scenario_unique unique (scenario_id);
