import Thumbnail from "../assets/Mockup-Bicycle.png"
import Dropdown from "../components/BikeUnlock/DropDown"
import Header from "../components/Header";
import MapView from "../components/MapView";
import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronDown, ChevronUp } from "lucide-react";

const formatTime = (minutes) => {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hrs} hr ${mins} min`;
};

const Arrivaltime = (minutes) => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + minutes)
  return now
}

const formatDistance = (km) => {
  if (!km && km !== 0) return "N/A"; // handle undefined/null
  const num = typeof km === "string" ? parseFloat(km) : km;
  if (num < 1) return `${Math.round(num * 1000)} m`;
  return `${num.toFixed(2)} km`;
};

const BikeUnlock = () => {
  const location = useLocation();
  const { boarding, destination } = location.state || {};
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBikeId, setSelectedBikeId] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [bikeDistance, setBikeDistance] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const navigate = useNavigate();


  const SORT_LABELS = ["Total time", "walk time", "ride time"]
  const FILTER_LABELS = ["All", "Geared", "NonGeared"]

  const [sortstate, setsort] = useState({ show: false, value: 0, asc: SORT_LABELS.map(x => true) })
  const [filterstate, setfilter] = useState({ show: false, value: 0 })

  const orderedCycles = useMemo(() => {
    const idx = sortstate.value;
    const asc = sortstate.asc[idx];

    return [...cycles].sort((a, b) => {
      if (idx === 0) return asc ? a.totalTimeMinutes - b.totalTimeMinutes : b.totalTimeMinutes - a.totalTimeMinutes;
      if (idx === 1) return asc ? a.walkEtaMinutes - b.walkEtaMinutes : b.walkEtaMinutes - a.walkEtaMinutes;
      if (idx === 2) return asc ? a.rideEtaMinutes - b.rideEtaMinutes : b.rideEtaMinutes - a.rideEtaMinutes;
      return 0;
    }).filter((cycle) => {
      if (filterstate.value == 0) return true
      else return cycle.type === FILTER_LABELS[filterstate.value]
    }
    )
  }, [cycles, sortstate, filterstate]);



  const handleSelectBike = async (bike) => {
    setSelectedBikeId(bike._id);

    if (!boarding || !destination) return;

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/cycles/ride-route`, {
        boarding,
        bike,
        destination
      });

      const { geometry } = res.data;
      setRouteCoords(geometry);

      setBikeDistance(bike.walkDistanceKm);

    } catch (err) {
      console.error(err);
    }
  };

  const handleStartRide = (bike) => {
    navigate(`/ride-start`, {
      state: {
        boarding,
        destination,
        bike, // send full object to next page
      },
    });
  };

  // Fetch Current GEOLOCATION
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error fetching current location:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!boarding || !destination) {
      setLoading(false);
      return;
    }

    const fetchCycles = () => {
      axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/cycles/search`, { boarding, destination })
        .then((res) => {
          setCycles(res.data.cycles || [])
        })
        .catch((err) => {
          console.error(err);
          // Don't clear cycles on error to avoid flickering if one request fails
        })
        .finally(() => setLoading(false));
    };

    fetchCycles(); // Initial fetch

    // Poll every 5 seconds to keep availability fresh
    const interval = setInterval(fetchCycles, 5000);
    return () => clearInterval(interval);
  }, [boarding, destination]);

  if (loading) return (<>
    <div className="min-h-screen bg-[#F9F8E9]">
      <div className="text-4xl  absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex">
        <div className="mr-2">Loading rides near you</div>
        <div className="animate-bounce">.</div>
        <div className="animate-bounce delay-100">.</div>
        <div className="animate-bounce delay-200">.</div>
      </div>;
    </div>
  </>)

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F9F8E9] font-afacad pt-20 px-4 lg:px-20 pb-10 flex flex-col lg:flex-row gap-5">
        {/* Map Container - Full Width on Mobile, Half on Desktop */}
        <div className="w-full lg:flex-1 h-[50vh] lg:h-auto bg-[#016766] text-white flex items-center justify-center rounded-2xl border-2 border-black overflow-hidden relative">
          <MapView
            boarding={boarding}
            destination={destination}
            cycles={cycles}
            selectedBikeId={selectedBikeId}
            onSelectBike={handleSelectBike}
            routeCoords={routeCoords}
            bikeDistance={bikeDistance}
            currentLocation={currentLocation}
          />
        </div>

        {/* List Container */}
        <div className="w-full lg:flex-1 flex flex-col">
          <div className="bg-black text-2xl lg:text-4xl text-white font-semibold flex justify-center py-3 rounded-t-2xl">
            Bicycle Found Near You
          </div>

          <div className="flex w-full">
            {/* Sort Button */}
            <div className="flex-1 relative">
              <div
                className="bg-[#016766] text-white flex justify-center items-center text-xl lg:text-3xl border cursor-pointer rounded-bl-xl p-2 lg:p-1 hover:bg-[#015050] transition-colors"
                onClick={() => setsort(prev => ({ show: !prev.show, value: prev.value, asc: prev.asc }))}
              >
                Sort By
              </div>

              {sortstate.show && (
                <div className="absolute top-full left-0 w-full bg-white z-50 border-2 border-gray-200 rounded-b-xl shadow-xl">
                  {SORT_LABELS.map((label, idx) => (
                    <div
                      key={idx}
                      className={`flex justify-between items-center cursor-pointer p-3 border-b last:border-b-0 hover:bg-gray-50
                          ${sortstate.value === idx ? 'bg-black text-white hover:bg-gray-800' : 'text-gray-800'}
                        `}
                      onClick={() => setsort(prev => ({ show: prev.show, value: idx, asc: prev.asc }))}
                    >
                      <div className="font-semibold">{label}</div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setsort(prev => ({ show: prev.show, value: idx, asc: prev.asc.map((prevasc, index) => (idx === index) ? !prevasc : true) }))
                        }}
                      >
                        {sortstate.asc[idx] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Button */}
            <div className="flex-1 relative">
              <div
                className="bg-[#016766] text-white flex justify-center items-center text-xl lg:text-3xl border cursor-pointer rounded-br-xl p-2 lg:p-1 hover:bg-[#015050] transition-colors"
                onClick={() => setfilter(prev => ({ show: !prev.show, value: prev.value }))}
              >
                Filter By
              </div>
              {filterstate.show && (
                <div className="absolute top-full left-0 w-full bg-white z-50 border-2 border-[#016766] rounded-b-xl shadow-xl">
                  {FILTER_LABELS.map((label, idx) => (
                    <div
                      key={idx}
                      className={`cursor-pointer p-3 border-b last:border-b-0 font-semibold hover:bg-gray-50
                          ${filterstate.value === idx ? 'bg-black text-white hover:bg-gray-800' : 'text-gray-800'}
                        `}
                      onClick={() => setfilter(prev => ({ show: prev.show, value: idx }))}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4 overflow-y-auto max-h-[500px]">
            {orderedCycles.map((bike) => {
              const isSelected = selectedBikeId === bike._id;

              return (
                <div key={bike._id} className="flex flex-col">
                  <div
                    onClick={() => handleSelectBike(bike)}
                    className={`relative flex flex-col sm:flex-row items-center gap-4 p-3 bg-white border-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out
                      ${isSelected ? "border-[#016766] ring-2 ring-[#016766]/20 shadow-lg scale-[1.01]" : "border-gray-300 hover:border-gray-400"}`}
                  >
                    <div className="w-full sm:w-1/3 flex justify-center">
                      <img src={Thumbnail} alt="Bicycle-Thumbnail" className="h-24 object-contain" />
                    </div>

                    <div className="w-full sm:w-2/3 bg-[#F9F8E9] p-3 rounded-xl flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#016766]">
                            Reach by {Arrivaltime(bike.totalTimeMinutes).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-xs text-gray-600">({formatTime(bike.totalTimeMinutes)})</span>
                        </div>
                        <div className="text-lg font-bold">{bike.cycleName}</div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                          <span>{bike.type}</span>
                          <span className="text-gray-400">•</span>
                          <span>{bike.totalDistanceKm} km</span>
                        </div>

                        <button
                          className="bg-black text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-gray-800 active:scale-95 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartRide(bike);
                          }}
                        >
                          Book Ride
                        </button>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-2 bg-[#016766] rounded-xl text-white p-4 animate-slidedown flex flex-col sm:flex-row justify-between items-center gap-2 text-center text-sm sm:text-base font-medium">
                      <div>Walk {formatDistance(bike.walkDistanceKm)} to bike ({formatTime(bike.walkEtaMinutes)})</div>
                      <div className="hidden sm:block text-white/50">|</div>
                      <div>Cycle {formatDistance(bike.rideDistanceKm)} to dest ({formatTime(bike.rideEtaMinutes)})</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </>
  )
}

export default BikeUnlock
