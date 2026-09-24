import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { authMode, getAdmin } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar no painel", robots: { index: false } };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-3">
          <Image src="/brand/logo-256.png" alt="" width={44} height={44} />
          <div>
            <p className="display text-lg leading-none">
              Brahim<span className="text-gold"> Cards</span>
            </p>
            <p className="meta mt-1">Painel da loja</p>
          </div>
        </div>
        <LoginForm local={authMode === "local"} />
      </div>
    </main>
  );
}
