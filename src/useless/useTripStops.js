import { useState, useEffect } from "react";
import Papa from "papaparse";
import useStopsData from "./useStopData";

function useTripStops(tripId) {
  const [tripStops, setTripStops] = useState([]);
  const stopsData = useStopsData();

  useEffect(() => {
    Papa.parse("/stop_times.txt", {
      download: true,
      header: true,
      complete: (result) => {
        const stopsSequence = result.data
          .filter((stop) => stop.trip_id === tripId)
          .sort((a, b) => parseInt(a.stop_sequence) - parseInt(b.stop_sequence))
          .map((stop) => ({
            stop_id: stop.stop_id,
            arrival_time: stop.arrival_time,
            ...stopsData[stop.stop_id],
          }));
        setTripStops(stopsSequence);
      },
    });
  }, [stopsData, tripId]);

  return tripStops;
}

export default useTripStops;
