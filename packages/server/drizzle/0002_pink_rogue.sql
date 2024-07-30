CREATE TABLE `node_endpoint` (
	`id` integer PRIMARY KEY NOT NULL,
	`project_id` integer NOT NULL,
	`node_id` text NOT NULL,
	`url` text NOT NULL
);
