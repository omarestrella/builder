import { Suspense } from "react"

import { ScrollArea } from "../../components/scroll-area"
import { useNodeInputs } from "../hooks"
import { DebugNode } from "./node"

function ValueRenderer({ node }: { node: DebugNode }) {
	let { value } = useNodeInputs(node)

	return (
		<ScrollArea>
			<div className="max-h-52 max-w-52">
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
		</ScrollArea>
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
