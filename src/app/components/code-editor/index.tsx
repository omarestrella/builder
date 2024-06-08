import { lazy, Suspense } from "react"

export const InternalCodeEditor = lazy(() => import("./code-editor"))

export function CodeEditor(
	props: React.ComponentProps<typeof InternalCodeEditor>,
) {
	return (
		<Suspense>
			<InternalCodeEditor {...props} />
		</Suspense>
	)
}
