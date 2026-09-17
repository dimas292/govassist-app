const blockStyle = { background: "var(--color-surface-3, #e9edf3)" };

export function AdminSkeletonBlock({ className = "", style }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg ${className}`} style={{ ...blockStyle, ...style }} />;
}

export function AdminSessionSkeleton() {
  return (
    <div className="app-shell" aria-label="Memeriksa sesi admin" aria-busy="true">
      <aside className="sidebar"><div className="p-5"><AdminSkeletonBlock className="h-9 w-36" /><AdminSkeletonBlock className="mt-10 h-10 w-full" /><AdminSkeletonBlock className="mt-3 h-10 w-full" /></div></aside>
      <main className="app-shell__main">
        <div className="topbar"><AdminSkeletonBlock className="h-9 w-9" /><AdminSkeletonBlock className="ms-auto h-10 w-44" /></div>
        <DashboardSkeleton />
      </main>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="page content" aria-label="Memuat dashboard admin" aria-busy="true">
      <div className="content__container">
        <header className="page__header"><div className="page__headline"><AdminSkeletonBlock className="h-8 w-72" /><AdminSkeletonBlock className="mt-3 h-4 w-96 max-w-full" /></div><AdminSkeletonBlock className="h-10 w-40" /></header>
        <div className="page__body">
          <section className="page__section"><div className="grid grid-cols-12 gap-4">{Array.from({ length: 4 }, (_, index) => <div className="col-span-6 lg:col-span-3" key={index}><div className="card"><div className="card__body"><AdminSkeletonBlock className="h-4 w-24" /><AdminSkeletonBlock className="mt-4 h-9 w-16" /><AdminSkeletonBlock className="mt-3 h-3 w-28" /></div></div></div>)}</div></section>
          <section className="page__section"><div className="grid grid-cols-12 gap-4"><div className="col-span-12 xl:col-span-8"><div className="card"><div className="card__body"><AdminSkeletonBlock className="h-5 w-40" /><AdminSkeletonBlock className="mt-6 h-64 w-full" /></div></div></div><div className="col-span-12 xl:col-span-4"><div className="card"><div className="card__body"><AdminSkeletonBlock className="h-5 w-40" /><AdminSkeletonBlock className="mx-auto mt-6 size-56 rounded-full" /></div></div></div></div></section>
        </div>
      </div>
    </div>
  );
}

export function AdminTicketRowsSkeleton() {
  return Array.from({ length: 5 }, (_, row) => (
    <tr key={row}>
      {Array.from({ length: 6 }, (_, cell) => <td key={cell}><AdminSkeletonBlock className={`h-5 ${cell === 1 ? "w-48" : "w-24"}`} /></td>)}
    </tr>
  ));
}
