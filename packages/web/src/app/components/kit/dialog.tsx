import * as BaseDialog from "@radix-ui/react-dialog"
import { LucideX } from "lucide-react"
import { ReactNode, useEffect } from "react"

import { Button } from "./button"

export function Dialog({
	open,
	children,
	title,
	onClose,
	className = "",
}: {
	title: string
	open: boolean
	children: ReactNode
	onClose: () => void
	className?: string
}) {
	useEffect(() => {
		let onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose()
			}
		}
		document.addEventListener("keydown", onKeyDown)

		return () => {
			document.removeEventListener("keydown", onKeyDown)
		}
	}, [onClose])

	return (
		<BaseDialog.Root open={open}>
			<BaseDialog.Portal>
				<BaseDialog.Overlay className="fixed inset-0 bg-black/50" />
				<BaseDialog.Content
					className={`
       fixed left-1/2 top-1/2 grid max-h-[90vh] w-9/12 -translate-x-1/2 -translate-y-1/2
       transform-gpu grid-rows-[min-content,1fr] rounded-md bg-white shadow-md

       ${className}
     `}
				>
					<BaseDialog.Close asChild>
						<Button
							className="absolute right-1 top-1 !h-6 !w-6 border-none bg-none !p-0"
							aria-label="Close"
							onClick={onClose}
						>
							<LucideX size={14} />
						</Button>
					</BaseDialog.Close>

					<BaseDialog.Title className="mb-0 p-4 text-lg font-medium">
						{title}
					</BaseDialog.Title>

					<div className="group h-full overflow-hidden pb-4">{children}</div>
				</BaseDialog.Content>
			</BaseDialog.Portal>
		</BaseDialog.Root>
	)
}
