type ServiceCardProps = {
  title: string;
  description: string;
};

export default function ServiceCard({ title, description }: ServiceCardProps) {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-card)] p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-[var(--elephant-800)]">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--foreground-muted)]">{description}</p>
    </article>
  );
}
