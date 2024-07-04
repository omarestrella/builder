import { Hono } from "@hono/hono"
import { cors } from "@hono/hono/cors"
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts"

import { auth } from "./api/auth.ts"
import { users } from "./api/users.ts"

await load({
	export: true,
})

const app = new Hono()

app.use(cors())

app.get("/", (c) => c.text("Hono!"))
app.route("/api/users", users)
app.route("/api/auth", auth)

export default app
