import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-page flex min-h-[70dvh] flex-col items-start justify-center gap-4 py-20">
      <p className="meta">Erro 404</p>
      <h1 className="display text-4xl sm:text-6xl">Página não encontrada</h1>
      <p className="max-w-md text-ink-muted">O link pode ter mudado. Volta pra loja e procura por lá.</p>
      <Link href="/loja" className="inline-flex h-10 items-center rounded-sm bg-gold px-4 text-sm font-medium text-on-gold hover:bg-gold-hover">
        Ir pra loja
      </Link>
    </main>
  );
}
