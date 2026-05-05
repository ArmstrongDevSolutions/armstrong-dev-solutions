import Hero from "@/components/Hero";
import ProjectCard from "@/components/ProjectCard";
import ServiceCard from "@/components/ServiceCard";

export default function Home() {
  const services = [
    {
      title: "Website Development",
      description:
        "Clean, mobile-friendly websites that help local businesses build trust and turn visitors into customers.",
    },
    {
      title: "Custom Web Applications",
      description:
        "Purpose-built applications for organizations and leagues that need practical tools, not bloated software.",
    },
    {
      title: "Workflow Automation Tools",
      description:
        "Simple automations that save time, reduce repetitive work, and keep teams focused on what matters most.",
    },
  ];

  return (
    <div className="space-y-16">
      <div className="hero-bleed-wrapper">
        <Hero
          title="Armstrong Dev Solutions"
          tagline="Website and apps that solve real problems"
          subtitle="I build modern websites and custom web apps for small businesses, local organizations, and recreational leagues."
        />
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-sm dark:border-[var(--elephant-800)] dark:bg-[var(--surface-card)]">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Fun, Approachable, And Built To Help People
        </h2>
        <p className="mx-auto mt-4 max-w-3xl leading-7 text-[var(--foreground-muted)]">
          Armstrong Dev Solutions is a side business built around projects I care about. I
          love sports, music, and practical software that makes life easier. If your mission
          helps your community, your members, or a cause you believe in, I would love to help
          you build it. <span className="font-semibold text-[var(--foreground)]">Rock on 🤘</span>
        </p>
      </section>

      <section>
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Featured Projects</h2>
          <p className="mx-auto mt-3 max-w-2xl text-[var(--foreground-muted)] dark:mx-auto">
            This site is where I share what I am building, learning, and shipping.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <ProjectCard
            darkPanel="900"
            title="Random Doubles League Manager"
            status="In Development"
            href="/doubles"
            description="A web app for managing disc golf leagues, checking in players, ranking them, and generating balanced teams so weekly operations are faster and easier."
          />
          <ProjectCard
            darkPanel="700"
            title="Golf League Tool (Placeholder)"
            status="Planned"
            description="A future platform where golfers can log in, view tee times, track live scores, and run league formats like match play and stableford."
          />
        </div>
      </section>

      <section>
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Services At A Glance</h2>
          <p className="mt-3 max-w-2xl text-[var(--foreground-muted)]">
            Practical, clean, and maintainable solutions that help teams move faster.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </section>
    </div>
  );
}
