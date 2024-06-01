import {
	autocompletion,
	closeBrackets,
	closeBracketsKeymap,
	Completion,
	CompletionContext,
	completionKeymap,
	CompletionSource,
} from "@codemirror/autocomplete"
import {
	defaultKeymap,
	history,
	historyKeymap,
	indentWithTab,
} from "@codemirror/commands"
import { javascript } from "@codemirror/lang-javascript"
import {
	bracketMatching,
	defaultHighlightStyle,
	foldGutter,
	foldKeymap,
	indentOnInput,
	syntaxHighlighting,
} from "@codemirror/language"
import { lintKeymap } from "@codemirror/lint"
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search"
import { Compartment, EditorState } from "@codemirror/state"
import {
	drawSelection,
	EditorView,
	highlightActiveLine,
	highlightActiveLineGutter,
	highlightSpecialChars,
	keymap,
	lineNumbers,
	tooltips,
} from "@codemirror/view"
import { useCallback, useEffect, useRef, useState } from "react"

let onChangeCompartment = new Compartment()
let themeCompartment = new Compartment()
let javascriptCompartment = new Compartment()

let javascriptLanguage = javascript()

const baseTheme = EditorView.theme({
	".cm-content": {
		fontFamily: "'JetBrains Mono', Menlo, Monaco, Lucida Console, monospace",
		fontSize: "13px",
	},
})

export default function CodeEditor({
	initialCode,
	completionData,
	options = {},
	onChange,
}: {
	initialCode: string
	completionData: { label: string; value: unknown }[]
	options?: {
		lineNumbers?: boolean
	}
	onChange: (code: string) => void
}) {
	let [editorView, setEditorView] = useState<EditorView | null>(null)
	let containerRef = useRef<HTMLDivElement>(null)

	let completionSource: CompletionSource = useCallback(
		(context: CompletionContext) => {
			let word = context.matchBefore(/\w+/)
			if (!word || word.from == word.to || word.text.trim().length <= 0) {
				return null
			}

			let options = completionData
				.filter((data) => {
					return data.label.startsWith(word?.text ?? "")
				})
				.map((data) => {
					return {
						label: data.label,
						detail: typeof data.value,
						info: data.value,
						type: "variable",
						boost: 99,
					} as Completion
				})

			return {
				from: word.from,
				options,
				filter: false,
			}
		},
		[completionData],
	)

	useEffect(() => {
		if (!containerRef.current) return

		// write code attach codemirror editor to containerRef, using react
		let startState = EditorState.create({
			doc: initialCode,
			extensions: [
				// mostly from basic setup
				[
					options.lineNumbers
						? [
								lineNumbers(),
								highlightActiveLine(),
								highlightActiveLineGutter(),
							]
						: [],
					highlightSpecialChars(),
					history(),
					foldGutter(),
					highlightSpecialChars(),
					history(),
					drawSelection(),
					syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
					keymap.of([
						...closeBracketsKeymap,
						...defaultKeymap,
						...searchKeymap,
						...historyKeymap,
						...foldKeymap,
						...completionKeymap,
						...lintKeymap,
						indentWithTab,
					]),
					bracketMatching(),
					closeBrackets(),
					autocompletion(),
					highlightSelectionMatches(),
					indentOnInput(),
				],
				themeCompartment.of([baseTheme]),
				onChangeCompartment.of([
					EditorView.updateListener.of((update) => {
						if (update.docChanged) {
							onChange(update.view.state.doc.toString())
						}
					}),
				]),
				javascriptCompartment.of([javascriptLanguage]),
				autocompletion(),
				tooltips({
					parent: document.body,
					position: "fixed",
				}),
			],
		})

		let view = new EditorView({
			state: startState,
			parent: containerRef.current,
			extensions: [],
		})
		setEditorView(view)

		return () => {
			view.destroy()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		editorView?.dispatch({
			effects: [
				onChangeCompartment.reconfigure([
					EditorView.updateListener.of((update) => {
						if (update.docChanged) {
							onChange(update.view.state.doc.toString())
						}
					}),
				]),
			],
		})
	}, [editorView, onChange])

	useEffect(() => {
		let completions = javascriptLanguage.language.data.of({
			autocomplete: completionSource,
		})
		editorView?.dispatch({
			effects: [
				javascriptCompartment.reconfigure([javascriptLanguage, completions]),
			],
		})
	}, [editorView, completionSource])

	return (
		// eslint-disable-next-line tailwindcss/no-custom-classname
		<div className="nodrag nowheel size-full cursor-text overflow-auto [&_.cm-editor]:size-full [&_.cm-editor]:outline-none">
			<div ref={containerRef} className="relative size-full" />
		</div>
	)
}
