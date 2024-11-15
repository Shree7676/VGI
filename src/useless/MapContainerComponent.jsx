import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import StopsMarkers from './StopsMarker';
import RoutePolyline from './RoutePolyline';
import 'leaflet/dist/leaflet.css';

function MapContainerComponent() {
  const defaultPosition = [48.7665, 11.4257]; // Center on Ingolstadt, Germany

  return (
    <MapContainer center={defaultPosition} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <RoutePolyline tripId="BusXXX:1:10:30499:39399:29:557:20241001" />
      <StopsMarkers tripId="BusXXX:1:10:30499:39399:29:557:20241001" />
    </MapContainer>
  );
}

export default MapContainerComponent;

