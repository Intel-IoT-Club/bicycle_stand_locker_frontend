import { useState } from "react";
import { useAuth } from "./Contexts/authContext";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-black text-white">
      <div className="flex justify-between items-center px-5 h-16 w-full max-w-7xl mx-auto">
        {/* Brand */}
        <div
          className="cursor-pointer font-bold text-xl tracking-wider"
          onClick={() => handleNavigation("/home")}
        >
          Amrita BRS
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-x-10">
          <div className="cursor-pointer hover:text-gray-300 transition-colors" onClick={() => navigate("/home")}>Home</div>
          <div className="cursor-pointer hover:text-gray-300 transition-colors" onClick={() => navigate("/my-rides")}>My Rides</div>
          <div className="cursor-pointer hover:text-gray-300 transition-colors" onClick={() => navigate("/wallet")}>Wallet</div>

          <div className="flex items-center gap-x-3 bg-gray-900 px-3 py-1.5 rounded-full border border-gray-800">
            <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold">
              {user ? user.userName.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="text-sm font-medium">{user ? user.userName : "Guest"}</div>
          </div>

          {user ? (
            <div className="cursor-pointer bg-red-600 px-4 py-1.5 rounded-md hover:bg-red-700 transition-colors text-sm font-bold" onClick={logout}>
              Logout
            </div>
          ) : (
            <div className="cursor-pointer bg-blue-600 px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm font-bold" onClick={() => navigate("/login")}>
              Login
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="p-2 text-white focus:outline-none">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-sm border-t border-gray-800 absolute w-full left-0 shadow-xl">
          <div className="flex flex-col px-5 py-4 gap-y-4">
            <div
              className="cursor-pointer text-lg hover:text-gray-300 py-2 border-b border-gray-800"
              onClick={() => handleNavigation("/home")}
            >
              Home
            </div>
            <div
              className="cursor-pointer text-lg hover:text-gray-300 py-2 border-b border-gray-800"
              onClick={() => handleNavigation("/my-rides")}
            >
              My Rides
            </div>
            <div
              className="cursor-pointer text-lg hover:text-gray-300 py-2 border-b border-gray-800"
              onClick={() => handleNavigation("/wallet")}
            >
              Wallet
            </div>

            {/* User Profile in Mobile */}
            <div className="flex items-center gap-x-3 py-2">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold">
                {user ? user.userName.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="text-lg">{user ? user.userName : "Guest"}</div>
            </div>

            {/* Logout/Login Mobile */}
            <div className="pt-2">
              {user ? (
                <button
                  className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              ) : (
                <button
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700"
                  onClick={() => handleNavigation("/login")}
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
