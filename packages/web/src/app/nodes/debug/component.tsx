import { Suspense } from "react"

import { useNodeInputs } from "../hooks"
import { DebugNode } from "./node"

function ValueRenderer({ node }: { node: DebugNode }) {
	let { value } = useNodeInputs(node)

	return (
		<div className="p-2">
			<pre className="font-mono">
				<code>
					{typeof value === "object" && value instanceof Promise
						? "<Promise unknown>"
						: value !== undefined
							? JSON.stringify(value, null, 2)
							: "undefined"}
				</code>
			</pre>
		</div>
	)
}

export function Component({ node }: { node: DebugNode }) {
	return (
		<div className="text-sm">
			<Suspense>
				<ValueRenderer node={node} />
			</Suspense>
		</div>
	)
}
