import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import HomeCycle from "../../assets/Home_Cycle.png";
import SearchIcon from "../../assets/Search_icon.png";
import Header from "../Header";

const Home = () => {
  const [boarding, setBoarding] = useState("");
  const [destination, setDestination] = useState("");
  const navigate = useNavigate();
  const containerRef = useRef();
  const cycleRef = useRef();
  const mapkey = import.meta.env.VITE_MAP_ACCESS_TOKEN;

  // GSAP Animations
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    // 1. Cycle slides in from right with bounce
    tl.from(cycleRef.current, {
      x: 200,
      opacity: 0,
      duration: 1.5,
      ease: "elastic.out(1, 0.75)",
    })
    // 2. Text and inputs stagger in from left
    .from(".hero-element", {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
    }, "-=1.2"); 
  }, { scope: containerRef });

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

    navigate("/ride-select", {
      state: { boarding: boardingCoords, destination: destinationCoords },
    });
  };

  return (
    <div ref={containerRef}>
      <Header />
      <div className="min-h-screen bg-[#F9F8E9] pt-30 px-12 lg:px-48 font-afacad m-0 overflow-hidden relative">
        {/* Background Blob */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-[#016766]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row justify-between items-center h-full">
          <div className="flex flex-col gap-y-8 w-full lg:w-1/3 z-10">
            <div className="hero-element font-bold text-7xl lg:text-8xl tracking-tight leading-[0.9] text-black">
              Request <br /> A Ride
            </div>

            {/* Boarding input */}
            <div className="hero-element group p-4 bg-white/50 backdrop-blur-sm rounded-4xl text-base pl-6 flex gap-x-4 items-center border-2 border-black/10 focus-within:border-black focus-within:bg-white transition-all duration-300 shadow-sm hover:shadow-md">
              <img src={SearchIcon} className="h-8 w-8 opacity-40 group-focus-within:opacity-100 transition-opacity" />
              <input
                type="text"
                name="boarding_point"
                autoComplete="on"
                placeholder="Enter Boarding Point"
                value={boarding}
                onChange={(e) => setBoarding(e.target.value)}
                className="bg-transparent outline-none text-xl flex-1 font-bold placeholder-gray-400 text-black"
                aria-label="Boarding Point"
              />
            </div>

            {/* Destination input */}
            <div className="hero-element group p-4 bg-white/50 backdrop-blur-sm rounded-4xl text-base pl-6 flex gap-x-4 items-center border-2 border-black/10 focus-within:border-black focus-within:bg-white transition-all duration-300 shadow-sm hover:shadow-md">
              <img src={SearchIcon} className="h-8 w-8 opacity-40 group-focus-within:opacity-100 transition-opacity" />
              <input
                type="text"
                name="destination_point"
                autoComplete="on"
                placeholder="Enter Destination Point"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="bg-transparent outline-none text-xl flex-1 font-bold placeholder-gray-400 text-black"
                aria-label="Destination Point"
              />
            </div>

            {/* Buttons */}
            <div className="hero-element flex w-full gap-8 text-center mt-2">
              <button
                onClick={handleAbout}
                className="flex-1 py-4 bg-[#016766] text-white rounded-xl text-xl font-bold relative overflow-hidden group border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              >
                <span className="relative z-10">About us</span>
                <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              </button>

              <button
                onClick={handleSearch}
                className="flex-1 py-4 bg-black text-white rounded-xl text-xl font-bold relative overflow-hidden group border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              >
                <span className="relative z-10">Search Rides</span>
                <div className="absolute inset-0 bg-[#016766] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              </button>
            </div>
          </div>

          <div className="w-full lg:w-1/2 relative mt-10 lg:mt-0">
            <img ref={cycleRef} src={HomeCycle} className="w-full drop-shadow-2xl hover:scale-105 transition-transform duration-500 ease-out" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;