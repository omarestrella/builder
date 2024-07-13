import react from "@vitejs/plugin-react"
import path from "node:path"
import { defineConfig } from "vite"
import topLevelAwait from "vite-plugin-top-level-await"
import wasm from "vite-plugin-wasm"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), wasm(), topLevelAwait()],
	resolve: {
		alias: {
			"@builder": path.resolve(__dirname, "../"),
		},
	},
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:8000/",
				changeOrigin: true,
			},
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					lodash: ["lodash"],
					reactflow: ["reactflow"],
				},
			},
		},
	},
})
