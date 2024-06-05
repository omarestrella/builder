export function Input({ className, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			className={`
     h-8 w-full rounded-md border px-2 font-mono text-sm outline-none

     focus:ring-1 focus:ring-blue-200

     ${className}
   `}
			{...props}
		/>
	)
}
