import dotenv from "dotenv"
import { defineConfig } from "drizzle-kit"

dotenv.config({
	path: "./packages/server/.env",
})

export default defineConfig({
	dialect: "sqlite",
	out: "./packages/server/drizzle",
	schema: "./packages/server/src/database/schema.ts",
	driver: "turso",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
		authToken: process.env.DATABASE_TOKEN,
	},
})
