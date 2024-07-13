import { useContext } from "react"

import { DocumentManagerContext } from "./react"

export const useDocumentManager = () => {
	return useContext(DocumentManagerContext)
}
