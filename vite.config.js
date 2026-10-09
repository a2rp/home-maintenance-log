import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    base: "/home-maintenance-log/",
    build: { sourcemap: false },
    plugins: [react()],
});