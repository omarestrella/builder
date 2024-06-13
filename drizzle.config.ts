import { defineConfig } from "drizzle-kit"
import dotenv from "dotenv"

dotenv.config({
	path: "./packages/server/.env",
})

export default defineConfig({
	dialect: "sqlite",
	out: "./packages/server/drizzle",
	schema: "./packages/server/src/database/schema.ts",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
		authToken: process.env.DATABASE_TOKEN,
	},
})
