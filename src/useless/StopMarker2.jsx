import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import useTripNames from "../hooks/useTripNames";

function StopMarker({ stop, stopTimes }) {
  const { stop_lat, stop_lon, stop_name, stop_id } = stop;
  const tripNames = useTripNames();

  // Compute top 5 trips based on arrival time
  const topTrips = stopTimes
    .sort((a, b) => a.arrival_time.localeCompare(b.arrival_time))
    .slice(0, 5);

  return (
    <Marker
      key={stop_id}
      position={[parseFloat(stop_lat), parseFloat(stop_lon)]}
      icon={
        new L.Icon({
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })
      }
    >
      <Popup>
        <strong>{stop_name}</strong>
        <br />
        Stop ID: {stop_id}
        <br />
        <strong>Top 5 Trips:</strong>
        {topTrips.map((trip) => (
          <div key={trip.trip_id}>
            Trip: {tripNames[trip.trip_id] || "Unknown Destination"}, Arrival: {trip.arrival_time}
          </div>
        ))}
      </Popup>
    </Marker>
  );
}

export default StopMarker;

