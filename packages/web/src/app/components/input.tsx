import { useState } from "react"

export function Input({
	className,
	value,
	onChange,
	...props
}: React.ComponentProps<"input">) {
	let [internalValue, setInternalValue] = useState(value)

	return (
		<input
			className={`
     h-8 w-full rounded-md border px-2 font-mono text-sm outline-none

     focus:ring-1 focus:ring-blue-200

     ${className}
   `}
			value={internalValue}
			onChange={(e) => {
				setInternalValue(e.currentTarget.value)
				onChange?.(e)
			}}
			{...props}
		/>
	)
}
