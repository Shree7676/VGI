import { useState, useEffect } from "react";
import Papa from "papaparse";

function useStopsData() {
  const [stopsData, setStopsData] = useState({});

  useEffect(() => {
    Papa.parse("/stops.txt", {
      download: true,
      header: true,
      complete: (result) => {
        const stops = {};
        result.data.forEach((stop) => {
          stops[stop.stop_id] = {
            stop_name: stop.stop_name,
            lat: parseFloat(stop.stop_lat),
            lon: parseFloat(stop.stop_lon),
          };
        });
        setStopsData(stops);
      },
    });
  }, []);

  return stopsData;
}

export default useStopsData;
