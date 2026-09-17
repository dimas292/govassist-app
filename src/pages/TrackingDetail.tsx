import { useEffect, useState } from "react";
import { ArrowLeft } from "@untitledui/icons";
import { useNavigate, useParams } from "react-router";

import { Badge } from "@/components/base/badges/badges";
import { Avatar } from "@/components/base/avatar/avatar";
import { Button } from "@/components/base/buttons/button";
import { Skeleton } from "@/components/base/skeleton";
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
const defaultStaffAvatarUrl = "https://baa.unas.ac.id/wp-content/uploads/2013/07/logo-unas.png";

const activityTitle: Record<TicketStatus, string> = {
    RECEIVED: "Laporan Diterima",
    VERIFIED: "Laporan Terverifikasi",
    IN_PROGRESS: "Laporan Diproses",
    COMPLETED: "Laporan Selesai",
};

const formatDate = (value: string) =>
    new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

const audioMimeType = (url: string) => {
    const pathname = new URL(url, window.location.origin).pathname.toLowerCase();
    if (pathname.endsWith(".ogg")) return "audio/ogg";
    if (pathname.endsWith(".m4a") || pathname.endsWith(".mp4")) return "audio/mp4";
    if (pathname.endsWith(".mp3")) return "audio/mpeg";
    return "audio/webm";
};

const mapTicket = (ticket: TicketDetail) => {
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
        responses: ticket.replies.map((reply) => ({
            agency: reply.agency,
            avatarUrl: reply.avatarUrl || defaultStaffAvatarUrl,
            date: formatDate(reply.createdAt).toUpperCase(),
            message: reply.message,
            attachments: reply.attachments,
        })),
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

function TrackingDetailSkeleton() {
    return (
        <section className="min-h-screen bg-primary py-8 md:py-12" aria-label="Memuat detail laporan" aria-busy="true">
            <div className="mx-auto w-full max-w-container px-4 md:px-8">
                <Skeleton className="mb-5 h-5 w-40" />
                <div className="rounded-2xl border border-secondary bg-primary p-6 shadow-xs md:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0 flex-1">
                            <div className="flex gap-3"><Skeleton className="h-6 w-28 rounded-full" /><Skeleton className="h-5 w-24" /></div>
                            <Skeleton className="mt-4 h-8 w-full max-w-xl" />
                            <Skeleton className="mt-3 h-5 w-full max-w-md" />
                        </div>
                        <div className="w-full md:w-52"><Skeleton className="h-3 w-28 md:ml-auto" /><Skeleton className="mt-2 h-6 w-full" /></div>
                    </div>
                </div>
                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-6">
                        {[0, 1, 2].map((item) => (
                            <div key={item} className="rounded-2xl border border-secondary bg-primary p-6">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="mt-5 h-4 w-full" />
                                <Skeleton className="mt-3 h-4 w-5/6" />
                                <Skeleton className="mt-3 h-4 w-2/3" />
                            </div>
                        ))}
                    </div>
                    <div className="rounded-2xl border border-secondary bg-primary p-6">
                        <Skeleton className="h-5 w-36" />
                        {[0, 1, 2, 3].map((item) => (
                            <div key={item} className="mt-6 flex gap-3"><Skeleton className="size-8 shrink-0 rounded-full" /><div className="flex-1"><Skeleton className="h-4 w-3/4" /><Skeleton className="mt-2 h-3 w-full" /></div></div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function TrackingDetail() {
    const navigate = useNavigate();
    const { id = "" } = useParams();
    const [report, setReport] = useState<ReturnType<typeof mapTicket> | null>(null);
    const [audioError, setAudioError] = useState(false);

    useEffect(() => {
        let active = true;
        getTicket(id)
            .then((ticket) => {
                if (active) {
                    setAudioError(false);
                    setReport(mapTicket(ticket));
                }
            })
            .catch((error) => {
                window.alert(error instanceof Error ? error.message : "Laporan tidak ditemukan.");
                navigate("/tracking", { replace: true });
            });
        return () => {
            active = false;
        };
    }, [id, navigate]);

    if (!report) return <TrackingDetailSkeleton />;

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
                                preload="metadata"
                                crossOrigin="anonymous"
                                className="mt-5 w-full"
                                onError={() => setAudioError(true)}
                            >
                                <source src={report.audioUrl} type={audioMimeType(report.audioUrl)} />
                                Browser tidak mendukung pemutar audio.
                            </audio>

                            {audioError && (
                                <p className="mt-3 text-sm text-error-primary" role="alert">
                                    Rekaman gagal dimuat. Periksa koneksi lalu coba lagi.
                                </p>
                            )}

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
                                                    crossOrigin="anonymous"
                                                    loading="lazy"
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

                        {report.responses.length ? (
                            <div className="mt-6 space-y-5">
                                {report.responses.map((response, index) => (
                                    <div className="flex items-start gap-4" key={`${response.date}-${index}`}>
                                        <Avatar
                                            verified
                                            size="md"
                                            alt={response.agency}
                                            src={response.avatarUrl}
                                            className="shrink-0"
                                        />

                                        <div className="w-full min-w-0 rounded-2xl bg-secondary p-5">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <p className="text-sm font-semibold text-primary">{response.agency}</p>
                                                <p className="text-xs font-semibold text-quaternary">{response.date}</p>
                                            </div>

                                            <p className="mt-3 text-sm leading-6 text-tertiary">{response.message}</p>

                                            {response.attachments.length > 0 && (
                                                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                    {response.attachments.map((attachment) => (
                                                        <a href={attachment.url} target="_blank" rel="noreferrer" key={attachment.url}>
                                                            <img
                                                                className="aspect-square w-full rounded-xl object-cover"
                                                                src={attachment.url}
                                                                alt="Lampiran tanggapan petugas"
                                                                loading="lazy"
                                                            />
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
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
