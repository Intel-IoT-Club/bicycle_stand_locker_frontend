import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import DefaultCycle from "../assets/Default_Cycle_Icon.png";
import SelectedCycle from "../assets/Selected_Cycle_Icon.png";

const defaultBikeIcon = new L.Icon({
  iconUrl: DefaultCycle,
  iconSize: [40, 40],
});

const selectedBikeIcon = new L.Icon({
  iconUrl: SelectedCycle,
  iconSize: [45, 45],
});

const boardingIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
});

const destinationIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149059.png",
  iconSize: [35, 35],
});

// Fit map to boarding, destination, and selected bike
const FitBounds = ({ boarding, destination, selectedBike }) => {
  const map = useMap();
  const points = [];

  if (boarding) points.push([boarding.lat, boarding.lng]);
  if (destination) points.push([destination.lat, destination.lng]);
  if (selectedBike) points.push([selectedBike.location.coordinates[1], selectedBike.location.coordinates[0]]);

  if (points.length > 0) {
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [50, 50] });
  }

  return null;
};

const MapView = ({ boarding, destination, cycles, selectedBikeId, onSelectBike, routeCoords, bikeDistance }) => {
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
      <FitBounds boarding={boarding} destination={destination} selectedBike={selectedBike} />

      {/* Boarding Marker */}
      {boarding && <Marker position={[boarding.lat, boarding.lng]} icon={boardingIcon}><Popup>Boarding Point</Popup></Marker>}

      {/* Destination Marker */}
      {destination && <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}><Popup>Destination</Popup></Marker>}

      {/* Cycles */}
      {cycles?.map(bike => (
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
              Status: {bike.status}<br/>
              {bike._id === selectedBikeId && (
                <span>Distance from you: {bikeDistance ? `${bikeDistance} km` : "Loading..."}</span>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

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
