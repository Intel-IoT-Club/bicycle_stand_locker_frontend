import Header from "../components/Header";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../components/Contexts/authContext";

import { useNavigate } from "react-router-dom";

const MyRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();

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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F9F8E9] pt-20 px-8 lg:px-20 font-afacad m-0 pb-10">
        <div className="text-5xl lg:text-7xl font-bold mb-10 text-black">My Rides</div>

        {loading ? (
          <div className="text-2xl text-center mt-20">Loading your rides...</div>
        ) : rides.length === 0 ? (
          <div className="text-2xl text-center mt-20">No rides found. Start your first ride!</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#016766] text-white text-xl lg:text-2xl">
                  <th className="p-4 border">S.no</th>
                  <th className="p-4 border">Date/Time</th>
                  <th className="p-4 border">Cycle</th>
                  <th className="p-4 border">Status</th>
                  <th className="p-4 border">Distance</th>
                  <th className="p-4 border">Time</th>
                  <th className="p-4 border">Fare</th>
                  <th className="p-4 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {rides.map((ride, index) => (
                  <tr key={ride._id} className="text-xl border-b hover:bg-gray-50">
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">{formatDate(ride.createdAt)}</td>
                    <td className="p-4 font-mono">{ride.bikeName || "N/A"}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${ride.status === 'finished' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {ride.status}
                      </span>
                    </td>
                    <td className="p-4">{ride.finalDistanceKm || ride.distanceKm || 0} km</td>
                    <td className="p-4">{ride.finalDurationMin || ride.timeMin || 0} min</td>
                    <td className="p-4 font-bold text-[#016766]">₹{ride.finalFare || ride.fare || 0}</td>
                    <td className="p-4">
                      {ride.status === 'started' && (
                        <button
                          onClick={() => navigate(`/ride-tracking/${ride._id}`, { state: { ride } })}
                          className="bg-black text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors"
                        >
                          RESUME
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default MyRides;
