import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("notes")
    .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
    .addColumn("content", "text", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("notes").execute();
}
