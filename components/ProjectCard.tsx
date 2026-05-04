type ProjectCardProps = {
  title: string;
  description: string;
  status?: string;
  /** Dark theme only: featured panels — solid fills, large radius (UI Colors–style). */
  darkPanel?: "900" | "700";
};

export default function ProjectCard({
  title,
  description,
  status,
  darkPanel,
}: ProjectCardProps) {
  const featured = Boolean(darkPanel);

  const darkFeaturedClass =
    darkPanel === "900"
      ? "dark:border dark:border-[var(--elephant-950)]/40 dark:bg-[var(--elephant-900)] dark:shadow-none"
      : darkPanel === "700"
        ? "dark:border dark:border-[var(--elephant-900)]/45 dark:bg-[var(--elephant-700)] dark:shadow-none"
        : "";

  return (
    <article
      className={`border border-[var(--border)] bg-[var(--surface-card)] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${featured ? "rounded-3xl p-8" : "rounded-xl p-6"} ${darkFeaturedClass}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
        {status ? (
          <span className="rounded-full bg-[var(--elephant-100)] px-3 py-1 text-xs font-medium text-[var(--elephant-900)] dark:bg-black/25 dark:text-[var(--foreground-muted)]">
            {status}
          </span>
        ) : null}
      </div>
      <p
        className={`mt-4 text-sm leading-7 text-[var(--foreground-muted)]${featured ? " dark:text-[var(--foreground)]" : ""}`}
      >
        {description}
      </p>
    </article>
  );
}
