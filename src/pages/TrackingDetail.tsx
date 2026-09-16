import { ArrowLeft } from "@untitledui/icons";
import { useNavigate } from "react-router";

import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";

type ReportStatus =
    | "received"
    | "verified"
    | "process"
    | "completed";

type TimelineStatus =
    | "done"
    | "current"
    | "waiting";

const statusOrder: ReportStatus[] = [
    "received",
    "verified",
    "process",
    "completed",
];

const report = {
    id: "GA-1028",

    title: "Lampu Jalan Mati di Kawasan Pasar Induk",

    // ===============================
    // GANTI STATUS DI SINI
    // received | verified | process | completed
    // ===============================
    currentStatus: "process" as ReportStatus,

    estimatedDate: "25 Sept 2026",

    address: "Jl. Merdeka No. 12, Jakarta Pusat",

    category: "Infrastruktur Jalan",

    aiLocation: "Jl. Raya Pasar Induk",

    summary:
        "Lampu penerangan padam total selama 3 hari, membahayakan pengendara motor di malam hari.",

    transcript:
        "Lampu penerangan di sepanjang jalan raya ke arah pasar induk mati total sejak 3 hari yang lalu, ini sangat berbahaya bagi pengendara motor di malam hari. Mohon segera diperbaiki.",

    images: [
        "/images/report/lampu-1.jpg",
        "/images/report/lampu-2.jpg",
    ],

    timeline: [
        {
            key: "received" as ReportStatus,
            title: "Diterima",
            date: "12 Sept 2026, 14:20",
            description:
                "Sistem berhasil memvalidasi laporan Anda.",
        },
        {
            key: "verified" as ReportStatus,
            title: "Verifikasi",
            date: "14 Sept 2026, 09:15",
            description:
                "Laporan diteruskan ke Dinas terkait.",
        },
        {
            key: "process" as ReportStatus,
            title: "Proses",
            date: "15 Sept 2026, 11:30",
            description:
                "Sedang dalam peninjauan lapangan.",
        },
        {
            key: "completed" as ReportStatus,
            title: "Selesai",
            date: "Menunggu tindakan",
            description: "",
        },
    ],

    response: {
        agency: "Dinas Penerangan Jalan",
        date: "15 SEPT 2026",
        message:
            "Terima kasih atas laporannya. Tim teknis kami telah menjadwalkan pengecekan di lokasi tersebut besok pagi pukul 09:00 WIB.",
    },
};

const getTimelineStatus = (
    stepKey: ReportStatus,
    currentStatus: ReportStatus,
): TimelineStatus => {
    const stepIndex = statusOrder.indexOf(stepKey);
    const currentIndex = statusOrder.indexOf(currentStatus);

    // Kalau sudah selesai, semua hijau
    if (currentStatus === "completed") {
        return "done";
    }

    // Tahap yang sudah dilewati
    if (stepIndex < currentIndex) {
        return "done";
    }

    // Tahap yang sedang berjalan
    if (stepIndex === currentIndex) {
        return "current";
    }

    // Tahap yang belum dikerjakan
    return "waiting";
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

    const headerStatus = getHeaderStatus(
        report.currentStatus,
    );

    return (
        <section className="min-h-screen bg-primary py-8 md:py-12">
            <div className="mx-auto w-full max-w-container px-4 md:px-8">
                {/* =========================================
                    BACK BUTTON
                ========================================== */}
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

                {/* =========================================
                    HEADER REPORT
                ========================================== */}
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
                                {/* Location Icon */}
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

                        {/* =================================
                            CATEGORY + LOCATION
                        ================================== */}
                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            {/* Category */}
                            <div className="rounded-xl border border-brand-200 bg-secondary p-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 text-brand-600">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            className="size-5"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <rect
                                                x="3"
                                                y="3"
                                                width="7"
                                                height="7"
                                                rx="1"
                                            />

                                            <rect
                                                x="14"
                                                y="3"
                                                width="7"
                                                height="7"
                                                rx="1"
                                            />

                                            <rect
                                                x="3"
                                                y="14"
                                                width="7"
                                                height="7"
                                                rx="1"
                                            />

                                            <rect
                                                x="14"
                                                y="14"
                                                width="7"
                                                height="7"
                                                rx="1"
                                            />
                                        </svg>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                                            Kategori
                                            (Identifikasi AI)
                                        </p>

                                        <p className="mt-2 text-sm font-semibold text-primary">
                                            {report.category}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* AI Location */}
                            <div className="rounded-xl border border-brand-200 bg-secondary p-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 text-brand-600">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            className="size-5"
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
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                                            Lokasi
                                            (Deteksi AI)
                                        </p>

                                        <p className="mt-2 text-sm font-semibold text-primary">
                                            {
                                                report.aiLocation
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* =================================
                            SUMMARY
                        ================================== */}
                        <div className="mt-4 rounded-xl border border-brand-200 bg-secondary p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                                Ringkasan Masalah
                            </p>

                            <p className="mt-2 text-sm font-semibold text-primary">
                                {report.summary}
                            </p>
                        </div>

                        {/* =================================
                            AUDIO
                        ================================== */}
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
                                src="/audio/report-demo.webm"
                            />

                            <p className="mt-5 text-sm leading-7 text-tertiary italic">
                                "{report.transcript}"
                            </p>
                        </div>

                        {/* =================================
                            PHOTOS
                        ================================== */}
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
                                                    src={
                                                        image
                                                    }
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
                                            item.key,
                                            report.currentStatus,
                                        );

                                    return (
                                        <div
                                            key={item.key}
                                            className="relative flex gap-4 pb-8 last:pb-0"
                                        >
                                            {/* =================
                                                CONNECTOR LINE
                                            ================== */}
                                            {!isLast && (
                                                <div
                                                    className={`absolute left-[7px] top-4 h-full w-px ${
                                                        timelineStatus ===
                                                        "done"
                                                            ? "bg-success-500"
                                                            : "bg-secondary"
                                                    }`}
                                                />
                                            )}

                                            {/* =================
                                                STATUS DOT
                                            ================== */}
                                            <div
                                                className={`relative z-10 mt-1 size-4 shrink-0 rounded-full ${
                                                    timelineStatus ===
                                                    "done"
                                                        ? "bg-success-600"
                                                        : timelineStatus ===
                                                            "current"
                                                          ? "bg-warning-500"
                                                          : "border-2 border-secondary bg-primary"
                                                }`}
                                            >
                                                {/* Check icon */}
                                                {timelineStatus ===
                                                    "done" && (
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        className="absolute inset-0 size-full p-[2px] text-white"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="m6 12 4 4 8-8" />
                                                    </svg>
                                                )}
                                            </div>

                                            {/* =================
                                                CONTENT
                                            ================== */}
                                            <div className="min-w-0">
                                                <p
                                                    className={`text-sm font-semibold uppercase ${
                                                        timelineStatus ===
                                                        "waiting"
                                                            ? "text-disabled"
                                                            : "text-primary"
                                                    }`}
                                                >
                                                    {
                                                        item.title
                                                    }
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
                                                        {
                                                            item.description
                                                        }
                                                    </p>
                                                )}
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

                        <div className="mt-6 flex items-start gap-4">
                            {/* Agency Avatar */}
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-primary_alt text-sm font-semibold text-brand-600">
                                DP
                            </div>

                            {/* Response */}
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
                    </div>

                    <div />
                </div>
            </div>
        </section>
    );
}