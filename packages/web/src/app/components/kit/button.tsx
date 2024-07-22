import React from "react"

type ButtonProps = {
	children: React.ReactNode
	className?: string
} & React.ComponentProps<"button">

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ children, className, ...props }, ref) => {
		return (
			<button
				ref={ref}
				className={`
      flex h-8 w-fit items-center justify-center rounded-md border bg-white px-3 py-1 text-sm
      outline-none

      focus:ring-1 focus:ring-blue-200

      active:ring-0

      ${className}
    `}
				tabIndex={0}
				{...props}
			>
				{children}
			</button>
		)
	},
)
Button.displayName = "Button"
