import { useMemo, useState } from "react";

function badgeTone(value) {
  if (value === "Baru") return "warning";
  if (value === "Diproses") return "info";
  if (value === "Selesai") return "success";
  if (value === "MBG") return "primary";
  if (value === "Infrastruktur") return "info";
  return "neutral";
}

export default function TicketTable({ tickets }) {
  const [query, setQuery] = useState("");
  const filteredTickets = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return tickets;
    return tickets.filter((ticket) =>
      [ticket.id, ticket.summary, ticket.category, ticket.status].some((value) => value.toLowerCase().includes(keyword)),
    );
  }, [query, tickets]);

  return (
    <article className="card">
      <header className="card__header flex-wrap">
        <span className="card__title">Ticket/Laporan Terbaru</span>
        <form className="input-group ms-auto w-full md:w-60" role="search" onSubmit={(event) => event.preventDefault()}>
          <span className="input-group__text">Cari</span>
          <input className="input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ID, ringkasan, kategori..." aria-label="Cari ticket" />
        </form>
      </header>

      <div className="table-responsive">
        <table className="table table--hover table--align-middle">
          <thead className="table__head--alt">
            <tr>
              <th scope="col">ID Ticket</th>
              <th scope="col">Ringkasan</th>
              <th scope="col">Kategori</th>
              <th scope="col">Status</th>
              <th scope="col">Tanggal</th>
              <th scope="col" className="text-end">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id}>
                <th scope="row"><a href={`/tracking/${ticket.id}`} className="link"><code>#{ticket.id}</code></a></th>
                <td>{ticket.summary}</td>
                <td><span className={`badge badge--soft badge--${badgeTone(ticket.category)}`}>{ticket.category}</span></td>
                <td><span className={`badge badge--soft badge--${badgeTone(ticket.status)}`}>{ticket.status}</span></td>
                <td>{ticket.date}</td>
                <td className="text-end"><a className="button button--sm button--neutral" href={`/tracking/${ticket.id}`}>Detail</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
