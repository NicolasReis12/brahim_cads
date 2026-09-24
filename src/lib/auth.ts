import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured, serviceClient, sessionClient } from "./supabase/clients";

/**
 * Autenticação do painel.
 * - Com Supabase: login por e-mail/senha (Supabase Auth) + o usuário precisa estar na tabela `admins`.
 * - Modo local (sem Supabase): senha única em ADMIN_DEMO_PASSWORD, só para desenvolvimento.
 */

export type Admin = { email: string };

const LOCAL_COOKIE = "bc_admin";

function localSecret() {
  const pw = process.env.ADMIN_DEMO_PASSWORD;
  if (!pw) return null;
  return pw;
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export async function getAdmin(): Promise<Admin | null> {
  if (isSupabaseConfigured) {
    const supabase = await sessionClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    const { data: row } = await serviceClient().from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
    return row ? { email: data.user.email ?? "" } : null;
  }

  const secret = localSecret();
  if (!secret) return null;
  const raw = (await cookies()).get(LOCAL_COOKIE)?.value;
  if (!raw) return null;
  const [email, sig] = raw.split("|");
  const expected = sign(email, secret);
  if (!sig || sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return { email };
}

export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function signIn(email: string, password: string): Promise<string | null> {
  if (isSupabaseConfigured) {
    const supabase = await sessionClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return "E-mail ou senha incorretos.";
    if (!(await getAdmin())) {
      await supabase.auth.signOut();
      return "Esse usuário não tem acesso ao painel.";
    }
    return null;
  }

  const secret = localSecret();
  if (!secret) return "Modo local: defina ADMIN_DEMO_PASSWORD no .env.local para entrar.";
  const a = Buffer.from(password);
  const b = Buffer.from(secret);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return "Senha incorreta.";
  const id = email.trim() || "admin";
  (await cookies()).set(LOCAL_COOKIE, `${id}|${sign(id, secret)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return null;
}

export async function signOut() {
  if (isSupabaseConfigured) {
    await (await sessionClient()).auth.signOut();
  } else {
    (await cookies()).delete(LOCAL_COOKIE);
  }
}

export const authMode = isSupabaseConfigured ? "supabase" : "local";
