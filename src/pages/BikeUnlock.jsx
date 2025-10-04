import Thumbnail from "../assets/Mockup-Bicycle.png"
import Dropdown from "../components/BikeUnlock/DropDown"
import MapView from "../components/MapView";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const NearbyBikes = [
  {
    time: "01:23PM",
    duration: "5 min",
    bike_name: "Trek Domane AL 2",
    type: "Non-Geared",
    price: "₹30.03",
    button: "Start Ride",
  },
  {
    time: "01:21PM",
    duration: "10 min",
    bike_name: "Mach City iBike",
    type: "Geared",
    price: "₹45.73",
    button: "Start Ride",
  },
  {
    time: "01:31PM",
    duration: "10 min",
    bike_name: "Hero Lectro C5",
    type: "Non-Geared",
    price: "₹50.21",
    button: "Start Ride",
  },
  {
    time: "01:40PM",
    duration: "15 min",
    bike_name: "Btwin Rockrider 340",
    type: "Geared",
    price: "₹65.10",
    button: "Start Ride",
  },
  {
    time: "01:55PM",
    duration: "7 min",
    bike_name: "Firefox Rapide",
    type: "Non-Geared",
    price: "₹28.45",
    button: "Start Ride",
  },
  {
    time: "02:05PM",
    duration: "20 min",
    bike_name: "Giant Escape 3",
    type: "Geared",
    price: "₹82.30",
    button: "Start Ride",
  },
]


const BikeUnlock=()=>{
  const location = useLocation();
  const { boarding, destination } = location.state || {};
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBikeId, setSelectedBikeId] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [bikeDistance, setBikeDistance] = useState(null);
  const [totalTime, setTotalTime] = useState(null);

  const mapkey = import.meta.env.VITE_MAP_ACCESS_TOKEN;

  const handleSelectBike = async (bike) => {
    setSelectedBikeId(bike._id);

    if (!boarding || !destination) return;

    try {
      // Boarding -> Bike
      const res1 = await axios.get(`https://us1.locationiq.com/v1/directions/driving/${boarding.lng},${boarding.lat};${bike.location.coordinates[0]},${bike.location.coordinates[1]}?key=${mapkey}&overview=full&geometries=geojson`);
      const routeToBike = res1.data.routes[0].geometry.coordinates;
      const dist1 = res1.data.routes[0].distance / 1000; // km
      const dur1 = res1.data.routes[0].duration / 60; // min

      // Bike -> Destination
      const res2 = await axios.get(`https://us1.locationiq.com/v1/directions/driving/${bike.location.coordinates[0]},${bike.location.coordinates[1]};${destination.lng},${destination.lat}?key=${mapkey}&overview=full&geometries=geojson`);
      const routeToDest = res2.data.routes[0].geometry.coordinates;
      const dist2 = res2.data.routes[0].distance / 1000;
      const dur2 = res2.data.routes[0].duration / 60;

      setRouteCoords([...routeToBike, ...routeToDest]);

      // Save distances/time
      setBikeDistance(dist1.toFixed(2));
      setTotalTime(Math.round(dur1 + dur2));
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hrs} hr ${mins} min`;
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

          <div className="flex-1 overflow-auto">
              <div className="bg-black text-4xl text-white font-semibold flex justify-center py-2 rounded-t-2xl">Bicycle Found Near You</div>
              <div className="flex">
                  <div className="bg-[#016766] text-white flex flex-1 justify-center text-3xl border">Sort By</div>
                  <div className="bg-[#016766] text-white flex flex-1 justify-center text-3xl border">Filter By</div>
              </div>
              <div className="text-2xl font-semibold">
                Choose A Ride
                {totalTime && (
                  <div className="text-xl mb-3 text-[#016766] font-semibold">
                    🚴 Estimated Total Ride Time: {formatTime(totalTime)}
                  </div>
                )}
              </div>
              
              
                      {cycles.map((bike)=>(
                  <div className="bg-white border flex h-auto w-full px-6 gap-5" key={bike._id} onClick={() => handleSelectBike(bike)}>
                      <div className="flex-1 "><img src={Thumbnail} alt="Bicycle-Thumbnail"/></div>
                      <div className="flex-2 border bg-[#F9F8E9] my-7.5 rounded-xl flex">
                          <div className="flex-3 ">
                              <div className="text-4xl font-semibold">{new Date(bike.lastSeen).toLocaleString("en-IN", {day: "2-digit",month: "2-digit",year: "numeric",hour: "2-digit",minute: "2-digit"})} | 68 min</div>
                              <div className="text-2xl font-semibold">{bike.cycleName}</div>
                              <div className="text-xl ">{bike.type}</div>
                              
                          </div>
                          <div className="flex-2 text-white font-semibold">
                              <div className="bg-black w-auto rounded-sm w-max text-2xl px-4 py-2 relative translate-x-1/4 translate-y-1/4">68₹
                                    <div className="bg-[#016766] rounded-sm w-max text-2xl  px-4 py-2 absolute">Start Ride</div>
                              </div>
                              
                          </div>
                      </div>

                  </div>         
              ))}
              </div>
            
        </div>
      </>
  )
}

export default BikeUnlock
