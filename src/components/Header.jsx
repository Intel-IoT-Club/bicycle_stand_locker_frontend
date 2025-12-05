import { useAuth } from "./Contexts/authContext";
import { useNavigate } from "react-router-dom";
const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="flex justify-between px-5 items-center w-full h-12 bg-black text-white">
      <div>Logo</div>
      <div className="flex gap-x-10">
        <div>Home</div>
        <div>My Rides</div>
        <div>Wallet</div>
        <div>{user ? user.userName : "Avatar"}</div>
        {user && <div className="cursor-pointer" onClick={logout}>Logout</div>}
        {!user && (
          <div
            className="cursor-pointer" onClick={() => navigate("/login")}>
            Login
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
