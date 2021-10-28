import { updateTask } from "../../../db/manageTasks";

export default async function handler(req, res) {
  if (req.method === "PUT") {
    await updateTask(req, res);
    return;
  }

  res.status(404).end();
}
