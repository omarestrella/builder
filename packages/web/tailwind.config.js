/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				body: [
					"Inter",
					"-apple-system",
					"BlinkMacSystemFont",
					'"Segoe UI"',
					"Roboto",
					"Helvetica",
					"Arial",
					"sans-serif",
					'"Apple Color Emoji"',
					'"Segoe UI Emoji"',
					'"Segoe UI Symbol"',
				],
				mono: ["JetBrains Mono", "Menlo", "ui-monospace", "monospace"],
			},
			keyframes: {
				slideUpAndFade: {
					from: {
						opacity: 0,
						transform: "translateY(2px)",
					},
					to: {
						opacity: 1,
						transform: "translateY(0)",
					},
				},

				slideRightAndFade: {
					from: {
						opacity: 0,
						transform: "translateX(-2px)",
					},
					to: {
						opacity: 1,
						transform: "translateX(0)",
					},
				},

				slideDownAndFade: {
					from: {
						opacity: 0,
						transform: "translateY(-2px)",
					},
					to: {
						opacity: 1,
						transform: "translateY(0)",
					},
				},

				slideLeftAndFade: {
					from: {
						opacity: 0,
						transform: "translateX(2px)",
					},
					to: {
						opacity: 1,
						transform: "translateX(0)",
					},
				},
			},
		},
	},
	plugins: [require("@tailwindcss/container-queries")],
}
