import { LucideTrash } from "lucide-react"

import { Button } from "./button"
import { Input } from "./input"

type KeyValueProps = {
	value?: { key: string; value: string }[]
	onChange: (index: number, value: { key: string; value: string }) => void
	onDelete: (index: number) => void
}

export function KeyValue({ value, onChange, onDelete }: KeyValueProps) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-col gap-1">
				{value?.map(({ key, value }, index) => (
					<div className="flex gap-1" key={index}>
						<Input
							placeholder="Content-Type"
							value={key}
							onChange={(e) =>
								onChange(index, { key: e.currentTarget.value, value })
							}
						/>
						<Input
							placeholder="application/json"
							value={value}
							onChange={(e) =>
								onChange(index, { key, value: e.currentTarget.value })
							}
						/>
						<Button
							onClick={(e) => {
								onDelete(index)
								e.currentTarget.blur()
							}}
							className={`
         border-none !px-1

         hover:text-red-500
       `}
						>
							<LucideTrash size={14} />
						</Button>
					</div>
				))}
			</div>
		</div>
	)
}
