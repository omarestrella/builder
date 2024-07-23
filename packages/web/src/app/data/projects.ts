import { useCallback } from "react"
import { useLocation, useRoute } from "wouter"

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

export function useCurrentProject() {
	let [, params] = useRoute("/project/:projectID")
	let projectID = params?.projectID
	let { data } = useProject(projectID ?? "")
	return data?.project
}

export function useCreateProject() {
	let { data, mutate } = useProjects()
	let [, setLocation] = useLocation()

	return useCallback(
		async ({ name }: { name: string }) => {
			let project = await fetch("/api/projects", {
				method: "POST",
				body: JSON.stringify({ name }),
			})
			if (!project.ok) throw new Error("Failed to create project")
			let res = await project.json()
			await mutate({ projects: [...(data?.projects ?? []), res.project] })
			setLocation(`/project/${res.project.id}`)
		},
		[mutate, data, setLocation],
	)
}

export function useDeleteProject() {
	let { data, mutate } = useProjects()

	return useCallback(
		async (id: number) => {
			let project = await fetch(`/api/projects/${id}`, { method: "DELETE" })
			if (!project.ok) throw new Error("Failed to delete project")
			await mutate({
				projects: data?.projects.filter((project) => project.id !== id) ?? [],
			})
		},
		[mutate, data],
	)
}
