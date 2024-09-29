# Neon Authorize + Clerk RLS Example (SQL from the Frontend)

This repository is a guided getting started example for Neon Authorize + Clerk RLS.

1. Create a Neon project
2. Create a Clerk Application
3. Head to the Clerk dashboard, and find "JWT Templates"
4. Create a JWT Template ("Blank") and give it any name (e.g., "my-jwt-template")
5. Copy the "JWKS Endpoint" URL and save it for later
6. Head to the Neon Console, and find "Authorize"
7. Inside Authorize, click "Add Authentication Provider", and paste in the JWKS Endpoint URL you copied earlier
8. Connect to your Neon project and load a sample todos list schema (`./schema.sql`):

```sql
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
```

9. Clone this repository and run `npm install`
10. Create a `.env` file in the root of this project and add the following:

```
# Grab from Clerk's dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Grab from Neon's dashboard (the "authenticated" role)
NEXT_PUBLIC_DATABASE_AUTHENTICATED_URL=

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

11. Run `npm run dev` or `bun run dev`
12. Open your browser and go to `http://localhost:3000`
13. Login and play around!
