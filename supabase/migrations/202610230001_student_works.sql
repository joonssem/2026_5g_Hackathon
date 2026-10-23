-- Apply in Supabase SQL Editor as project owner. No admin key belongs in the browser.
begin;
create schema if not exists hackathon_private;
revoke all on schema hackathon_private from public, anon, authenticated;

create table if not exists hackathon_private.sessions (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  code_hash text not null unique,
  opens_at timestamptz not null default now(),
  closes_at timestamptz not null default (now() + interval '14 days'),
  max_works integer not null default 200 check (max_works between 1 and 500),
  enabled boolean not null default true
);
create table if not exists hackathon_private.works (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references hackathon_private.sessions(id),
  class_name text not null check (class_name in ('5학년 1반','5학년 2반','5학년 3반','5학년 4반')),
  team text not null check (length(team) between 1 and 100),
  title text not null check (length(title) between 1 and 80),
  html text not null check (octet_length(html) between 1 and 512000),
  edit_hash text not null,
  visible boolean not null default true,
  revisions integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, edit_hash)
);
alter table hackathon_private.sessions enable row level security;
alter table hackathon_private.works enable row level security;
revoke all on all tables in schema hackathon_private from public, anon, authenticated;

-- This narrow RPC is the only write entry point. Lock the session to serialize quota checks.
create or replace function public.publish_work(
  p_session_code text, p_class_name text, p_team text, p_title text,
  p_html text, p_edit_token text, p_id uuid default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  s hackathon_private.sessions%rowtype;
  w hackathon_private.works%rowtype;
  edit_digest text;
  work_count integer;
begin
  if p_session_code is null or length(p_session_code) not between 8 and 80 then
    raise exception '수업 참여 코드를 확인해 주세요.';
  end if;
  select * into s from hackathon_private.sessions
    where code_hash = pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(p_session_code, 'UTF8')), 'hex') for update;
  if not found then raise exception '수업 참여 코드를 확인해 주세요.'; end if;
  if not s.enabled or now() < s.opens_at or now() > s.closes_at then raise exception '수업 시간이 아니에요. 선생님께 게시를 열어 달라고 해요.'; end if;
  if p_class_name is null or p_class_name not in ('5학년 1반','5학년 2반','5학년 3반','5학년 4반') or p_team is null or length(trim(p_team)) not between 1 and 100 then raise exception '반과 팀 이름을 확인해 주세요.'; end if;
  if p_title is null or length(trim(p_title)) not between 1 and 80 then raise exception '작품 제목을 확인해 주세요.'; end if;
  if p_html is null or octet_length(p_html) not between 1 and 512000 then raise exception 'HTML 코드는 500KB까지 올릴 수 있어요.'; end if;
  if p_edit_token is null or p_edit_token !~ '^[0-9a-f]{64}$' then raise exception '수정 권한을 확인해 주세요.'; end if;
  edit_digest := pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(p_edit_token, 'UTF8')), 'hex');
  -- A retry after a lost response reuses the same row instead of making duplicate public links.
  select * into w from hackathon_private.works where session_id = s.id and edit_hash = edit_digest for update;
  if p_id is not null and (w.id is null or w.id <> p_id) then raise exception '수정 권한이 없어요. 이 작품을 올린 브라우저에서 수정해요.'; end if;
  if w.id is not null then
    if not w.visible then raise exception '수정 권한을 선생님께 확인해 주세요.'; end if;
    if w.updated_at > now() - interval '5 seconds' then raise exception '잠시 뒤 다시 게시해 주세요.'; end if;
    if w.revisions >= 100 then raise exception '게시 수를 초과했어요. 선생님께 알려 주세요.'; end if;
    update hackathon_private.works set class_name = p_class_name, team = trim(p_team), title = trim(p_title), html = p_html, revisions = revisions + 1, updated_at = now() where id = w.id;
  else
    select count(*) into work_count from hackathon_private.works where session_id = s.id;
    if work_count >= s.max_works then raise exception '수업의 게시 수를 초과했어요. 선생님께 알려 주세요.'; end if;
    insert into hackathon_private.works(session_id, class_name, team, title, html, edit_hash)
      values(s.id, p_class_name, trim(p_team), trim(p_title), p_html, edit_digest) returning * into w;
  end if;
  return jsonb_build_object('id', w.id);
end;
$$;

-- Unlisted works are readable by their random UUID; there is intentionally no public list API.
create or replace function public.get_work(p_id uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('id', id, 'class_name', class_name, 'team', team, 'title', title, 'html', html, 'updated_at', updated_at)
  from hackathon_private.works where id = p_id and visible = true;
$$;
revoke all on function public.publish_work(text,text,text,text,text,text,uuid) from public, anon, authenticated;
revoke all on function public.get_work(uuid) from public, anon, authenticated;
grant execute on function public.publish_work(text,text,text,text,text,text,uuid) to anon;
grant execute on function public.get_work(uuid) to anon;
notify pgrst, 'reload schema';
commit;
