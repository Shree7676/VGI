import { useEffect, useState, useMemo } from "react";
import Papa from "papaparse";

export function useStopsData() {
  const [stops, setStops] = useState([]);

  useEffect(() => {
    Papa.parse("/stops.txt", {
      download: true,
      header: true,
      complete: (result) => setStops(result.data),
    });
  }, []);

  // Memoize stops to prevent unnecessary re-computation
  return useMemo(() => stops, [stops]);
}
