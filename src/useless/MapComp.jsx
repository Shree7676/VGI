import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Papa from 'papaparse';
import 'leaflet/dist/leaflet.css';

function MapComponent() {
  const [stops, setStops] = useState([]);
  const [stopTimes, setStopTimes] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(10);
  const defaultPosition = [48.7665, 11.4257];
  const zoomThreshold = 15;

  // Fetch and parse the stops.txt data
  useEffect(() => {
    Papa.parse('/stops.txt', {
      download: true,
      header: true,
      complete: (result) => {
        setStops(result.data);
      },
    });
  }, []);

  // Fetch and parse the stop_times.txt data
  useEffect(() => {
    Papa.parse('/stop_times.txt', {
      download: true,
      header: true,
      complete: (result) => {
        setStopTimes(result.data);
      },
    });
  }, []);

  // Custom hook to track the map's zoom level
  function ZoomListener() {
    const map = useMapEvents({
      zoomend: () => {
        setZoomLevel(map.getZoom());
      },
    });
    return null;
  }

  // Function to get the top 5 trip IDs for a stop based on arrival time
  const getTopTripsForStop = (stopId) => {
    // Filter stop times for the given stopId
    const filteredStopTimes = stopTimes
      .filter((stopTime) => stopTime.stop_id === stopId)
      .sort((a, b) => a.arrival_time.localeCompare(b.arrival_time)) // Sort by arrival time
      .slice(0, 5); // Get the top 5 entries

    // Map the filtered results to a display format
    return filteredStopTimes.map((stopTime) => (
      <div key={stopTime.trip_id}>
        Trip ID: {stopTime.trip_id}, Arrival: {stopTime.arrival_time}
      </div>
    ));
  };

  return (
    <MapContainer center={defaultPosition} zoom={10} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
      />

      <ZoomListener />

      {zoomLevel >= zoomThreshold && stops.map((stop) => {
        const { stop_lat, stop_lon, stop_name, stop_id } = stop;
        if (stop_lat && stop_lon) {
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
        }
        return null;
      })}
    </MapContainer>
  );
}

export default MapComponent;

