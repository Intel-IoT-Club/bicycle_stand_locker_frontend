import Header from "../components/Header";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../components/Contexts/authContext";

const MyRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      fetchRides();
    }
  }, [user, token]);

  const fetchRides = () => {
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
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleCancelRide = async (rideId) => {
    if (!window.confirm("Cancel this ride? No charges will be applied.")) return;

    setActionLoading(prev => ({ ...prev, [rideId]: 'cancel' }));
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/rides/${rideId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Ride cancelled!");
      fetchRides();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to cancel ride");
    } finally {
      setActionLoading(prev => ({ ...prev, [rideId]: null }));
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8E9] font-afacad pb-20">
      <Header />

      <div className="max-w-7xl mx-auto pt-28 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter text-black">
              My <span className="text-[#016766]">Rides</span>
            </h1>
            <p className="text-xl font-bold text-gray-500 uppercase tracking-widest mt-2 ml-1">
              Track your journey history
            </p>
          </div>
          <div className="bg-white px-6 py-2 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase">
            Total: {rides.length}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-16 h-16 border-8 border-black border-t-[#016766] rounded-full animate-spin mb-4"></div>
            <span className="text-2xl font-black uppercase italic tracking-tighter">Fetching your history...</span>
          </div>
        ) : rides.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
            <div className="text-5xl mb-4">🚲</div>
            <h2 className="text-3xl font-black uppercase mb-2">No rides yet!</h2>
            <p className="text-gray-500 font-bold mb-8 uppercase tracking-wider">Start your first adventure today</p>
            <button
              onClick={() => window.location.href = '/home'}
              className="bg-[#016766] text-white px-8 py-4 rounded-2xl font-black uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
            >
              Search Rides
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rides.map((ride, index) => {
              const isActive = ride.status === 'started';
              const isFinished = ride.status === 'finished';
              const isCancelled = ride.status === 'cancelled';
              const isLoading = actionLoading[ride._id];

              return (
                <div
                  key={ride._id}
                  className="bg-white rounded-3xl border-4 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all group"
                >
                  {/* Status Barrier */}
                  <div className={`h-3 ${isFinished ? 'bg-green-500' : isCancelled ? 'bg-red-500' : 'bg-yellow-400'
                    }`}></div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">
                          Cycle ID: {ride.bikeId?.slice(-6) || 'N/A'}
                        </div>
                        <h3 className="text-2xl font-black uppercase italic truncate max-w-[150px]">
                          {ride.bikeName || "Bicycle"}
                        </h3>
                      </div>
                      <div className={`px-3 py-1 rounded-full border-2 border-black text-xs font-black uppercase ${isFinished ? 'bg-green-100' : isCancelled ? 'bg-red-100' : 'bg-yellow-100'
                        }`}>
                        {ride.status}
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-lg border-2 border-black">🗓️</div>
                        <div className="font-bold text-sm">{formatDate(ride.createdAt)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-xl border-2 border-black">
                          <div className="text-[10px] font-black uppercase text-gray-400">Distance</div>
                          <div className="text-lg font-black">{ride.finalDistanceKm || ride.distanceKm || 0} km</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl border-2 border-black">
                          <div className="text-[10px] font-black uppercase text-gray-400">Time</div>
                          <div className="text-lg font-black">{ride.finalDurationMin || ride.timeMin || 0} min</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-gray-200">
                      <div>
                        <div className="text-[10px] font-black uppercase text-gray-400">Total Fare</div>
                        <div className="text-3xl font-black text-[#016766] italic">₹{ride.finalFare || ride.fare || 0}</div>
                      </div>

                      {isActive && (
                        <button
                          onClick={() => handleCancelRide(ride._id)}
                          disabled={isLoading}
                          className="bg-red-500 text-white px-4 py-2 rounded-xl font-black uppercase text-xs border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:bg-red-600 transition-all disabled:opacity-50"
                        >
                          {isLoading === 'cancel' ? 'Wait...' : 'Cancel'}
                        </button>
                      )}

                      {isFinished && (
                        <button
                          onClick={() => window.location.href = `/ride-summary/${ride._id}`}
                          className="bg-[#016766] text-white px-4 py-2 rounded-xl font-black uppercase text-xs border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:bg-[#015554] transition-all"
                        >
                          Invoice
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRides;

