import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": "/src/app",
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
