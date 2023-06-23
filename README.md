database: https://gist.github.com/sonipranjal/8015583e89ecb75ef7361605991d7b6d

authentication setup: https://supabase.com/docs/guides/auth/auth-helpers/nextjs-server-components

before authentication, generate the types for your tables

- npx supabase login
- npx supabase gen types typescript --project-id <project-id> --schema public > types/supabase.ts
