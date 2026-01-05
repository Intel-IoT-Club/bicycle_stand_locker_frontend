import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MapView from "../components/MapView";
import Thumbnail from "../assets/Mockup-Bicycle.png";
import axios from "axios";
import { useAuth } from "../components/Contexts/authContext";

const DISTANCE_THRESHOLD = 20000; // meters

const formatTime = (minutes) => {
  if (minutes < 60) return `${Math.round(minutes)} min`;
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

// Returns distance between two lat/lng points in meters
const distanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth radius in meters
  const toRad = (x) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // meters
};

// Get user's current GPS position
const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject("Geolocation not supported by browser.");
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => reject(err.message),
      { enableHighAccuracy: true }
    );
  });
};

const RideStart = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();

  const { bike: passedBike, boarding, destination } = location.state || {};
  const [bike, setBike] = useState(passedBike || null);
  const [loading, setLoading] = useState(true);
  const [routeCoords, setRouteCoords] = useState([]);
  const [totalDist, setTotalDist] = useState(null);
  const [totalTime, setTotalTime] = useState(null);

  const [bikeDistance, setBikeDistance] = useState(bike?.walkDistanceKm ?? null);
  const [bikeEtaMinutes, setBikeEtaMinutes] = useState(bike?.walkEtaMinutes ?? null);
  const [EstimatedFare, setEstimatedFare] = useState();

  const [rideObj, setRideObj] = useState(null); // created ride from server
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [wallet, setWallet] = useState(null);
  const { user } = useAuth();

  // helper: are we close enough to bike? (2 meters threshold)
  const isCloseEnoughToBike = async () => {
    try {
      const userPos = await getUserLocation();

      const bikeLng = bike.location.coordinates[0];
      const bikeLat = bike.location.coordinates[1];

      const dist = distanceMeters(userPos.lat, userPos.lng, bikeLat, bikeLng);

      // 2 meters threshold
      return dist <= DISTANCE_THRESHOLD;
    } catch (err) {
      console.error("GPS error:", err);
      return null; // unknown
    }
  };

  // Create ride on server if not already created, with payment.paid = false
  const createRideIfNeeded = async () => {
    if (rideObj && rideObj._id) return rideObj;

    try {
      const boardingPoint = {
        type: "Point",
        coordinates: [bike.location.coordinates[0], bike.location.coordinates[1]],
      };

      const destinationPoint = {
        type: "Point",
        coordinates: [destination.lng, destination.lat],
      };

      const ridePayload = {
        bikeId: bike._id,
        bikeName: bike.cycleName,
        boarding: boardingPoint,
        destination: destinationPoint,
        payment: {
          paid: false, // IMPORTANT: keep false, user pays after ride
          method: "postpaid",
          amount: Number(EstimatedFare), // estimated fare; still unpaid
          txnId: undefined, // defined after real payment
        },
        plannedDistanceKm: Number(bikeDistance),
        plannedDurationMin: Number(bikeEtaMinutes),
      };

      const rideRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/rides`,
        ridePayload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        },
      );

      const createdRide = rideRes.data.ride || rideRes.data;
      setRideObj(createdRide);
      return createdRide;
    } catch (err) {
      console.error("Ride creation failed:", err.response?.data || err.message);
      // If controller returned 409, it means cycle was already unavailable
      if (err.response?.status === 409) {
        alert("Bike is no longer available. Please choose another bike.");
      } else {
        alert("Something went wrong while creating ride. See console for details.");
      }
      throw err;
    }
  };

  const handleUnlockAndStart = async () => {
    if (!bike) {
      alert("Bike not available.");
      return;
    }

    setIsUnlocking(true);

    try {
      const close = await isCloseEnoughToBike();
      if (close === null) {
        alert("Unable to get your GPS position. Cannot verify distance to bike.");
        setIsUnlocking(false);
        return;
      }
      if (!close) {
        alert("You must be within 2 meters of the bicycle to unlock it.");
        setIsUnlocking(false);
        return;
      }

      // 1. Fetch Latest Wallet
      const wRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/wallet/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const currentWallet = wRes.data;

      // 2. Create Ride anyway if not exists
      let rideToUse = await createRideIfNeeded();

      if (currentWallet.balance >= EstimatedFare) {
        // 3a. Auto-deduct from wallet
        const payRes = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/wallet/${user._id}/pay`,
          { amount: EstimatedFare, rideId: rideToUse._id, status: 'started' },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (payRes.data.success) {
          alert(`₹${EstimatedFare} deducted from wallet. Ride started!`);
          navigate(`/ride-tracking`, { state: { ride: rideToUse, bike } });
        }
      } else {
        // 3b. Insufficient Balance - Prompt for Online Payment
        if (window.confirm(`Insufficient wallet balance (₹${currentWallet.balance}). Pay ₹${EstimatedFare} online to start ride?`)) {
          const orderRes = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/payments/create-order`,
            { amount: EstimatedFare },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const { order } = orderRes.data;
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: "INR",
            order_id: order.id,
            handler: async (response) => {
              try {
                const verifyRes = await axios.post(
                  `${import.meta.env.VITE_API_BASE_URL}/api/payments/verifyPay`,
                  { response, ride: rideToUse, status: 'started' },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                if (verifyRes.data.success) {
                  alert("Payment successful! Have a safe ride!");
                  navigate(`/ride-tracking`, { state: { ride: rideToUse, bike } });
                }
              } catch (err) {
                alert("Payment verification failed.");
              }
            }
          };
          new window.Razorpay(options).open();
        }
      }
    } catch (err) {
      console.error("Unlock error:", err);
      alert(err.response?.data?.error || "Failed to start ride");
    } finally {
      setIsUnlocking(false);
    }
  };

  useEffect(() => {
    if (!bike || !boarding || !destination) {
      setLoading(false);
      return;
    }

    const getRoute = async () => {
      setLoading(true);
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/cycles/ride-route`,
          {
            boarding,
            bike,
            destination,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { geometry } = res.data || {};

        setRouteCoords(geometry || []);
        setTotalDist(bike.totalDistanceKm);
        setTotalTime(bike.totalTimeMinutes);
        setBikeDistance(bike.walkDistanceKm ?? bikeDistance);
        setBikeEtaMinutes(bike.walkEtaMinutes ?? bikeEtaMinutes);
        const fareRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/fare`, {
          distanceKm: bike.walkDistanceKm,
          baseRate: 5, // or wherever baseRate comes from
          durationMinutes: bike.walkEtaMinutes,
        }, { headers: { Authorization: `Bearer ${token}` } });
        setEstimatedFare(fareRes.data.fare);
      } catch (err) {
        console.error("Failed to fetch ride-route:", err);
      } finally {
        setLoading(false);
      }
    };

    getRoute();
  }, [bike, boarding, destination]);

  if (!bike) {
    return (
      <div className="p-20">
        <div className="text-3xl font-semibold mb-4">No bike selected</div>
        <div className="mb-6">Select a bike to Start ride</div>
        <div>
          <button
            onClick={() => navigate(-1)}
            className="cursor-pointer px-6 py-2 text-lg rounded-lg border-2 border-black bg-transparent"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) return (<>
    <div className="min-h-screen bg-[#F9F8E9]">
      <div className="text-4xl  absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex">
        <div className="mr-2"> Loading trip details</div>
        <div className="animate-bounce">.</div>
        <div className="animate-bounce delay-100">.</div>
        <div className="animate-bounce delay-200">.</div>
      </div>;
    </div>
  </>)


  return (
    <div className="min-h-screen bg-[#F9F8E9] font-afacad p-4 lg:p-20 flex flex-col lg:flex-row gap-5">
      {/* Map Section */}
      <div className="flex-1 min-h-[400px] bg-[#016766] text-white flex items-center justify-center rounded-2xl border-2 border-black overflow-hidden relative">
        <MapView
          boarding={boarding}
          destination={destination}
          cycles={bike ? [bike] : []}
          selectedBikeId={bike?._id}
          onSelectBike={() => { }}
          routeCoords={routeCoords}
          bikeDistance={bikeDistance}
        />
      </div>

      {/* Details Section */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
        <div className="bg-black text-2xl lg:text-4xl text-white font-semibold flex justify-center py-3 rounded-2xl">
          Start Ride
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-2xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-gray-100 p-4 rounded-xl border-2 border-black">
              <img
                src={Thumbnail}
                alt="Bike Thumb"
                className="w-32 lg:w-48 h-auto object-contain"
              />
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              <div className="bg-yellow-50 p-3 rounded-lg border-2 border-black">
                <div className="text-sm font-bold text-gray-500 uppercase">Trip Time</div>
                <div className="text-xl lg:text-3xl font-black">
                  {formatTime(totalTime)}
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border-2 border-black">
                <div className="text-sm font-bold text-gray-500 uppercase">Distance</div>
                <div className="text-xl lg:text-3xl font-black">
                  {formatDistance(totalDist)}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 mt-6 gap-3 text-lg font-bold">
            <div className="bg-gray-50 p-3 rounded-lg border-2 border-black flex justify-between">
              <span className="text-gray-500">Distance to bike:</span>
              <span>{formatDistance(bike?.walkDistanceKm)}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border-2 border-black flex justify-between">
              <span className="text-gray-500">Time to reach:</span>
              <span>{formatTime(bike?.walkEtaMinutes)}</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-[#016766] rounded-xl border-2 border-black text-center text-white">
            <div className="text-sm font-bold uppercase opacity-80 mb-1">Estimated Fare</div>
            <div className="text-4xl font-black italic">₹{EstimatedFare}</div>
            <div className="text-xs mt-2 font-bold uppercase tracking-wider bg-black/20 py-1 rounded-full">
              Payment Required at Start
            </div>
          </div>

          <div className="mt-6 p-4 bg-orange-50 rounded-xl border-2 border-black text-sm text-black">
            <div className="text-lg font-black uppercase mb-2 flex items-center gap-2">
              ⚠️ Rules & Penalties
            </div>
            <ul className="list-disc ml-5 space-y-1 font-semibold">
              <li>Damage or loss may result in penalty charges.</li>
              <li>Parking outside authorized zone incurs ₹50 fine.</li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center mb-6">
            <div className="text-xl lg:text-2xl font-black uppercase mb-1">Go to Bicycle</div>
            <div className="text-sm font-bold text-gray-600">
              Must be within 2 meters to unlock
            </div>
            <div className="mt-4 inline-block bg-black text-white px-4 py-1 rounded-full text-lg font-bold">
              Walk {Math.round(bike.walkDistanceKm * 1000)}m more
            </div>
          </div>

          <button
            onClick={handleUnlockAndStart}
            disabled={isUnlocking}
            className="w-full py-4 text-2xl font-black uppercase tracking-tighter rounded-2xl bg-black text-white hover:bg-gray-900 active:scale-95 transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,103,102,1)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUnlocking ? "Unlocking..." : "Unlock & Start"}
          </button>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="w-full lg:w-max px-8 py-3 text-lg font-black uppercase border-4 border-black bg-white hover:bg-gray-100 rounded-xl transition-all"
        >
          ← Back
        </button>
      </div>
    </div>
  );
};

export default RideStart;
