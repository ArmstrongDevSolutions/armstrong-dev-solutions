export default function ContactPage() {
  return (
    <section className="mt-8 grid gap-10 sm:mt-10 lg:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Contact</h1>
        <p className="mt-4 text-[var(--foreground-muted)]">
          This page is here if you want to connect, but for now the main goal of this site is
          showcasing what I am building.
        </p>

        <div className="mt-8 space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--foreground-muted)] shadow-sm">
          <p className="font-semibold text-[var(--foreground)]">Contact Info</p>
          <p>Mike Armstrong</p>
          <p>mike@armstrongdevsolutions.com</p>
        </div>

        <p className="mt-4 text-sm text-[var(--foreground-subtle)]">
          Note: This form is currently a design preview and does not send messages yet.
        </p>
      </div>

      <form className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
        <div className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-[var(--foreground)]">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-[var(--foreground)]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-[var(--foreground)]">
              Phone (optional)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label htmlFor="message" className="mb-2 block text-sm font-medium text-[var(--foreground)]">
              What is on your mind?
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              placeholder="Tell me what you are building, what is blocking you, or what you want to improve."
            />
          </div>

          <button
            type="submit"
            className="rounded-md border border-transparent bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
          >
            Start The Conversation
          </button>
        </div>
      </form>
    </section>
  );
}
