import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import MapView from "../components/MapView";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
const SIMULATE_RIDE = true; // set false in production
import { useAuth } from "../components/Contexts/authContext";

const RideTracking = () => {
  const { state } = useLocation();
  const { ride, bike } = state || {};
  const navigate = useNavigate();
  const { token } = useAuth();
  /* ---------------- UI STATE ---------------- */
  const [showPaymentSummary, setShowPaymentSummary] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);

  /* ---------------- LIVE TRACKING STATE ---------------- */
  const [currentLocation, setCurrentLocation] = useState(null);
  const [distanceCovered, setDistanceCovered] = useState(0);
  const [distanceLeft, setDistanceLeft] = useState(ride?.plannedDistanceKm || 0);
  const [rideTimeMin, setRideTimeMin] = useState(0);
  const [timeLeftMin, setTimeLeftMin] = useState(null);
  const [livePrice, setLivePrice] = useState(ride?.payment?.amount || 0);
  const [rideEnded, setRideEnded] = useState(false);

  const canEndRide = distanceLeft < 1; // 200 meters

  /* ---------------- FALLBACK DATA (UNCHANGED) ---------------- */
  const bikeId = ride?.bikeId || bike?._id || "N/A";
  const bikeName = ride?.bikeName || bike?.cycleName || "N/A";

  /* ---------------- HELPERS ---------------- */
  const getLatLng = (geo) =>
    geo?.coordinates
      ? { lat: geo.coordinates[1], lng: geo.coordinates[0] }
      : null;

  const boardingLoc = useMemo(
    () => getLatLng(ride?.boarding),
    [ride?.boarding?.coordinates?.[0], ride?.boarding?.coordinates?.[1]]
  );

  const destinationLoc = useMemo(
    () => getLatLng(ride?.destination),
    [ride?.destination?.coordinates?.[0], ride?.destination?.coordinates?.[1]]
  );


  const haversine = (a, b) => {
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(a.lat * Math.PI / 180) *
      Math.cos(b.lat * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  };

  /* ---------------- ADDRESSES (RUN ONCE) ---------------- */
  const [fromAddress, setFromAddress] = useState("Start");
  const [toAddress, setToAddress] = useState("Destination");

  const hasGeocodedRef = useRef(false);

  useEffect(() => {
    if (!boardingLoc || !destinationLoc) return;
    if (hasGeocodedRef.current) return; // 🔒 HARD STOP

    hasGeocodedRef.current = true;

    const reverse = async (loc, setter) => {
      try {
        const res = await fetch(
          `https://us1.locationiq.com/v1/reverse?key=${import.meta.env.VITE_MAP_ACCESS_TOKEN}&lat=${loc.lat}&lon=${loc.lng}&format=json`
        );
        const data = await res.json();
        setter(data?.display_name || "");
      } catch (e) {
        console.error("Reverse geocode failed", e);
      }
    };

    reverse(boardingLoc, setFromAddress);
    reverse(destinationLoc, setToAddress);
  }, [boardingLoc, destinationLoc]);



  /* ---------------- PUSH CURRENT LOCATION (THROTTLED/SIMULATION) ---------------- */
  useEffect(() => {
    if (rideEnded) return;
    if (!bike?._id) return;
    let interval;
    let index = 0;
    if (SIMULATE_RIDE) {
      // SIMULATION MODE
      if (!routeCoords.length) return;
      interval = setInterval(() => {
        if (index >= routeCoords.length) {
          clearInterval(interval);
          return;
        }
        const [lng, lat] = routeCoords[index];
        axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/cycles/${bike._id}/location`,
          { lat, lng }
        );
        index += 1;
      }, 5000); // simulate movement every 5 sec
    } else {
      // REAL GPS MODE
      interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/api/cycles/${bike._id}/location`,
              {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              }
            );
          },
          (err) => {
            console.warn("GPS error:", err.message);
          },
          { enableHighAccuracy: true }
        );
      }, 5000); // real GPS every 5 sec
    }

    return () => clearInterval(interval);
  }, [SIMULATE_RIDE, bike?._id, routeCoords]);

  /* ---------------- READ LOCATION ---------------- */
  useEffect(() => {
    if (rideEnded) return;
    if (!bike?._id) return;

    const interval = setInterval(async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/cycles/${bike._id}/location`
      );
      setCurrentLocation(res.data.location);
    }, 5000);

    return () => clearInterval(interval);
  }, [bike?._id]);

  /* ---------------- ROUTE ---------------- */
  useEffect(() => {
    if (!boardingLoc || !destinationLoc) return;

    axios
      .post(`${import.meta.env.VITE_API_BASE_URL}/api/cycles/ride-route`, {
        boarding: boardingLoc,
        bike,
        destination: destinationLoc,
      })
      .then((res) => setRouteCoords(res.data.geometry || []));
  }, [ride?._id]);

  /* ---------------- DISTANCE CALC (ROUTE-BASED) ---------------- */
  useEffect(() => {
    if (!currentLocation || !routeCoords.length) return;

    let min = Infinity;
    let idx = 0;

    routeCoords.forEach(([lng, lat], i) => {
      const d = haversine(currentLocation, { lat, lng });
      if (d < min) {
        min = d;
        idx = i;
      }
    });

    let covered = 0;
    for (let i = 1; i < idx; i++) {
      covered += haversine(
        { lat: routeCoords[i - 1][1], lng: routeCoords[i - 1][0] },
        { lat: routeCoords[i][1], lng: routeCoords[i][0] }
      );
    }

    setDistanceCovered((prev) => Math.max(prev, covered));
    setDistanceLeft(Math.max((ride?.plannedDistanceKm || 0) - covered, 0));
  }, [currentLocation, routeCoords]);

  /* ---------------- TIME ---------------- */
  useEffect(() => {
    if (rideEnded) return;
    if (!ride?.startedAt) return;

    const start = new Date(ride.startedAt);
    const interval = setInterval(() => {
      setRideTimeMin((Date.now() - start) / 60000);
    }, 10000);

    return () => clearInterval(interval);
  }, [ride?.startedAt]);

  useEffect(() => {
    if (rideEnded) return;
    const rawSpeed = distanceCovered / (rideTimeMin / 60);
    const MIN_ETA_SPEED = 10; // km/h (estimating to minimum cycle speed in case of slow traffic / signals)
    const effectiveSpeed = rawSpeed && rawSpeed > MIN_ETA_SPEED ? rawSpeed : MIN_ETA_SPEED;
    setTimeLeftMin((distanceLeft / effectiveSpeed) * 60);
  }, [rideTimeMin, distanceCovered, distanceLeft]);

  /* ---------------- PRICE, Ride data Update (BACKEND AUTH) ---------------- */
  useEffect(() => {
    if (rideEnded) return;
    if (!ride?._id) return;

    const interval = setInterval(async () => {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/rides/${ride._id}/update-metrics`,
        { distanceKm: distanceCovered, timeMin: rideTimeMin }
      );
      setLivePrice(res.data.fare);
    }, 15000);

    return () => clearInterval(interval);
  }, [distanceCovered, rideTimeMin]);

  /* ---------------- END RIDE ---------------- */
  const handleEndRide = async () => {

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/rides/${ride._id}/end`,
        {
          endLocation: currentLocation,
          distanceKm: distanceCovered,
          timeMin: rideTimeMin,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        }
      );
      // LOCK final price returned by backend
      if (res.data?.finalFare) {
        setLivePrice(res.data.finalFare);
      }

      setRideEnded(true);
      setShowPaymentSummary(true);
    } catch (err) {
      console.log(err);
      alert("Failed to end ride. Try again.");
    }
  };

  /* ---------------- PAYMENT ---------------- */
  const handlePayment = async () => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/payments/create-order`,
      { amount: livePrice }
    );

    const { order } = response.data;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      order_id: order.id,

      handler: async (response) => {
        try {
          // 2️⃣ Verify payment + update ride
          const verifyRes = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/payments/verifyPay`,
            {
              response,
              ride
            }
          );

          // 3️⃣ Redirect ONLY after backend success
          if (verifyRes.data.success) {
            const id = ride._id;
            navigate(`/ride-summary/${id}`);
          }

        } catch (err) {
          console.error("Payment verification failed:", err);
          alert("Payment verification failed. Please contact support.");
        }
      },

      theme: { color: "#3399cc" },
    };

    new window.Razorpay(options).open();
  };

  // UI values to display
  const rideTimeDisplay = `${Math.ceil(rideTimeMin)} min`;
  const distLeftDisplay = `${distanceLeft.toFixed(2)} km`;
  const distCoveredDisplay = `${distanceCovered.toFixed(2)} km`;
  const price = livePrice.toFixed(2);

  if (!ride) {
    return <div className="p-10 text-center">No active ride data found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#F9F8E9] font-afacad flex flex-col items-center p-5">

      <div className="pb-6">
        <div className="text-6xl font-bold text-center">{bikeName}</div>
      </div>

      <div className="flex flex-row gap-5 w-full pr-20 pl-20">

        <div className="flex-1 bg-[#016766] text-white flex items-center justify-center rounded-2xl border-2 border-black">
          <MapView
            boarding={boardingLoc}
            destination={destinationLoc}
            cycles={currentLocation ? [{ ...bike, location: { coordinates: [currentLocation.lng, currentLocation.lat] } }] : [bike]}
            selectedBikeId={bike?._id}
            onSelectBike={() => { }}
            routeCoords={routeCoords}
            bikeDistance={null}
          //currentLocation={currentLocation}
          />
        </div>

        <div className="flex-1 flex flex-col items-center gap-4">

          {showPaymentSummary ? (
            <div className="flex flex-col items-center gap-6">

              <h2 className="text-5xl font-bold mb-4">Payment Summary</h2>

              <div className="bg-black text-white text-3xl rounded-xl px-6 py-4 w-140">
                <div>Bike ID: {bikeId}</div>
                <div>Bike Name: {bikeName}</div>
                <div>From: {fromAddress}</div>
                <div>To: {toAddress}</div>
                <div>Ride Time: {rideTimeDisplay}</div>
                <div>Distance Covered: {distCoveredDisplay}</div>
                <div className="text-4xl font-bold mt-4">Amount: ₹{price}</div>
              </div>

              <button
                className="bg-green-600 hover:bg-green-700 text-white text-4xl font-bold px-36 py-6 rounded-lg"
                onClick={handlePayment}
              >
                PAY NOW
              </button>
            </div>
          ) : (
            <>
              <div className="bg-black text-white text-xl rounded-xl px-6 py-4 w-140">
                <div><b className="text-3xl">From:</b>&nbsp; {fromAddress}</div>
                <div><b className="text-3xl">To:</b>&nbsp; {toAddress}</div>
              </div>

              <div className="flex justify-center items-center gap-36 relative mt-18">
                <div className="bg-black text-white text-3xl rounded-full w-48 h-48 flex flex-col items-center justify-center z-20">
                  <div>Ride Time</div>
                  <div className="text-5xl font-bold">{rideTimeDisplay}</div>
                </div>

                <div className="bg-[#016766] text-white text-3xl rounded-full w-48 h-48 flex flex-col items-center justify-center absolute top-[-50px] left-1/2 transform -translate-x-1/2 z-10">
                  <div>Time Left</div>
                  <div className="text-5xl font-bold">
                    {timeLeftMin ? `${Math.ceil(timeLeftMin)} min` : "--"}
                  </div>
                </div>

                <div className="bg-black text-white text-3xl rounded-full w-48 h-48 flex flex-col items-center justify-center ml-auto z-10">
                  <div>Dist. Left</div>
                  <div className="text-5xl font-bold">{distLeftDisplay}</div>
                </div>
              </div>

              <div className="bg-[#016766] text-white text-center px-6 py-3 rounded-lg">
                <div className="text-2xl">Dist. Covered: {distCoveredDisplay}</div>
                <div className="text-4xl">Est. Fare: ₹{price}</div>
              </div>

              <button
                disabled={!canEndRide || rideEnded}
                className={`text-white text-4xl font-bold px-36 py-6 rounded-lg
                  ${canEndRide && !rideEnded
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-400 cursor-not-allowed"}`}
                onClick={handleEndRide}
              >
                {rideEnded ? "RIDE ENDED" : "END RIDE"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideTracking;
