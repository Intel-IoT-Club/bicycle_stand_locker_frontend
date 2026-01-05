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
    return new Date(dateStr).toLocaleString();
  };

  const handleCancelRide = async (rideId) => {
    if (!window.confirm("Are you sure you want to cancel this ride? No charges will be applied.")) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [rideId]: 'cancel' }));
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/rides/${rideId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Ride cancelled successfully!");
      fetchRides(); // Refresh the rides list
    } catch (err) {
      console.error("Cancel ride error:", err);
      alert(err.response?.data?.error || "Failed to cancel ride");
    } finally {
      setActionLoading(prev => ({ ...prev, [rideId]: null }));
    }
  };

  const handleEndRide = async (rideId, ride) => {
    if (!window.confirm("Are you sure you want to end this ride? Charges will be applied.")) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [rideId]: 'done' }));
    try {
      // Use current location or fallback to boarding location
      const endLocation = ride.boarding;

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/rides/${rideId}/end`,
        {
          distanceKm: ride.distanceKm || 0,
          timeMin: ride.timeMin || 0,
          endLocation
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Ride ended successfully!");
      fetchRides(); // Refresh the rides list
    } catch (err) {
      console.error("End ride error:", err);
      alert(err.response?.data?.error || "Failed to end ride");
    } finally {
      setActionLoading(prev => ({ ...prev, [rideId]: null }));
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F9F8E9] pt-20 px-4 lg:px-20 font-afacad m-0 pb-10">
        <div className="text-4xl lg:text-7xl font-bold mb-6 lg:mb-10 text-black text-center lg:text-left">My Rides</div>

        {loading ? (
          <div className="text-xl lg:text-2xl text-center mt-20">Loading your rides...</div>
        ) : rides.length === 0 ? (
          <div className="text-xl lg:text-2xl text-center mt-20">No rides found. Start your first ride!</div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-full">
                <thead>
                  <tr className="bg-[#016766] text-white text-base lg:text-2xl">
                    <th className="p-3 lg:p-4 border whitespace-nowrap">S.no</th>
                    <th className="p-3 lg:p-4 border whitespace-nowrap">Bicycle ID</th>
                    <th className="p-3 lg:p-4 border whitespace-nowrap">Date/Time</th>
                    <th className="p-3 lg:p-4 border whitespace-nowrap">Cycle</th>
                    <th className="p-3 lg:p-4 border whitespace-nowrap">Status</th>
                    <th className="p-3 lg:p-4 border whitespace-nowrap">Distance</th>
                    <th className="p-3 lg:p-4 border whitespace-nowrap">Time</th>
                    <th className="p-3 lg:p-4 border whitespace-nowrap">Fare</th>
                    <th className="p-3 lg:p-4 border whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rides.map((ride, index) => {
                    const isActive = ride.status === 'started';
                    const isLoading = actionLoading[ride._id];

                    return (
                      <tr key={ride._id} className="text-base lg:text-xl border-b hover:bg-gray-50">
                        <td className="p-3 lg:p-4">{index + 1}</td>
                        <td className="p-3 lg:p-4 font-mono text-sm bg-gray-50 select-all">
                          {ride.bikeId || "N/A"}
                        </td>
                        <td className="p-3 lg:p-4 whitespace-nowrap">{formatDate(ride.createdAt)}</td>
                        <td className="p-3 lg:p-4 font-mono">{ride.bikeName || "N/A"}</td>
                        <td className="p-3 lg:p-4">
                          <span className={`px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs lg:text-sm font-semibold whitespace-nowrap ${ride.status === 'finished' ? 'bg-green-100 text-green-800' :
                            ride.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                            {ride.status}
                          </span>
                        </td>
                        <td className="p-3 lg:p-4 whitespace-nowrap">{ride.finalDistanceKm || ride.distanceKm || 0} km</td>
                        <td className="p-3 lg:p-4 whitespace-nowrap">{ride.finalDurationMin || ride.timeMin || 0} min</td>
                        <td className="p-3 lg:p-4 font-bold text-[#016766]">₹{ride.finalFare || ride.fare || 0}</td>
                        <td className="p-3 lg:p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCancelRide(ride._id)}
                              disabled={!isActive || isLoading}
                              className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg font-semibold text-xs lg:text-sm transition-all whitespace-nowrap ${!isActive || isLoading
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-red-500 text-white hover:bg-red-600 active:scale-95'
                                }`}
                            >
                              {isLoading === 'cancel' ? 'Cancelling...' : 'Cancel'}
                            </button>
                            <button
                              onClick={() => handleEndRide(ride._id, ride)}
                              disabled={!isActive || isLoading}
                              className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg font-semibold text-xs lg:text-sm transition-all whitespace-nowrap ${!isActive || isLoading
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
                                }`}
                            >
                              {isLoading === 'done' ? 'Ending...' : 'Done'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden flex flex-col gap-4 p-4">
              {rides.map((ride, index) => {
                const isActive = ride.status === 'started';
                const isLoading = actionLoading[ride._id];

                return (
                  <div key={ride._id} className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-start border-b pb-2">
                      <div>
                        <div className="font-bold text-lg">{ride.bikeName || "N/A"}</div>
                        <div className="text-xs text-gray-500 font-mono">{ride.bikeId}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ride.status === 'finished' ? 'bg-green-100 text-green-800' :
                        ride.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                        {ride.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                      <div>
                        <span className="text-gray-500 block text-xs">Date</span>
                        {formatDate(ride.createdAt)}
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Fare</span>
                        <span className="font-bold text-[#016766]">₹{ride.finalFare || ride.fare || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Distance</span>
                        {ride.finalDistanceKm || ride.distanceKm || 0} km
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Duration</span>
                        {ride.finalDurationMin || ride.timeMin || 0} min
                      </div>
                    </div>

                    {isActive && (
                      <div className="flex gap-2 mt-2 pt-2 border-t">
                        <button
                          onClick={() => handleCancelRide(ride._id)}
                          disabled={isLoading}
                          className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg font-semibold text-sm"
                        >
                          {isLoading === 'cancel' ? '...' : 'Cancel'}
                        </button>
                        <button
                          onClick={() => handleEndRide(ride._id, ride)}
                          disabled={isLoading}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold text-sm"
                        >
                          {isLoading === 'done' ? 'Ending...' : 'End Ride'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MyRides;
