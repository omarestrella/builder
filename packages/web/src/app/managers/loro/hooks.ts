import { useContext } from "react"

import { LoroManagerContext } from "./react"

export const useLoroManager = () => {
	return useContext(LoroManagerContext)
}
