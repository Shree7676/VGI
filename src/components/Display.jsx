import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import RoutePolyline from './RoutePolyline';
import StopsMarkers from './StopMarkers';
import 'leaflet/dist/leaflet.css';

function DisplayMap() {
  const [stopsData, setStopsData] = useState([]);
  const [stopTimesData, setStopTimesData] = useState([]);
  const [tripsData, setTripsData] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const defaultPosition = [48.7665, 11.4257];
  const zoomThreshold = 15;

  // Fetch stops and stop_times data
  useEffect(() => {
    Promise.all([
      fetch('/stops.json').then(res => res.json()),
      fetch('/stop_times.json').then(res => res.json()),
      fetch('/trips.json').then(res => res.json())
    ]).then(([stops, stopTimes, trips]) => {
      setStopsData(stops);
      setStopTimesData(stopTimes);
      setTripsData(trips);
    });
  }, []);

  // Get the top 5 trips for a stop and make them clickable
  const getTopTripsForStop = useMemo(() => {
    return (stopId) => {
      const filteredStopTimes = stopTimesData
        .filter(stopTime => stopTime.stop_id === stopId)
        .slice(0, 5);

      return filteredStopTimes.map((stopTime) => {
        const trip = tripsData.find(trip => trip.trip_id === stopTime.trip_id);
        return (
          <div key={stopTime.trip_id} onClick={() => setSelectedTripId(stopTime.trip_id)} style={{ cursor: 'pointer', color: 'blue' }}>
            Trip: {trip ? trip.trip_headsign : stopTime.trip_id}, Arrival: {stopTime.arrival_time}
          </div>
        );
      });
    };
  }, [stopTimesData, tripsData]);

  return (
    <MapContainer center={defaultPosition} zoom={10} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
      />

      {selectedTripId && <RoutePolyline tripId={selectedTripId} />}
      {selectedTripId && <StopsMarkers tripId={selectedTripId} />}

      {stopsData.map((stop) => {
        const { stop_lat, stop_lon, stop_name, stop_id } = stop;
        return (
          <Marker
            key={stop_id}
            position={[parseFloat(stop_lat), parseFloat(stop_lon)]}
            icon={new L.Icon({
              iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            })}
          >
            <Popup>
              <strong>{stop_name}</strong>
              <br />
              Stop ID: {stop_id}
              <br />
              <div>
                <strong>Top 5 Trips:</strong>
                {getTopTripsForStop(stop_id)}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default DisplayMap;

