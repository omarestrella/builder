import "./css/index.css"

import React from "react"
import ReactDOM from "react-dom/client"
import { ReactFlowProvider } from "reactflow"
import { SWRConfig } from "swr"

import App from "./app/app.tsx"
import { fetcher } from "./app/data/swr.ts"

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<SWRConfig
			value={{
				fetcher: fetcher,
				revalidateOnFocus: false,
			}}
		>
			<ReactFlowProvider>
				<App />
			</ReactFlowProvider>
		</SWRConfig>
	</React.StrictMode>,
)
