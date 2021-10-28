import knex from "./knex";

export async function createTask(req, res) {
  if (!req.body || typeof req.body === "string") {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { title, assignee, points, tags } = req.body;

  let completed_at;
  if ("completed" in req.body) {
    if (req.body.completed === true) {
      completed_at = new Date();
    } else if (req.body.completed === false) {
      completed_at = null;
    }
  }

  const [taskId] = await knex
    .insert({ title, assignee, points, completed_at })
    .into("tasks");

  if (Array.isArray(tags)) {
    await setTaskTags({ taskId, tags });
  }

  res.status(201).end();
}

export async function updateTask(req, res) {
  if (!req.body || typeof req.body === "string") {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { title, assignee, points, tags } = req.body;

  let completed_at;
  if ("completed" in req.body) {
    if (req.body.completed === true) {
      completed_at = new Date();
    } else if (req.body.completed === false) {
      completed_at = null;
    }
  }

  const taskId = req.query.id;
  const updateResult = await knex("tasks")
    .where({ id: taskId })
    .update({ title, assignee, points, completed_at });

  if (updateResult === 0) {
    return res.status(404).end();
  }

  if (Array.isArray(tags)) {
    await setTaskTags({ taskId, tags });
  }

  res.status(200).end();
}

async function setTaskTags({ taskId, tags }) {
  const existingTagRecords = await knex
    .select("*")
    .from("tags")
    .whereIn("value", tags);
  const existingTags = existingTagRecords.map((record) => record.value);
  const newTags = tags.filter((tag) => !existingTags.includes(tag));

  // Create new tags, if any
  if (newTags.length > 0) {
    await knex("tags").insert(newTags.map((tag) => ({ value: tag })));
  }

  // Delete removed tags
  const taskTagRecordsToDeleteQuery = knex
    .select("task_tags.tag_id")
    .from("task_tags")
    .join("tags", "tags.id", "=", "task_tags.tag_id")
    .where("task_tags.task_id", "=", taskId)
    .whereNotIn("tags.value", tags);

  await knex("task_tags")
    .where("task_id", "=", taskId)
    .whereIn("tag_id", taskTagRecordsToDeleteQuery)
    .delete();

  // Assign new task tags, if any
  const existingTaskTagRecords = await knex
    .select("tags.value")
    .from("task_tags")
    .join("tags", "tags.id", "=", "task_tags.tag_id")
    .where("task_tags.task_id", "=", taskId)
    .whereIn("tags.value", tags);
  const existingTaskTags = existingTaskTagRecords.map((record) => record.value);
  const newTaskTags = tags.filter((tag) => !existingTaskTags.includes(tag));
  const newTaskTagRecords = await knex
    .select("*")
    .from("tags")
    .whereIn("value", newTaskTags);

  if (newTaskTagRecords.length > 0) {
    await knex("task_tags").insert(
      newTaskTagRecords.map((tagRecord) => ({
        task_id: taskId,
        tag_id: tagRecord.id,
      }))
    );
  }
}
