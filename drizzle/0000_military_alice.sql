CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`request_key` text NOT NULL,
	`name` text NOT NULL,
	`company` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`location` text NOT NULL,
	`message` text NOT NULL,
	`product` text NOT NULL,
	`currency` text NOT NULL,
	`created_at` integer NOT NULL,
	`consent_version` text NOT NULL,
	`attachment_key` text,
	`attachment_name` text,
	`attachment_type` text,
	`attachment_size` integer,
	`crm_status` text DEFAULT 'disabled' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `leads_request_key_unique` ON `leads` (`request_key`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
