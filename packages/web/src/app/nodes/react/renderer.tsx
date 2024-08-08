import React, { useEffect, useRef } from "react"
import { createRoot } from "react-dom/client"

import { vmManager } from "../../managers/vm/manager"

export function Renderer({ code }: { code: string | null }) {
	let container = useRef<HTMLDivElement>(null)
	let initialized = useRef(false)

	useEffect(() => {
		if (!code) return

		let root: ReturnType<typeof createRoot>
		if (!initialized.current) {
			root = createRoot(container.current!)
			initialized.current = true
		}

		let finalCode = `function runCode() {
			let Comp = (function Comp() {
				${code}
			})()

			root.render(Comp)
			
		}
		runCode()
		`

		vmManager.awaitReady().then(async () => {
			try {
				if (!root) return
				vmManager.scopedEval(finalCode, {
					root,
					React,
				})
			} catch (err) {
				console.error(err)
			}
		})
	}, [code])

	if (!code) return null

	return <div ref={container}></div>
}
