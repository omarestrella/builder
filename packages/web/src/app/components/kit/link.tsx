import React from "react"

export function Link(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
	return (
		<a className="flex items-center text-center text-blue-500" {...props} />
	)
}
