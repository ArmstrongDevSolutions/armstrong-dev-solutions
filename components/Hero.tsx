import Link from "next/link";

type HeroProps = {
  title: string;
  tagline: string;
  subtitle: string;
};

export default function Hero({ title, tagline, subtitle }: HeroProps) {
  return (
    <section className="rounded-2xl bg-[var(--elephant-950)] px-8 py-20 shadow-none dark:rounded-none">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{title}</h1>
        <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-[var(--elephant-400)]">
          {tagline}
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#d4d4d8]">{subtitle}</p>
        <div className="mt-10 flex w-full justify-center">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-[var(--accent)] px-6 py-3 text-center text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
            >
              View Projects
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-md border border-[var(--elephant-400)] bg-transparent px-6 py-3 text-center text-sm font-semibold text-[#d4d4d8] transition hover:bg-[var(--elephant-900)]/50"
            >
              About Mike
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
