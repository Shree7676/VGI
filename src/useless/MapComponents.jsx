import React, { useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { useStopsData } from '../hooks/useStopData2';
import { useStopTimesData } from '../hooks/useStopTimeData';
import StopMarker from './StopMarker2';

function MapComponent() {
  const stops = useStopsData();
  const stopTimes = useStopTimesData();
  const [zoomLevel, setZoomLevel] = useState(10); // Default zoom level
  const zoomThreshold = 15;

  // Inline ZoomListener component to handle zoom level changes
  function ZoomListener() {
    useMapEvents({
      zoomend: (event) => setZoomLevel(event.target.getZoom()),
    });
    return null;
  }

  return (
    <MapContainer center={[48.7665, 11.4257]} zoom={10} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
      />

      <ZoomListener />

      {/* Use clustering if zoom level is low */}
      {zoomLevel >= zoomThreshold ? (
        stops
          .filter((stop) => stop.stop_lat && stop.stop_lon && !isNaN(stop.stop_lat) && !isNaN(stop.stop_lon))
          .map((stop) => (
            <StopMarker key={stop.stop_id} stop={stop} stopTimes={stopTimes[stop.stop_id] || []} />
          ))
      ) : (
        <MarkerClusterGroup>
          {stops
            .filter((stop) => stop.stop_lat && stop.stop_lon && !isNaN(stop.stop_lat) && !isNaN(stop.stop_lon))
            .map((stop) => (
              <StopMarker key={stop.stop_id} stop={stop} stopTimes={stopTimes[stop.stop_id] || []} />
            ))}
        </MarkerClusterGroup>
      )}
    </MapContainer>
  );
}

export default MapComponent;

