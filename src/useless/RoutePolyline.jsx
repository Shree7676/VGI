import React from 'react';
import { Polyline } from 'react-leaflet';
import useTripStops from '../hooks/useTripStops';
import useRoutePath from '../hooks/useRoutePath';

function RoutePolyline({ tripId }) {
  const tripStops = useTripStops(tripId);
  const routeCoordinates = useRoutePath(tripStops);

  return routeCoordinates.length > 0 ? (
    <Polyline positions={routeCoordinates} color="blue" />
  ) : null;
}

export default RoutePolyline;

