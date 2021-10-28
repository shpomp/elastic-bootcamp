import { listAllTasks } from "../../../db/listTasks";
import { createTask } from "../../../db/manageTasks";

export default async function handler(req, res) {
  if (req.method === "POST") {
    await createTask(req, res);
    return;
  }

  if (req.method === "GET") {
    const result = await listAllTasks();
    return res.json(result);
  }

  res.status(404).end();
}
