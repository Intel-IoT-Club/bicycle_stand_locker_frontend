import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Homepage from "./pages/HomePage";
import RideSummary from "./pages/RideSummary";
import MyRides from "./pages/MyRides";
import { AuthProvider } from "./components/Contexts/authContext";
import BikeUnlock from "./pages/BikeUnlock";
import RideTracking from "./pages/RideTracking";
import RideStart from "./pages/RideStart";


function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/home" element={<Homepage />} />
            <Route path="/my-rides" element={<MyRides />} />
            <Route path="/ride-summary/:id" element={<RideSummary />} />
            <Route path="/ride-select" element={<BikeUnlock />} />
            <Route path="/ride-start" element={<RideStart />} />
            <Route path="/ride-tracking" element={<RideTracking />} />

          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
