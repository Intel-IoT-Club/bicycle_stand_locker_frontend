import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Homepage from "./pages/HomePage";
import RideSummary from "./pages/RideSummary";
import MyRides from "./pages/MyRides";
import BikeUnlock from "./pages/BikeUnlock";
import RideTracking from "./pages/RideTracking";
import RideStart from "./pages/RideStart";

function App() {
  return (
    <>
      {/* <Homepage/>
      <BikeUnlock/>
      <RideTracking/>
      <RideSummary/>
      <MyRides/> */}
      <Router>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/ride-summary" element={<RideSummary />} />
          <Route path="/ride-select" element={<BikeUnlock />} />
          <Route path="/ride-start" element={<RideStart />} />
          <Route path="/ride-tracking" element={<RideTracking />} />

        </Routes>
      </Router>
    </>
  );
}

export default App;
