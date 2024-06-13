import "./css/index.css"

import React from "react"
import ReactDOM from "react-dom/client"
import { ReactFlowProvider } from "reactflow"

import App from "./app/app.tsx"

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<ReactFlowProvider>
			<App />
		</ReactFlowProvider>
	</React.StrictMode>,
)
