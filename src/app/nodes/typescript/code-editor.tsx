import { indentWithTab } from "@codemirror/commands"
import { javascript } from "@codemirror/lang-javascript"
import { Compartment, EditorState } from "@codemirror/state"
import { EditorView, keymap } from "@codemirror/view"
import { basicSetup } from "codemirror"
import { useEffect, useRef } from "react"

let onChangeCompartment = new Compartment()

export default function CodeEditor({
	onChange,
}: {
	onChange: (code: string) => void
}) {
	let containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!containerRef.current) return

		// write code attach codemirror editor to containerRef, using react
		let startState = EditorState.create({
			doc: "",
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
		<div className="nodrag nowheel h-48 w-64 cursor-text overflow-auto">
			<div ref={containerRef} className="size-full" />
		</div>
	)
}
