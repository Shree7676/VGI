import { useEffect, useState, useMemo } from "react";
import Papa from "papaparse";

export function useStopTimesData() {
  const [stopTimes, setStopTimes] = useState([]);

  useEffect(() => {
    Papa.parse("/stop_times.txt", {
      download: true,
      header: true,
      complete: (result) => setStopTimes(result.data),
    });
  }, []);

  // Group stop times by stop_id for efficient access
  return useMemo(() => {
    const groupedStopTimes = stopTimes.reduce((acc, stopTime) => {
      if (!acc[stopTime.stop_id]) acc[stopTime.stop_id] = [];
      acc[stopTime.stop_id].push(stopTime);
      return acc;
    }, {});
    return groupedStopTimes;
  }, [stopTimes]);
}
