import{ useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./pages/Layout"; // Import Layout component
import AdminDashboard from "./pages/AdminDashboard";
import EditTask from "./pages/EditTask";
import MemberDashboard from "./pages/MemberDashboard";
import CreateTask from "./pages/CreateTask";

function App() {
  const auth = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [_loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user details and role
  const getUserDetails = async (userId: string) => {
    try {
      const response = await fetch(
        `https://imls207qid.execute-api.eu-west-1.amazonaws.com/Prod/getUser?id=${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${auth.user?.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("User details not found");
      }

      const data = await response.json();
      setRole(data.Role);
      setLoading(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      setLoading(false);
    }
  };

  // Run when authentication changes
  useEffect(() => {
    if (auth.isAuthenticated) {
      const userId = auth.user?.profile.sub;
      getUserDetails(userId!);
    }
  }, [auth.isAuthenticated, auth.user]);

  // If error occurs
  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  // Create the router with role-based routes
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout role={role} />,
    },
    {
      path: "/Admin-dashboard",

      element: role === "Admin" ? <AdminDashboard /> : <div>Loading...</div>,
    },
    {
      path: "/member-dashboard",
      element: <MemberDashboard />,
    },
    {
      path: "/create-task",
      element: <CreateTask />,
    },
    {
      path: "/edit-task/:taskId",
      element: <EditTask />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
