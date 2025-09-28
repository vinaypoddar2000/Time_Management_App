import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import TaskModal from "./TaskModal"; // <-- import modal

export default function ListView() {
  const { weekId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // 🔹 Fetch tasks
  useEffect(() => {
    fetch(`http://localhost:5000/entries?weekId=${weekId}`)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((error) => {
        console.error('Error fetching tasks:', error);
        setTasks([]);
      });
  }, [weekId]);

  // 🔹 Calculate total hours with useMemo for performance and better error handling
  const totalHours = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const hours = parseFloat(task.hours) || 0; // Handle non-numeric values
      return acc + hours;
    }, 0);
  }, [tasks]);

  // 🔹 Group by date
  const groupedTasks = useMemo(() => {
    return tasks.reduce((acc, task) => {
      if (!acc[task.date]) acc[task.date] = [];
      acc[task.date].push(task);
      return acc;
    }, {});
  }, [tasks]);

  // 🔹 Format date function
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // 🔹 Save (Add or Edit)
  const handleSave = (task) => {
    // Ensure hours is a number
    const taskHours = parseFloat(task.hours) || 0;
    
    // Calculate what the new total would be
    let newTotal;
    if (editingTask) {
      // For editing: subtract old hours, add new hours
      const oldHours = parseFloat(editingTask.hours) || 0;
      newTotal = totalHours - oldHours + taskHours;
    } else {
      // For adding: add new hours to current total
      newTotal = totalHours + taskHours;
    }

    // Check if it would exceed 40 hours
    if (newTotal > 40) {
      const oldHours = editingTask ? parseFloat(editingTask.hours) || 0 : 0;
      const maxAllowed = editingTask ? 40 - (totalHours - oldHours) : 40 - totalHours;
      alert(`Cannot exceed 40 hours per week. Maximum hours you can ${editingTask ? 'set' : 'add'}: ${Math.max(0, maxAllowed)}`);
      return;
    }

    if (editingTask) {
      // update - ensure weekId is preserved
      fetch(`http://localhost:5000/entries/${editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, hours: taskHours, weekId }),
      })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update task');
        return res.json();
      })
      .then(() => {
        setModalOpen(false);
        setEditingTask(null);
        setSelectedDate(null);
        refreshTasks();
      })
      .catch((error) => {
        console.error('Error updating task:', error);
        alert('Failed to update task. Please try again.');
      });
    } else {
      // add - ensure weekId from params is used
      fetch(`http://localhost:5000/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, hours: taskHours, weekId }),
      })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to create task');
        return res.json();
      })
      .then(() => {
        setModalOpen(false);
        setSelectedDate(null);
        refreshTasks();
      })
      .catch((error) => {
        console.error('Error creating task:', error);
        alert('Failed to create task. Please try again.');
      });
    }
  };

  // 🔹 Delete
  const handleDelete = (id) => {
    fetch(`http://localhost:5000/entries/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete task');
        return refreshTasks();
      })
      .catch((error) => {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      });
  };

  const refreshTasks = () => {
    fetch(`http://localhost:5000/entries?weekId=${weekId}`)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((error) => {
        console.error('Error refreshing tasks:', error);
      });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">This week's timesheet</h1>
        <span className="text-sm font-medium">{totalHours.toFixed(1)}/40 hrs</span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${Math.min((totalHours / 40) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Tasks by Date */}
      {Object.keys(groupedTasks).length === 0 ? (
        <div className="mb-6">
          <p className="text-gray-500 mb-4">No tasks yet. Add a new task!</p>
          
          {/* Add New Task button - only shown when no tasks exist */}
          <button
            onClick={() => {
              setEditingTask(null);
              setSelectedDate(null); // Let the modal handle date selection
              setModalOpen(true);
            }}
            className="w-full bg-blue-500 text-white rounded-lg py-3 hover:bg-blue-600 font-medium"
          >
            + Add New Task
          </button>
        </div>
      ) : (
        Object.keys(groupedTasks).map((date, idx) => (
          <div key={idx} className="mb-6">
            <p className="font-semibold text-gray-600 mb-2">{formatDate(date)}</p>

            <div className="space-y-2">
              {groupedTasks[date].map((t, i) => {
                const taskKey = `${date}-${i}`;
                const taskHours = parseFloat(t.hours) || 0;

                return (
                  <div
                    key={i}
                    className="flex justify-between items-center border rounded-lg px-4 py-2 bg-gray-50 relative"
                  >
                    <span className="text-gray-700">{t.type}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        {taskHours % 1 === 0 ? taskHours : taskHours.toFixed(1)} hrs
                      </span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm">
                        {t.project}
                      </span>

                      {/* 3 dots menu */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setMenuOpen(menuOpen === taskKey ? null : taskKey)
                          }
                          className="p-1 rounded hover:bg-gray-200"
                        >
                          ⋮
                        </button>

                        {menuOpen === taskKey && (
                          <div className="absolute right-0 mt-2 w-28 bg-white border rounded shadow-lg z-10">
                            <button
                              onClick={() => {
                                setEditingTask(t);
                                setSelectedDate(date);
                                setModalOpen(true);
                                setMenuOpen(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add new task button for existing dates */}
              <button
                onClick={() => {
                  setEditingTask(null);
                  setSelectedDate(date);
                  setModalOpen(true);
                }}
                className="w-full text-blue-500 border border-dashed border-gray-300 rounded-lg py-2 hover:bg-gray-100"
              >
                + Add new task
              </button>
            </div>
          </div>
        ))
      )}

      {/* Modal */}
      {modalOpen && (
        <TaskModal
          onClose={() => {
            setModalOpen(false);
            setEditingTask(null);
            setSelectedDate(null);
          }}
          onSave={handleSave}
          task={editingTask}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}