import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import useTripStops from '../hooks/useTripStops';

function StopsMarkers({ tripId }) {
  const tripStops = useTripStops(tripId);

  return (
    <>
      {tripStops.map(stop => (
        <Marker key={stop.stop_id} position={[stop.lat, stop.lon]}>
          <Popup>
            <div>Stop ID: {stop.stop_id}</div>
            <div>Arrival Time: {stop.arrival_time}</div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default StopsMarkers;

