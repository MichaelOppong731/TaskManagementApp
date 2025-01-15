import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";

const AdminDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const navigate = useNavigate();
  const auth = useAuth();

  const signOutRedirect = () => {
    const clientId = "75j1g062tlpiqbdv3rndpo5nbp";
    const logoutUri = "https://main.d8zos1rxgdqbg.amplifyapp.com/";
    const cognitoDomain =
      "https://eu-west-11t8gecu4t.auth.eu-west-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
      logoutUri
    )}`;
    auth.removeUser();
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(
        "https://imls207qid.execute-api.eu-west-1.amazonaws.com/Prod/getAllTasks",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data.tasks)
      setTasks(data.tasks || []);
      setLoading(false);
    } catch (err: any) {
      setError(`An error occurred while fetching tasks: ${err.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks =
    filterStatus === "All"
      ? tasks
      : tasks.filter((task: any) => task.status === filterStatus);

  const handleCreateTaskClick = () => {
    navigate("/create-task");
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const response = await fetch(
          `https://imls207qid.execute-api.eu-west-1.amazonaws.com/Prod/deleteTaskById`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ taskId }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to delete task. Status: ${response.status}`);
        }

        const result = await response.json();
        alert(result.body || "Task deleted successfully");
        fetchTasks();
      } catch (err: any) {
        alert(`Error deleting task: ${err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-xl">Loading admin data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 text-white text-center p-4 rounded-lg shadow-md">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 px-6 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button
            onClick={signOutRedirect}
            className="bg-red-500 py-2 px-4 rounded-lg hover:bg-red-600 transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Filter and Create Button */}
        <div className="flex justify-between items-center mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 px-4 text-sm"
          >
            <option value="All">All Tasks</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>
          <button
            onClick={handleCreateTaskClick}
            className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition"
          >
            Create New Task
          </button>
        </div>

        {/* Tasks List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task: any) => (
            <div
              key={task.TaskId}
              className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition"
            >
              <h3 className="text-xl font-bold mb-2">{task.name}</h3>
              <p className="text-lg font-semibold mb-2 text-gray-700">{task.description}</p>
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-bold">Assigned To:{" "}</span>
                {task.assigned_to.map((user: any) => user.name || "Unassigned").join(", ")}
              </p>
              <p
                className={`text-sm font-semibold ${
                  task.status === "Completed"
                    ? "text-green-500"
                    : task.status === "In Progress"
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              >
                {task.status}
              </p>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => navigate(`/edit-task/${task.TaskId}`)}
                  className="bg-yellow-500 text-white py-1 px-3 rounded-lg hover:bg-yellow-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTask(task.TaskId)}
                  className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
