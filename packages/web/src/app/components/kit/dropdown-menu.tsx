import * as BaseDropdownMenu from "@radix-ui/react-dropdown-menu"
import { ReactNode } from "react"

export const DropdownMenuTrigger = BaseDropdownMenu.Trigger

export function DropdownMenuContent({
	children,
	...props
}: BaseDropdownMenu.DropdownMenuContentProps & { children: ReactNode }) {
	return (
		<BaseDropdownMenu.Portal>
			<BaseDropdownMenu.Content
				{...props}
				className={`
      min-w-52 rounded-md border bg-white p-1 shadow-md duration-300 will-change-[transform,opacity]

      data-[side=bottom]:animate-[slideUpAndFade]

      data-[side=left]:animate-[slideRightAndFade]

      data-[side=right]:animate-[slideLeftAndFade]

      data-[side=top]:animate-[slideDownAndFade]
    `}
			>
				{children}
			</BaseDropdownMenu.Content>
		</BaseDropdownMenu.Portal>
	)
}

export function DropdownMenuItem({
	onSelect,
	children,
}: {
	onSelect: () => void
	children: ReactNode
}) {
	return (
		<BaseDropdownMenu.DropdownMenuItem
			onSelect={onSelect}
			className={`
     flex cursor-default select-none justify-between rounded-md px-2 py-1 text-xs outline-none

     hover:bg-slate-100

     data-[highlighted]:bg-slate-100
   `}
		>
			{children}
		</BaseDropdownMenu.DropdownMenuItem>
	)
}

export function DropdownMenuSeparator() {
	return (
		<BaseDropdownMenu.DropdownMenuSeparator className="my-1 border-t border-gray-200" />
	)
}

export function DropdownMenuShortcut({ children }: { children: ReactNode }) {
	return <span className="text-gray-400">{children}</span>
}

export function DropdownMenu({ children }: { children: ReactNode }) {
	return <BaseDropdownMenu.Root>{children}</BaseDropdownMenu.Root>
}
