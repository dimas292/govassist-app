import { useEffect, useMemo, useState } from "react";
import {
  ApiRequestError,
  createAdminTicketReply,
  listAdminTickets,
  updateAdminTicketStatus,
} from "../../services/api";
import { AdminTicketRowsSkeleton } from "./AdminSkeletons.jsx";
import "./magic-status.css";

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

const ticketCacheTtlMs = 60000;
let ticketCache = null;
let ticketCacheTime = 0;

const cacheTickets = (tickets) => {
  ticketCache = tickets;
  ticketCacheTime = Date.now();
};

export default function AdminTickets({ staff, onChanged, onAuthExpired }) {
  const [tickets, setTickets] = useState([]);
  const [query, setQuery] = useState("");
  const [draftStatus, setDraftStatus] = useState({});
  const [savingId, setSavingId] = useState("");
  const [replyTicketId, setReplyTicketId] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingId, setReplyingId] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiStatusChange, setAiStatusChange] = useState(null);

  const loadTickets = async () => {
    const response = await listAdminTickets();
    cacheTickets(response.data);
    setTickets(response.data);
    setDraftStatus(Object.fromEntries(response.data.map((ticket) => [ticket.id, ticket.status])));
  };

  useEffect(() => {
    if (ticketCache && Date.now() - ticketCacheTime < ticketCacheTtlMs) {
      setTickets(ticketCache);
      setDraftStatus(Object.fromEntries(ticketCache.map((ticket) => [ticket.id, ticket.status])));
      setLoading(false);
      return undefined;
    }

    let active = true;
    listAdminTickets()
      .then((response) => {
        if (!active) return;
        cacheTickets(response.data);
        setTickets(response.data);
        setDraftStatus(Object.fromEntries(response.data.map((ticket) => [ticket.id, ticket.status])));
      })
      .catch((error) => { if (active) setMessage({ tone: "danger", text: error.message || "Gagal memuat ticket." }); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!replyTicketId) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !replyingId) {
        setReplyTicketId("");
        setReplyText("");
      }
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [replyTicketId, replyingId]);

  useEffect(() => {
    if (!aiStatusChange) return undefined;
    const timer = window.setTimeout(() => setAiStatusChange(null), 6000);
    return () => window.clearTimeout(timer);
  }, [aiStatusChange]);

  const filteredTickets = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return tickets;
    return tickets.filter((ticket) =>
      [ticket.id, ticket.title, ticket.description, statusLabel[ticket.status]].some((value) =>
        value.toLowerCase().includes(keyword),
      ),
    );
  }, [query, tickets]);

  const replyTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === replyTicketId) || null,
    [replyTicketId, tickets],
  );

  const closeReplyModal = () => {
    if (replyingId) return;
    setReplyTicketId("");
    setReplyText("");
  };

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

  const handleReply = async (ticket) => {
    const cleanReply = replyText.trim();
    if (!cleanReply) return;
    setReplyingId(ticket.id);
    setMessage(null);
    setAiStatusChange(null);
    try {
      const result = await createAdminTicketReply(ticket.id, cleanReply);
      await loadTickets();
      if (result.statusChange) {
        setAiStatusChange(result.statusChange);
        await onChanged?.();
      }
      setReplyText("");
      setMessage({
        tone: "success",
        text: result.statusChange
          ? `Balasan dikirim. AI mengubah status menjadi ${statusLabel[result.statusChange.to]}.`
          : `Balasan untuk #${ticket.id} berhasil dikirim.`,
      });
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) onAuthExpired?.();
      setMessage({ tone: "danger", text: error.message || "Balasan ticket gagal dikirim." });
    } finally {
      setReplyingId("");
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
              </div>
              <form className="input-group ms-auto w-full md:w-60" role="search" onSubmit={(event) => event.preventDefault()}>
                <span className="input-group__text">Cari</span>
                <input className="input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ID atau ringkasan..." aria-label="Cari ticket" />
              </form>
            </header>
            <div className="table-responsive">
              <table className="table table--hover table--align-middle" aria-busy={loading}>
                <thead className="table__head--alt"><tr><th>ID Ticket</th><th>Ringkasan</th><th>Status Saat Ini</th><th>Status Baru</th><th>Tanggal</th><th className="text-end">Aksi</th></tr></thead>
                <tbody>
                  {loading ? <AdminTicketRowsSkeleton /> : filteredTickets.map((ticket) => {
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
                          <div className="flex justify-end gap-2">
                            <button type="button" className="button button--sm button--neutral" onClick={() => { setReplyTicketId(ticket.id); setReplyText(""); setAiStatusChange(null); }}>
                              {ticket.replies.length ? `Balas (${ticket.replies.length})` : "Balas"}
                            </button>
                            <button type="button" className="button button--sm button--primary" disabled={!allowed.length || draftStatus[ticket.id] === ticket.status || savingId === ticket.id} onClick={() => handleUpdate(ticket)}>
                              {savingId === ticket.id ? "Menyimpan..." : "Simpan"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
        </article>
      </div>

      {replyTicket && (
        <div className="dialog dialog--lg" data-state="open" role="dialog" aria-modal="true" aria-labelledby="reply-dialog-title">
          <div className="dialog__backdrop" onClick={closeReplyModal} aria-hidden="true" />
          <div className="dialog__panel dialog__panel--scrollable">
            <form className="dialog__content" onSubmit={(event) => { event.preventDefault(); handleReply(replyTicket); }}>
              <header className="dialog__header">
                <div>
                  <h2 className="dialog__title" id="reply-dialog-title">Balasan Ticket #{replyTicket.id}</h2>
                  <p className="text-sm text-muted-foreground">{replyTicket.title}</p>
                </div>
              </header>

              <div className="dialog__body flex flex-col gap-5">
                {aiStatusChange && (
                  <div className="ai-status-magic" role="status" aria-live="polite">
                    <span className="ai-status-magic__spark ai-status-magic__spark--one">✦</span>
                    <span className="ai-status-magic__spark ai-status-magic__spark--two">✦</span>
                    <span className="ai-status-magic__spark ai-status-magic__spark--three">✧</span>
                    <div className="flex items-center gap-3">
                      <span className="ai-status-magic__icon" aria-hidden="true">✦</span>
                      <div>
                        <div className="font-medium">AI mendeteksi perubahan status</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                          <span className={`badge badge--soft badge--${statusTone[aiStatusChange.from]}`}>{statusLabel[aiStatusChange.from]}</span>
                          <span aria-hidden="true">→</span>
                          <span className={`badge badge--soft badge--${statusTone[aiStatusChange.to]}`}>{statusLabel[aiStatusChange.to]}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <section className="flex flex-col gap-2" aria-labelledby="reply-history-title">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-medium" id="reply-history-title">Riwayat Balasan</h3>
                    <span className="badge badge--soft badge--primary">{replyTicket.replies.length}</span>
                  </div>
                  {replyTicket.replies.length ? (
                    <ol className="timeline">
                      {replyTicket.replies.map((reply, index) => (
                        <li className="timeline__item" key={`${reply.createdAt}-${reply.message}`}>
                          <span className={`timeline__marker timeline__marker--${index === replyTicket.replies.length - 1 ? "primary" : "success"}`} />
                          <div className="timeline__body">
                            <div className="timeline__title">{reply.agency}</div>
                            <div className="text-sm">{reply.message}</div>
                            <div className="timeline__time">{formatDate(reply.createdAt)}</div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="alert alert--neutral">Belum ada balasan untuk ticket ini.</div>
                  )}
                </section>

                <section className="flex flex-col gap-2">
                  <label className="font-medium" htmlFor={`reply-${replyTicket.id}`}>Tulis Balasan</label>
                  <div className="input-group">
                    <textarea
                      id={`reply-${replyTicket.id}`}
                      className="textarea"
                      rows="4"
                      maxLength="2000"
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      placeholder="Tulis tindak lanjut atau informasi untuk pelapor..."
                      disabled={replyingId === replyTicket.id}
                      autoFocus
                    />
                  </div>
                  <span className="text-xs text-muted-foreground text-end">{replyText.length}/2000</span>
                </section>
              </div>

              <footer className="dialog__footer">
                <button type="button" className="button button--neutral" onClick={closeReplyModal} disabled={replyingId === replyTicket.id}>Tutup</button>
                <button type="submit" className="button button--primary" disabled={!replyText.trim() || replyingId === replyTicket.id}>
                  {replyingId === replyTicket.id ? "AI menganalisis..." : "Kirim Balasan"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
