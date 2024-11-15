import { useState, useEffect } from "react";
import Papa from "papaparse";

function useUpcomingTrips(stopId) {
  const [upcomingTrips, setUpcomingTrips] = useState([]);

  useEffect(() => {
    if (!stopId) return;

    Papa.parse("/stop_times.txt", {
      download: true,
      header: true,
      complete: (result) => {
        const now = new Date();
        const nextTrips = result.data
          .filter(
            (row) =>
              row.stop_id === stopId &&
              new Date(`1970-01-01T${row.departure_time}`) > now,
          )
          .slice(0, 5)
          .map((row) => ({
            trip_id: row.trip_id,
            departure_time: row.departure_time,
            onSelectTrip: (tripId) => {
              // Trigger route display for selected trip
              console.log("Selected trip:", tripId);
              // You can trigger route display by updating a state or context in the main component
            },
          }));
        setUpcomingTrips(nextTrips);
      },
    });
  }, [stopId]);

  return upcomingTrips;
}

export default useUpcomingTrips;
