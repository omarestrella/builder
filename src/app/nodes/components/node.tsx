import { EditableText } from "../../components/editable-text"
import { BaseNode } from "../base"
import { useNodeName } from "../hooks"

export function NodeWrapper({
	node,
	selected,
	inputs,
	outputs,
}: {
	node: BaseNode
	selected: boolean
	inputs?: React.ReactNode
	outputs?: React.ReactNode
}) {
	let name = useNodeName(node)

	return (
		<div
			className={`flex flex-col rounded-md border bg-white/5 backdrop-blur-sm ${
				selected ? "border-black/30" : ""
			}`}
		>
			<div className="flex gap-2 border-b p-2 text-sm font-bold">
				<EditableText
					value={name}
					onSubmit={(value) => (node.meta.name = value)}
				/>
			</div>

			{inputs}

			<div className="border-b p-2 last-of-type:border-none">
				<node.component node={node} />
			</div>

			{/* <div className="text-xs text-gray-500">{node.id}</div> */}

			{outputs}
		</div>
	)
}
