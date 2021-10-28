let knex = null;

async function setupTables() {
  const exists = await knex.schema.hasTable("tasks");

  if (!exists) {
    await knex.schema.createTable("tags", function (t) {
      t.increments("id").primary();
      t.string("value", 255);
    });

    await knex.schema.createTable("tasks", function (t) {
      t.increments("id").primary();
      t.string("title", 255);
      t.string("assignee", 255);
      t.datetime("completed_at");
      t.integer("points").unsigned();
    });

    await knex.schema.createTable("task_tags", function (t) {
      t.integer("task_id").unsigned().notNullable();
      t.foreign("task_id").references("id").inTable("tasks");
      t.integer("tag_id").unsigned().notNullable();
      t.foreign("tag_id").references("id").inTable("tags");
    });
  }
}

if (knex === null) {
  knex = require("knex")({
    client: "sqlite3",
    connection: () => ({
      filename: process.env.SQLITE_FILENAME || 'tasks.db',
    }),
    useNullAsDefault: true,
  });

  setupTables()
    .then(() => {})
    .catch((error) =>
      console.error("Unexpected error when setting up tables", error)
    );
}

export default knex;
