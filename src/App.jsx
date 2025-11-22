import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
function App() {
  const { user } = useAuth();

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/home" replace /> : <AuthPage />}
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/home" replace /> : <AuthPage />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/home" replace /> : <AuthPage />}
          />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Homepage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ride-summary"
            element={
              <ProtectedRoute>
                <RideSummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-rides"
            element={
              <ProtectedRoute>
                <MyRides />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ride-select"
            element={
              <ProtectedRoute>
                <BikeUnlock />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ride-start"
            element={
              <ProtectedRoute>
                <RideStart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ride-tracking"
            element={
              <ProtectedRoute>
                <RideTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <WalletPage />
              </ProtectedRoute>
            }
          />

        </Routes>
      </Router>
    </>
  );
}

export default App;
