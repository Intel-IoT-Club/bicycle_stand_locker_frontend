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
  const { user, token } = useAuth();
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
          { lat, lng },
          { headers: { Authorization: `Bearer ${token}` } }
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
              },
              { headers: { Authorization: `Bearer ${token}` } }
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
        `${import.meta.env.VITE_API_BASE_URL}/api/cycles/${bike._id}/location`,
        { headers: { Authorization: `Bearer ${token}` } }
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
      }, { headers: { Authorization: `Bearer ${token}` } })
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
        { distanceKm: distanceCovered, timeMin: rideTimeMin },
        { headers: { Authorization: `Bearer ${token}` } }
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
          headers: { Authorization: `Bearer ${token}` }
        });
        setWallet(res.data);
      } catch (err) {
        console.error("Failed to fetch wallet:", err);
      }
    };
    fetchWallet();
  }, [user?._id, showPaymentSummary]);

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
        { headers: { Authorization: `Bearer ${token}` } }
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
      { headers: { Authorization: `Bearer ${token}` } }
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
            { headers: { Authorization: `Bearer ${token}` } }
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
    <div className="min-h-screen bg-[#F9F8E9] font-afacad flex flex-col pt-16">
      <Header />

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 lg:p-10 gap-6">

        {/* Left Side: Map Tracking */}
        <div className="lg:w-2/3 h-[400px] lg:h-auto bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative">
          <MapView
            boarding={boardingLoc}
            destination={destinationLoc}
            cycles={bike ? [bike] : []}
            selectedBikeId={bike?._id}
            onSelectBike={() => { }}
            routeCoords={routeCoords}
            currentLocation={currentLocation}
          />

          {/* Floating Stats on Map */}
          <div className="absolute top-4 left-4 right-4 flex flex-col sm:flex-row gap-2 pointer-events-none">
            <div className="bg-black text-white px-4 py-2 rounded-xl text-sm font-black uppercase tracking-tighter shadow-lg border-2 border-[#016766]">
              Live: {bikeName}
            </div>
            <div className="bg-[#016766] text-white px-4 py-2 rounded-xl text-sm font-black uppercase tracking-tighter shadow-lg border-2 border-black">
              Fare: ₹{livePrice?.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Right Side: Ride Dashboard */}
        <div className="lg:w-1/3 flex flex-col gap-6">

          {showPaymentSummary ? (
            /* PAYMENT OVERLAY CARD */
            <div className="bg-white p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(1,103,102,1)] animate-in zoom-in duration-300">
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-6 text-center">Receipt</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between border-b-2 border-gray-100 pb-2">
                  <span className="text-gray-500 font-bold uppercase text-xs">Distance</span>
                  <span className="font-black">{distCoveredDisplay}</span>
                </div>
                <div className="flex justify-between border-b-2 border-gray-100 pb-2">
                  <span className="text-gray-500 font-bold uppercase text-xs">Time</span>
                  <span className="font-black">{rideTimeDisplay}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-black">
                  <div className="text-center text-sm font-bold text-[#016766] uppercase mb-1">Total Paid</div>
                  <div className="text-4xl font-black text-center italic">₹{livePrice?.toFixed(2)}</div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  className="w-full bg-[#016766] py-4 rounded-2xl text-xl font-black text-white uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                  onClick={() => navigate(`/ride-summary/${ride?._id || bikeId}`)}
                >
                  View Final Details
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE RIDE CARD */
            <div className="flex flex-col gap-6">

              <div className="bg-black text-white p-6 rounded-3xl border-4 border-[#016766] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-[#016766] p-3 rounded-2xl border-2 border-white">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-gray-400">Time Elapsed</div>
                    <div className="text-4xl font-black italic tabular-nums">{rideTimeDisplay}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                    <div className="text-[10px] font-black uppercase text-gray-400">ETA</div>
                    <div className="text-xl font-black text-[#016766]">
                      {timeLeftMin ? `${Math.ceil(timeLeftMin)}m` : "--"}
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                    <div className="text-[10px] font-black uppercase text-gray-400">Distance</div>
                    <div className="text-xl font-black text-white">{distCoveredDisplay}</div>
                  </div>
                </div>
              </div>

              {/* ROUTE CARD */}
              <div className="bg-white p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-1 before:border-l-2 before:border-dashed before:border-gray-300">
                  <div className="relative">
                    <div className="absolute -left-10 top-1 w-6 h-6 rounded-full bg-white border-4 border-green-500 z-10"></div>
                    <div className="text-[10px] font-black uppercase text-gray-400">Pick up</div>
                    <div className="text-sm font-bold truncate">{fromAddress}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-10 top-1 w-6 h-6 rounded-full bg-white border-4 border-red-500 z-10"></div>
                    <div className="text-[10px] font-black uppercase text-gray-400">Drop off</div>
                    <div className="text-sm font-bold truncate">{toAddress}</div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button
                className={`w-full py-5 rounded-3xl text-2xl font-black uppercase tracking-tighter transition-all border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none ${canEndRide
                  ? "bg-[#016766] text-white hover:bg-[#015554]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300 shadow-none translate-y-1"
                  }`}
                onClick={handleEndRide}
                disabled={!canEndRide}
              >
                {canEndRide ? "End Ride" : "Getting Closer..."}
              </button>

              {!canEndRide && (
                <div className="text-center text-xs font-black uppercase text-red-500 animate-pulse">
                  Reach destination to end ride
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideTracking;
