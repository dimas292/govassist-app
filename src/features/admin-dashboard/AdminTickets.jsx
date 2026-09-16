import { useEffect, useMemo, useState } from "react";
import {
  ApiRequestError,
  listAdminTickets,
  updateAdminTicketStatus,
} from "../../services/api";

const statusLabel = {
  RECEIVED: "Diterima",
  VERIFIED: "Terverifikasi",
  IN_PROGRESS: "Diproses",
  COMPLETED: "Selesai",
};

const statusTone = {
  RECEIVED: "warning",
  VERIFIED: "primary",
  IN_PROGRESS: "info",
  COMPLETED: "success",
};

const nextStatuses = {
  RECEIVED: ["VERIFIED", "IN_PROGRESS"],
  VERIFIED: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
};

const formatDate = (value) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));

export default function AdminTickets({ staff, onChanged, onAuthExpired }) {
  const [tickets, setTickets] = useState([]);
  const [query, setQuery] = useState("");
  const [draftStatus, setDraftStatus] = useState({});
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState(null);

  const loadTickets = async () => {
    const response = await listAdminTickets(query);
    setTickets(response.data);
    setDraftStatus(Object.fromEntries(response.data.map((ticket) => [ticket.id, ticket.status])));
  };

  useEffect(() => {
    let active = true;
    listAdminTickets()
      .then((response) => {
        if (!active) return;
        setTickets(response.data);
        setDraftStatus(Object.fromEntries(response.data.map((ticket) => [ticket.id, ticket.status])));
      })
      .catch((error) => { if (active) setMessage({ tone: "danger", text: error.message || "Gagal memuat ticket." }); });
    return () => { active = false; };
  }, []);

  const filteredTickets = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return tickets;
    return tickets.filter((ticket) =>
      [ticket.id, ticket.title, ticket.description, statusLabel[ticket.status]].some((value) =>
        value.toLowerCase().includes(keyword),
      ),
    );
  }, [query, tickets]);

  const handleUpdate = async (ticket) => {
    const status = draftStatus[ticket.id];
    if (!status || status === ticket.status) return;
    setSavingId(ticket.id);
    setMessage(null);
    try {
      await updateAdminTicketStatus(ticket.id, status);
      await loadTickets();
      await onChanged?.();
      setMessage({ tone: "success", text: `Status #${ticket.id} berhasil diubah menjadi ${statusLabel[status]}.` });
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) onAuthExpired?.();
      setMessage({ tone: "danger", text: error.message || "Status ticket gagal diperbarui." });
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="page content">
      <div className="content__container">
        <header className="page__header">
          <div className="page__headline">
            <h1 className="page__title">Ticket/Laporan</h1>
            <p className="page__description">Kelola dan perbarui status laporan masyarakat.</p>
          </div>
        </header>

        {message && <div className={`alert alert--${message.tone}`} role="status"><span>{message.text}</span></div>}

        <article className="card">
            <header className="card__header flex-wrap">
              <div>
                <span className="card__title">Semua Ticket</span>
                <p className="text-sm text-muted-foreground">Login sebagai {staff.name}</p>
              </div>
              <form className="input-group ms-auto w-full md:w-60" role="search" onSubmit={(event) => event.preventDefault()}>
                <span className="input-group__text">Cari</span>
                <input className="input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ID atau ringkasan..." aria-label="Cari ticket" />
              </form>
            </header>
            <div className="table-responsive">
              <table className="table table--hover table--align-middle">
                <thead className="table__head--alt"><tr><th>ID Ticket</th><th>Ringkasan</th><th>Status Saat Ini</th><th>Status Baru</th><th>Tanggal</th><th className="text-end">Aksi</th></tr></thead>
                <tbody>
                  {filteredTickets.map((ticket) => {
                    const allowed = nextStatuses[ticket.status];
                    return (
                      <tr key={ticket.id}>
                        <th scope="row"><a href={`/tracking/${ticket.id}`} className="link"><code>#{ticket.id}</code></a></th>
                        <td>{ticket.title}</td>
                        <td><span className={`badge badge--soft badge--${statusTone[ticket.status]}`}>{statusLabel[ticket.status]}</span></td>
                        <td>
                          {allowed.length ? (
                            <select className="select" value={draftStatus[ticket.id] || ticket.status} onChange={(event) => setDraftStatus((current) => ({ ...current, [ticket.id]: event.target.value }))} aria-label={`Status baru ${ticket.id}`}>
                              <option value={ticket.status}>{statusLabel[ticket.status]}</option>
                              {allowed.map((status) => <option value={status} key={status}>{statusLabel[status]}</option>)}
                            </select>
                          ) : <span className="text-sm text-muted-foreground">Status akhir</span>}
                        </td>
                        <td>{formatDate(ticket.createdAt)}</td>
                        <td className="text-end">
                          <button type="button" className="button button--sm button--primary" disabled={!allowed.length || draftStatus[ticket.id] === ticket.status || savingId === ticket.id} onClick={() => handleUpdate(ticket)}>
                            {savingId === ticket.id ? "Menyimpan..." : "Simpan"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
        </article>
      </div>
    </div>
  );
}
