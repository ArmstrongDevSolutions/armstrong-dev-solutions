import ServiceCard from "@/components/ServiceCard";

const services = [
  {
    title: "Website Development",
    description:
      "Modern, mobile-friendly websites for small businesses and local organizations that want a polished online presence.",
  },
  {
    title: "Custom Web Applications",
    description:
      "Custom apps built around your real process, whether you run a team, nonprofit, or recreational league.",
  },
  {
    title: "Workflow Automation Tools",
    description:
      "Practical automations that reduce repetitive tasks and help you spend more time on high-value work.",
  },
  {
    title: "Maintenance & Support",
    description:
      "Reliable ongoing support, enhancements, and fixes to keep your site and apps running smoothly.",
  },
];

export default function ServicesPage() {
  return (
    <section className="mt-8 sm:mt-10">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Services</h1>
        <p className="mt-4 text-[var(--foreground-muted)]">
          Practical, approachable development services focused on results, clear communication,
          and tools that actually help people.
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {services.map((service) => (
          <ServiceCard key={service.title} {...service} />
        ))}
      </div>
    </section>
  );
}
