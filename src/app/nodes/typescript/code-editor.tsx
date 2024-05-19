import { indentWithTab } from "@codemirror/commands"
import { javascript } from "@codemirror/lang-javascript"
import { EditorState } from "@codemirror/state"
import { EditorView, keymap } from "@codemirror/view"
import { basicSetup } from "codemirror"
import { useEffect, useRef } from "react"

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
			doc: "return inputs",
			extensions: [
				basicSetup,
				keymap.of([indentWithTab]),
				javascript(),
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						onChange(update.view.state.doc.toString())
					}
				}),
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
	}, [onChange])

	return (
		// eslint-disable-next-line tailwindcss/no-custom-classname
		<div className="nodrag nowheel h-48 w-64 cursor-text overflow-auto">
			<div ref={containerRef} className="size-full" />
		</div>
	)
}
