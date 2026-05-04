import ProjectCard from "@/components/ProjectCard";

const projects = [
  {
    title: "Random Doubles League Manager",
    description:
      "A web app for managing disc golf leagues, checking in players, ranking them, and generating balanced teams for weekly doubles events.",
    status: "In Development",
  },
  {
    title: "Golf League Tool (Placeholder)",
    description:
      "A planned league platform where golfers can log in, see tee times and matchups, enter scores live, and follow real-time leaderboards with support for formats like match play and stableford.",
    status: "Planned",
  },
];

export default function ProjectsPage() {
  return (
    <section className="mt-8 sm:mt-10">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Projects</h1>
        <p className="mt-4 text-[var(--foreground-muted)]">
          Project concepts focused on making leagues, organizations, and communities easier to
          run with practical software.
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.title} {...project} />
        ))}
      </div>
    </section>
  );
}
