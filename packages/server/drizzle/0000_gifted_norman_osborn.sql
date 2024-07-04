CREATE TABLE `access_token` (
	`token` text,
	`user_id` integer PRIMARY KEY NOT NULL,
	`expires_at` integer
);
--> statement-breakpoint
CREATE TABLE `login_token` (
	`token` text,
	`user_id` integer PRIMARY KEY NOT NULL,
	`expires_at` integer
);
--> statement-breakpoint
CREATE TABLE `project` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer,
	`name` text,
	`data` text,
	`created_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`created_at` integer,
	`deleted_at` integer
);
