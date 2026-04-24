import Hero from "@/components/Hero";
import ProjectCard from "@/components/ProjectCard";
import ServiceCard from "@/components/ServiceCard";

export default function Home() {
  const services = [
    {
      title: "Website Development",
      description:
        "Responsive, professional websites designed to help small businesses establish trust and attract customers.",
    },
    {
      title: "Custom Web Applications",
      description:
        "Purpose-built tools for organizations that need more than a template site, with workflows tailored to real operations.",
    },
    {
      title: "Workflow Automation Tools",
      description:
        "Internal tools and automations that reduce repetitive manual tasks and improve day-to-day efficiency.",
    },
  ];

  return (
    <div className="space-y-16">
      <Hero
        title="Armstrong Dev Solutions"
        subtitle="I build modern websites and custom web apps for small businesses and organizations."
      />

      <section>
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Services At A Glance
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Practical, clean, and maintainable solutions that help teams move faster.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Featured Project
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            A preview of the custom tooling foundation being built for disc golf league
            operations.
          </p>
        </div>
        <ProjectCard
          title="Random Doubles League Manager"
          status="In Development"
          description="A web app for managing disc golf leagues, checking in players, ranking them, splitting A/B pools, and generating balanced teams."
        />
      </section>
    </div>
  );
}
