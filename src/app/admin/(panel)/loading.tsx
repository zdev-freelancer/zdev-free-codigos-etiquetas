/**
 * Instant feedback while a section's server component streams in. Because the
 * shell is a persistent layout, only the content area shows this skeleton.
 */
export default function PanelLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-48 rounded-lg bg-border" />
      <div className="mt-2 h-4 w-72 rounded bg-border/70" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl border border-border bg-background" />
        ))}
      </div>
      <div className="mt-5 h-64 rounded-2xl border border-border bg-background" />
    </div>
  );
}
