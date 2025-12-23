# RSquare Smart Processes

A request management solution for business processes (HR, Finance, Travel) with role-based routing and backoffice handling.

## Stack
- Vite + React + TypeScript
- Tailwind + shadcn/ui
- Supabase Auth + Postgres

## Setup
1. Create a new Supabase project.
2. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Run the SQL in `supabase/migrations` against your Supabase project.
4. Install deps and run:
   - `npm install`
   - `npm run dev`

## Roles
- `requester`: create and track own requests
- `backoffice`: manage requests across teams
- `admin`: manage request types and user roles
