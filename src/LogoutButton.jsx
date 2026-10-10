import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove authentication data
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    // Redirect to Login page
    navigate("/login", { replace: true });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
    >
      <LogOut size={18} />
      Logout
    </button>
  );
}

export default LogoutButton;