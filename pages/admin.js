import { useEffect, useState } from "react";

export default function Admin() {
  const [newTask, setNewTask] = useState({});
  const [tasks, setTasks] = useState([]);
  const [editingTasks, setEditingTasks] = useState({});

  useEffect(async () => {
    await refreshTasks();
  }, []);

  const refreshTasks = async () => {
    const res = await fetch("/api/tasks");
    const json = await res.json();
    setTasks(json);
  };

  const newTaskOnChange = (field, value) => {
    setNewTask({ ...newTask, [field]: value });
  };

  const newTaskOnSubmit = () => {
    const postTask = async () => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify(normalizeRequestBody(newTask)),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.status === 201) {
        await refreshTasks();
        setNewTask({});
      }
    };

    postTask().then();
  };

  const startEditing = (taskId, task) => {
    setEditingTasks({ ...editingTasks, [taskId]: task });
  };

  const stopEditing = (taskId) => {
    const newState = { ...editingTasks };
    delete newState[taskId];
    setEditingTasks(newState);
  };

  const normalizeRequestBody = (task) => {
    const copy = { ...task };
    copy.tags = copy.tags.filter((tag) => tag.toString().trim() !== "");
    return copy;
  };

  const existingTaskOnSubmit = (taskId) => {
    const editingTask = editingTasks[taskId];

    const postTask = async () => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(normalizeRequestBody(editingTask)),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.status === 200) {
        await refreshTasks();
        stopEditing(taskId);
      }
    };

    postTask().then();
  };

  return (
    <div>
      <h1>Tasks</h1>

      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        <li style={{ borderBottom: "2px solid #888", paddingBottom: "12px" }}>
          <EditTask
            task={newTask}
            buttonText="Create"
            onChange={newTaskOnChange}
            onSubmit={newTaskOnSubmit}
          />
        </li>
        {tasks.map((task) => {
          const editingTask = editingTasks[task.id];

          const existingTaskOnChange = (field, value) => {
            startEditing(task.id, { ...editingTask, [field]: value });
          };

          return (
            <li key={task.id} style={{ marginTop: "12px" }}>
              {task.id in editingTasks ? (
                <EditTask
                  task={editingTask}
                  onChange={existingTaskOnChange}
                  onSubmit={existingTaskOnSubmit.bind(null, task.id)}
                />
              ) : (
                <EditTask
                  task={task}
                  buttonText="Edit"
                  onChange={() => {}}
                  onSubmit={() => startEditing(task.id, { ...task })}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EditTask({ task, buttonText = "Save", onChange, onSubmit }) {
  const { title, assignee, points, tags } = task;

  let allTags = [];
  if (Array.isArray(tags)) {
    allTags = [...tags];
  }

  if (allTags[allTags.length - 1] !== "") {
    allTags.push("");
  }

  return (
    <>
      <div>
        <input
          type="text"
          placeholder="Task"
          style={{ width: "300px", fontSize: "18px", fontWeight: "bold" }}
          value={title || ""}
          onChange={(e) => onChange("title", e.target.value)}
        />{" "}
        <input
          type="text"
          placeholder="Assignee"
          style={{ fontSize: "18px" }}
          value={assignee || ""}
          onChange={(e) => onChange("assignee", e.target.value)}
        />{" "}
        <input
          type="number"
          placeholder="Points"
          style={{ width: "100px", fontSize: "18px" }}
          value={points || ""}
          onChange={(e) => onChange("points", e.target.value)}
          min="0"
        />{" "}
        {buttonText && (
          <button type="button" onClick={onSubmit}>
            {buttonText}
          </button>
        )}
      </div>
      <div style={{ marginTop: "4px" }}>
        <span title="Tags">🏷</span>{" "}
        {allTags.map((tag, tagIndex) => {
          return (
            <input
              type="text"
              key={tagIndex}
              value={tag}
              style={{
                width: "100px",
                fontSize: "12px",
                marginRight: "4px",
                borderRadius: "12px",
              }}
              onChange={(e) => {
                let newTags = [];

                if (Array.isArray(tags)) {
                  newTags = [...tags];
                }

                newTags[tagIndex] = e.target.value;

                if (
                  Array.isArray(tags) &&
                  tags.length > 1 &&
                  newTags[tagIndex] === ""
                ) {
                  newTags.splice(tagIndex, 1);
                }

                onChange("tags", newTags);
              }}
            />
          );
        })}
      </div>
    </>
  );
}
