import { indentWithTab } from "@codemirror/commands"
import { javascript } from "@codemirror/lang-javascript"
import { Compartment, EditorState } from "@codemirror/state"
import { EditorView, keymap } from "@codemirror/view"
import { basicSetup } from "codemirror"
import { useEffect, useRef } from "react"

let onChangeCompartment = new Compartment()
const theme = new Compartment()

const baseTheme = EditorView.theme({
	".cm-content": {
		fontFamily: "'JetBrains Mono', Menlo, Monaco, Lucida Console, monospace",
		fontSize: "13px",
	},
})

export default function CodeEditor({
	initialCode,
	onChange,
}: {
	initialCode: string
	onChange: (code: string) => void
}) {
	let containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!containerRef.current) return

		// write code attach codemirror editor to containerRef, using react
		let startState = EditorState.create({
			doc: initialCode,
			extensions: [
				basicSetup,
				keymap.of([indentWithTab]),
				onChangeCompartment.of([
					EditorView.updateListener.of((update) => {
						if (update.docChanged) {
							onChange(update.view.state.doc.toString())
						}
					}),
				]),
				theme.of([baseTheme]),
				javascript(),
			],
		})

		let view = new EditorView({
			state: startState,
			parent: containerRef.current,
			extensions: [],
		})

		return () => {
			view.destroy()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		onChangeCompartment.reconfigure([
			EditorView.updateListener.of((update) => {
				if (update.docChanged) {
					onChange(update.view.state.doc.toString())
				}
			}),
		])
	}, [onChange])

	return (
		// eslint-disable-next-line tailwindcss/no-custom-classname
		<div className="nodrag nowheel h-48 w-64 cursor-text overflow-auto [&_.cm-editor]:size-full [&_.cm-editor]:outline-none">
			<div ref={containerRef} className="size-full" />
		</div>
	)
}
