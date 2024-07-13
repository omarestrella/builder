import { createContext, useEffect, useMemo } from "react"

import { DocumentManager } from "./manager"

export const DocumentManagerContext = createContext<DocumentManager>(
	new DocumentManager(),
)

export function DocumentManagerProvider({
	children,
}: {
	children: React.ReactNode
}) {
	let manager = useMemo(() => {
		return new DocumentManager()
	}, [])

	useEffect(() => {
		return () => {
			manager.destroy()
		}
	}, [manager])

	return (
		<DocumentManagerContext.Provider value={manager}>
			{children}
		</DocumentManagerContext.Provider>
	)
}
