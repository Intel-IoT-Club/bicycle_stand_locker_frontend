import axios from "axios";
import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MapView from "../components/MapView";
import { useAuth } from "../components/Contexts/authContext";
import AnimationWrapper from "../components/AnimationWrapper";

const SIMULATE_RIDE = true; // set false in production

const RideTracking = () => {
  const { state } = useLocation();
  const { ride, bike } = state || {};
  const navigate = useNavigate();
  const { token, user } = useAuth(); // Fixed destructuring

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
  const [wallet, setWallet] = useState(null);
  const [pinInput, setPinInput] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);

  // const canEndRide = distanceLeft < 1; // Removed restriction

  /* ---------------- FALLBACK DATA ---------------- */
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
  }, [distanceCovered, rideTimeMin, rideEnded]);

  /* ---------------- FETCH WALLET ---------------- */
  useEffect(() => {
    if (!user?._id) return;
    const fetchWallet = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/wallet/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` } // ADDED AUTH HEADER
        });
        setWallet(res.data);
      } catch (err) {
        console.error("Failed to fetch wallet:", err);
      }
    };
    fetchWallet();
  }, [user?._id, showPaymentSummary, token]);

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
  const handleWalletPayment = async () => {
    if (!wallet) return;
    if (wallet.pin && !showPinModal) {
      setShowPinModal(true);
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/wallet/${user._id}/pay`,
        {
          amount: livePrice,
          rideId: ride._id,
          pin: pinInput
        },
        { headers: { Authorization: `Bearer ${token}` } } // ADDED AUTH
      );

      if (res.data.success) {
        navigate(`/ride-summary/${ride._id}`);
      }
    } catch (err) {
      console.error("Wallet payment failed:", err);
      alert(err.response?.data?.message || "Wallet payment failed");
    }
  };

  const handlePayment = async () => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/payments/create-order`,
      { amount: livePrice },
      { headers: { Authorization: `Bearer ${token}` } } // ADDED AUTH
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
            },
            { headers: { Authorization: `Bearer ${token}` } } // ADDED AUTH
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

      theme: { color: "#016766" },
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
    <AnimationWrapper className="h-screen w-full relative bg-slate-100 font-sans overflow-hidden">

      {/* Full Screen Map */}
      <div className="absolute inset-0 z-0">
        <MapView
          boarding={boardingLoc}
          destination={destinationLoc}
          cycles={currentLocation ? [{ ...bike, location: { coordinates: [currentLocation.lng, currentLocation.lat] } }] : [bike]}
          selectedBikeId={bike?._id}
          onSelectBike={() => { }}
          routeCoords={routeCoords}
          bikeDistance={null}
        />
      </div>

      {/* Floating Glass Panels */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 pb-8">

        {/* Top Bar */}
        <div className="glass-card pointer-events-auto p-4 flex justify-between items-center mx-auto w-full max-w-4xl mt-4">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Ride</div>
            <div className="text-xl font-bold text-slate-800">{bikeName}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-teal-600 uppercase tracking-wider">Live Fare</div>
            <div className="text-2xl font-bold text-teal-700">₹{price}</div>
          </div>
        </div>

        {/* Bottom Panel */}
        {showPaymentSummary ? (
          <div className="glass-card pointer-events-auto p-6 md:p-8 mx-auto w-full max-w-md bg-white/95 backdrop-blur-xl animate-in slide-in-from-bottom duration-500 mb-0 md:mb-4 rounded-b-none md:rounded-2xl">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center text-slate-800">Trip Summary</h2>

            <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-sm text-slate-500">Distance</span>
                <span className="font-bold text-slate-800">{distCoveredDisplay}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-sm text-slate-500">Time</span>
                <span className="font-bold text-slate-800">{rideTimeDisplay}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Total</span>
                <span className="font-bold text-2xl md:text-3xl text-teal-700">₹{price}</span>
              </div>
            </div>

            <div className="grid gap-3">
              <button
                className={`w-full py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-lg transition-all ${wallet?.balance >= livePrice ? "bg-teal-700 text-white hover:bg-teal-800 shadow-teal-700/20" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                onClick={handleWalletPayment}
                disabled={wallet?.balance < livePrice}
              >
                Pay with Wallet (Bal: ₹{wallet?.balance?.toFixed(0)})
              </button>

              <button
                className="w-full py-3 md:py-4 rounded-xl font-bold text-base md:text-lg border-2 border-slate-900 text-slate-900 hover:bg-slate-50 transition-all"
                onClick={handlePayment}
              >
                Pay Online
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-card pointer-events-auto p-4 md:p-6 mx-auto w-full max-w-4xl grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-white/90 mb-0 md:mb-4 rounded-b-none md:rounded-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between items-center md:block">
              <div className="text-center md:text-left flex-1 min-w-0 mr-4">
                <div className="text-slate-400 text-[10px] md:text-xs font-bold uppercase">Destination</div>
                <div className="text-slate-800 font-semibold truncate text-sm md:text-base">{toAddress}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 col-span-2">
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Time</div>
                <div className="font-bold text-lg md:text-xl text-slate-800">{rideTimeDisplay}</div>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Km Left</div>
                <div className="font-bold text-lg md:text-xl text-slate-800">{distLeftDisplay}</div>
              </div>
              <div className="text-center p-2 bg-teal-50 rounded-lg">
                <div className="text-teal-600 text-[10px] font-bold uppercase">ETA</div>
                <div className="font-bold text-lg md:text-xl text-teal-700">{timeLeftMin ? `${Math.ceil(timeLeftMin)}m` : "--"}</div>
              </div>
            </div>

            <button
              disabled={rideEnded}
              className={`h-12 md:h-full w-full rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 text-sm md:text-base
                  ${!rideEnded
                  ? "bg-red-600 hover:bg-red-700 shadow-red-600/30"
                  : "bg-slate-400 cursor-not-allowed"}`}
              onClick={handleEndRide}
            >
              {rideEnded ? "ENDED" : "END RIDE"}
            </button>
          </div>
        )}
      </div>

      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] font-sans p-4 pointer-events-auto">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm">
            <h3 className="text-xl font-bold mb-6 text-center text-slate-800">Enter Wallet PIN</h3>
            <div className="flex justify-center mb-8">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-32 text-center text-4xl tracking-[0.5em] border-b-2 border-slate-200 focus:border-teal-600 outline-none py-2 font-mono bg-transparent"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShowPinModal(false)} className="py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
              <button onClick={handleWalletPayment} className="py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-lg">Confirm</button>
            </div>
          </div>
        </div>
      )}

    </AnimationWrapper>
  );
};

export default RideTracking;
