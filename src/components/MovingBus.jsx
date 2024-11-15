import React, { useState, useEffect, useRef } from 'react';
import { Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import useTripStops from '../hooks/useTripStops';
import useRoutePath from '../hooks/useRoutePath';

// Import or specify the path to your bus icon
import busIconUrl from '/bus-stop.png';
import { FaUserFriends, FaChair } from 'react-icons/fa'; // Import icons for occupancy and seats

// Function to calculate a point a few meters away from the current location
function calculateOffsetPosition(lat, lon, distanceInMeters, angleInDegrees) {
  const earthRadius = 6371e3; // Earth radius in meters
  const angleRad = angleInDegrees * (Math.PI / 180);

  // Convert latitude and longitude from degrees to radians
  const latRad = lat * (Math.PI / 180);
  const lonRad = lon * (Math.PI / 180);

  // Calculate new latitude and longitude using the offset
  const newLat = latRad + (distanceInMeters / earthRadius);
  const newLon = lonRad + (distanceInMeters / earthRadius) / Math.cos(latRad);

  // Convert the new latitude and longitude back to degrees
  const newLatDeg = newLat * (180 / Math.PI);
  const newLonDeg = newLon * (180 / Math.PI);

  return [newLatDeg, newLonDeg];
}

// Function to find the closest point on the route to a given position
function findClosestPoint(position, routeCoordinates) {
  let closestPoint = null;
  let minDistance = Infinity;

  routeCoordinates.forEach((coord) => {
    const distance = L.latLng(position).distanceTo(L.latLng(coord));
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = coord;
    }
  });

  return closestPoint;
}

function MovingBus({ tripId, location, stopData, stopTimesData }) {
  const tripStops = useTripStops(tripId);
  const routeCoordinates = useRoutePath(tripStops);
  const [busPosition, setBusPosition] = useState(null);
  const [showPreviousStops, setShowPreviousStops] = useState(false);
  const [showUpcomingStops, setShowUpcomingStops] = useState(false);
  const busIntervalRef = useRef(null);

  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 0) {
      // Extract stop coordinates from the provided location prop
      const { stop_lat, stop_lon } = location;

      // Calculate a starting position a bit away from the bus stop (e.g., 50 meters away)
      const offsetPosition = calculateOffsetPosition(stop_lat, stop_lon, 50, 90); // Adjust `90` for desired angle

      // Find the closest route coordinate to the offset position
      const closestPoint = findClosestPoint(offsetPosition, routeCoordinates);

      let currentIndex = routeCoordinates.indexOf(closestPoint);

      if (currentIndex === -1) {
        currentIndex = 0; // Fallback to the first point if no closest point found
      }

      // Start bus at the closest point
      setBusPosition(routeCoordinates[currentIndex]);

      if (busIntervalRef.current) clearInterval(busIntervalRef.current);

      busIntervalRef.current = setInterval(() => {
        currentIndex++;
        if (currentIndex < routeCoordinates.length) {
          setBusPosition(routeCoordinates[currentIndex]);
        } else {
          clearInterval(busIntervalRef.current);
        }
      }, 1500); // Adjusted for slower movement

      return () => clearInterval(busIntervalRef.current);
    }
  }, [routeCoordinates, location]);

  // Icon configuration
  const busIcon = new L.Icon({
    iconUrl: busIconUrl,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  // Dummy data
  const bus = {
    lineName: 'Bus 101',
    origin: 'Main Street',
    destination: 'Uptown Station',
    progressPercentage: Math.random() * 100, // Random progress
    occupancy: {
      passengers: Math.floor(Math.random() * 100),
      capacity: 100,
      percentage: Math.floor(Math.random() * 100),
      seats: Math.floor(Math.random() * 50), // Random seats available
    },
    previousStops: [
      { StopPointName: 'Stop 1', AimedArrivalTime: '2024-11-15T12:00:00' },
      { StopPointName: 'Stop 2', AimedArrivalTime: '2024-11-15T12:15:00' },
    ],
    upcomingStops: [
      { StopPointName: 'Stop 3', AimedArrivalTime: '2024-11-15T12:30:00' },
      { StopPointName: 'Stop 4', AimedArrivalTime: '2024-11-15T12:45:00' },
    ],
    currentStop: { StopPointName: 'Current Stop', AimedArrivalTime: '2024-11-15T12:10:00' },
  };

  return (
    <>
      {routeCoordinates && routeCoordinates.length > 0 && (
        <Polyline positions={routeCoordinates} color="blue" />
      )}
      {busPosition && (
        <Marker
          position={busPosition} // Use busPosition directly as [lat, lon]
          icon={busIcon}
        >
          {/* Popup content when the bus icon is clicked */}
          <Popup>
            <h3>Bus Line: {bus.lineName}</h3>
            <p><strong>Origin:</strong> {bus.origin}</p>
            <p><strong>Destination:</strong> {bus.destination}</p>

            {/* Progress Bar */}
            <div style={{ marginBottom: '1em' }}>
              <div style={{
                display: 'flex',
                height: '15px',
                borderRadius: '5px',
                overflow: 'hidden',
                width: '100%',
                backgroundColor: '#f0f0f0'
              }}>
                <div style={{
                  width: `${bus.progressPercentage}%`,
                  backgroundColor: 'green',
                  transition: 'width 0.3s ease'
                }} />
                <div style={{
                  width: `${100 - bus.progressPercentage}%`,
                  backgroundColor: 'red',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <p>{bus.progressPercentage}%</p>
            </div>

            {/* Occupancy Information */}
            <p>
              <FaUserFriends /> <strong>Occupancy:</strong> {bus.occupancy.passengers}/{bus.occupancy.capacity}
              ({bus.occupancy.percentage}%)
            </p>
            <p>
              <FaChair /> <strong>Seats Available:</strong> {bus.occupancy.seats} seats
            </p>

            {/* Previous Stops Dropdown */}
            <div style={{ marginBottom: '1em' }}>
              <button onClick={() => setShowPreviousStops(!showPreviousStops)} style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}>
                {showPreviousStops ? "Hide" : "Show"} Previous Stops
              </button>
              {showPreviousStops && (
                <ul style={{ listStyleType: 'none', padding: 0, marginTop: '5px' }}>
                  {bus.previousStops.map((stop, idx) => (
                    <li key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '4px 0'
                    }}>
                      <span style={{ fontWeight: 'bold', textAlign: 'left' }}>{stop.StopPointName}</span>
                      <span style={{ textAlign: 'right' }}>{stop.AimedArrivalTime?.split("T")[1] || "N/A"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Current Stop */}
            <p>
              <strong>{bus.currentStop?.StopPointName || "N/A"}</strong>
              (Aimed Arrival: {bus.currentStop?.AimedArrivalTime?.split("T")[1] || "N/A"})
            </p>

            {/* Upcoming Stops Dropdown */}
            <div style={{ marginTop: '1em' }}>
              <button onClick={() => setShowUpcomingStops(!showUpcomingStops)} style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}>
                {showUpcomingStops ? "Hide" : "Show"} Upcoming Stops
              </button>
              {showUpcomingStops && (
                <ul style={{ listStyleType: 'none', padding: 0, marginTop: '5px' }}>
                  {bus.upcomingStops.map((stop, idx) => (
                    <li key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '4px 0'
                    }}>
                      <span style={{ fontWeight: 'bold', textAlign: 'left' }}>{stop.StopPointName}</span>
                      <span style={{ textAlign: 'right' }}>{stop.AimedArrivalTime?.split("T")[1] || "N/A"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
}

export default MovingBus;

