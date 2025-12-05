import { createContext, useContext, useState, useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Full user object
    const [loadingUser, setLoadingUser] = useState(true); // NEW
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const initializeUser = async () => {
        setLoadingUser(true);
        try {
          // Optional: Validate token expiration (based on jwtDecode)
          const decoded = jwtDecode(token);
          if (Date.now() >= decoded.exp * 1000) {
            // Token expired
            logout();
            return;
          }

          // Fetch full user profile from backend
          console.log(decoded);
          const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          });

          if (res.data.fetched) {
            setUser(res.data.user); // Store full DB user
          } else {
            logout();
          }
        } catch (err) {
          console.error("Auth initialization error:", err);
          logout();
        }finally{
          setLoadingUser(false);
        }
  };
    useEffect(() => {
    if (!token){
      setLoadingUser(false);
      return;
    }
    initializeUser();
    }, [token]);
    const logout = () => {
      localStorage.removeItem("token");
      setUser(null);
    };
    const login = async (token, userDataFromBackend = null) => {
        localStorage.setItem("token", token);
        if (userDataFromBackend) {
          setUser(userDataFromBackend);
        } else {
          // fallback: fetch user
          try {
            console.log("is it so")
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
            });
            if (res.data.fetched){ 
              setUser(res.data.user);
            }
          } catch (err) {
            console.error("Error fetching user after login:", err);
          }
    }
  };
    return (
        <AuthContext.Provider value={{ user, login, logout, loadingUser }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => useContext(AuthContext);
