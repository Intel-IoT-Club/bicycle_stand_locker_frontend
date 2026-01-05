import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import DefaultCycle from "../assets/Bicycle_Pin1.png";
import SelectedCycle from "../assets/Bicycle_Pin2.png";
import Destination from "../assets/Destination_Pin.png";
import Boarding from "../assets/Boarding_Pin.png";
import CurrentLocation from "../assets/Current_Location_Pin.png";

const defaultBikeIcon = new L.Icon({
  iconUrl: DefaultCycle,
  iconSize: [45, 50],
});

const selectedBikeIcon = new L.Icon({
  iconUrl: SelectedCycle,
  iconSize: [55, 60],
});

const boardingIcon = new L.Icon({
  iconUrl: Boarding,
  iconSize: [45, 50],
});

const destinationIcon = new L.Icon({
  iconUrl: Destination,
  iconSize: [45, 50],
});

const currentLocationIcon = new L.Icon({
  iconUrl: CurrentLocation,
  iconSize: [45, 50],
});


const formatDistance = (km) => {
  if (!km && km !== 0) return "N/A"; // handle undefined/null
  const num = typeof km === "string" ? parseFloat(km) : km;
  if (num < 1) return `${Math.round(num * 1000)} m`;
  return `${num.toFixed(2)} km`;
};

// Fit map to boarding, destination, selected bike, and current location
import { useRef, useEffect } from "react";

const FitBounds = ({ boarding, destination, selectedBike, currentLocation }) => {
  const map = useMap();
  const fittedRef = useRef(false);

  useEffect(() => {
    const points = [];

    if (boarding) points.push([boarding.lat, boarding.lng]);
    if (destination) points.push([destination.lat, destination.lng]);
    if (selectedBike?.location?.coordinates)
      points.push([
        selectedBike.location.coordinates[1],
        selectedBike.location.coordinates[0]
      ]);
    if (currentLocation) points.push([currentLocation.lat, currentLocation.lng]);

    if (points.length > 0 && !fittedRef.current) {
      map.fitBounds(L.latLngBounds(points), { padding: [50, 50] });
      fittedRef.current = true;
    }
  }, [boarding, destination, selectedBike, currentLocation]);

  return null;
};


const MapView = ({ boarding, destination, cycles, selectedBikeId, onSelectBike, routeCoords, bikeDistance, currentLocation }) => {
  const selectedBike = cycles.find(bike => bike._id === selectedBikeId);

  return (
    <MapContainer
      center={[28.6139, 77.2090]} // default center, overridden by FitBounds
      zoom={13}
      style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Fit map to boarding, destination, selected bike */}
      <FitBounds boarding={boarding} destination={destination} selectedBike={selectedBike} currentLocation={currentLocation} />

      {/* Current Location Marker */}
      {currentLocation && <Marker position={[currentLocation.lat, currentLocation.lng]} icon={currentLocationIcon}><Popup>You are Here</Popup></Marker>}

      {/* Boarding Marker */}
      {boarding && <Marker position={[boarding.lat, boarding.lng]} icon={boardingIcon}><Popup>Boarding Point</Popup></Marker>}

      {/* Destination Marker */}
      {destination && <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}><Popup>Destination</Popup></Marker>}

      {/* Cycles */}
      {cycles?.map(bike => bike?.location?.coordinates ?(
        <Marker
          key={bike._id}
          position={[bike.location.coordinates[1], bike.location.coordinates[0]]}
          icon={bike._id === selectedBikeId ? selectedBikeIcon : defaultBikeIcon}
          eventHandlers={{ click: () => onSelectBike(bike) }}
        >
          <Popup>
            <div>
              <strong>{bike.cycleName}</strong><br />
              Type: {bike.type}<br />
              Status: {bike.status}<br />
              {bike._id === selectedBikeId && (
                <span>Distance from you: {bikeDistance ? `${formatDistance(bike.walkDistanceKm)}` : "Loading..."}</span>
              )}
            </div>
          </Popup>
        </Marker>
      ):null)}

      {routeCoords?.length > 0 && (
        <Polyline
          positions={routeCoords.map(c => [c[1], c[0]])} // lat,lng
          color="blue"
          weight={5}
        />
      )}
    </MapContainer>
  );
};

export default MapView;
