create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  email text,
  created_at timestamptz default now()
);

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users on delete cascade,
  role text not null check (role in ('admin', 'backoffice', 'requester')),
  team_key text,
  created_at timestamptz default now()
);

create table if not exists public.request_teams (
  key text primary key,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists public.request_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  team_key text references public.request_teams(key),
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  request_type_id uuid not null references public.request_types(id),
  team_key text references public.request_teams(key),
  status text not null check (status in ('submitted', 'in_review', 'approved', 'rejected', 'cancelled')) default 'submitted',
  created_at timestamptz default now()
);

create table if not exists public.request_comments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

create or replace function public.has_role(check_role text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role = check_role
  );
$$;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.request_teams enable row level security;
alter table public.request_types enable row level security;
alter table public.requests enable row level security;
alter table public.request_comments enable row level security;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.has_role('admin') or public.has_role('backoffice'));

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (auth.uid() = id or public.has_role('admin'))
  with check (auth.uid() = id or public.has_role('admin'));

create policy "profiles_insert_self"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "user_roles_select_own_or_admin"
  on public.user_roles for select
  using (auth.uid() = user_id or public.has_role('admin'));

create policy "user_roles_admin_all"
  on public.user_roles for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

create policy "request_teams_select_auth"
  on public.request_teams for select
  using (auth.role() = 'authenticated');

create policy "request_teams_admin_manage"
  on public.request_teams for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

create policy "request_types_select_auth"
  on public.request_types for select
  using (auth.role() = 'authenticated');

create policy "request_types_admin_manage"
  on public.request_types for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

create policy "requests_select_allowed"
  on public.requests for select
  using (
    requester_id = auth.uid()
    or public.has_role('admin')
    or public.has_role('backoffice')
  );

create policy "requests_insert_requester_or_backoffice"
  on public.requests for insert
  with check (
    requester_id = auth.uid()
    or public.has_role('admin')
    or public.has_role('backoffice')
  );

create policy "requests_update_allowed"
  on public.requests for update
  using (
    requester_id = auth.uid()
    or public.has_role('admin')
    or public.has_role('backoffice')
  )
  with check (
    requester_id = auth.uid()
    or public.has_role('admin')
    or public.has_role('backoffice')
  );

create policy "requests_admin_delete"
  on public.requests for delete
  using (public.has_role('admin'));

create policy "request_comments_select_allowed"
  on public.request_comments for select
  using (
    exists (
      select 1 from public.requests r
      where r.id = request_comments.request_id
        and (
          r.requester_id = auth.uid()
          or public.has_role('admin')
          or public.has_role('backoffice')
        )
    )
  );

create policy "request_comments_insert_allowed"
  on public.request_comments for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.requests r
      where r.id = request_comments.request_id
        and (
          r.requester_id = auth.uid()
          or public.has_role('admin')
          or public.has_role('backoffice')
        )
    )
  );

insert into public.request_teams (key, name)
values
  ('hr', 'HR'),
  ('finance', 'Finance'),
  ('travel', 'Travel')
on conflict (key) do nothing;

insert into public.request_types (name, team_key, active)
values
  ('Absence Request', 'hr', true),
  ('Expense Reimbursement', 'finance', true),
  ('Travel Request', 'travel', true)
on conflict do nothing;
