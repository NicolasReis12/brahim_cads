import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(url && publishableKey && secretKey);

/** Cliente com a secret key: ignora RLS. Só usar no servidor, depois de checar permissão. */
export function serviceClient(): SupabaseClient {
  return createClient(url!, secretKey!, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Cliente anônimo sem cookies — leitura pública cacheável. */
export function publicClient(): SupabaseClient {
  return createClient(url!, publishableKey!, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Cliente com a sessão do usuário (login do painel). */
export async function sessionClient(): Promise<SupabaseClient> {
  const store = await cookies();
  return createServerClient(url!, publishableKey!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // chamado de Server Component: o proxy renova a sessão
        }
      },
    },
  });
}
