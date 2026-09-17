export default function StatCard({ label, value, detail, tone }) {
  return (
    <article className="card h-full">
      <div className="card__body">
        <div className="w-full flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">{label}</span>
          <div className="text-2xl font-bold">{value}</div>
          <span className={`badge badge--soft badge--${tone}`}>{detail}</span>
        </div>
      </div>
    </article>
  );
}

