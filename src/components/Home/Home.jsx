import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeCycle from "../../assets/Home_Cycle.png";
import SearchIcon from "../../assets/Search_icon.png";
import Header from "../Header";

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
      <div className="min-h-screen bg-[#F9F8E9] pt-30 px-48 font-afacad m-0">
        <div className="flex justify-between">
          <div className="flex flex-col gap-y-8 w-1/3 ">
            <div className="font-bold text-8xl ">Request A Ride</div>

            {/* Boarding input */}
            <div className="p-4 bg-[#787880]/16 rounded-4xl text-base pl-6 flex gap-x-4 items-center">
              <img src={SearchIcon} className="h-8 w-8" />
              <input
                type="text"
                name="boarding_point"
                autoComplete="on"
                placeholder="Enter Boarding Point"
                value={boarding}
                onChange={(e) => setBoarding(e.target.value)}
                className="bg-transparent outline-none text-xl flex-1"
                aria-label="Boarding Point"
              />
            </div>

            {/* Destination input */}
            <div className="p-4 bg-[#787880]/16 rounded-4xl text-base pl-6 flex gap-x-4 items-center">
              <img src={SearchIcon} className="h-8 w-8" />
              <input
                type="text"
                name="destination_point"
                autoComplete="on"
                placeholder="Enter Destination Point"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="bg-transparent outline-none text-xl flex-1"
                aria-label="Destination Point"
              />
            </div>

            {/* Custom clickable divs */}
            <div className="flex w-full gap-8 text-center">
              <div
                onClick={handleAbout}
                className="p-4 flex-1 bg-[#016766] text-white rounded-md text-2xl relative overflow-hidden cursor-pointer"
              >
                About us
                <div className="absolute inset-0 bg-white opacity-0 hover:opacity-25  transition-opacity rounded-md"></div>
              </div>

              <div
                onClick={handleSearch}
                className="p-4 flex-1 bg-[#000000] text-white rounded-md text-2xl relative overflow-hidden cursor-pointer"
              >
                Search Rides
                <div className="absolute inset-0 bg-white opacity-0 hover:opacity-25 transition-opacity rounded-md"></div>
              </div>
            </div>
          </div>

          <div className="w-1/2">
            <img src={HomeCycle} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
