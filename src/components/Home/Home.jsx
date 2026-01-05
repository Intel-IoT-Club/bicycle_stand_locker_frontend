import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeCycle from "../../assets/Home_Cycle.png";
import SearchIcon from "../../assets/Search_icon.png";
import Header from "../Header";
import LocationInput from "./LocationInput";

const Home = () => {
  const [boarding, setBoarding] = useState("");
  const [destination, setDestination] = useState("");
  const navigate = useNavigate();
  const mapkey = import.meta.env.VITE_MAP_ACCESS_TOKEN;

  // Geocode place name -> coordinates
  const getCoordinates = async (place) => {
    try {
      const res = await fetch(
        `https://us1.locationiq.com/v1/search?key=${mapkey}&q=${encodeURIComponent(
          place
        )}&format=json`
      );
      const data = await res.json();
      if (data && data[0]) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch (err) {
      console.error("Geocoding error:", err);
      return null;
    }
  };

  const handleAbout = () => {
    document.getElementById("about-us")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearch = async () => {
    if (!boarding || !destination) {
      alert("Please enter both Boarding and Destination points!");
      return;
    }
    const boardingCoords = await getCoordinates(boarding);
    const destinationCoords = await getCoordinates(destination);

    if (!boardingCoords || !destinationCoords) {
      alert("Could not fetch location data. Try again.");
      return;
    }

    // Navigate to ride-select page with coordinates
    navigate("/ride-select", {
      state: { boarding: boardingCoords, destination: destinationCoords },
    });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F9F8E9] pt-24 pb-12 px-4 sm:px-8 lg:px-20 xl:px-48 font-afacad overflow-x-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-12 lg:gap-20">
          {/* Form Side */}
          <div className="flex flex-col gap-y-8 w-full lg:w-1/2">
            <h1 className="font-black text-6xl sm:text-7xl lg:text-8xl leading-tight tracking-tighter text-black uppercase">
              Request A <span className="text-[#016766]">Ride</span>
            </h1>

            <div className="space-y-4">
              {/* Boarding input */}
              <LocationInput
                label="Enter Boarding Point"
                value={boarding}
                onChange={setBoarding}
                onSelect={(place) => {
                  // Optional: Store coords immediately if needed, 
                  // but Home currently fetches on search click. 
                  // We can optimize later.
                }}
              />

              {/* Destination input */}
              <LocationInput
                label="Enter Destination Point"
                value={destination}
                onChange={setDestination}
                onSelect={(place) => { }}
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row w-full gap-4 pt-4">
              <button
                onClick={handleAbout}
                className="p-4 flex-1 bg-[#016766] text-white rounded-2xl text-xl lg:text-2xl font-black uppercase border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                About us
              </button>

              <button
                onClick={handleSearch}
                className="p-4 flex-1 bg-black text-white rounded-2xl text-xl lg:text-2xl font-black uppercase border-4 border-black shadow-[6px_6px_0px_0px_rgba(1,103,102,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                Search Rides
              </button>
            </div>
          </div>

          {/* Visual Side */}
          <div className="w-full lg:w-1/2 relative">
            <div className="absolute -inset-4 bg-[#016766]/10 rounded-full blur-3xl animate-pulse"></div>
            <img
              src={HomeCycle}
              alt="Bicycle Illustration"
              className="relative w-full max-w-[600px] mx-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

