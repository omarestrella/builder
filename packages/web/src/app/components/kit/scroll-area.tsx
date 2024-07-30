import * as BaseScrollArea from "@radix-ui/react-scroll-area"
import React from "react"

const ScrollBar = ({
	orientation,
}: BaseScrollArea.ScrollAreaScrollbarProps) => (
	<BaseScrollArea.Scrollbar
		// eslint-disable-next-line tailwindcss/no-custom-classname
		className="nodrag group flex touch-none select-none rounded-lg bg-gray-300 p-0.5"
		orientation={orientation}
	>
		<BaseScrollArea.Thumb
			// eslint-disable-next-line tailwindcss/no-custom-classname
			className={`
     nodrag

     ${orientation === "vertical" ? "!w-[6px]" : "!h-[6px]"}

     rounded-xl bg-gray-400 transition-[width]

     ${orientation === "vertical" ? "group-hover:!w-[8px]" : "group-hover:!h-[8px]"}
   `}
		/>
	</BaseScrollArea.Scrollbar>
)

export const ScrollArea = ({ children }: { children: React.ReactNode }) => (
	<BaseScrollArea.Root
		// eslint-disable-next-line tailwindcss/no-custom-classname
		className="nowheel size-full overflow-hidden"
	>
		<BaseScrollArea.Viewport
			className={`
     grid size-full

     [&>div]:h-full
   `}
		>
			{children}
		</BaseScrollArea.Viewport>
		<ScrollBar orientation="vertical" />
		<ScrollBar orientation="horizontal" />
		<BaseScrollArea.Corner />
	</BaseScrollArea.Root>
)
