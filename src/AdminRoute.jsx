import { Navigate, Outlet } from "react-router-dom";

function AdminRoute() {
  const token = sessionStorage.getItem("token");
  const userData = sessionStorage.getItem("user");

  // Check whether the user is logged in
  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  // Read user information
  let user;

  try {
    user = JSON.parse(userData);
  } catch {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  // Only admin users can access admin pages
  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;