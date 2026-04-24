export default function ContactPage() {
  return (
    <section className="grid gap-10 lg:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Contact</h1>
        <p className="mt-4 text-slate-600">
          Tell me about your project and I will follow up with next steps.
        </p>

        <div className="mt-8 space-y-2 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
          <p className="font-semibold text-slate-900">Contact Info</p>
          <p>Mike Armstrong</p>
          <p>mike@armstrongdevsolutions.com</p>
          <p>armstrongdevsolutions.com</p>
        </div>
      </div>

      <form className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none ring-blue-300 transition focus:ring"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none ring-blue-300 transition focus:ring"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="message" className="mb-2 block text-sm font-medium text-slate-700">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none ring-blue-300 transition focus:ring"
              placeholder="What are you looking to build?"
            />
          </div>

          <button
            type="submit"
            className="rounded-md bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Send Message
          </button>
        </div>
      </form>
    </section>
  );
}
