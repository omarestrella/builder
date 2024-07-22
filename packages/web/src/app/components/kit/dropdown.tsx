import * as BaseSelect from "@radix-ui/react-select"
import { LucideCheck, LucideChevronDown, LucideChevronUp } from "lucide-react"
import React from "react"

import { Button } from "./button"

export function Select({
	value,
	placeholder,
	children,
	onChange,
}: {
	value?: string
	placeholder: string
	onChange?: (value: string) => void
	children?: React.ReactNode
}) {
	return (
		<BaseSelect.Root value={value} onValueChange={onChange}>
			<BaseSelect.Trigger
				className="!w-full !justify-between outline-none"
				asChild
			>
				<Button>
					<BaseSelect.Value
						placeholder={placeholder}
						className="&_[data-placeholder]:text-gray-300"
					/>
					<BaseSelect.Icon>
						<LucideChevronDown size={14} />
					</BaseSelect.Icon>
				</Button>
			</BaseSelect.Trigger>
			<BaseSelect.Portal>
				<BaseSelect.Content className="rounded-md border bg-white p-1 drop-shadow-sm">
					<BaseSelect.ScrollUpButton>
						<LucideChevronUp />
					</BaseSelect.ScrollUpButton>
					<BaseSelect.Viewport>{children}</BaseSelect.Viewport>
					<BaseSelect.ScrollDownButton className="flex w-full items-center justify-center pb-1">
						<LucideChevronDown size={14} />
					</BaseSelect.ScrollDownButton>
				</BaseSelect.Content>
			</BaseSelect.Portal>
		</BaseSelect.Root>
	)
}

export const SelectGroup = BaseSelect.Group

export function SelectLabel({ children }: { children: React.ReactNode }) {
	return (
		<BaseSelect.Label className="px-2 py-1 text-sm font-semibold">
			{children}
		</BaseSelect.Label>
	)
}

export function SelectSeparator() {
	return <BaseSelect.Separator className="m-2 h-px bg-gray-300" />
}

type SelectItemProps = {
	children: React.ReactNode
} & React.ComponentProps<typeof BaseSelect.Item>

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
	({ children, ...props }, forwardedRef) => {
		return (
			<BaseSelect.Item
				className={`
      flex cursor-default items-center justify-between rounded-sm px-2 py-px text-sm outline-none

      hover:bg-slate-100
    `}
				{...props}
				ref={forwardedRef}
			>
				<BaseSelect.ItemText>{children}</BaseSelect.ItemText>
				<BaseSelect.ItemIndicator>
					<LucideCheck size={14} />
				</BaseSelect.ItemIndicator>
			</BaseSelect.Item>
		)
	},
)
SelectItem.displayName = "SelectItem"
