import { useAuth } from "./Contexts/authContext";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-4 py-3">
      <div className="glass rounded-xl flex items-center justify-between px-6 py-3 mx-auto max-w-7xl">
        {/* Logo */}
        <div
          className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent cursor-pointer"
          onClick={() => navigate(user ? "/home" : "/")}
        >
          Amrita BRS
        </div>

        {/* Nav Links */}
        {user && (
          <nav className="hidden md:flex items-center gap-8">
            {[
              { name: "Home", path: "/home" },
              { name: "My Rides", path: "/my-rides" },
              { name: "Wallet", path: "/wallet" }
            ].map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors ${isActive(link.path)
                    ? "text-teal-700 font-semibold"
                    : "text-slate-500 hover:text-teal-600"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        )}

        {/* User Profile / Logout */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden md:flex flex-col items-end text-right">
                <span className="text-xs font-bold text-slate-800">{user.username}</span>
                <span className="text-[10px] text-slate-400 font-medium">STUDENT</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs ring-2 ring-white shadow-sm">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-800 transition-all shadow-md ml-2"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="bg-teal-600 text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-teal-700 transition-all shadow-lg hover:shadow-teal-500/20"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
