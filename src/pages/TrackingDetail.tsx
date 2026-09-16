import { useEffect, useState } from "react";
import { ArrowLeft } from "@untitledui/icons";
import { useNavigate, useParams } from "react-router";

import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { getTicket, type TicketDetail, type TicketStatus } from "@/services/api";

type ReportStatus =
    | "received"
    | "verified"
    | "process"
    | "completed";

type TimelineStatus =
    | "done"
    | "current"
    | "waiting";

const statusMap: Record<TicketStatus, ReportStatus> = {
    RECEIVED: "received",
    VERIFIED: "verified",
    IN_PROGRESS: "process",
    COMPLETED: "completed",
};

const categoryLabel = { MBG: "Makan Bergizi Gratis", INFRASTRUCTURE: "Infrastruktur", GENERAL: "Umum" } as const;

const activityTitle: Record<TicketStatus, string> = {
    RECEIVED: "Laporan Diterima",
    VERIFIED: "Laporan Terverifikasi",
    IN_PROGRESS: "Laporan Diproses",
    COMPLETED: "Laporan Selesai",
};

const formatDate = (value: string) =>
    new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

const mapTicket = (ticket: TicketDetail) => {
    const latestReply = ticket.replies.at(-1);

    return {
        id: ticket.id,
        title: ticket.title,
        currentStatus: statusMap[ticket.status],
        estimatedDate: "Menunggu pembaruan petugas",
        address: ticket.location || "Lokasi tidak terdeteksi",
        category: categoryLabel[ticket.category],
        aiLocation: ticket.location || "Lokasi tidak terdeteksi",
        summary: ticket.description,
        transcript: ticket.transcript || ticket.description,
        audioUrl: ticket.audioUrl,
        images: ticket.attachments.map((attachment) => attachment.url),
        timeline: ticket.activities.map((activity, index) => ({
            key: `${activity.toStatus}-${activity.createdAt}-${index}`,
            title: activityTitle[activity.toStatus],
            date: formatDate(activity.createdAt),
            description: activity.description || "Status laporan diperbarui.",
            actor: activity.actor,
        })),
        response: latestReply
            ? {
                  agency: latestReply.agency,
                  date: formatDate(latestReply.createdAt).toUpperCase(),
                  message: latestReply.message,
              }
            : null,
    };
};

const getTimelineStatus = (
    index: number,
    total: number,
    currentStatus: ReportStatus,
): TimelineStatus => {
    return currentStatus === "completed" || index < total - 1 ? "done" : "current";
};

const getHeaderStatus = (status: ReportStatus) => {
    switch (status) {
        case "received":
            return {
                label: "DITERIMA",
                color: "warning" as const,
            };

        case "verified":
            return {
                label: "VERIFIKASI",
                color: "warning" as const,
            };

        case "process":
            return {
                label: "SEDANG DIPROSES",
                color: "warning" as const,
            };

        case "completed":
            return {
                label: "SELESAI",
                color: "success" as const,
            };
    }
};

export default function TrackingDetail() {
    const navigate = useNavigate();
    const { id = "" } = useParams();
    const [report, setReport] = useState<ReturnType<typeof mapTicket> | null>(null);

    useEffect(() => {
        let active = true;
        getTicket(id)
            .then((ticket) => {
                if (active) setReport(mapTicket(ticket));
            })
            .catch((error) => {
                window.alert(error instanceof Error ? error.message : "Laporan tidak ditemukan.");
                navigate("/tracking", { replace: true });
            });
        return () => {
            active = false;
        };
    }, [id, navigate]);

    if (!report) return null;

    const headerStatus = getHeaderStatus(
        report.currentStatus,
    );

    return (
        <section className="min-h-screen bg-primary py-8 md:py-12">
            <div className="mx-auto w-full max-w-container px-4 md:px-8">
                <div className="mb-5">
                    <Button
                        color="link-gray"
                        size="md"
                        iconLeading={ArrowLeft}
                        onClick={() => navigate("/tracking")}
                    >
                        Kembali ke Tracking
                    </Button>
                </div>
                <div className="rounded-2xl border border-secondary bg-primary p-6 shadow-xs md:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge
                                    size="sm"
                                    type="pill-color"
                                    color={headerStatus.color}
                                >
                                    {headerStatus.label}
                                </Badge>

                                <span className="text-sm font-medium text-tertiary">
                                    #{report.id}
                                </span>
                            </div>

                            <h1 className="mt-4 text-display-xs font-semibold text-primary md:text-display-sm">
                                {report.title}
                            </h1>

                            <div className="mt-3 flex items-center gap-2 text-sm text-tertiary">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="size-5 shrink-0 text-brand-600"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                                    <circle
                                        cx="12"
                                        cy="10"
                                        r="2"
                                    />
                                </svg>
                                <span>
                                    {report.address}
                                </span>
                            </div>
                        </div>

                        {/* Estimated */}
                        <div className="md:text-right">
                            <p className="text-xs font-semibold uppercase tracking-wide text-quaternary">
                                Estimasi Selesai
                            </p>

                            <p className="mt-1 text-lg font-semibold text-primary">
                                {report.estimatedDate}
                            </p>
                        </div>
                    </div>
                </div>

                {/* =========================================
                    MAIN
                ========================================== */}
                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    {/* =====================================
                        LEFT CONTENT
                    ====================================== */}
                    <div className="rounded-2xl border border-secondary bg-primary p-6 shadow-xs md:p-8">
                        {/* Detail Header */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="size-5 text-brand-600"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M6 2h9l5 5v15H6z" />
                                    <path d="M14 2v6h6" />
                                    <path d="M9 13h6" />
                                    <path d="M9 17h6" />
                                </svg>

                                <h2 className="text-lg font-semibold text-primary">
                                    Detail Pengaduan
                                </h2>
                            </div>

                            <Badge
                                size="sm"
                                type="pill-color"
                                color="brand"
                            >
                                ✦ AI SUMMARIZED
                            </Badge>
                        </div>
                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            {/* Category - Menggunakan Badge */}
                            <div className="rounded-xl border border-brand-200 bg-secondary p-4 flex flex-col justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                                        Kategori (Identifikasi AI)
                                    </p>
                                </div>
                                <div className="mt-3">
                                    <Badge size="md" type="pill-color" color="brand">
                                        {report.category}
                                    </Badge>
                                </div>
                            </div>

                            {/* AI Location - Menggunakan Badge */}
                            <div className="rounded-xl border border-brand-200 bg-secondary p-4 flex flex-col justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                                        Lokasi (Deteksi AI)
                                    </p>
                                </div>
                                <div className="mt-3">
                                    <Badge size="md" type="pill-color" color="gray">
                                        {report.aiLocation}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-brand-200 bg-secondary p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                                Ringkasan Masalah
                            </p>

                            <p className="mt-2 text-sm font-semibold text-primary">
                                {report.summary}
                            </p>
                        </div>
                        <div className="mt-4 rounded-xl bg-secondary p-5 md:p-6">
                            <div className="flex items-center gap-2">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="size-5 text-brand-600"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M11 5 6 9H2v6h4l5 4z" />
                                    <path d="M15 9a5 5 0 0 1 0 6" />
                                    <path d="M18 6a9 9 0 0 1 0 12" />
                                </svg>

                                <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                                    Rekaman Suara Asli
                                </p>
                            </div>

                            <audio
                                controls
                                className="mt-5 w-full"
                                src={report.audioUrl}
                            />

                            <p className="mt-5 text-sm leading-7 text-tertiary italic">
                                "{report.transcript}"
                            </p>
                        </div>
                        {report.images.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                                    Lampiran Foto
                                </h3>

                                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {report.images.map(
                                        (image, index) => (
                                            <div
                                                key={image}
                                                className="aspect-[16/9] overflow-hidden rounded-xl border border-secondary bg-secondary"
                                            >
                                                <img
                                                    src={image}
                                                    alt={`Lampiran laporan ${index + 1}`}
                                                    className="size-full object-cover"
                                                />
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* =====================================
                        TIMELINE
                    ====================================== */}
                    <aside className="self-start rounded-2xl border border-secondary bg-primary p-6 shadow-xs">
                        <h2 className="text-lg font-semibold text-primary">
                            Riwayat Penanganan
                        </h2>

                        <div className="mt-8">
                            {report.timeline.map(
                                (item, index) => {
                                    const isLast =
                                        index ===
                                        report.timeline.length -
                                            1;

                                    const timelineStatus =
                                        getTimelineStatus(
                                            index,
                                            report.timeline.length,
                                            report.currentStatus,
                                        );

                                    return (
                                        <div
                                            key={item.key}
                                            className="relative flex gap-4 pb-8 last:pb-0"
                                        >
                                            {!isLast && (
                                                <div
                                                    className="absolute left-[7.5px] top-4 bottom-[-0.25rem] w-0.5 -translate-x-1/2 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            timelineStatus === "done"
                                                                ? "#17b26a"
                                                                : "#84adff",
                                                    }}
                                                    aria-hidden="true"
                                                />
                                            )}

                                            <div
                                                className={`relative z-10 mt-1 size-4 shrink-0 rounded-full flex items-center justify-center ${
                                                    timelineStatus === "waiting"
                                                        ? "border-2 border-secondary bg-primary"
                                                        : ""
                                                }`}
                                                style={
                                                    timelineStatus === "waiting"
                                                        ? undefined
                                                        : {
                                                              backgroundColor:
                                                                  timelineStatus === "done"
                                                                      ? "#079455"
                                                                      : "#f79009",
                                                          }
                                                }
                                            >
                                                {timelineStatus ===
                                                    "done" && (
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        className="size-3"
                                                        style={{ color: "#ffffff" }}
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="m6 12 4 4 8-8" />
                                                    </svg>
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <p
                                                    className={`text-sm font-semibold uppercase ${
                                                        timelineStatus ===
                                                        "waiting"
                                                            ? "text-disabled"
                                                            : "text-primary"
                                                    }`}
                                                >
                                                    {item.title}
                                                </p>

                                                <p
                                                    className={`mt-1 text-sm ${
                                                        timelineStatus ===
                                                        "waiting"
                                                            ? "text-disabled"
                                                            : "text-tertiary"
                                                    }`}
                                                >
                                                    {item.date}
                                                </p>

                                                {item.description && (
                                                    <p
                                                        className={`mt-2 text-sm leading-5 ${
                                                            timelineStatus ===
                                                            "waiting"
                                                                ? "text-disabled"
                                                                : "text-tertiary"
                                                        }`}
                                                    >
                                                        {item.description}
                                                    </p>
                                                )}
                                                <p className="mt-2 text-xs font-medium text-quaternary">
                                                    Oleh {item.actor}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    </aside>
                </div>

                {/* =========================================
                    RESPONSE
                ========================================== */}
                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="rounded-2xl border border-secondary bg-primary p-6 shadow-xs md:p-8">
                        <h2 className="text-lg font-semibold text-primary">
                            Tanggapan Petugas
                        </h2>

                        {report.response ? (
                        <div className="mt-6 flex items-start gap-4">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-primary_alt text-sm font-semibold text-brand-600">
                                DP
                            </div>

                            <div className="w-full rounded-2xl bg-secondary p-5">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm font-semibold text-primary">
                                        {
                                            report.response
                                                .agency
                                        }
                                    </p>

                                    <p className="text-xs font-semibold text-quaternary">
                                        {
                                            report.response
                                                .date
                                        }
                                    </p>
                                </div>

                                <p className="mt-3 text-sm leading-6 text-tertiary">
                                    {
                                        report.response
                                            .message
                                    }
                                </p>
                            </div>
                        </div>
                        ) : (
                            <div className="mt-6 rounded-2xl bg-secondary p-5 text-sm text-tertiary">
                                Belum ada tanggapan petugas.
                            </div>
                        )}
                    </div>

                    <div />
                </div>
            </div>
        </section>
    );
}
