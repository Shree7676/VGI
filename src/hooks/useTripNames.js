import { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";

function useTripNames(tripIds) {
  const [tripNames, setTripNames] = useState({});

  // Fetch and parse the trips.txt data
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

  // Memoize the result to avoid unnecessary recalculations
  const tripNamesList = useMemo(() => {
    return tripIds.map((tripId) => tripNames[tripId] || "Unknown Trip");
  }, [tripIds, tripNames]);

  return tripNamesList;
}

export default useTripNames;
