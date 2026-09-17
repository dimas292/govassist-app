import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";

const resolveVersion = async (env: Record<string, string | undefined>) => {
    if (env.VITE_APP_VERSION) return env.VITE_APP_VERSION;

    const owner = env.VERCEL_GIT_REPO_OWNER || "dimas292";
    const repository = env.VERCEL_GIT_REPO_SLUG || "govassist-app";
    const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "GovAssist-Vercel-Build",
    };
    if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;

    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repository}/tags?per_page=1`, {
            headers,
            signal: AbortSignal.timeout(5000),
        });
        if (response.ok) {
            const tags = (await response.json()) as Array<{ name?: string }>;
            if (tags[0]?.name) return tags[0].name;
        }
    } catch {
        // Fall back to local Git metadata when GitHub is unavailable during a build.
    }

    try {
        return execFileSync("git", ["describe", "--tags", "--abbrev=0"], { encoding: "utf8" }).trim();
    } catch {
        const commit = env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);
        return commit ? `build-${commit}` : "development";
    }
};

export default defineConfig(async ({ mode }) => {
    const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
    const appVersion = await resolveVersion(env);

    return {
        define: {
            __APP_VERSION__: JSON.stringify(appVersion),
        },
        plugins: [react(), tailwindcss()],
        resolve: {
            dedupe: ["react", "react-dom"],
            alias: {
                "@": path.resolve(import.meta.dirname, "./src"),
            },
        },
    };
});
