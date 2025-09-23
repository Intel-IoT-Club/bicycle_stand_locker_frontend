import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Homepage from "./pages/HomePage";
import RideSummary from "./pages/RideSummary";
import MyRides from "./pages/MyRides";
import BikeUnlock from "./pages/BikeUnlock";

function App() {
  return (
    <>
      {/* <Homepage/> */}
      {/* <MyRides/> */}
      <BikeUnlock/>
      <Router>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/ride-summary" element={<RideSummary />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
