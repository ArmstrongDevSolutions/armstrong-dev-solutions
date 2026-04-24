import ServiceCard from "@/components/ServiceCard";

const services = [
  {
    title: "Website Development",
    description:
      "Custom business websites built with performance, clarity, and mobile usability in mind.",
  },
  {
    title: "Custom Web Applications",
    description:
      "Business-specific apps and tools built to streamline operations and support growth.",
  },
  {
    title: "Workflow Automation Tools",
    description:
      "Automations that connect your tools and reduce manual work across recurring tasks.",
  },
  {
    title: "Maintenance & Support",
    description:
      "Ongoing updates, bug fixes, and improvements to keep your website and apps reliable.",
  },
];

export default function ServicesPage() {
  return (
    <section>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Services</h1>
        <p className="mt-4 text-slate-600">
          End-to-end web development services focused on practical outcomes and long-term
          maintainability.
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
