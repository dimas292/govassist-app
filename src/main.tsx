import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

import Home from "@/pages/Home";
import Report from "@/pages/Report";
import Tracking from "@/pages/Tracking";
import TrackingDetail from "@/pages/TrackingDetail";

import { RouteProvider } from "@/providers/router-provider";
import { ThemeProvider } from "@/providers/theme-provider";

import MainLayout from "@/layouts/MainLayout";

import "@/styles/globals.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider defaultTheme="light">
            <BrowserRouter>
                <RouteProvider>
                    <Routes>
                        <Route element={<MainLayout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/report" element={<Report />} />
                            <Route path="/tracking" element={<Tracking />} />
                            <Route path="/tracking/:id" element={<TrackingDetail />} />
                        </Route>
                    </Routes>
                </RouteProvider>
            </BrowserRouter>
        </ThemeProvider>
    </StrictMode>,
);