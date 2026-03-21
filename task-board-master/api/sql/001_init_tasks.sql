create extension if not exists "pgcrypto";

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  status text not null default 'todo' check (status in ('todo', 'inprogress', 'inreview', 'done')),
  description text,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  due_date date,
  tag text not null default 'normal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks
add column if not exists priority text not null default 'normal';

alter table public.tasks
add column if not exists due_date date;

alter table public.tasks
add column if not exists tag text not null default 'normal';

alter table public.tasks
alter column description drop not null;

alter table public.tasks
alter column status type text;

alter table public.tasks
alter column status set default 'todo';

alter table public.tasks
drop constraint if exists tasks_status_check;

alter table public.tasks
add constraint tasks_status_check check (status in ('todo', 'inprogress', 'inreview', 'done'));

alter table public.tasks
drop constraint if exists tasks_priority_check;

alter table public.tasks
add constraint tasks_priority_check check (priority in ('low', 'normal', 'high'));

alter table public.tasks enable row level security;

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own" on public.tasks
for select using (auth.uid() = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own" on public.tasks
for insert with check (auth.uid() = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own" on public.tasks
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own" on public.tasks
for delete using (auth.uid() = user_id);

create or replace function public.set_tasks_user_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'user_id 需要绑定已建立的会话用户';
  end if;
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  if new.user_id <> auth.uid() then
    raise exception 'user_id 必须与当前会话用户一致';
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_set_user_id on public.tasks;
create trigger tasks_set_user_id
before insert on public.tasks
for each row
execute function public.set_tasks_user_id();

create or replace function public.set_tasks_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row
execute function public.set_tasks_updated_at();
