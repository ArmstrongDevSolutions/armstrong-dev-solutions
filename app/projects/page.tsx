import ProjectCard from "@/components/ProjectCard";

const projects = [
  {
    title: "Random Doubles League Manager",
    description:
      "A web app for managing disc golf leagues, checking in players, ranking them, splitting A/B pools, and generating balanced teams.",
    status: "Planned Build",
  },
];

export default function ProjectsPage() {
  return (
    <section>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Projects</h1>
        <p className="mt-4 text-slate-600">
          Portfolio projects that highlight practical software design and workflow-focused
          development.
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
