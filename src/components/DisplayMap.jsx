import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import RoutePolyline from './RoutePolyline'; // Import the RoutePolyline component

function DisplayMap() {
  const [zoomLevel, setZoomLevel] = useState(10);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null); // State to store the selected tripId
  const defaultPosition = [48.7665, 11.4257];
  const zoomThreshold = 15;

  // useRef to hold parsed data for stops, stopTimes, and trips
  const stopsData = useRef([]);
  const stopTimesData = useRef([]);
  const tripsLookup = useRef({}); // Dictionary for fast trip_id to trip_headsign lookup
  const topTripsLookup = useRef({}); // Dictionary for precomputed top trips for each stop

  // One-time data loading and initialization
  useEffect(() => {
    // Load JSON files and set data
    Promise.all([
      fetch('/stops.json').then(res => res.json()).then(data => stopsData.current = data),
      fetch('/stop_times.json').then(res => res.json()).then(data => stopTimesData.current = data),
      fetch('/trips.json').then(res => res.json()).then(data => {
        // Create trip_id to trip_headsign lookup
        tripsLookup.current = data.reduce((acc, trip) => {
          acc[trip.trip_id] = trip.trip_headsign;
          return acc;
        }, {});
      })
    ]).then(() => {
      calculateTopTripsForStops(); // Precompute top trips
      setDataLoaded(true); // Mark all data as loaded
    });
  }, []);

  // Calculate the top trips for each stop and store in topTripsLookup
  const calculateTopTripsForStops = () => {
    const stopGroups = stopTimesData.current.reduce((acc, stopTime) => {
      if (!acc[stopTime.stop_id]) acc[stopTime.stop_id] = [];
      acc[stopTime.stop_id].push(stopTime);
      return acc;
    }, {});

    for (const stopId in stopGroups) {
      const topTrips = stopGroups[stopId]
        .sort((a, b) => a.arrival_time.localeCompare(b.arrival_time))
        .slice(0, 5)
        .map((stopTime) => {
          const tripHeadsign = tripsLookup.current[stopTime.trip_id] || 'Unknown';
          return { tripHeadsign, arrival: stopTime.arrival_time, tripId: stopTime.trip_id };
        });

      topTripsLookup.current[stopId] = topTrips;
    }
  };

  // Custom hook to track the map's zoom level
  function ZoomListener() {
    const map = useMapEvents({
      zoomend: () => {
        setZoomLevel(map.getZoom());
      },
    });
    return null;
  }

  // Memoizing the stops array for stable rendering
  const memoizedStops = useMemo(() => stopsData.current, [dataLoaded]);

  // Function to handle trip headsign click
  const handleTripClick = (tripId) => {
    // Set the selected tripId to trigger RoutePolyline rendering
    setSelectedTripId(tripId);

    // Collect all stop_id's associated with the given tripId
    const relatedStopIds = stopTimesData.current
      .filter((stopTime) => stopTime.trip_id === tripId)
      .map((stopTime) => stopTime.stop_id);

    // Collect the stop_lat and stop_lon of these stop_ids from stopsData
    const coordinates = stopsData.current
      .filter((stop) => relatedStopIds.includes(stop.stop_id))
      .map((stop) => ({
        stop_id: stop.stop_id,
        stop_lat: stop.stop_lat,
        stop_lon: stop.stop_lon
      }));

    console.log("Coordinates for trip ID:", tripId, coordinates);
  };

  return (
    <MapContainer center={defaultPosition} zoom={10} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
      />

      <ZoomListener />

      {dataLoaded && zoomLevel >= zoomThreshold && memoizedStops.map((stop) => {
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
                <div style={{ width: '250px' }}>
                  <strong>{stop_name}</strong>
                  <br />
                  Stop ID: {stop_id}
                  <br />
                  <div>
                    {topTripsLookup.current[stop_id]?.map((trip, index) => (
                      <div key={index}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '5px 0',
                          borderBottom: '1px solid #ddd', // Optional: Adds a separator between trips
                        }}>
                          <span
                            onClick={() => handleTripClick(trip.tripId, stop_id)}
                            style={{
                              color: 'blue',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              flex: 1, // Ensures the trip name takes the left space
                            }}
                          >
                            {trip.tripHeadsign}
                          </span>
                          <span style={{ fontSize: '0.9em', color: '#555' }}>{trip.arrival}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        }
        return null;
      })}

      {/* Render the polyline for the selected trip */}
      {selectedTripId && <RoutePolyline tripId={selectedTripId} />}
    </MapContainer>
  );
}

export default DisplayMap;

