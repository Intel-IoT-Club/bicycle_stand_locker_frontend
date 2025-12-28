import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Homepage from "./pages/HomePage";
import RideSummary from "./pages/RideSummary";
import MyRides from "./pages/MyRides";
import BikeUnlock from "./pages/BikeUnlock";
import RideTracking from "./pages/RideTracking";
import RideStart from "./pages/RideStart";
import WalletPage from "./pages/WalletPage";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";

const MainLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/home" /> : <AuthPage />} />
        <Route path="/signup" element={user ? <Navigate to="/home" /> : <AuthPage />} />
        <Route path="/" element={user ? <Navigate to="/home" /> : <AuthPage />} />

        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/home" element={<Homepage />} />
          <Route path="/ride-summary" element={<RideSummary />} />
          <Route path="/my-rides" element={<MyRides />} />
          <Route path="/ride-select" element={<BikeUnlock />} />
          <Route path="/ride-start" element={<RideStart />} />
          <Route path="/ride-tracking" element={<RideTracking />} />
          <Route path="/wallet" element={<WalletPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
