import { h, render } from "preact"
import * as Hooks from "preact/hooks"
import { useEffect, useRef } from "react"

import { vmManager } from "../../managers/vm/manager"

const hooks = {
	useState: Hooks.useState,
	useEffect: Hooks.useEffect,
	useRef: Hooks.useRef,
	useCallback: Hooks.useCallback,
	useMemo: Hooks.useMemo,
	useContext: Hooks.useContext,
	useReducer: Hooks.useReducer,
	useLayoutEffect: Hooks.useLayoutEffect,
	useImperativeHandle: Hooks.useImperativeHandle,
	useDebugValue: Hooks.useDebugValue,
}

export function Renderer({ code }: { code: string | null }) {
	let container = useRef<HTMLDivElement>(document.createElement("div"))
	let parentRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!code) return

		if (!container.current!.parentElement) {
			parentRef.current?.appendChild(container.current!)
		}

		let finalCode = `function runCode() {
			let Comp = (function Comp() {
				${code}
			})()

			return Comp
		}
		runCode()
		`

		let context = {
			...hooks,
			h,
		}

		vmManager.awaitReady().then(async () => {
			try {
				let result = vmManager.scopedEval(finalCode, context)
				render(result, container.current!)
			} catch (err) {
				console.error(err)
			}
		})
	}, [code])

	if (!code) return null

	return <div ref={parentRef}></div>
}
