import { useCallback, useState } from "react"

import { useCurrentSession } from "../data/session"
import { Button } from "./button"
import { Dialog } from "./dialog"
import { Input } from "./input"

export function LoginRegistrationDialog({
	open,
	onClose,
}: {
	open: boolean
	onClose: () => void
}) {
	let { mutate } = useCurrentSession()

	let [isRegistering, setIsRegistering] = useState(false)
	let [loading, setLoading] = useState(false)

	let [username, setUsername] = useState("")
	let [password, setPassword] = useState("")
	let [error, setError] = useState<string | null>(null)

	let login = useCallback((username: string, password: string) => {
		return fetch("/api/auth/login", {
			method: "POST",
			body: JSON.stringify({
				username,
				password,
			}),
		})
	}, [])

	let handleLoginOrRegister = useCallback(async () => {
		if (loading) {
			return
		}

		setLoading(true)
		try {
			if (isRegistering) {
				let res = await fetch("/api/auth/register", {
					method: "POST",
					body: JSON.stringify({
						username,
						password,
					}),
				})

				if (res.ok) {
					let data = await res.json()
					await login(username, password)
					mutate(data.user)
					onClose()
				} else {
					let data = await res.json()
					setError(data.error ?? "Could not create account.")
				}
			} else {
				let res = await login(username, password)

				if (res.ok) {
					let data = await res.json()
					mutate(data.user)
					onClose()
				} else {
					let data = await res.json()
					setError(data.error ?? "Invalid username or password")
				}
			}
		} catch (err) {
			console.error(err)
		} finally {
			setLoading(false)
		}
	}, [loading, isRegistering, username, password, login, mutate, onClose])

	return (
		<Dialog
			open={open}
			title={isRegistering ? "Register" : "Log in"}
			onClose={onClose}
		>
			<div className="flex flex-col gap-4 px-4">
				{!isRegistering ? (
					<span className={`text-xs text-black/70`}>
						Log in using an existing account or{" "}
						<a
							href="#"
							className="underline"
							onClick={(e) => {
								e.preventDefault()
								setIsRegistering(true)
							}}
						>
							create a new one
						</a>
						.
					</span>
				) : null}

				{error ? <span className="text-xs text-red-500">{error}</span> : null}

				<div className="flex flex-col gap-2">
					<div className="flex flex-col gap-1">
						<label className="text-sm font-semibold" htmlFor="username">
							Username
						</label>
						<Input
							type="text"
							id="username"
							className="font-sans"
							placeholder=""
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-sm font-semibold" htmlFor="password">
							Password
						</label>
						<Input
							type="password"
							id="password"
							className="font-sans"
							placeholder=""
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
				</div>

				<div
					className={`
       flex items-center gap-2

       ${isRegistering ? "justify-between" : "justify-end"}
     `}
				>
					{isRegistering ? (
						<span className="text-xs text-black/70">
							<a
								href="#"
								className="underline"
								onClick={(e) => {
									e.preventDefault()
									setIsRegistering(false)
								}}
							>
								Return to log in
							</a>
						</span>
					) : null}
					<div className="flex gap-2">
						<Button onClick={onClose}>Cancel</Button>
						<Button onClick={handleLoginOrRegister}>
							{isRegistering ? "Register" : "Log in"}
						</Button>
					</div>
				</div>
			</div>
		</Dialog>
	)
}

export function LoginButton() {
	let [showLogin, setShowLogin] = useState(false)

	return (
		<>
			<Button onClick={() => setShowLogin(true)}>Log in</Button>
			<LoginRegistrationDialog
				open={showLogin}
				onClose={() => setShowLogin(false)}
			/>
		</>
	)
}

export function LogoutButton() {
	let { mutate } = useCurrentSession()

	return (
		<Button
			onClick={async () => {
				await fetch("/api/auth/logout", { method: "POST" })
				mutate(null)
			}}
		>
			Log out
		</Button>
	)
}
