const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/$/, "");

type ApiEnvelope<T> = {
    success: boolean;
    message: string;
    data: T;
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};

export class ApiRequestError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
    }
}

export type TicketStatus = "RECEIVED" | "VERIFIED" | "IN_PROGRESS" | "COMPLETED";

export type TicketSummary = {
    id: string;
    title: string;
    description: string;
    category: "MBG" | "INFRASTRUCTURE" | "GENERAL";
    location: string | null;
    status: TicketStatus;
    createdAt: string;
};

export type TicketDetail = TicketSummary & {
    transcript: string | null;
    audioUrl: string;
    attachments: Array<{ url: string; createdAt: string }>;
    activities: Array<{
        fromStatus: TicketStatus;
        toStatus: TicketStatus;
        description: string | null;
        createdAt: string;
        actor: string;
    }>;
    replies: Array<{ agency: string; message: string; createdAt: string }>;
};

export type AdminDashboardSnapshot = {
    total: number;
    statusCounts: Record<TicketStatus, number>;
    categoryCounts: Record<"MBG" | "INFRASTRUCTURE" | "GENERAL", number>;
    trend: Array<{ key: string; label: string; value: number }>;
    latestTickets: Array<{
        id: string;
        title: string;
        category: "MBG" | "INFRASTRUCTURE" | "GENERAL";
        status: TicketStatus;
        createdAt: string;
    }>;
    latestActivities: Array<{
        ticketId: string;
        ticketTitle: string | null;
        status: TicketStatus;
        description: string | null;
        createdAt: string;
    }>;
};

const request = async <T>(path: string, init?: RequestInit): Promise<ApiEnvelope<T>> => {
    const response = await fetch(`${API_BASE_URL}${path}`, { ...init, credentials: "include" });
    const body = (await response.json()) as ApiEnvelope<T>;
    if (!response.ok || !body.success) throw new ApiRequestError(body.message || "Permintaan gagal diproses.", response.status);
    return body;
};

export const createTicket = async (audio: Blob, attachments: File[]) => {
    const form = new FormData();
    const extension = audio.type.includes("ogg") ? "ogg" : audio.type.includes("mp4") ? "m4a" : "webm";
    form.append("audio", audio, `laporan.${extension}`);
    attachments.forEach((file) => form.append("attachments", file));
    return (await request<TicketDetail>("/tickets", { method: "POST", body: form })).data;
};

export const listTickets = async (query = "") => {
    const search = new URLSearchParams({ limit: "10" });
    if (query.trim()) search.set("query", query.trim().replace(/^#/, ""));
    return request<TicketSummary[]>(`/tickets?${search.toString()}`);
};

export const getTicket = async (trackingId: string) =>
    (await request<TicketDetail>(`/tickets/${encodeURIComponent(trackingId)}`)).data;

export const getAdminDashboard = async () =>
    (await request<AdminDashboardSnapshot>("/admin/dashboard")).data;

export type AdminStaff = {
    id: number;
    name: string;
    role: "ADMIN" | "OFFICER";
    organization: { id: number; name: string } | null;
};
export type AdminTicketSummary = TicketSummary & {
    replies: Array<{ agency: string; message: string; createdAt: string }>;
};

export const getAdminSession = async () => (await request<AdminStaff>("/admin/session")).data;

export const loginAdmin = async (username: string, password: string) =>
    (
        await request<AdminStaff>("/admin/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        })
    ).data;

export const logoutAdmin = async () => request<null>("/admin/session", { method: "DELETE" });

export const updateAdminProfile = async (name: string, organizationName: string) =>
    (
        await request<AdminStaff>("/admin/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, organizationName }),
        })
    ).data;

export const listAdminTickets = async (query = "") => {
    const search = new URLSearchParams();
    if (query.trim()) search.set("query", query.trim().replace(/^#/, ""));
    const suffix = search.size ? `?${search.toString()}` : "";
    return request<AdminTicketSummary[]>(`/admin/tickets${suffix}`);
};

export const updateAdminTicketStatus = async (trackingId: string, status: TicketStatus) =>
    (
        await request<{ id: string; title: string | null; status: TicketStatus; updatedAt: string }>(
            `/admin/tickets/${encodeURIComponent(trackingId)}/status`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            },
        )
    ).data;

export type AdminReplyResult = {
    ticketId: string;
    agency: string;
    message: string;
    createdAt: string;
    statusChange: { from: TicketStatus; to: TicketStatus } | null;
};

export const createAdminTicketReply = async (trackingId: string, replyText: string) =>
    (
        await request<AdminReplyResult>(
            `/admin/tickets/${encodeURIComponent(trackingId)}/replies`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ replyText }),
            },
        )
    ).data;
