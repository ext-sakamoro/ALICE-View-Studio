-- View Studio domain tables
create table if not exists public.scenes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    project_id uuid references public.projects(id) on delete cascade,
    name text not null,
    scene_type text default 'viewport',
    resolution_width integer default 1920,
    resolution_height integer default 1080,
    camera_position jsonb,
    lighting_config jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
create table if not exists public.render_jobs (
    id uuid primary key default gen_random_uuid(),
    scene_id uuid references public.scenes(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    render_mode text not null default 'preview' check (render_mode in ('preview', 'production', 'wireframe')),
    status text default 'pending',
    output_format text default 'png',
    elapsed_ms bigint,
    output_url text,
    created_at timestamptz default now()
);
create index idx_scenes_user on public.scenes(user_id);
create index idx_render_jobs_scene on public.render_jobs(scene_id);
