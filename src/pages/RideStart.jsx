import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MapView from "../components/MapView";
import Thumbnail from "../assets/Mockup-Bicycle.png";
import axios from "axios";
import { useAuth } from "../components/Contexts/authContext";

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

  // helper: are we close enough to bike? (2 meters threshold)
  const isCloseEnoughToBike = async () => {
    try {
      const userPos = await getUserLocation();

      const bikeLng = bike.location.coordinates[0];
      const bikeLat = bike.location.coordinates[1];

      const dist = distanceMeters(userPos.lat, userPos.lng, bikeLat, bikeLng);

      // 2 meters threshold
      return dist <= 2;
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
      // Distance check removed as per request
      /*
      const close = await isCloseEnoughToBike();
      if (close === null) {
        alert(
          "Unable to get your GPS position. Cannot verify distance to bike."
        );
        setIsUnlocking(false);
        return;
      }
      if (!close) {
        alert("You must be within 2 meters of the bicycle to unlock it.");
        setIsUnlocking(false);
        return;
      }
      */

      // Create ride (with payment.paid = false) if not yet created
      let rideToUse;
      try {
        rideToUse = await createRideIfNeeded();
      } catch (err) {
        // createRide already showed alert for 409 or failure
        setIsUnlocking(false);
        return;  // <-- stops further execution
      }

      if (!rideToUse || !rideToUse._id) {
        setIsUnlocking(false);
        return;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/rides/${rideToUse._id}/start`, {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        },
      );
      const updatedRide = res.data.ride || res.data;

      setRideObj(updatedRide);

      setBike((prev) =>
        prev ? { ...prev, status: "unlocked", availabilityFlag: false } : prev
      );

      alert("Ride started — bike unlocked. Have a safe ride!");
      navigate(`/ride-tracking`, { state: { ride: updatedRide, bike } });
    } catch (err) {
      console.error("Failed to start ride:", err.response?.data || err.message);
      const status = err.response?.status;
      if (status === 400 || status === 409) {
        alert(err.response?.data?.error || "Cannot start ride.");
      } else {
        alert("Server error while starting ride. See console.");
      }
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
          }
        );

        const { geometry } = res.data || {};

        setRouteCoords(geometry || []);
        setTotalDist(bike.totalDistanceKm);
        setTotalTime(bike.totalTimeMinutes);
        setBikeDistance(bike.walkDistanceKm ?? bikeDistance);
        setBikeEtaMinutes(bike.walkEtaMinutes ?? bikeEtaMinutes);
        const fareRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/fare`, {
          distanceKm: bike.walkDistanceKm,
          bikeType: bike.type,
          durationMinutes: bike.walkEtaMinutes,
        });
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
    <div className="max-h-screen bg-[#F9F8E9] font-afacad p-20 flex gap-5">
      <div className="flex-1 bg-[#016766] text-white flex items-center justify-center rounded-2xl border-2 border-black">
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

      <div className="flex-1 overflow-auto px-6">
        <div className="bg-black text-4xl text-white font-semibold flex justify-center py-2 rounded-t-2xl">
          Start Ride
        </div>


        <div className="bg-white p-6 rounded-b-xl border-2 border-gray-300 mt-4">
          <div className="flex flex-row justify-evenly ">
            <div className="flex gap-4 items-center">
              <img
                src={Thumbnail}
                alt="Bike Thumb"
                className="w-32 h-20 object-contain"
              />

            </div>

            <div className="mt-6 ml-12 grid grid-cols-2 gap-8">
              <div>
                <div className="text-xl text-gray-500">Estimated trip time</div>
                <div className="text-3xl font-semibold">
                  {formatTime(totalTime ?? totalTime)}
                </div>
              </div>
              <div>
                <div className="text-xl text-gray-500">Distance</div>
                <div className="text-3xl font-semibold">
                  {formatDistance(totalDist ?? totalDist)}
                </div>
              </div>
            </div>
          </div>

          {/* Show bike-specific: distance to bike and estimated arrival-to-bike if present */}
          <div className="flex justify-evenly mt-4 gap-2 text-2xl text-gray-600">
            <div>Distance to bike: {formatDistance(bike?.walkDistanceKm)} </div>
            <div>Time to reach Bicycle: {formatTime(bike?.walkEtaMinutes)}</div>
          </div>
          <div className="flex justify-center mt-2 text-2xl text-gray-1200">
            <div className="bg-[#016766] p-2 rounded-sm text-white">
              Pay after Finishing Ride (Est. ₹{" "}
              {EstimatedFare})
            </div>
          </div>
          <div className="mt-4 bg-white p-2 rounded-xl border-2 border-gray-300 text-center text-lg text-gray-700">
            <div className="text-2xl font-semibold">Ride Rules & Penalties</div>
            <p>Damage or loss of cycle may result in penalty charges.</p>
            <p>Parking outside authorized zone incurs ₹50 fine.</p>
          </div>

        </div>

        <div className="mt-6 bg-white p-6 rounded-xl border-2 border-gray-300">
          <div className="text-center text-2xl text-gray-1200 mb-4">
            <span className="font-bold">You can now unlock the bike</span>
            {/* Distance warning removed
            <div className="text-gray-600">
              {" "}
              (Note: You should be at minimum of 2 meters distance closer to Bicycle to
              Unlock and start ride){" "}
            </div>
            <div>Walk {Math.round(bike.walkDistanceKm * 1000)} more meters to unlock</div>
            */}
          </div>

          <button
            onClick={handleUnlockAndStart}
            disabled={isUnlocking}
            className="cursor-pointer w-full py-3 text-2xl font-semibold rounded-2xl bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title="Unlock and Start Ride"
          >
            {isUnlocking ? "Unlocking..." : "Unlock and Start Ride"}
          </button>
        </div>

        {/* Extra info / actions */}
        <div className="mt-6">
          <button
            onClick={() => navigate(-1)}
            className="cursor-pointer px-6 py-2 text-lg rounded-lg border-2 border-black bg-transparent"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default RideStart;
