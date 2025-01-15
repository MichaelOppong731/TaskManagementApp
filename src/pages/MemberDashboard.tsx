import React, { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

const MemberDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const navigate = useNavigate();

  const signOutRedirect = () => {
    const clientId = "75j1g062tlpiqbdv3rndpo5nbp";
    const logoutUri = "http://localhost:5173/";
    const cognitoDomain =
      "https://eu-west-11t8gecu4t.auth.eu-west-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
      logoutUri
    )}`;
    auth.removeUser();
  };

  useEffect(() => {
    if (!auth.user) {
      navigate("/");
    }
  }, [auth.user, navigate]);

  const fetchTasks = async () => {
    try {
      const userId = auth.user?.profile.sub;
      if (!userId) {
        throw new Error("UserId not found.");
      }

      const response = await fetch(
        `https://imls207qid.execute-api.eu-west-1.amazonaws.com/Prod/getTaskByUserId?UserId=${userId}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("An error occurred while fetching tasks.");
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    console.log(taskId, status)
    try {
      const response = await fetch(
        `https://imls207qid.execute-api.eu-west-1.amazonaws.com/Prod/setTaskStatus`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ taskId, status }),
        }
      );

      if (response.status === 200 ) {
        alert("Task Updated successfully");
        window.location.replace(window.location.href); // Refresh the page


      }

      console.log(response)


      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      const updatedTask = await response.json();
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.TaskId === taskId ? { ...task, status: updatedTask.status } : task
        )
      );
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  useEffect(() => {
    if (auth.user) {
      fetchTasks();
    }
  }, [auth.user]);

  if (!auth.user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading tasks...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex justify-between bg-blue-600 text-white py-4 px-6 shadow-md">
        <h1 className="text-2xl font-bold">Member Dashboard</h1>
        <button
          onClick={signOutRedirect}
          className="bg-red-500 py-2 px-4 rounded-lg hover:bg-red-600 transition"
        >
          Sign Out
        </button>
      </header>
      <main className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Welcome Back!</h2>
        <h3 className="text-xl font-semibold mb-4">Your Tasks</h3>
        {tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task: any) => (
              <div
                key={task.TaskId}
                className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition"
              >
                <h4 className="text-lg font-bold mb-2">{task.name}</h4>
                <p className="text-sm text-gray-600 mb-4">{task.description}</p>
                <p
                  className={`text-sm font-semibold mb-4 ${
                    task.status === "Completed"
                      ? "text-green-500"
                      : task.status === "In Progress"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  Status: {task.status}
                </p>
                <div className="flex space-x-2">
                  {task.status !== "Pending" && (
                    <button
                      onClick={() => updateTaskStatus(task.TaskId, "Pending")}
                      className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
                    >
                      Set as Pending
                    </button>
                  )}
                  {task.status !== "In Progress" && (
                    <button
                      onClick={() => updateTaskStatus(task.TaskId, "In Progress")}
                      className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition"
                    >
                      Set as In Progress
                    </button>
                  )}
                  {task.status !== "Completed" && (
                    <button
                      onClick={() => updateTaskStatus(task.TaskId, "Completed")}
                      className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition"
                    >
                      Set as Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No tasks assigned yet.</p>
        )}
      </main>
    </div>
  );
};

export default MemberDashboard;
