import { useAuth } from "./Contexts/authContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", path: "/home" },
    { label: "My Rides", path: "/my-rides" },
    { label: "Wallet", path: "/wallet" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-black text-white border-b-2 border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="cursor-pointer font-black text-2xl tracking-tighter hover:text-[#016766] transition-colors"
            onClick={() => navigate("/home")}
          >
            AMRITA <span className="text-[#016766]">BRS</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 font-bold text-sm uppercase tracking-widest">
            {navItems.map((item) => (
              <div
                key={item.path}
                className="cursor-pointer hover:text-[#016766] transition-colors"
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </div>
            ))}

            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full border border-white/20">
              <div className="w-8 h-8 bg-[#016766] rounded-full flex items-center justify-center text-xs font-black">
                {user ? user.userName.charAt(0).toUpperCase() : "G"}
              </div>
              <span className="text-xs truncate max-w-[100px]">{user ? user.userName : "Guest"}</span>
            </div>

            {user ? (
              <button
                className="bg-red-600 px-4 py-2 rounded-lg font-black text-xs hover:bg-red-700 active:scale-95 transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]"
                onClick={logout}
              >
                LOGOUT
              </button>
            ) : (
              <button
                className="bg-[#016766] px-4 py-2 rounded-lg font-black text-xs hover:bg-[#015554] active:scale-95 transition-all"
                onClick={() => navigate("/login")}
              >
                LOGIN
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-white/10"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-b-2 border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <div
                key={item.path}
                className="block px-3 py-4 rounded-md text-base font-bold uppercase tracking-widest hover:bg-white/10"
                onClick={() => {
                  navigate(item.path);
                  setIsMenuOpen(false);
                }}
              >
                {item.label}
              </div>
            ))}
            <div className="border-t border-white/10 pt-4 pb-3">
              <div className="flex items-center px-5 mb-4">
                <div className="w-10 h-10 bg-[#016766] rounded-full flex items-center justify-center text-lg font-black">
                  {user ? user.userName.charAt(0).toUpperCase() : "G"}
                </div>
                <div className="ml-3">
                  <div className="text-base font-bold">{user ? user.userName : "Guest"}</div>
                </div>
              </div>
              <div className="px-5">
                {user ? (
                  <button
                    className="w-full bg-red-600 py-3 rounded-xl font-black text-sm text-center uppercase"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    className="w-full bg-[#016766] py-3 rounded-xl font-black text-sm text-center uppercase"
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

