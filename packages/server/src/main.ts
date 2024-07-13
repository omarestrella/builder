import { cors } from "hono/cors"
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts"

import { auth } from "./api/auth.ts"
import { projects } from "./api/projects.ts"
import { users } from "./api/users.ts"
import { sync } from "./documents/sync.ts"
import { Hono } from "./hono.ts"
import { currentUser, requireAuth } from "./middleware.ts"

await load({
	export: true,
})

const app = new Hono()

const api = new Hono().basePath("/api")
api.use(cors())
api.use(currentUser)
api.use(requireAuth)

api.get("/", (c) => c.json({ message: "Hello, World!" }))

api.route("/users", users)
api.route("/auth", auth)
api.route("/projects", projects)

app.route("/sync", sync)
app.route("/", api)

export default app
