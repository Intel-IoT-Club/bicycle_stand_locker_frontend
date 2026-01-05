import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import HomeCycle from "../../assets/Home_Cycle.png";
import SearchIcon from "../../assets/Search_icon.png";
import Header from "../Header";
import axios from "axios";

const Home = () => {
  const [boarding, setBoarding] = useState("");
  const [destination, setDestination] = useState("");

  // Suggestion States
  const [boardingSuggestions, setBoardingSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showBoardingSuggestions, setShowBoardingSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  const navigate = useNavigate();
  const mapkey = import.meta.env.VITE_MAP_ACCESS_TOKEN;

  // Debounce timeout refs
  const boardingTimeoutRef = useRef(null);
  const destinationTimeoutRef = useRef(null);

  // Wrapper for click-outside
  const boardingWrapperRef = useRef(null);
  const destinationWrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (boardingWrapperRef.current && !boardingWrapperRef.current.contains(event.target)) {
        setShowBoardingSuggestions(false);
      }
      if (destinationWrapperRef.current && !destinationWrapperRef.current.contains(event.target)) {
        setShowDestinationSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query, setSuggestions) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await axios.get(`https://api.locationiq.com/v1/autocomplete`, {
        params: {
          key: mapkey,
          q: query,
          limit: 5,
          format: "json",
          countrycodes: "in" // Optional: restrict to India if relevant to the user context
        }
      });
      setSuggestions(res.data || []);
    } catch (err) {
      console.error("Autocomplete error:", err);
      setSuggestions([]);
    }
  };

  const handleBoardingChange = (e) => {
    const val = e.target.value;
    setBoarding(val);
    setShowBoardingSuggestions(true);

    if (boardingTimeoutRef.current) clearTimeout(boardingTimeoutRef.current);
    boardingTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(val, setBoardingSuggestions);
    }, 500); // 500ms debounce
  };

  const handleDestinationChange = (e) => {
    const val = e.target.value;
    setDestination(val);
    setShowDestinationSuggestions(true);

    if (destinationTimeoutRef.current) clearTimeout(destinationTimeoutRef.current);
    destinationTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(val, setDestinationSuggestions);
    }, 500);
  };

  const selectSuggestion = (item, setVal, setShow, clearSuggestions) => {
    setVal(item.display_name); // Or format how you want to display it
    setShow(false);
    clearSuggestions([]);
  };

  // Geocode place name -> coordinates (Fallback or for final check)
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
      <div className="min-h-screen bg-[#F9F8E9] pt-24 px-6 lg:px-48 font-afacad m-0">
        <div className="flex flex-col-reverse lg:flex-row justify-between gap-10 lg:gap-0 pb-10">
          <div className="flex flex-col gap-y-6 lg:gap-y-8 w-full lg:w-1/3">
            <div className="font-bold text-5xl lg:text-8xl text-center lg:text-left">Request A Ride</div>

            {/* Boarding input */}
            <div className="relative" ref={boardingWrapperRef}>
              <div className="p-3 lg:p-4 bg-[#787880]/16 rounded-3xl lg:rounded-4xl text-base pl-4 lg:pl-6 flex gap-x-3 lg:gap-x-4 items-center z-10 relative">
                <img src={SearchIcon} className="h-6 w-6 lg:h-8 lg:w-8" />
                <input
                  type="text"
                  name="boarding_point"
                  autoComplete="off"
                  placeholder="Enter Boarding Point"
                  value={boarding}
                  onChange={handleBoardingChange}
                  onFocus={() => setShowBoardingSuggestions(true)}
                  className="bg-transparent outline-none text-lg lg:text-xl flex-1 w-full"
                  aria-label="Boarding Point"
                />
              </div>
              {showBoardingSuggestions && boardingSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-2 shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                  {boardingSuggestions.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 hover:bg-gray-100 cursor-pointer text-base lg:text-lg truncate border-b last:border-b-0 border-gray-100"
                      onClick={() => selectSuggestion(item, setBoarding, setShowBoardingSuggestions, setBoardingSuggestions)}
                    >
                      {item.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Destination input */}
            <div className="relative" ref={destinationWrapperRef}>
              <div className="p-3 lg:p-4 bg-[#787880]/16 rounded-3xl lg:rounded-4xl text-base pl-4 lg:pl-6 flex gap-x-3 lg:gap-x-4 items-center z-10 relative">
                <img src={SearchIcon} className="h-6 w-6 lg:h-8 lg:w-8" />
                <input
                  type="text"
                  name="destination_point"
                  autoComplete="off"
                  placeholder="Enter Destination Point"
                  value={destination}
                  onChange={handleDestinationChange}
                  onFocus={() => setShowDestinationSuggestions(true)}
                  className="bg-transparent outline-none text-lg lg:text-xl flex-1 w-full"
                  aria-label="Destination Point"
                />
              </div>
              {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-2 shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                  {destinationSuggestions.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 hover:bg-gray-100 cursor-pointer text-base lg:text-lg truncate border-b last:border-b-0 border-gray-100"
                      onClick={() => selectSuggestion(item, setDestination, setShowDestinationSuggestions, setDestinationSuggestions)}
                    >
                      {item.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom clickable divs */}
            <div className="flex flex-col sm:flex-row w-full gap-4 lg:gap-8 text-center">
              <div
                onClick={handleAbout}
                className="p-3 lg:p-4 flex-1 bg-[#016766] text-white rounded-md text-xl lg:text-2xl relative overflow-hidden cursor-pointer shadow-md active:scale-95 transition-transform"
              >
                About us
                <div className="absolute inset-0 bg-white opacity-0 hover:opacity-25  transition-opacity rounded-md"></div>
              </div>

              <div
                onClick={handleSearch}
                className="p-3 lg:p-4 flex-1 bg-[#000000] text-white rounded-md text-xl lg:text-2xl relative overflow-hidden cursor-pointer shadow-md active:scale-95 transition-transform"
              >
                Search Rides
                <div className="absolute inset-0 bg-white opacity-0 hover:opacity-25 transition-opacity rounded-md"></div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex justify-center">
            <img src={HomeCycle} className="max-w-full h-auto object-contain" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
