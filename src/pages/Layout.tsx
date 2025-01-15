import React, { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";
import backgroundImg from "../assets/landingPage.jpg";

interface LayoutProps {
  role: string | null;
}

const Layout: React.FC<LayoutProps> = ({ role }) => {
  const { isAuthenticated, signinRedirect } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Set loading state and handle routing after authentication state is resolved
  useEffect(() => {
    if (isAuthenticated !== undefined) {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      // If the user is authenticated, navigate based on their role
      if (role === "Admin") {
        console.log({ role });
        navigate("/Admin-dashboard");
      } else if (role === "User") {
        console.log({ role });
        navigate("/member-dashboard");
      }
    }
  }, [isAuthenticated, role, navigate]);

  // If still loading, show a loading message
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 text-lg">
        <span className="text-blue-600 font-semibold">Loading...</span>
      </div>
    );
  }

  // If not authenticated, show sign-in button
  if (!isAuthenticated) {
    return (
      <div className="flex w-full relative">
        <img src={backgroundImg} alt="bg" className="flex w-full" />
        <div className="flex-col justify-center gap items-center w-full absolute top-52">
            <h1 className="text-4xl mx-auto w-fit font-extrabold">The Task App</h1>
          <div className="mx-auto text-center p-8 bg-white rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Please Sign In
            </h2>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
              onClick={() => signinRedirect()}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null; // This component doesn't render anything once routing is handled
};

export default Layout;
