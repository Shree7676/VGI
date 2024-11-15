import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import useTripStops from '../hooks/useTripStops';
import L from 'leaflet';

function StopsMarkers({ tripId }) {
  const tripStops = useTripStops(tripId);

  return tripStops.map((stop, idx) => (
    stop.lat && stop.lon ? (
      <Marker
        key={idx}
        position={[stop.lat, stop.lon]}
        icon={new L.Icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })}
      >
        <Popup>
          <strong>{stop.stop_name}</strong>
          <br />
          Stop ID: {stop.stop_id}
          <br />
          Arrival Time: {stop.arrival_time}
        </Popup>
      </Marker>
    ) : null
  ));
}

export default StopsMarkers;

