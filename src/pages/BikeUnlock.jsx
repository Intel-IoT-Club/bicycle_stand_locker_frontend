import Thumbnail from "../assets/Mockup-Bicycle.png"
import Dropdown from "../components/BikeUnlock/DropDown"
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
      const res = await axios.post("http://localhost:3000/api/cycles/ride-route", {
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

    axios.post("http://localhost:3000/api/cycles/search", { boarding, destination })
      .then((res) => {
        setCycles(res.data.cycles || [])
      })
      .catch((err) => {
        console.error(err);
        setCycles([]);
      })
      .finally(() => setLoading(false));
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
      <div className="max-h-screen bg-[#F9F8E9] font-afacad p-20 flex gap-5">
        <div className="flex-1 border bg-[#016766] text-white flex items-center justify-center rounded-2xl border-2 border-black">
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

        <div className="flex-1 overflow-auto px-6">
          <div className="bg-black text-4xl text-white font-semibold flex justify-center py-2 rounded-t-2xl">Bicycle Found Near You</div>
          <div className="flex ">
            <div className="flex-col flex-1 flex relative">
              <div className="bg-[#016766] text-white flex justify-center text-3xl border cursor-pointer rounded-bl-xl p-1"
                onClick={() => setsort(prev => ({ show: !prev.show, value: prev.value, asc: prev.asc }))}>Sort By</div>

              {sortstate.show && (
                <>
                  <div className="px-3 absolute top-full left-0 w-full bg-white z-50 border-2  rounded-b-xl shadow-xl">
                    {SORT_LABELS.map((label, idx) => {
                      return <div key={idx} className={`mt-2 flex justify-between cursor-pointer border-1 p-1 
                          ${sortstate.value == idx ? 'bg-black text-white' : ''}
                        `} onClick={() => {
                          setsort(prev => ({ show: prev.show, value: idx, asc: prev.asc }))
                        }}>
                        <div>{label}</div>
                        <div onClick={() => {
                          setsort(prev => ({ show: prev.show, value: idx, asc: prev.asc.map((prevasc, index) => (idx === index) ? !prevasc : true) }))
                        }}>{sortstate.asc[idx] ? <ChevronUp /> : <ChevronDown />}</div>
                      </div>
                    })}
                    <div className="mb-2"></div>
                  </div>

                </>
              )}
            </div>


            <div className="flex-1 relative">
              <div className="bg-[#016766] text-white flex flex-1 justify-center text-3xl border cursor-pointer rounded-br-xl p-1"
                onClick={() => setfilter(prev => ({ show: !prev.show, value: prev.value }))}>Filter By</div>
              {filterstate.show && (
                <>
                  <div className="px-3 absolute top-full left-0 w-full bg-white z-50 border-2 border-[#016766] rounded-b-xl shadow-xl">
                    {FILTER_LABELS.map((label, idx) => {
                      return <div key={idx} className={`mt-2 flex justify-between cursor-pointer border-1 p-1
                          ${filterstate.value == idx ? 'bg-black text-white' : ''}
                        `} onClick={() => {
                          setfilter(prev => ({ show: prev.show, value: idx }))
                        }} >
                        <div>{label}</div>
                      </div>
                    })}
                    <div className="mb-2"></div>
                  </div>

                </>
              )}
            </div>
          </div>

          {orderedCycles.map((bike) => {
            const isSelected = selectedBikeId === bike._id;

            return (
              <>
                <div
                  key={bike._id}
                  onClick={() => handleSelectBike(bike)}
                  className={`relative flex items-center gap-5 px-2 my-3 bg-white border-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out
                  ${isSelected ? "border-[#016766] scale-[1.01] shadow-lg shadow-[#016766]/50  hover:scale-[1.02]" : "border-gray-300  hover:scale-[1.02]"}`}
                >

                  <div className="flex-1 "><img src={Thumbnail} alt="Bicycle-Thumbnail" /></div>
                  <div className="flex-2 border bg-[#F9F8E9] my-1 p-2 rounded-xl flex flex-row h-max">
                    <div className="flex-1">
                      <div className="text-xl font-semibold gap-2 flex">
                        <span>Reach destination by {Arrivaltime(bike.totalTimeMinutes).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} </span>
                        <span>({formatTime(bike.totalTimeMinutes)} )</span>
                      </div>
                      <div className="text-xl font-semibold">{bike.cycleName}</div>

                      <div className="flex justify-between items-center ">
                        <div className="flex gap-2">
                          <div className="text-lg">{bike.type}</div>
                          <span>•</span>
                          <div className="text-lg">{bike.totalDistanceKm}km</div>
                        </div>

                        <div className="bg-black text-white text-lg p-2 rounded-sm" onClick={(e) => {
                          e.stopPropagation();
                          handleStartRide(bike);
                        }}>Book Ride</div>

                      </div>

                    </div>


                  </div>

                </div>
                {isSelected && (
                  <>
                    <div className="bg-[#016766]/90 rounded-xl text-white p-4 animate-slidedown flex flex-row justify-around">
                      <div className="text-xl bg-"> Walk  {formatDistance(bike.walkDistanceKm)} to bike ({formatTime(bike.walkEtaMinutes)})</div>
                      <div className="text-xl"> Cycle {formatDistance(bike.rideDistanceKm)} to destination ({formatTime(bike.rideEtaMinutes)}) </div>
                    </div>
                    <div></div>
                  </>

                )}
              </>

            );
          })}
        </div>

      </div>
    </>
  )
}

export default BikeUnlock
