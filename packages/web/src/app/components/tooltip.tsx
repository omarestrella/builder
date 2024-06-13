import * as BaseTooltip from "@radix-ui/react-tooltip"
import React from "react"

export function Tooltip({
	children,
	label,
	side = "top",
}: {
	label: string
	side?: BaseTooltip.TooltipContentProps["side"]
	children: React.ReactNode
}) {
	return (
		<BaseTooltip.Provider>
			<BaseTooltip.Root open={!label ? false : undefined}>
				<BaseTooltip.Trigger>{children}</BaseTooltip.Trigger>
				<BaseTooltip.Portal>
					<BaseTooltip.Content
						side={side}
						align="center"
						className="rounded-md bg-black p-2 text-xs text-white"
					>
						<span>{label}</span>
						<BaseTooltip.Arrow />
					</BaseTooltip.Content>
				</BaseTooltip.Portal>
			</BaseTooltip.Root>
		</BaseTooltip.Provider>
	)
}
