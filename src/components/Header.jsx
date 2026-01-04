import { useState } from "react";
import { useAuth } from "./Contexts/authContext";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: "Home", path: "/home" },
    { name: "My Rides", path: "/my-rides" },
    { name: "Wallet", path: "/wallet" }
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 px-4 py-3">
        <div className="glass rounded-xl flex items-center justify-between px-6 py-3 mx-auto max-w-7xl relative z-50">
          {/* Logo */}
          <div
            className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent cursor-pointer"
            onClick={() => navigate(user ? "/home" : "/")}
          >
            Amrita BRS
          </div>

          {/* Desktop Nav */}
          {user && (
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
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

          {/* User Profile / Logout (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <div className="flex flex-col items-end text-right">
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

          {/* Mobile Menu Button */}
          {user && (
            <button
              className="md:hidden p-2 text-slate-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && user && (
        <div className="fixed inset-0 z-40 glass-dark bg-black/40 backdrop-blur-xl flex flex-col pt-24 px-6 md:hidden animate-in slide-in-from-top-10 duration-300">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`text-2xl font-bold py-4 border-b border-white/10 ${isActive(link.path) ? "text-teal-400" : "text-white"}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-lg">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-white font-bold">{user.username}</div>
                <div className="text-teal-300 text-xs">Student Account</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-black px-6 py-2 rounded-lg font-bold"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
