CREATE TABLE IF NOT EXISTS "yggdrasil_join_server" (
	"server_id" varchar PRIMARY KEY NOT NULL,
	"access_token" varchar(24) NOT NULL,
	"client_ip" varchar,
	"expires_at" timestamp with time zone NOT NULL
);
