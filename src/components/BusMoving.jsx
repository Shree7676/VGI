import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import RoutePolyline from './RoutePolyline';
import useTripStops from '../hooks/useTripStops';
import useRoutePath from '../hooks/useRoutePath';

function BusMoving() {
  const [zoomLevel, setZoomLevel] = useState(10);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [busPosition, setBusPosition] = useState(null); // State for the bus position
  const busIntervalRef = useRef(null); // Reference to interval timer for bus movement
  const defaultPosition = [48.7665, 11.4257];
  const zoomThreshold = 15;

  // useRef to hold parsed data for stops, stopTimes, and trips
  const stopsData = useRef([]);
  const stopTimesData = useRef([]);
  const tripsLookup = useRef({});
  const topTripsLookup = useRef({});

  useEffect(() => {
    Promise.all([
      fetch('/stops.json').then(res => res.json()).then(data => stopsData.current = data),
      fetch('/stop_times.json').then(res => res.json()).then(data => stopTimesData.current = data),
      fetch('/trips.json').then(res => res.json()).then(data => {
        tripsLookup.current = data.reduce((acc, trip) => {
          acc[trip.trip_id] = trip.trip_headsign;
          return acc;
        }, {});
      })
    ]).then(() => {
      calculateTopTripsForStops();
      setDataLoaded(true);
    });
  }, []);

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

  const handleTripClick = (tripId) => {
    setSelectedTripId(tripId);

    const relatedStopIds = stopTimesData.current
      .filter((stopTime) => stopTime.trip_id === tripId)
      .map((stopTime) => stopTime.stop_id);

    const coordinates = stopsData.current
      .filter((stop) => relatedStopIds.includes(stop.stop_id))
      .map((stop) => ({
        stop_id: stop.stop_id,
        stop_lat: parseFloat(stop.stop_lat),
        stop_lon: parseFloat(stop.stop_lon)
      }));

    const tripStop_ = useTripStops(tripId);
    const routeCoordinates_ = useRoutePath(tripStop_);
    startBusAnimation(routeCoordinates_);
  };

  const startBusAnimation = (routeCoords) => {
    if (busIntervalRef.current) clearInterval(busIntervalRef.current);

    let currentIndex = 0;
    setBusPosition(routeCoords[currentIndex]);

    busIntervalRef.current = setInterval(() => {
      currentIndex++;
      if (currentIndex < routeCoords.length) {
        setBusPosition(routeCoords[currentIndex]);
      } else {
        clearInterval(busIntervalRef.current);
      }
    }, 1000); // Update interval in milliseconds
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

  const memoizedStops = useMemo(() => stopsData.current, [dataLoaded]);

  useEffect(() => {
    return () => clearInterval(busIntervalRef.current);
  }, []);

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
                <strong>{stop_name}</strong>
                <br />
                Stop ID: {stop_id}
                <br />
                <div>
                  <strong>Top 5 Trips:</strong>
                  {topTripsLookup.current[stop_id]?.map((trip, index) => (
                    <div key={index}>
                      Trip Name: <span
                        onClick={() => handleTripClick(trip.tripId)}
                        style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {trip.tripHeadsign}
                      </span>, Arrival: {trip.arrival}
                    </div>
                  ))}
                </div>
              </Popup>
            </Marker>
          );
        }
        return null;
      })}

      {selectedTripId && <RoutePolyline tripId={selectedTripId} />}

      {busPosition && (
        <Marker
          position={[busPosition.stop_lat, busPosition.stop_lon]}
          icon={new L.Icon({
            iconUrl: '/bus-stop.png',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          })}
        />
      )}
    </MapContainer>
  );
}

export default BusMoving;
