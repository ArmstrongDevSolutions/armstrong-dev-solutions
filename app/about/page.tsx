export default function AboutPage() {
  return (
    <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm sm:mt-10 sm:p-10">
      <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">About</h1>
      <div className="mt-6 space-y-4 text-[var(--foreground-muted)]">
        <p>
          Hi, I am Mike Armstrong. I build practical web solutions for small businesses,
          local organizations, and recreational leagues.
        </p>
        <p>
          Armstrong Dev Solutions is my side business, and I take on projects that I truly
          care about. I enjoy creating software that helps real people do meaningful work.
        </p>
        <p>
          I love sports, music, and building useful tools with a fun, approachable style. My
          goal is to leave a positive impact through software that is simple to use, easy to
          maintain, and designed around real day-to-day workflows. Rock on 🤘
        </p>
      </div>
    </section>
  );
}
