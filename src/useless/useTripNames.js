import { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";

function useTripNames() {
  const [tripNames, setTripNames] = useState({});

  useEffect(() => {
    Papa.parse("/trips.txt", {
      download: true,
      header: true,
      complete: (result) => {
        const tripNameMapping = result.data.reduce((acc, trip) => {
          acc[trip.trip_id] = trip.trip_headsign || "Unknown Destination";
          return acc;
        }, {});
        setTripNames(tripNameMapping);
      },
    });
  }, []);

  // Memoize trip names to avoid recalculating
  return useMemo(() => tripNames, [tripNames]);
}

export default useTripNames;
