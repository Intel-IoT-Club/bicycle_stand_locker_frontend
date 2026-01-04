import Header from "../components/Header";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../components/Contexts/authContext";
import { useNavigate } from "react-router-dom";
import AnimationWrapper from "../components/AnimationWrapper";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const MyRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const listRef = useRef(null);

  useEffect(() => {
    if (user && token) {
      const riderId = user._id || user.id;
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/rides?riderId=${riderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setRides(res.data.rides || []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user, token]);

  useGSAP(() => {
    if (!loading && rides.length > 0) {
      gsap.from(".ride-card", {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  }, [loading, rides]);


  const handleStopRide = async (ride) => {
    if (!window.confirm("Are you sure you want to stop this ride? It will charge you based on current metrics.")) return;

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/rides/${ride._id}/end`, {
        distanceKm: ride.distanceKm || 0,
        timeMin: ride.timeMin || 0,
        endLocation: ride.destination
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Ride stopped successfully!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to stop ride.");
    }
  };

  const handleCancelRide = async (rideId) => {
    if (!window.confirm("Are you sure you want to cancel? No charges will be applied.")) return;

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/rides/${rideId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Ride cancelled successfully!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to cancel ride.");
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString(undefined, {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <AnimationWrapper>
      <Header />
      <div className="min-h-screen bg-white pt-24 px-4 lg:px-20 font-sans pb-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-slate-800 tracking-tight">Your Journey</h1>

          {loading ? (
            <div className="flex justify-center mt-20">
              <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : rides.length === 0 ? (
            <div className="text-center mt-20 text-slate-500">
              <p className="text-lg">No rides found.</p>
              <button
                onClick={() => navigate("/home")}
                className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-teal-700 transition"
              >
                Start your first ride
              </button>
            </div>
          ) : (
            <div ref={listRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rides.map((ride) => (
                <div
                  key={ride._id}
                  className="ride-card glass-card p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  {/* Status Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${ride.status === 'started' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                      ride.status === 'finished' ? 'bg-teal-50 text-teal-700' :
                        'bg-slate-100 text-slate-500'
                    }`}>
                    {ride.status}
                  </div>

                  <div>
                    <div className="text-slate-400 text-xs font-bold mb-1 uppercase">
                      {formatDate(ride.createdAt)}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 font-mono">
                      {ride.bikeName || "Unknown Cycle"}
                    </h3>

                    <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <div className="text-slate-400 text-[10px] font-bold uppercase">Dist</div>
                        <div className="text-slate-700 font-bold">{ride.finalDistanceKm || ride.distanceKm || 0} km</div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <div className="text-slate-400 text-[10px] font-bold uppercase">Time</div>
                        <div className="text-slate-700 font-bold">{ride.finalDurationMin || ride.timeMin || 0} m</div>
                      </div>
                      <div className="bg-teal-50 p-2 rounded-lg">
                        <div className="text-teal-600 text-[10px] font-bold uppercase">Fare</div>
                        <div className="text-teal-700 font-bold">₹{ride.finalFare || ride.fare || 0}</div>
                      </div>
                    </div>
                  </div>

                  {ride.status === 'started' && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={() => navigate(`/ride-tracking/${ride._id}`, { state: { ride } })}
                        className="col-span-2 bg-slate-900 text-white py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
                      >
                        Resume Tracking
                      </button>
                      <button
                        onClick={() => handleStopRide(ride)}
                        className="bg-red-50 text-red-600 border border-red-100 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition"
                      >
                        Stop
                      </button>
                      <button
                        onClick={() => handleCancelRide(ride._id)}
                        className="bg-white text-slate-500 border border-slate-200 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AnimationWrapper>
  );
};

export default MyRides;
