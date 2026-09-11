import { Link } from "wouter";

export default function NotFound() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ background: "var(--home-bg)", color: "var(--home-text)" }}
    >
      <span className="font-display text-sm tracking-[0.3em]" style={{ color: "var(--accent-ink)" }}>
        404
      </span>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Cette page n'existe pas (encore).</h1>
      <p className="max-w-md" style={{ color: "var(--home-text-muted)" }}>
        Le lien est peut-être cassé, ou la page a été déplacée. Revenez à l'accueil pour repartir sur de bonnes bases.
      </p>
      <Link href="/" className="btn-accent rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:scale-[1.03]">
        Retour à l'accueil
      </Link>
    </main>
  );
}
