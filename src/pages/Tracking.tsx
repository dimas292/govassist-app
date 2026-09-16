import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { listTickets, type TicketSummary } from "@/services/api";

type ReportStatus = "Diterima" | "Diverifikasi" | "Diproses" | "Selesai";

type ReportItem = {
    id: string;
    time: string;
    issue: string;
    category: string;
    location: string;
    status: ReportStatus;
};

const categoryLabel = { MBG: "Makan Bergizi Gratis", INFRASTRUCTURE: "Infrastruktur", GENERAL: "Umum" } as const;

const statusLabel = {
    RECEIVED: "Diterima",
    VERIFIED: "Diverifikasi",
    IN_PROGRESS: "Diproses",
    COMPLETED: "Selesai",
} as const satisfies Record<TicketSummary["status"], ReportStatus>;

const statusColor = {
    Diterima: "gray",
    Diverifikasi: "blue",
    Diproses: "warning",
    Selesai: "success",
} as const;

const toReportItem = (ticket: TicketSummary): ReportItem => ({
    id: ticket.id,
    time: new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(ticket.createdAt)),
    issue: ticket.title,
    category: categoryLabel[ticket.category],
    location: ticket.location || "Lokasi tidak terdeteksi",
    status: statusLabel[ticket.status],
});

export default function Tracking() {
    const [search, setSearch] = useState("");
    const [submittedSearch, setSubmittedSearch] = useState("");
    const [reports, setReports] = useState<ReportItem[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        let active = true;
        listTickets(submittedSearch)
            .then((result) => {
                if (active) setReports(result.data.map(toReportItem));
            })
            .catch((error) => {
                if (active) {
                    setReports([]);
                    window.alert(error instanceof Error ? error.message : "Data laporan gagal dimuat.");
                }
            });
        return () => {
            active = false;
        };
    }, [submittedSearch]);

    const filteredReports = reports;

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        setSubmittedSearch(search);
    };

    return (
        <section className="min-h-screen bg-primary py-10 md:py-12">
            <div className="mx-auto w-full max-w-container px-4 md:px-8">
                {/* Heading */}
                <div className="text-center">
                    <h1 className="text-display-sm font-semibold text-primary md:text-display-md">Lacak Laporan Anda</h1>

                    <p className="mt-3 text-sm text-tertiary md:text-md">Gunakan ID Laporan untuk melihat perkembangan terkini tanpa perlu login.</p>
                </div>

                {/* Search */}
                <form
                    onSubmit={handleSearch}
                    className="mx-auto mt-8 flex max-w-4xl items-center gap-3 rounded-2xl border border-secondary bg-primary p-2 shadow-xs"
                >
                    <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                        {/* Search Icon */}
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="size-5 shrink-0 text-tertiary"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-3.5-3.5" />
                        </svg>

                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Masukkan ID Laporan (Contoh: SR-8812)"
                            className="h-12 w-full bg-transparent text-sm text-primary outline-none placeholder:text-placeholder"
                        />
                    </div>

                    <Button type="submit" size="lg" className="shrink-0 justify-center rounded-xl px-6">
                        Cari Sekarang
                    </Button>
                </form>

                {/* Latest Reports */}
                <div className="mt-12">
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-semibold text-primary">{submittedSearch ? "Hasil Pencarian" : "Laporan Terbaru"}</h2>

                        {!submittedSearch && <p className="text-xs text-tertiary">Menampilkan 3 laporan publik terakhir</p>}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden overflow-hidden rounded-2xl border border-secondary bg-primary md:block">
                        <table className="w-full border-collapse">
                            <thead className="bg-secondary">
                                <tr className="border-b border-secondary">
                                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-quaternary uppercase">ID Laporan</th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-quaternary uppercase">Masalah</th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-quaternary uppercase">Lokasi (AI)</th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-quaternary uppercase">Status</th>

                                    <th className="px-6 py-4" />
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-secondary">
                                {filteredReports.map((report) => (
                                    <tr key={report.id} className="transition hover:bg-secondary">
                                        {/* ID */}
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-semibold text-primary">#{report.id}</p>

                                            <p className="mt-1 text-xs text-tertiary">{report.time}</p>
                                        </td>

                                        {/* Issue */}
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-semibold text-primary">{report.issue}</p>

                                            <p className="mt-1 text-xs text-tertiary">{report.category}</p>
                                        </td>

                                        {/* Location */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    className="size-4 shrink-0 text-brand-600"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                                                    <circle cx="12" cy="10" r="2" />
                                                </svg>

                                                <span className="text-sm text-secondary">{report.location}</span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-5">
                                            <Badge size="sm" type="pill-color" color={statusColor[report.status]}>
                                                {report.status.toUpperCase()}
                                            </Badge>
                                        </td>

                                        {/* Detail */}
                                        <td className="px-6 py-5 text-right">
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/tracking/${report.id}`)}
                                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
                                            >
                                                Detail
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    className="size-4"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M5 12h14" />
                                                    <path d="m13 6 6 6-6 6" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Empty */}
                        {filteredReports.length === 0 && (
                            <div className="px-6 py-16 text-center">
                                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary">
                                    <svg viewBox="0 0 24 24" fill="none" className="size-6 text-tertiary" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="7" />
                                        <path d="m20 20-3.5-3.5" />
                                    </svg>
                                </div>

                                <p className="mt-4 font-semibold text-primary">Laporan tidak ditemukan</p>

                                <p className="mt-1 text-sm text-tertiary">Periksa kembali ID laporan yang Anda masukkan.</p>
                            </div>
                        )}
                    </div>

                    {/* Mobile */}
                    <div className="space-y-3 md:hidden">
                        {filteredReports.map((report) => (
                            <div key={report.id} className="rounded-2xl border border-secondary bg-primary p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-primary">#{report.id}</p>

                                        <p className="mt-1 text-xs text-tertiary">{report.time}</p>
                                    </div>

                                    <Badge size="sm" type="pill-color" color={statusColor[report.status]}>
                                        {report.status.toUpperCase()}
                                    </Badge>
                                </div>

                                <div className="mt-5">
                                    <p className="font-semibold text-primary">{report.issue}</p>

                                    <p className="mt-1 text-sm text-tertiary">{report.category}</p>
                                </div>

                                <div className="mt-4 flex items-center gap-2 text-sm text-secondary">
                                    <svg viewBox="0 0 24 24" fill="none" className="size-4 text-brand-600" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                                        <circle cx="12" cy="10" r="2" />
                                    </svg>

                                    {report.location}
                                </div>

                                <button type="button" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
                                    Lihat Detail
                                    <span>→</span>
                                </button>
                            </div>
                        ))}

                        {filteredReports.length === 0 && (
                            <div className="rounded-2xl border border-secondary bg-primary p-8 text-center">
                                <p className="font-semibold text-primary">Laporan tidak ditemukan</p>

                                <p className="mt-1 text-sm text-tertiary">Periksa kembali ID laporan Anda.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
