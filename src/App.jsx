import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Header from "./components/Auth/header";
import Home from "./pages/Home";
import AboutPage from "./pages/AboutPage";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          {/* <Route path="/about" element={<AboutPage />} /> */}
          {/* <Route path="/home" element={<Home />} /> */}
        </Routes>
      </Router>
    </>
  );
}

export default App;
