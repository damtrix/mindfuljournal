import { createClient } from '@supabase/supabase-js';

// Read Supabase config from environment. For client-side usage with Next.js,
// prefer `NEXT_PUBLIC_*` prefixed variables so they are embedded in the client bundle.
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL) as string | undefined;
const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY) as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase environment variables. Define `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your .env (or export them in your environment).'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
