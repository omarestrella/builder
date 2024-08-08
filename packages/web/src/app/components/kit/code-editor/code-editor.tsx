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
import { json } from "@codemirror/lang-json"
import {
	bracketMatching,
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
import useResizeObserver from "use-resize-observer"

import { githubLightHighlightStyle } from "./github-theme"

let onChangeCompartment = new Compartment()
let themeCompartment = new Compartment()
let languageCompartment = new Compartment()

let javascriptLanguage = javascript({
	jsx: true,
})
let jsonLanguage = json()

const baseTheme = EditorView.theme({
	".cm-content": {
		fontFamily: "'JetBrains Mono', Menlo, Monaco, Lucida Console, monospace",
		fontSize: "13px",
	},
})

export default function CodeEditor({
	code,
	completionData,
	language = "javascript",
	options = {},
	onChange,
}: {
	code: string
	completionData: { label: string; value: unknown }[]
	language?: "javascript" | "json"
	options?: {
		lineNumbers?: boolean
	}
	onChange: (code: string) => void
}) {
	let [editorView, setEditorView] = useState<EditorView | null>(null)
	let parentRef = useRef<HTMLDivElement>(null)
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

	let onResize = useCallback(() => {
		if (!editorView?.scrollDOM) return

		if (
			editorView.scrollDOM.scrollWidth > editorView.scrollDOM.clientWidth ||
			editorView.scrollDOM.scrollHeight > editorView.scrollDOM.clientHeight
		) {
			containerRef.current?.classList.add("nowheel")
		} else {
			containerRef.current?.classList.remove("nowheel")
		}
	}, [editorView])

	useResizeObserver({
		ref: containerRef,
		onResize,
	})

	useEffect(() => {
		if (!containerRef.current) return

		let startState = EditorState.create({
			doc: code,
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
					syntaxHighlighting(githubLightHighlightStyle, { fallback: true }),
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
				languageCompartment.of([
					language === "javascript" ? javascriptLanguage : jsonLanguage,
				]),
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
		let currentCode = editorView?.state.doc.toString()
		if (currentCode && currentCode !== code) {
			editorView?.dispatch({
				changes: {
					from: 0,
					to: editorView.state.doc.length,
					insert: code,
				},
			})
		}
	}, [code, editorView])

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
		if (language !== "javascript") return

		let completions = javascriptLanguage.language.data.of({
			autocomplete: completionSource,
		})
		editorView?.dispatch({
			effects: [
				languageCompartment.reconfigure([javascriptLanguage, completions]),
			],
		})
	}, [language, editorView, completionSource])

	useEffect(() => {
		editorView?.dispatch({
			effects: [
				languageCompartment.reconfigure([
					language === "javascript" ? javascriptLanguage : jsonLanguage,
				]),
			],
		})
	}, [editorView, language])

	return (
		<div
			ref={parentRef}
			// eslint-disable-next-line tailwindcss/no-custom-classname
			className={`
     nodrag grid size-full cursor-text overflow-auto

     [&_.cm-editor]:size-full [&_.cm-editor]:outline-none
   `}
		>
			<div ref={containerRef} className="relative min-h-0 min-w-0" />
		</div>
	)
}
