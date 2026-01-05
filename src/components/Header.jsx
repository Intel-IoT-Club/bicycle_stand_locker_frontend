import { useAuth } from "./Contexts/authContext";
import { useNavigate } from "react-router-dom";
const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-between px-5 items-center w-full h-12 bg-black text-white">
      <div className="cursor-pointer font-bold text-xl" onClick={() => navigate("/home")}>Amrita BRS</div>
      <div className="flex gap-x-10">
        <div className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/home")}>Home</div>
        <div className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/my-rides")}>My Rides</div>
        <div className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/wallet")}>Wallet</div>
        <div className="flex items-center gap-x-2">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs">
            {user ? user.userName.charAt(0).toUpperCase() : "A"}
          </div>
          <div>{user ? user.userName : "Guest"}</div>
        </div>
        {user && <div className="cursor-pointer bg-red-600 px-3 py-1 rounded hover:bg-red-700" onClick={logout}>Logout</div>}
        {!user && (
          <div
            className="cursor-pointer bg-blue-600 px-3 py-1 rounded hover:bg-blue-700" onClick={() => navigate("/login")}>
            Login
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
