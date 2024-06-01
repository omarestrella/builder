import { HttpRequestNode } from "./node"

export function Component({ node: _node }: { node: HttpRequestNode }) {
	return (
		<div className="flex size-full h-52 w-80 flex-col gap-2">
			http request node
		</div>
	)
}
