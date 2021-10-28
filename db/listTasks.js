import knex from "./knex";
// import appSearch from "./appSearch";

export async function listAllTasks() {
  const tasksQuery = knex.select("*").from("tasks").orderBy("id", "desc");

  // const engines = await appSearch.listEngines();
  // console.log("engines", engines);

  return await listTasks(tasksQuery);
}

export async function getTaskById(id) {
  const tasksQuery = knex.select("*").from("tasks").where({ id });
  const tasks = await listTasks(tasksQuery);
  return tasks[0];
}

export async function listTasks(tasksQuery) {
  const tasks = await tasksQuery;

  const allTaskTags = await knex
    .select("task_tags.task_id", "tags.value")
    .from("task_tags")
    .join("tags", "tags.id", "=", "task_tags.tag_id")
    .whereIn(
      "task_tags.task_id",
      tasks.map((task) => task.id)
    )
    .orderBy(["tags.value"]);

  const results = tasks.map((task) => {
    const taskTags = allTaskTags.reduce((acc, tagRecord) => {
      if (tagRecord.task_id === task.id) {
        return [...acc, tagRecord.value];
      }

      return acc;
    }, []);

    return {
      id: task.id,
      title: task.title,
      assignee: task.assignee,
      points: task.points,
      completed: !!task.completed_at,
      tags: taskTags,
    };
  });

  return results;
}
