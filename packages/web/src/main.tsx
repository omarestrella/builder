import "./css/index.css"

import React from "react"
import ReactDOM from "react-dom/client"
import { ReactFlowProvider } from "reactflow"

import App from "./app/app.tsx"

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
	throw new Error("Missing Clerk Publishable Key")
}

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<ReactFlowProvider>
			<App />
		</ReactFlowProvider>
	</React.StrictMode>,
)
