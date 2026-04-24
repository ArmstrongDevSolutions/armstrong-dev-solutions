type ProjectCardProps = {
  title: string;
  description: string;
  status?: string;
};

export default function ProjectCard({
  title,
  description,
  status,
}: ProjectCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {status ? (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            {status}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>
    </article>
  );
}
