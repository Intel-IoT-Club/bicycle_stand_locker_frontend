import Thumbnail from "../assets/Mockup-Bicycle.png"
import MapView from "../components/MapView";
import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronDown, ChevronUp, Filter, SortAsc, Navigation } from "lucide-react";
import { useAuth } from "../components/Contexts/authContext";
import Header from "../components/Header";

const formatTime = (minutes) => {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hrs}h ${mins}m`;
};

const Arrivaltime = (minutes) => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + minutes)
  return now
}

const formatDistance = (km) => {
  if (!km && km !== 0) return "N/A";
  const num = typeof km === "string" ? parseFloat(km) : km;
  if (num < 1) return `${Math.round(num * 1000)}m`;
  return `${num.toFixed(2)}km`;
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
  const { token } = useAuth();

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
    })
  }, [cycles, sortstate, filterstate]);

  const handleSelectBike = async (bike) => {
    setSelectedBikeId(bike._id);
    if (!boarding || !destination) return;

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/cycles/ride-route`, {
        boarding, bike, destination
      }, { headers: { Authorization: `Bearer ${token}` } });

      const { geometry } = res.data;
      setRouteCoords(geometry);
      setBikeDistance(bike.walkDistanceKm);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartRide = (bike) => {
    navigate(`/ride-start`, {
      state: { boarding, destination, bike },
    });
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error(error)
      );
    }
  }, []);

  useEffect(() => {
    if (!boarding || !destination) {
      setLoading(false);
      return;
    }
    setLoading(true);
    axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/cycles/search`, { boarding, destination }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => setCycles(res.data.cycles || []))
      .catch((err) => { console.error(err); setCycles([]); })
      .finally(() => setLoading(false));
  }, [boarding, destination]);

  if (loading) return (
    <div className="min-h-screen bg-[#F9F8E9] flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 border-8 border-black border-t-[#016766] rounded-full animate-spin mb-6"></div>
      <h2 className="text-3xl font-black uppercase italic tracking-tighter text-center">
        Scanning for <span className="text-[#016766]">Bicycles</span> nearby...
      </h2>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F9F8E9] font-afacad flex flex-col pt-16">
      <Header />

      <div className="flex-1 flex flex-col lg:flex-row p-4 lg:p-8 gap-5 overflow-hidden">
        {/* Left Map View */}
        <div className="lg:w-1/2 h-[350px] lg:h-auto bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative">
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

        {/* Right Selection Panel */}
        <div className="lg:w-1/2 flex flex-col gap-4 overflow-y-auto pr-2">
          <div className="bg-black text-white p-6 rounded-3xl border-4 border-[#016766] flex flex-col items-center justify-center text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-2xl lg:text-4xl font-black uppercase tracking-tighter">Bicycles Found</h1>
            <p className="text-[#016766] font-bold text-sm uppercase tracking-widest">{cycles.length} Available near your pickup</p>
          </div>

          {/* Sort & Filter Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <button
                onClick={() => setsort(prev => ({ ...prev, show: !prev.show }))}
                className="w-full bg-white border-4 border-black py-3 px-4 rounded-2xl flex items-center justify-between font-black uppercase tracking-tighter hover:bg-gray-50 active:translate-y-1 transition-all"
              >
                <div className="flex items-center gap-2 italic">
                  <SortAsc size={20} /> Sort
                </div>
                <ChevronDown size={20} />
              </button>
              {sortstate.show && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-4 border-black rounded-2xl z-50 shadow-2xl overflow-hidden p-2">
                  {SORT_LABELS.map((label, idx) => (
                    <button
                      key={idx}
                      onClick={() => setsort(prev => ({ ...prev, value: idx, show: false }))}
                      className={`w-full text-left p-3 rounded-xl font-bold uppercase text-xs flex justify-between items-center ${sortstate.value === idx ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                    >
                      {label}
                      <span onClick={(e) => {
                        e.stopPropagation();
                        setsort(prev => ({ ...prev, asc: prev.asc.map((a, i) => i === idx ? !a : a) }));
                      }}>
                        {sortstate.asc[idx] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setfilter(prev => ({ ...prev, show: !prev.show }))}
                className="w-full bg-white border-4 border-black py-3 px-4 rounded-2xl flex items-center justify-between font-black uppercase tracking-tighter hover:bg-gray-50 active:translate-y-1 transition-all"
              >
                <div className="flex items-center gap-2 italic">
                  <Filter size={20} /> Filter
                </div>
                <ChevronDown size={20} />
              </button>
              {filterstate.show && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-4 border-black rounded-2xl z-50 shadow-2xl overflow-hidden p-2">
                  {FILTER_LABELS.map((label, idx) => (
                    <button
                      key={idx}
                      onClick={() => setfilter(prev => ({ ...prev, value: idx, show: false }))}
                      className={`w-full text-left p-3 rounded-xl font-bold uppercase text-xs ${filterstate.value === idx ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bike List */}
          <div className="space-y-4 pt-2">
            {orderedCycles.map((bike) => {
              const isSelected = selectedBikeId === bike._id;
              return (
                <div
                  key={bike._id}
                  onClick={() => handleSelectBike(bike)}
                  className={`bg-white border-4 rounded-3xl p-4 cursor-pointer transition-all duration-300 relative ${isSelected ? 'border-[#016766] shadow-[8px_8px_0px_0px_rgba(0,103,102,1)] translate-x-1 translate-y-1' : 'border-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}
                >
                  <div className="flex gap-4">
                    <div className={`w-24 h-24 lg:w-32 lg:h-32 bg-gray-50 rounded-2xl border-2 p-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-[#016766]' : 'border-gray-100'}`}>
                      <img src={Thumbnail} alt="Bike" className="w-full h-auto object-contain" />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl lg:text-2xl font-black uppercase italic tracking-tighter truncate max-w-[150px]">
                            {bike.cycleName}
                          </h3>
                          <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                            {bike.type === 'Geared' ? '⚡ GEARED' : '🚲 STANDARD'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Navigation size={14} className="text-[#016766]" />
                          <span className="text-sm font-bold text-gray-500 uppercase">Arrive by {Arrivaltime(bike.totalTimeMinutes).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex gap-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase">Duration</span>
                            <span className="text-lg font-black">{formatTime(bike.totalTimeMinutes)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase">Distance</span>
                            <span className="text-lg font-black">{bike.totalDistanceKm}km</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); handleStartRide(bike); }}
                          className={`px-4 lg:px-6 py-2 rounded-xl font-black uppercase text-xs transition-all border-2 border-black ${isSelected ? 'bg-black text-white' : 'bg-[#016766] text-white'}`}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-100 grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 p-2 rounded-xl border-2 border-black text-center animate-in slide-in-from-left duration-300">
                        <div className="text-[9px] font-black text-gray-400 uppercase">Walk to bike</div>
                        <div className="text-sm font-black">{formatDistance(bike.walkDistanceKm)} ({formatTime(bike.walkEtaMinutes)})</div>
                      </div>
                      <div className="bg-[#016766]/10 p-2 rounded-xl border-2 border-[#016766] text-center animate-in slide-in-from-right duration-300">
                        <div className="text-[9px] font-black text-[#016766]/60 uppercase">Ride to destination</div>
                        <div className="text-sm font-black text-[#016766]">{formatDistance(bike.rideDistanceKm)} ({formatTime(bike.rideEtaMinutes)})</div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BikeUnlock;

