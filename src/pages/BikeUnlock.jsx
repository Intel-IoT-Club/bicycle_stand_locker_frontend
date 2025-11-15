import Thumbnail from "../assets/Mockup-Bicycle.png"
import Dropdown from "../components/BikeUnlock/DropDown"
import MapView from "../components/MapView";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const formatTime = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hrs} hr ${mins} min`;
};    

const formatDistance = (km) => {
  if (!km && km !== 0) return "N/A"; // handle undefined/null
  const num = typeof km === "string" ? parseFloat(km) : km;
  if (num < 1) return `${Math.round(num * 1000)} m`;
  return `${num.toFixed(2)} km`;
};

const calculatePrice = (distanceKm, type) => {
  let baseFare = 10;
  let perKm = type === "Geared" ? 12 : 10;
  return (baseFare + distanceKm * perKm).toFixed(2);
};


const BikeUnlock=()=>{
  const location = useLocation();
  const { boarding, destination } = location.state || {};
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBikeId, setSelectedBikeId] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [bikeDistance, setBikeDistance] = useState(null);
  const [totalTime, setTotalTime] = useState(null);
  const [totalDist, setTotalDist] = useState(null);
  const navigate = useNavigate();

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
      setTotalDist(bike.totalDistanceKm);
      setRouteCoords(geometry);
      setTotalTime(bike.totalTimeMinutes);

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


  useEffect(() => {

    if (!boarding || !destination) {
      setLoading(false);
      return;
    }

    axios.post("http://localhost:3000/api/cycles/search", { boarding, destination })
      .then((res) => {
        console.log("Fetched cycles:", res.data.cycles);
        setCycles(res.data.cycles || [])
      })
      .catch((err) => {
        console.error(err);
        setCycles([]);
      })
      .finally(() => setLoading(false));
  }, [boarding, destination]);

  if (loading) return <div className="p-20 text-3xl">Loading rides near you...</div>;

  return(
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
            />
          </div>

          <div className="flex-1 overflow-auto px-6">
              <div className="bg-black text-4xl text-white font-semibold flex justify-center py-2 rounded-t-2xl">Bicycle Found Near You</div>
              <div className="flex">
                  <div className="bg-[#016766] text-white flex flex-1 justify-center text-3xl border">Sort By</div>
                  <div className="bg-[#016766] text-white flex flex-1 justify-center text-3xl border">Filter By</div>
              </div>
              <div className="text-2xl font-semibold">
                Choose A Ride
                {totalTime && (
                  <div className="text-xl mb-3 text-[#016766] font-semibold">
                    Estimated Total Ride Time: {formatTime(totalTime)} | Total distance: {formatDistance(totalDist)}
                  </div>
                )}
              </div>
              {cycles.map((bike)=>{
              const isSelected = selectedBikeId === bike._id;

              return(
              <div
                key={bike._id}
                onClick={() => handleSelectBike(bike)}
                className={`relative flex items-center gap-5 px-5 my-3 bg-white border-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out
                  ${isSelected ? "border-[#016766] scale-[1.01] shadow-lg shadow-[#016766]/50  hover:scale-[1.02]" : "border-gray-300  hover:scale-[1.02]"}`}
              >
                <div className="flex-1 "><img src={Thumbnail} alt="Bicycle-Thumbnail"/></div>
                <div className="flex-2 border bg-[#F9F8E9] my-1 p-2 rounded-xl flex flex-row justify-between h-max">
                  <div className="flex-3 ">
                    <div className="text-3xl font-semibold">{bike.cycleName} | {formatTime(bike.walkEtaMinutes)}</div>
                    <div className="text-2xl font-semibold">{bike.type}</div>
                    <div className="text-xl ">{new Date(bike.lastSeen).toLocaleString("en-IN", {day: "2-digit",month: "2-digit",year: "numeric",hour: "2-digit",minute: "2-digit"})} </div>                   
                  </div>
                  <div className="flex-2 text-white font-semibold">
                    <div className="bg-black w-auto rounded-sm w-max text-2xl px-4 py-2 relative translate-x-2/4 translate-y-1/8">
                      {calculatePrice(bike.rideDistanceKm, bike.type)}₹
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartRide(bike);
                        }}
                        className="cursor-pointer bg-[#016766] rounded-sm w-max text-2xl px-4 py-2 absolute hover:bg-[#025b58] active:scale-95 transition-all"
                      >
                        Use Bike
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              );        
              })}
              </div>
            
        </div>
      </>
  )
}

export default BikeUnlock
