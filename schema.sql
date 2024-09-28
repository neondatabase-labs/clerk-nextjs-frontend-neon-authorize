create table todos (
  id bigint generated by default as identity primary key,
  user_id text not null default (auth.user_id()),
  task text check (char_length(task) > 0),
  is_complete boolean default false,
  inserted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table todos enable row level security;

create policy "Individuals can create todos." on todos for
    insert with check (auth.user_id() = user_id);

create policy "Individuals can view their own todos. " on todos for
    select using (auth.user_id() = user_id);

create policy "Individuals can update their own todos." on todos for
    update using (auth.user_id() = user_id);

create policy "Individuals can delete their own todos." on todos for
    delete using (auth.user_id() = user_id);
