import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaUserFriends, FaChair } from 'react-icons/fa'; // Icons for occupancy and seats


// Custom icon for bus markers
const busIcon = new L.Icon({
  iconUrl: "/bus-stop.png",
  iconSize: [30, 30],
});

const BusMap = () => {
  const [buses, setBuses] = useState([]);
  const [showPreviousStops, setShowPreviousStops] = useState(false);
  const [showUpcomingStops, setShowUpcomingStops] = useState(false);

  useEffect(() => {
    // Fetch the local JSON file from the public directory
    fetch("/VGI_SIRI.json")
      .then((response) => response.json())
      .then((data) => {
        // Parse the JSON data for all buses
        const vehicleActivities = data.Siri.ServiceDelivery.VehicleMonitoringDelivery.VehicleActivity;

        // Map over each vehicle activity to extract relevant data for each bus
        const parsedBuses = vehicleActivities.map((activity) => {
          const vehicleJourney = activity.MonitoredVehicleJourney;
          const location = {
            lat: parseFloat(vehicleJourney.VehicleLocation?.Latitude || "0"),
            lng: parseFloat(vehicleJourney.VehicleLocation?.Longitude || "0"),
          };
          const occupancy = activity.Extensions?.["init-o:OccupancyData"];
          const progress = activity.ProgressBetweenStops;

          return {
            location,
            lineName: vehicleJourney.PublishedLineName,
            origin: vehicleJourney.OriginName,
            destination: vehicleJourney.DestinationName,
            previousStops: Array.isArray(vehicleJourney.PreviousCalls?.PreviousCall)
              ? vehicleJourney.PreviousCalls.PreviousCall
              : [],  // Ensure previousStops is an array
            currentStop: vehicleJourney.MonitoredCall || {},
            nextStops: Array.isArray(vehicleJourney.OnwardCalls?.OnwardCall)
              ? vehicleJourney.OnwardCalls.OnwardCall
              : [],  // Ensure nextStops is an array
            occupancy: {
              percentage: occupancy?.["init-o:OccupancyPercentage"] || "N/A",
              passengers: occupancy?.["init-o:PassengersNumber"] || "N/A",
              capacity: occupancy?.["init-o:VehicleCapacity"] || "N/A",
              seats: occupancy?.["init-o:VehicleSeatsNumber"] || "N/A",
            },
            progressPercentage: progress?.Percentage || "N/A",
          };
        });

        // Set the parsed bus data into state
        setBuses(parsedBuses);
      })
      .catch((error) => console.error("Error loading bus data:", error));
  }, []);

  if (!buses.length) return <p>Loading bus data...</p>;

  return (
    <MapContainer center={[48.711247, 11.503959]} zoom={13} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {buses.map((bus, index) => (
        <Marker key={index} position={bus.location} icon={busIcon}>
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
          </Popup>        </Marker>
      ))}
    </MapContainer>
  );
};

export default BusMap;

