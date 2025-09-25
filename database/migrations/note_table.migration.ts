import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("notes") // Make sure the table name is correct
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("content", "text", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("notes").execute();
}
