import React from 'react';
import useUpcomingTrips from '../hooks/useUpcomingTrips';

function StopPopupInfo({ stopId }) {
  const upcomingTrips = useUpcomingTrips(stopId);

  return (
    <div>
      <h4>Next 5 Trips</h4>
      {upcomingTrips.length === 0 ? (
        <p>No upcoming trips</p>
      ) : (
        <ul>
          {upcomingTrips.map(trip => (
            <li key={trip.trip_id}>
              <button onClick={() => trip.onSelectTrip(trip.trip_id)}>
                Trip ID: {trip.trip_id} - Departure: {trip.departure_time}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default StopPopupInfo;
