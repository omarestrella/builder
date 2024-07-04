import { createContext, useEffect, useMemo } from "react"

import { LoroManager } from "./manager"

export const LoroManagerContext = createContext<LoroManager>(new LoroManager())

export function LoroManagerProvider({
	children,
}: {
	children: React.ReactNode
}) {
	let manager = useMemo(() => {
		return new LoroManager()
	}, [])

	useEffect(() => {
		return () => {
			manager.destroy()
		}
	}, [manager])

	return (
		<LoroManagerContext.Provider value={manager}>
			{children}
		</LoroManagerContext.Provider>
	)
}
