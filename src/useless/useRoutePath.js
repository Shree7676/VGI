import { useState, useEffect } from "react";
import ors from "openrouteservice-js";

function useRoutePath(tripStops) {
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  useEffect(() => {
    if (tripStops.length === 0) return;

    const coordinates = tripStops.map((stop) => [stop.lon, stop.lat]);
    const Directions = new ors.Directions({
      api_key: "5b3ce3597851110001cf62486b0acb53fddc4fb7bbaaa6184fdacd2b", // Replace with OpenRouteService API key
    });

    Directions.calculate({
      coordinates: coordinates,
      profile: "driving-car",
      format: "geojson",
    })
      .then((geojson) => {
        const routeCoords = geojson.features[0].geometry.coordinates.map(
          (coord) => [coord[1], coord[0]],
        );
        setRouteCoordinates(routeCoords);
      })
      .catch((err) => console.error("Error fetching route:", err));
  }, [tripStops]);

  return routeCoordinates;
}

export default useRoutePath;
