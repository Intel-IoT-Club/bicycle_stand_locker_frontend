import axios from "axios";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MapView from "../components/MapView";

const RideTracking = () => {
  const { state } = useLocation();
  const { ride, bike } = state || {};
  console.log(bike);

  /* ------------------ STATE ------------------ */
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeMeta, setRouteMeta] = useState(null);

  const [distanceCovered, setDistanceCovered] = useState(0);
  const [distanceLeft, setDistanceLeft] = useState(0);

  const [rideTimeMin, setRideTimeMin] = useState(0);
  const [timeLeftMin, setTimeLeftMin] = useState(null);

  const [offRouteSince, setOffRouteSince] = useState(null);
  const [showPaymentSummary, setShowPaymentSummary] = useState(false);

  const [livePrice, setLivePrice] = useState(ride?.payment?.amount || 0);

  /* ------------------ HELPERS ------------------ */
  const getLatLng = (geo) =>
    geo?.coordinates
      ? { lat: geo.coordinates[1], lng: geo.coordinates[0] }
      : null;

  const boardingLoc = getLatLng(ride?.boarding);
  const destinationLoc = getLatLng(ride?.destination);

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

  useEffect(() => {
    if (!bike?._id) return;

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          axios.post(`/api/cycles/${bike._id}/location`, {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    }, 8000); // every 8 seconds

    return () => clearInterval(interval);
  }, [bike?._id]);

  /* ------------------ 1️⃣ BIKE LIVE LOCATION ------------------ */
  useEffect(() => {
    if (!bike?._id) return;

    const interval = setInterval(async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/cycles/${bike._id}/location`
      );
      setCurrentLocation(res.data.location);
    }, 5000);

    return () => clearInterval(interval);
  }, [bike?._id]);

  /* ------------------ 2️⃣ FETCH ROUTE ------------------ */
  useEffect(() => {
    const fetchRoute = async () => {
      if (!boardingLoc || !destinationLoc) return;

      try {
        console.log(boardingLoc, destinationLoc);

        const res = await axios.post(
          "http://localhost:3000/api/cycles/ride-route",
          {
            boarding: boardingLoc,
            bike: null, // better than {}
            destination: destinationLoc,
          }
        );

        setRouteCoords(res.data.geometry || []);
      } catch (err) {
        console.error("Failed to fetch route:", err);
      }
    };

    fetchRoute();
  }, [boardingLoc, destinationLoc]);

  /* ------------------ 3️⃣ ROUTE META ------------------ */
  useEffect(() => {
    if (!routeCoords.length) return;

    let total = 0;
    const segments = [];

    for (let i = 1; i < routeCoords.length; i++) {
      const from = { lat: routeCoords[i - 1][1], lng: routeCoords[i - 1][0] };
      const to   = { lat: routeCoords[i][1], lng: routeCoords[i][0] };
      const d = haversine(from, to);
      segments.push({ from, d });
      total += d;
    }

    setRouteMeta({ segments, total });
    setDistanceLeft(total);
  }, [routeCoords]);

  /* ------------------ 4️⃣ DISTANCE CALC ------------------ */
  useEffect(() => {
    if (!currentLocation || !routeMeta) return;

    let minDist = Infinity, idx = 0;
    routeMeta.segments.forEach((s, i) => {
      const d = haversine(currentLocation, s.from);
      if (d < minDist) {
        minDist = d;
        idx = i;
      }
    });

    let covered = 0;
    for (let i = 0; i < idx; i++) covered += routeMeta.segments[i].d;

    setDistanceCovered(prev => Math.max(prev, covered));
    setDistanceLeft(Math.max(routeMeta.total - covered, 0));
  }, [currentLocation, routeMeta]);

  /* ------------------ 5️⃣ RIDE TIME & ETA ------------------ */
  useEffect(() => {
    if (!ride?.startedAt) return;

    const start = new Date(ride.startedAt);
    const interval = setInterval(() => {
      setRideTimeMin((Date.now() - start) / 60000);
    }, 10000);

    return () => clearInterval(interval);
  }, [ride?.startedAt]);

  useEffect(() => {
    if (rideTimeMin < 1 || distanceCovered < 0.1) return;
    const speed = distanceCovered / (rideTimeMin / 60);
    setTimeLeftMin(speed > 1 ? (distanceLeft / speed) * 60 : null);
  }, [rideTimeMin, distanceCovered, distanceLeft]);

  /* ------------------ 6️⃣ OFF-ROUTE ------------------ */
  useEffect(() => {
    if (!currentLocation || !routeCoords.length) return;

    let min = Infinity;
    routeCoords.forEach(([lng, lat]) => {
      min = Math.min(min, haversine(currentLocation, { lat, lng }) * 1000);
    });

    if (min > 50 && !offRouteSince) setOffRouteSince(Date.now());
    if (min <= 50) setOffRouteSince(null);
  }, [currentLocation, routeCoords]);

  useEffect(() => {
    if (!offRouteSince || Date.now() - offRouteSince < 10000) return;

    axios.post("http://localhost:3000/api/cycles/ride-route", {
      boarding: currentLocation,
      destination: destinationLoc,
    }).then(res => setRouteCoords(res.data.geometry || []));
  }, [offRouteSince]);

  /* ------------------ 7️⃣ PRICE UPDATE ------------------ */
  useEffect(() => {
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

  if (!ride) return <div>No active ride</div>;

  /* ------------------ UI ------------------ */
  return (
    <div className="p-6">
      <MapView
        boarding={boardingLoc}
        destination={destinationLoc}
        cycles={currentLocation ? [{ ...bike, location: currentLocation }] : []}
        routeCoords={routeCoords}
      />

      <h2>{bike?.cycleName}</h2>
      <p>Ride Time: {rideTimeMin.toFixed(0)} min</p>
      <p>Time Left: {timeLeftMin?.toFixed(0) || "--"} min</p>
      <p>Covered: {distanceCovered.toFixed(2)} km</p>
      <p>Left: {distanceLeft.toFixed(2)} km</p>
      <p>Fare: ₹{livePrice.toFixed(2)}</p>

      <button onClick={() => setShowPaymentSummary(true)}>END RIDE</button>
    </div>
  );
};

export default RideTracking;
