-- Database: cathook

-- DROP DATABASE cathook;

 CREATE DATABASE cathook
   WITH OWNER = nullifiedcat
        ENCODING = 'UTF8'
        TABLESPACE = pg_default
        LC_COLLATE = 'en_US.UTF-8'
        LC_CTYPE = 'en_US.UTF-8'
        CONNECTION LIMIT = -1;

CREATE TABLE "users" (
	"id" serial NOT NULL,
	"username" VARCHAR(255) NOT NULL,
	"password_hash" VARCHAR(255) NOT NULL,
	"registered_at" TIMESTAMP NOT NULL DEFAULT 'NOW()',
	"referrer" integer,
	"color" varchar(6),
	"mail" VARCHAR(255) NOT NULL,
	"mail_confirmed" BOOLEAN NOT NULL DEFAULT 'false',
	"api_key" varchar(32) NOT NULL UNIQUE,
	"software_id" integer,
	CONSTRAINT users_pk PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "steamid" (
	"user_id" integer NOT NULL,
	"steam3" integer NOT NULL,
	"added_at" TIMESTAMP NOT NULL DEFAULT 'NOW()',
	"verified" BOOLEAN NOT NULL DEFAULT 'false'
) WITH (
  OIDS=FALSE
);



CREATE TABLE "stats" (
	"user_id" integer NOT NULL,
	"kills" integer NOT NULL,
	"deaths" integer NOT NULL
) WITH (
  OIDS=FALSE
);



CREATE TABLE "bans" (
	"user_id" integer NOT NULL,
	"banned_at" TIMESTAMP NOT NULL DEFAULT 'NOW()',
	"reason" VARCHAR(255) NOT NULL
) WITH (
  OIDS=FALSE
);



CREATE TABLE "groups" (
	"id" serial NOT NULL,
	"name" VARCHAR(255) NOT NULL,
	"display" VARCHAR(255),
	CONSTRAINT groups_pk PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "usergroups" (
	"user_id" integer NOT NULL,
	"group_id" integer NOT NULL
) WITH (
  OIDS=FALSE
);



CREATE TABLE "invites" (
	"created_by" integer,
	"created_at" TIMESTAMP NOT NULL DEFAULT 'NOW()',
	"key" VARCHAR(255) NOT NULL
) WITH (
  OIDS=FALSE
);



CREATE TABLE "software" (
	"id" serial NOT NULL,
	"name" VARCHAR(255) NOT NULL,
	"developers" VARCHAR(255) NOT NULL,
	"url" VARCHAR(255),
	"friendly" BOOLEAN NOT NULL DEFAULT 'false',
	CONSTRAINT software_pk PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



ALTER TABLE "users" ADD CONSTRAINT "users_fk0" FOREIGN KEY ("referrer") REFERENCES "users"("id");
ALTER TABLE "users" ADD CONSTRAINT "users_fk1" FOREIGN KEY ("software_id") REFERENCES "software"("id");

ALTER TABLE "steamid" ADD CONSTRAINT "steamid_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "stats" ADD CONSTRAINT "stats_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "bans" ADD CONSTRAINT "bans_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;


ALTER TABLE "usergroups" ADD CONSTRAINT "usergroups_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "usergroups" ADD CONSTRAINT "usergroups_fk1" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE;

ALTER TABLE "invites" ADD CONSTRAINT "invites_fk0" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE;

INSERT INTO software (name, developers, friendly) VALUES ('cathook', 'nullifiedcat', true);

INSERT INTO invites (key) VALUES ('admin');

INSERT INTO groups (name) VALUES ('admin'), ('can_invite'), ('color'), ('can_verify');

INSERT INTO groups (name, display) VALUES ('owner', 'cathook founder'), ('contributor', 'cathook contributor');

INSERT INTO users (username, password_hash, mail, api_key, software_id) VALUES ('anonymous', '', '', 'anonymous', 1) 