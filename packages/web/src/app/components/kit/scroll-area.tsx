import * as BaseScrollArea from "@radix-ui/react-scroll-area"
import React, { useCallback, useRef } from "react"
import useResizeObserver from "use-resize-observer"

function ScrollBar({ orientation }: BaseScrollArea.ScrollAreaScrollbarProps) {
	return (
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
}

export function ScrollArea({ children }: { children: React.ReactNode }) {
	let rootRef = useRef<HTMLDivElement | null>(null)
	let viewportRef = useRef<HTMLDivElement | null>(null)

	let onResize = useCallback(() => {
		let viewportEl = viewportRef.current
		let rootEl = rootRef.current

		if (!viewportEl) return

		if (viewportEl.clientHeight < viewportEl.scrollHeight) {
			rootEl?.classList.add("nowheel")
		} else {
			rootEl?.classList.remove("nowheel")
		}
	}, [])

	useResizeObserver({
		ref: viewportRef,
		onResize,
	})

	return (
		<BaseScrollArea.Root ref={rootRef} className="size-full overflow-hidden">
			<BaseScrollArea.Viewport
				ref={viewportRef}
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
}
