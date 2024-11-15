import { useState, useEffect } from "react";

function useTripStops(tripId) {
  const [tripStops, setTripStops] = useState([]);

  useEffect(() => {
    // Fetch the stop times and stops data
    Promise.all([
      fetch("/stop_times.json").then((res) => res.json()),
      fetch("/stops.json").then((res) => res.json()),
    ]).then(([stopTimesData, stopsData]) => {
      // Filter stops for the selected trip ID and sort by stop sequence
      const stopsSequence = stopTimesData
        .filter((stop) => stop.trip_id === tripId)
        .sort((a, b) => parseInt(a.stop_sequence) - parseInt(b.stop_sequence))
        .map((stopTime) => {
          const stop = stopsData.find((s) => s.stop_id === stopTime.stop_id);
          return {
            stop_id: stopTime.stop_id,
            arrival_time: stopTime.arrival_time,
            lat: parseFloat(stop.stop_lat),
            lon: parseFloat(stop.stop_lon),
          };
        });
      setTripStops(stopsSequence);
    });
  }, [tripId]);

  return tripStops;
}

export default useTripStops;
