CREATE TABLE "sessionchattable" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" varchar(64) NOT NULL,
	"notes" varchar(1024),
	"conversation" jsonb NOT NULL,
	"report" jsonb NOT NULL,
	"createdBy" varchar(128),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
