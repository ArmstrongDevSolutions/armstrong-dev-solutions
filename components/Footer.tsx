export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface-header)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-[var(--foreground-muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Armstrong Dev Solutions</p>
        <p className="text-[var(--foreground)]">Built by Mike Armstrong 🤘</p>
      </div>
    </footer>
  );
}
