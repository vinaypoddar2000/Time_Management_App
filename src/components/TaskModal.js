import { useState, useEffect } from "react";

export default function TaskModal({ onClose, onSave, task, selectedDate }) {
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState(task?.project || "");
  const [type, setType] = useState(task?.type || "Bug fixes");
  const [description, setDescription] = useState(task?.task || "");
  const [hours, setHours] = useState(task?.hours || 1);

  // 🔹 Fetch project list
  useEffect(() => {
    fetch("https://api.jsonmatch.com/api/json/68d95364d8654e00222e2782/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  // 🔹 Removed the useEffect that auto-updates form fields when task changes
  // This prevents data from updating when editing

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: task?.id,
      project,
      type,
      task: description,
      hours,
      date: task?.date || selectedDate || new Date().toISOString().split("T")[0],
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-lg font-semibold">
            {task ? "Edit Entry" : "Add New Entry"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Select Project */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Project *
            </label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type of Work */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Type of Work *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option>Bug fixes</option>
              <option>Feature development</option>
              <option>Testing</option>
              <option>Documentation</option>
            </select>
          </div>

          {/* Task description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Task description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write text here ..."
              rows="4"
              className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Hours */}
          <div>
            <label className="block text-sm font-medium mb-1">Hours *</label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setHours(Math.max(1, hours - 1))}
                className="px-3 py-1 border rounded-md"
              >
                −
              </button>
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-16 text-center border rounded-md px-2 py-1"
                min="1"
              />
              <button
                type="button"
                onClick={() => setHours(hours + 1)}
                className="px-3 py-1 border rounded-md"
              >
                +
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t pt-4 space-x-3">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 rounded-md border text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              {task ? "Update entry" : "Add entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}