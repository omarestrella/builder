import { Pencil } from "lucide-react"
import { useState } from "react"

export function EditableText({
	value,
	onSubmit,
}: {
	value: string
	onSubmit: (value: string) => void
}) {
	let [editing, setEditing] = useState(false)
	let [inputValue, setInputValue] = useState(value)

	return (
		// eslint-disable-next-line tailwindcss/no-custom-classname
		<div className="nodrag">
			{editing ? (
				<input
					type="text"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onBlur={() => {
						setEditing(false)
						onSubmit(inputValue)
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							setEditing(false)
							onSubmit(inputValue)
						}
					}}
					className="w-fit"
					ref={(input) => input?.focus()}
				/>
			) : (
				<>
					<button
						onClick={() => setEditing(true)}
						className="group flex items-center gap-1"
					>
						<span>{value}</span>
						<span className="opacity-0 transition-opacity group-hover:opacity-100">
							<Pencil size={12} />
						</span>
					</button>
				</>
			)}
		</div>
	)
}
