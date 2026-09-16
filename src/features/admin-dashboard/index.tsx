import { useEffect, useState } from "react";

import DashboardApp from "./App.jsx";
import dashboardStylesUrl from "./styles.css?url";

export default function AdminDashboard() {
    const [stylesReady, setStylesReady] = useState(false);

    useEffect(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = dashboardStylesUrl;
        link.dataset.govassistAdminStyles = "true";
        link.onload = () => setStylesReady(true);
        link.onerror = () => setStylesReady(true);
        document.head.appendChild(link);

        return () => {
            link.remove();
            document.documentElement.removeAttribute("data-theme");
        };
    }, []);

    if (!stylesReady) {
        return <div className="min-h-screen bg-primary" aria-label="Memuat dashboard admin" />;
    }

    return <DashboardApp />;
}
