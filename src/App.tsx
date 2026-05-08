import { useMemo, useState } from 'react';

declare const __APP_VERSION__: string;
declare const __COMMIT_SHA__: string;
declare const __REPOSITORY_URL__: string;
declare const __PAYPAL_URL__: string;

export default function App() {
  const [ready] = useState(true);
  const versionLine = useMemo(() => `v${__APP_VERSION__} • ${__COMMIT_SHA__}`, []);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Reference Photo Organizer</p>
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Artist reference board</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <a className="rounded border border-ink/15 px-3 py-2 hover:bg-shell" href={__REPOSITORY_URL__}>
              GitHub
            </a>
            <a className="rounded border border-ink/15 px-3 py-2 hover:bg-shell" href={__PAYPAL_URL__}>
              PayPal
            </a>
            <span className="rounded bg-ink px-3 py-2 text-paper">{versionLine}</span>
          </nav>
        </header>
        <section className="grid flex-1 place-items-center py-16">
          <div className="max-w-2xl text-center">
            <p className="text-lg text-graphite">
              {ready
                ? 'Static scaffold is ready. The organizer workspace is being implemented next.'
                : 'Loading'}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
