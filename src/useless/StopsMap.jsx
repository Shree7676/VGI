import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { MarkerClusterGroup } from 'leaflet.markercluster';
import axios from 'axios';

const StopsMap = () => {
  const [stopsData, setStopsData] = useState([]);
  const [map, setMap] = useState(null);

  useEffect(() => {
    // Lazy loading or fetching data on demand can be optimized here
    const fetchStopsData = async () => {
      try {
        // Fetch data from your JSON file or API
        const response = await axios.get('/stop.json');
        setStopsData(response.data);
      } catch (error) {
        console.error("Error fetching stops data:", error);
      }
    };

    fetchStopsData();
  }, []);

  const handleZoom = () => {
    if (map) {
      const zoomLevel = map.getZoom();
      console.log('Current Zoom Level:', zoomLevel);
    }
  };

  // Initialize map
  const onMapReady = (mapInstance) => {
    setMap(mapInstance);
    mapInstance.on('zoomend', handleZoom);
  };

  return (
    <MapContainer
      center={[48.739588, 11.436405]} // Default center
      zoom={12} // Default zoom level
      style={{ width: '100%', height: '100vh' }}
      whenCreated={onMapReady}
      zoomControl={false}
    >
      {/* Add a TileLayer for the map tiles */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Marker Clustering */}
      <MarkerClusterGroup>
        {stopsData.map((stop) => (
          <Marker
            key={stop.stop_id}
            position={[stop.stop_lat, stop.stop_lon]}
            icon={new L.Icon({ iconUrl: 'marker-icon.png', iconSize: [25, 41] })}
          >
            <Popup>
              <div>
                <h3>{stop.stop_name}</h3>
                <p>ID: {stop.stop_id}</p>
                <p>Coordinates: {stop.stop_lat}, {stop.stop_lon}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>

      {/* Add zoom control */}
      <ZoomControl position="topright" />
    </MapContainer>
  );
};

export default StopsMap;
