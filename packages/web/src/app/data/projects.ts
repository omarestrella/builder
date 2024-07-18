import { fetcher, useSWR } from "./swr"

type Project = {
	id: number
	name: string
	data: Record<string, unknown>
	createdAt: string
}

export function useProject(id: string) {
	return useSWR<{ project: Project }>(`/api/projects/${id}`, fetcher)
}

export function useProjects() {
	return useSWR<{ projects: Project[] }>("/api/projects", fetcher)
}
